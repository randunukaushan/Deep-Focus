import assert from 'node:assert/strict';
import test from 'node:test';

const { bootstrapAuthenticatedAccount } = await import('../../supabase/functions/_shared/postgres-authenticated-account-bootstrap.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-10-11T00:00:00.000Z';
const RATE_LIMIT = { counter: { consume: async () => ({ allowed: true, retryAfterSeconds: 0 }) }, windowMs: 60_000, limit: 2, nowMs: 1_700_000_000_000 };

function harness({ fail = false } = {}) {
  const queries = [];
  let sessionCreated = false;
  let profileCreated = false;
  let workspaceCreated = false;
  let syncHeadCreated = false;
  const runner = { withTransaction: async (run) => {
    if (fail) throw new Error('transaction failed');
    return run({ query: async (sql, params) => {
      queries.push({ sql, params });
      if (sql.includes('from df_private.app_sessions')) return { rows: sessionCreated ? [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: '2026-10-11T01:00:00.000Z', revoked_at: null }] : [] };
      if (sql.includes('insert into df_private.app_sessions')) { sessionCreated = true; return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: '2026-10-11T01:00:00.000Z', revoked_at: null }] }; }
      if (sql.includes('insert into df_private.profiles')) {
        if (profileCreated) return { rows: [] };
        profileCreated = true;
        return { rows: [{ owner_id: OWNER, display_name: 'Nimal', account_state: 'active', version: 1 }] };
      }
      if (sql.includes('select owner_id, display_name')) return { rows: [{ owner_id: OWNER, display_name: 'Nimal', account_state: 'active', version: 1 }] };
      if (sql.includes('insert into df_private.workspaces')) {
        if (workspaceCreated) return { rows: [] };
        workspaceCreated = true;
        return { rows: [{ id: WORKSPACE, owner_id: OWNER, kind: 'personal' }] };
      }
      if (sql.includes('select id, owner_id, kind')) return { rows: [{ id: WORKSPACE, owner_id: OWNER, kind: 'personal' }] };
      if (sql.includes('insert into df_private.sync_heads')) {
        if (syncHeadCreated) return { rows: [] };
        syncHeadCreated = true;
        return { rows: [{ owner_id: OWNER, last_sequence: '0' }] };
      }
      if (sql.includes('select owner_id, last_sequence')) return { rows: [{ owner_id: OWNER, last_sequence: '0' }] };
      throw new Error(`unexpected query: ${sql}`);
    } });
  } };
  return { runner, queries };
}

function provider(overrides = {}) {
  return { auth: { getClaims: async () => ({ data: { claims: {
    sub: OWNER, session_id: SESSION, exp: Math.floor(Date.parse(NOW) / 1000) + 3600,
    iss: 'https://issuer.example', aud: 'authenticated', ...overrides,
  } }, error: null }) } };
}

test('verifies provider claims and atomically creates session, profile, workspace and sync head', async () => {
  const h = harness();
  const result = await bootstrapAuthenticatedAccount({
    providerClient: provider(), accessToken: 'provider-token', expectedIssuer: 'https://issuer.example',
    expectedAudience: 'authenticated', now: NOW, displayName: 'Nimal', createWorkspaceId: () => WORKSPACE, runner: h.runner, rateLimit: RATE_LIMIT,
  });
  assert.equal(result.ok, true);
  assert.equal(result.account.profile.ownerId, OWNER);
  assert.equal(result.session.record.sessionId, SESSION);
  assert.equal(h.queries.length, 5);
});

test('lost-response bootstrap retry reuses the verified app session and canonical account foundation', async () => {
  const h = harness();
  const rateLimitKeys = [];
  const base = {
    providerClient: provider(), accessToken: 'provider-token', expectedIssuer: 'https://issuer.example',
    expectedAudience: 'authenticated', now: NOW, runner: h.runner,
    rateLimit: { ...RATE_LIMIT, counter: { consume: async (key) => { rateLimitKeys.push(key); return { allowed: true, retryAfterSeconds: 0 }; } } },
  };
  const first = await bootstrapAuthenticatedAccount({ ...base, displayName: 'Nimal', createWorkspaceId: () => WORKSPACE });
  const retry = await bootstrapAuthenticatedAccount({ ...base, displayName: 'Attempted overwrite', createWorkspaceId: () => '44444444-4444-4444-8444-444444444444' });
  assert.equal(first.ok, true);
  assert.equal(retry.ok, true);
  assert.equal(retry.account.profile.displayName, 'Nimal');
  assert.equal(retry.account.workspace.workspaceId, WORKSPACE);
  assert.equal(h.queries.filter((query) => query.sql.includes('insert into df_private.app_sessions')).length, 1);
  assert.deepEqual(rateLimitKeys, [`actor:${OWNER}:bootstrapAccount`, `actor:${OWNER}:bootstrapAccount`]);
});

test('provider verification failure does not open a database transaction', async () => {
  let transactions = 0;
  const result = await bootstrapAuthenticatedAccount({
    providerClient: { auth: { getClaims: async () => { throw new Error('invalid'); } } }, accessToken: 'bad',
    expectedIssuer: 'https://issuer.example', expectedAudience: 'authenticated', now: NOW, displayName: 'Nimal',
    createWorkspaceId: () => WORKSPACE, runner: { withTransaction: async () => { transactions += 1; throw new Error('must not run'); } }, rateLimit: RATE_LIMIT,
  });
  assert.deepEqual(result, { ok: false, reason: 'invalid_provider_session' });
  assert.equal(transactions, 0);
});

test('issuer or audience mismatch is rejected before any persistence', async () => {
  const h = harness();
  const result = await bootstrapAuthenticatedAccount({
    providerClient: provider({ aud: 'wrong' }), accessToken: 'provider-token', expectedIssuer: 'https://issuer.example',
    expectedAudience: 'authenticated', now: NOW, displayName: 'Nimal', createWorkspaceId: () => WORKSPACE, runner: h.runner, rateLimit: RATE_LIMIT,
  });
  assert.deepEqual(result, { ok: false, reason: 'invalid_provider_session' });
  assert.equal(h.queries.length, 0);
});

test('transaction failure is not converted into a successful account result', async () => {
  await assert.rejects(() => bootstrapAuthenticatedAccount({
    providerClient: provider(), accessToken: 'provider-token', expectedIssuer: 'https://issuer.example',
    expectedAudience: 'authenticated', now: NOW, displayName: 'Nimal', createWorkspaceId: () => WORKSPACE, runner: harness({ fail: true }).runner, rateLimit: RATE_LIMIT,
  }), /transaction failed/);
});

test('bootstrap rejects an invalid transaction runner or workspace identity before persistence', async () => {
  const base = { providerClient: provider(), accessToken: 'provider-token', expectedIssuer: 'https://issuer.example', expectedAudience: 'authenticated', now: NOW, displayName: 'Nimal', rateLimit: RATE_LIMIT };
  let transactions = 0;
  const runner = { withTransaction: async () => { transactions += 1; throw new Error('must not run'); } };
  assert.deepEqual(await bootstrapAuthenticatedAccount({ ...base, createWorkspaceId: () => WORKSPACE, runner: {} }), { ok: false, reason: 'invalid_input' });
  assert.deepEqual(await bootstrapAuthenticatedAccount({ ...base, createWorkspaceId: () => 'bad-workspace', runner }), { ok: false, reason: 'invalid_input' });
  assert.equal(transactions, 0);
});

test('rate limits only after provider identity and claim validation, before workspace or database work', async () => {
  let counterCalls = 0;
  let workspaceCalls = 0;
  let transactions = 0;
  const result = await bootstrapAuthenticatedAccount({
    providerClient: provider(), accessToken: 'provider-token', expectedIssuer: 'https://issuer.example', expectedAudience: 'authenticated', now: NOW,
    displayName: 'Nimal', createWorkspaceId: () => { workspaceCalls += 1; return WORKSPACE; },
    runner: { withTransaction: async () => { transactions += 1; throw new Error('must not run'); } },
    rateLimit: { ...RATE_LIMIT, counter: { consume: async (key) => { counterCalls += 1; assert.equal(key, `actor:${OWNER}:bootstrapAccount`); return { allowed: false, retryAfterSeconds: 12 }; } } },
  });
  assert.deepEqual(result, { ok: false, reason: 'rate_limited', retryAfterSeconds: 12 });
  assert.equal(counterCalls, 1);
  assert.equal(workspaceCalls, 0);
  assert.equal(transactions, 0);
});

test('invalid provider claims do not consume an owner rate-limit bucket', async () => {
  let counterCalls = 0;
  const result = await bootstrapAuthenticatedAccount({
    providerClient: provider({ aud: 'wrong' }), accessToken: 'provider-token', expectedIssuer: 'https://issuer.example', expectedAudience: 'authenticated', now: NOW,
    displayName: 'Nimal', createWorkspaceId: () => WORKSPACE, runner: harness().runner,
    rateLimit: { ...RATE_LIMIT, counter: { consume: async () => { counterCalls += 1; return { allowed: true, retryAfterSeconds: 0 }; } } },
  });
  assert.deepEqual(result, { ok: false, reason: 'invalid_provider_session' });
  assert.equal(counterCalls, 0);
});

test('bootstrap rate-limit keys remain isolated for distinct verified owners', async () => {
  const secondOwner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const secondSession = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  const keys = [];
  const rateLimit = { ...RATE_LIMIT, counter: { consume: async (key) => { keys.push(key); return { allowed: false, retryAfterSeconds: 12 }; } } };
  const base = {
    accessToken: 'provider-token', expectedIssuer: 'https://issuer.example', expectedAudience: 'authenticated', now: NOW,
    displayName: 'Nimal', createWorkspaceId: () => WORKSPACE,
    runner: { withTransaction: async () => { throw new Error('must not run'); } }, rateLimit,
  };
  const first = await bootstrapAuthenticatedAccount({ ...base, providerClient: provider() });
  const second = await bootstrapAuthenticatedAccount({ ...base, providerClient: provider({ sub: secondOwner, session_id: secondSession }) });
  assert.equal(first.reason, 'rate_limited');
  assert.equal(second.reason, 'rate_limited');
  assert.deepEqual(keys, [`actor:${OWNER}:bootstrapAccount`, `actor:${secondOwner}:bootstrapAccount`]);
});
