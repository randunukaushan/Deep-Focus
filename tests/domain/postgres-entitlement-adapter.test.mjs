import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresCapabilityAdmission, createPostgresEntitlementReader } = await import('../../supabase/functions/_shared/postgres-entitlement-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';

function harness(rows) {
  const calls = [];
  return { calls, runner: { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params }); return sql.includes('app_sessions') ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] } : { rows }; } }) } };
}

function sessionHarness(rows) {
  const calls = [];
  return { calls, runner: { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params }); if (sql.includes('app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] }; return { rows }; } }) } };
}

test('entitlement reader returns only server-verified owner capability records', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null }]);
  const result = await createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION);
  assert.deepEqual(result, { ownerId: OWNER, capability: 'ai', status: 'active', verifiedBy: 'server', policyVersion: 'v1', expiresAt: null, offerId: null });
  assert.deepEqual(h.calls.find((call) => call.sql.includes('server_entitlements')).params, [OWNER, 'ai']);
  assert.deepEqual(h.calls.find((call) => call.sql.includes('app_sessions')).params, [OWNER, SESSION]);
});

test('entitlement reader returns null for a missing capability without granting anything', async () => {
  const h = harness([]);
  assert.equal(await createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'cloud_resources', SESSION), null);
});

test('entitlement reader preserves grace as a non-active server state', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'ai', status: 'grace', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null }]);
  const result = await createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION);
  assert.equal(result?.status, 'grace');
});

test('entitlement reader fails closed on a client-untrusted verification marker', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'client', policy_version: 'v1', expires_at: null, offer_id: null }]);
  await assert.rejects(() => createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('entitlement reader fails closed when storage returns a foreign owner or capability row', async () => {
  const foreignOwner = '33333333-3333-4333-8333-333333333333';
  const h = harness([{ owner_id: foreignOwner, capability: 'cloud_resources', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null }]);
  await assert.rejects(() => createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('entitlement reader fails closed on a malformed expiry timestamp', async () => {
  const h = harness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: 'not-a-timestamp', offer_id: null }]);
  await assert.rejects(() => createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('session-bound entitlement read rechecks the active session before capability data', async () => {
  const h = sessionHarness([{ owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null }]);
  const result = await createPostgresEntitlementReader({ runner: h.runner }).readEntitlement(OWNER, 'ai', SESSION);
  assert.equal(result?.capability, 'ai');
  assert.equal(h.calls[0].sql.includes('app_sessions'), true);
});

test('revoked session blocks entitlement data access', async () => {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql) => { calls.push(sql); if (sql.includes('app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: '2026-10-10T00:00:00.000Z' }] }; throw new Error('capability query must not run'); } }) };
  await assert.rejects(() => createPostgresEntitlementReader({ runner }).readEntitlement(OWNER, 'ai', SESSION), /AUTH_REQUIRED/);
  assert.equal(calls.length, 1);
});

test('entitlement reader rejects runtime identity confusion before session access', async () => {
  let calls = 0;
  const runner = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  await assert.rejects(() => createPostgresEntitlementReader({ runner }).readEntitlement(Symbol('owner'), 'ai', SESSION), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
});

test('entitlement reader fails closed on duplicate or malformed storage rows', async () => {
  const duplicate = { owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null };
  const runner = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('app_sessions') ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] } : { rows: [duplicate, duplicate] } }) };
  await assert.rejects(() => createPostgresEntitlementReader({ runner }).readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
  const malformedRunner = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('app_sessions') ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] } : { rows: [null] } }) };
  await assert.rejects(() => createPostgresEntitlementReader({ runner: malformedRunner }).readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('entitlement reader rejects malformed runner and result-container dependencies safely', async () => {
  assert.throws(() => createPostgresEntitlementReader(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresEntitlementReader({ runner: { withTransaction: 'not-a-function' } }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresCapabilityAdmission({ runner: null }), /VALIDATION_FAILED/);
  const malformedRunner = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('app_sessions') ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] } : { rows: null } }) };
  await assert.rejects(() => createPostgresEntitlementReader({ runner: malformedRunner }).readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('entitlement reader fails closed before session access when the client is malformed', async () => {
  const reader = createPostgresEntitlementReader({
    runner: { withTransaction: async (run) => run({ query: 'not-a-function' }) },
  });
  await assert.rejects(() => reader.readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('entitlement reader rejects malformed capability and session identities before opening a transaction', async () => {
  let opened = 0;
  const reader = createPostgresEntitlementReader({ runner: { withTransaction: async () => { opened += 1; return null; } } });
  await assert.rejects(() => reader.readEntitlement(OWNER, Symbol('capability'), SESSION), /VALIDATION_FAILED/);
  await assert.rejects(() => reader.readEntitlement(OWNER, 'ai', Symbol('session')), /VALIDATION_FAILED/);
  assert.equal(opened, 0);
});

test('entitlement reader fails closed on sparse capability rows before granting access', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, capability: 'ai', status: 'active', verified_by: 'server', policy_version: 'v1', expires_at: null, offer_id: null };
  const calls = [];
  const reader = createPostgresEntitlementReader({ runner: { withTransaction: async (run) => run({ query: async (sql) => {
    calls.push(sql);
    if (sql.includes('app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    return { rows: sparse };
  } }) } });
  await assert.rejects(() => reader.readEntitlement(OWNER, 'ai', SESSION), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(calls.filter((sql) => sql.includes('server_entitlements')).length, 1);
});
