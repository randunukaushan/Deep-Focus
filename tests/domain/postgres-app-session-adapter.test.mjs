import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAppSessionStore, createPostgresSessionRevocationStore, createPostgresAccountSessionRevocationStore } = await import('../../supabase/functions/_shared/postgres-app-session-adapter.ts');
const { issueAppSessionTransactionally } = await import('../../supabase/functions/_shared/app-session.ts');
const { revokeAndQueueProviderRevocation } = await import('../../supabase/functions/_shared/app-session-revocation.ts');
const { revokeAccountSessionsTransactionally } = await import('../../supabase/functions/_shared/app-session-revocation-plan.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const REVOCATION = '33333333-3333-4333-8333-333333333333';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-10T00:00:00.000Z';
const EXPIRY = '2026-10-10T01:00:00.000Z';

function harness({ existing = true, outboxCreated = true, sessionInsertRows = [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null }], receipt = null } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: existing ? [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null }] : [] };
    if (sql.includes('from df_private.app_session_revocation_receipts')) return { rows: receipt ? [receipt] : [] };
    if (sql.includes('insert into df_private.app_session_revocation_outbox')) return { rows: outboxCreated ? [{ revocation_id: REVOCATION, owner_id: OWNER, session_id: SESSION }] : [] };
    if (sql.includes('insert into df_private.app_session_revocation_receipts')) return { rows: [{ owner_id: params[0], mutation_id: params[1], request_sha256: params[2], session_ids: JSON.parse(params[3]), current_session_revoked: params[4], provider_revocation_status: params[5] }] };
    if (sql.includes('insert into df_private.app_sessions')) return { rows: sessionInsertRows };
    if (sql.includes('update df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked' }] };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('PostgreSQL app-session adapter persists a new owner-bound session', async () => {
  const h = harness({ existing: false });
  const result = await issueAppSessionTransactionally({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: EXPIRY, store: createPostgresAppSessionStore({ runner: h.runner }) });
  assert.equal(result.ok, true);
  const insert = h.calls.find((call) => call.sql.includes('insert into df_private.app_sessions'));
  assert.deepEqual(insert.params.slice(0, 2), [SESSION, OWNER]);
  assert.equal(insert.params[2], NOW);
});

test('PostgreSQL app-session adapter treats a matching active existing session as an idempotent retry', async () => {
  const h = harness({ existing: true });
  const result = await issueAppSessionTransactionally({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: EXPIRY, store: createPostgresAppSessionStore({ runner: h.runner }) });
  assert.deepEqual(result, { ok: true, record: { ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, status: 'active', expiresAt: EXPIRY, revokedAt: null } });
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.app_sessions')), false);
});

test('PostgreSQL app-session adapter replays a concurrently inserted session row', async () => {
  const calls = [];
  let insertAttempt = true;
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('insert into df_private.app_sessions')) { insertAttempt = false; return { rows: [] }; }
    if (sql.includes('from df_private.app_sessions')) return { rows: insertAttempt ? [] : [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null }] };
    return { rows: [] };
  } }) };
  const result = await issueAppSessionTransactionally({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: EXPIRY, store: createPostgresAppSessionStore({ runner }) });
  assert.deepEqual(result, { ok: true, record: { ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, status: 'active', expiresAt: EXPIRY, revokedAt: null } });
  assert.equal(calls.some((call) => call.sql.includes('on conflict (owner_id, session_id) do nothing')), true);
});

test('PostgreSQL app-session adapter fails closed when session insert is not acknowledged', async () => {
  const h = harness({ existing: false, sessionInsertRows: [] });
  await assert.rejects(
    () => issueAppSessionTransactionally({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: EXPIRY, store: createPostgresAppSessionStore({ runner: h.runner }) }),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL app-session adapter fails closed when the database returns sparse rows', async () => {
  const runner = { withTransaction: async (run) => run({ query: async () => {
    const rows = [];
    rows[1] = { owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null };
    return { rows };
  } }) };
  const store = createPostgresAppSessionStore({ runner });
  await assert.rejects(
    () => store.withTransaction((transaction) => transaction.loadSession(OWNER, SESSION)),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL app-session adapter fails closed on foreign returned insert metadata', async () => {
  const h = harness({ existing: false, sessionInsertRows: [{ owner_id: '44444444-4444-4444-8444-444444444444', session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null }] });
  await assert.rejects(
    () => issueAppSessionTransactionally({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: EXPIRY, store: createPostgresAppSessionStore({ runner: h.runner }) }),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL revocation adapter locks, enqueues idempotently and revokes in one transaction', async () => {
  const h = harness();
  const result = await revokeAndQueueProviderRevocation({ verifiedOwnerId: OWNER, sessionId: SESSION, revocationId: REVOCATION, now: NOW, store: createPostgresSessionRevocationStore({ runner: h.runner }) });
  assert.deepEqual(result, { ok: true, record: { ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, status: 'revoked', expiresAt: EXPIRY, revokedAt: NOW }, outbox: 'created' });
  assert.equal(h.calls.some((call) => call.sql.includes('for update')), true);
  assert.equal(h.calls.some((call) => call.sql.includes('on conflict (owner_id, session_id)')), true);
  assert.equal(h.calls.some((call) => call.sql.includes("status = 'revoked'")), true);
});

test('PostgreSQL revocation adapter does not revoke a missing session', async () => {
  const h = harness({ existing: false });
  const result = await revokeAndQueueProviderRevocation({ verifiedOwnerId: OWNER, sessionId: SESSION, revocationId: REVOCATION, now: NOW, store: createPostgresSessionRevocationStore({ runner: h.runner }) });
  assert.deepEqual(result, { ok: false, reason: 'invalid_input', outbox: 'not_queued' });
  assert.equal(h.calls.some((call) => call.sql.includes('outbox')), false);
});

test('PostgreSQL app-session adapter fails closed on a foreign returned session row', async () => {
  const h = harness();
  const base = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => base((client) => run({
    query: async (sql, params) => {
      const result = await client.query(sql, params);
      if (sql.includes('from df_private.app_sessions')) result.rows[0].owner_id = '44444444-4444-4444-8444-444444444444';
      return result;
    },
  }));
  await assert.rejects(
    () => revokeAndQueueProviderRevocation({ verifiedOwnerId: OWNER, sessionId: SESSION, revocationId: REVOCATION, now: NOW, store: createPostgresSessionRevocationStore({ runner: h.runner }) }),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL app-session adapter fails closed on malformed session timestamps', async () => {
  const h = harness();
  const base = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => base((client) => run({
    query: async (sql, params) => {
      const result = await client.query(sql, params);
      if (sql.includes('from df_private.app_sessions')) result.rows[0].expires_at = 'not-a-timestamp';
      return result;
    },
  }));
  await assert.rejects(
    () => revokeAndQueueProviderRevocation({ verifiedOwnerId: OWNER, sessionId: SESSION, revocationId: REVOCATION, now: NOW, store: createPostgresSessionRevocationStore({ runner: h.runner }) }),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL app-session adapter fails closed on inconsistent status and revocation timestamp', async () => {
  const h = harness();
  const base = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => base((client) => run({
    query: async (sql, params) => {
      const result = await client.query(sql, params);
      if (sql.includes('from df_private.app_sessions')) {
        result.rows[0].status = 'active';
        result.rows[0].revoked_at = NOW;
      }
      return result;
    },
  }));
  await assert.rejects(
    () => revokeAndQueueProviderRevocation({ verifiedOwnerId: OWNER, sessionId: SESSION, revocationId: REVOCATION, now: NOW, store: createPostgresSessionRevocationStore({ runner: h.runner }) }),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL revocation adapter fails closed on a foreign returned outbox row', async () => {
  const h = harness();
  const base = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => base((client) => run({
    query: async (sql, params) => {
      const result = await client.query(sql, params);
      if (sql.includes('insert into df_private.app_session_revocation_outbox')) result.rows[0].owner_id = '44444444-4444-4444-8444-444444444444';
      return result;
    },
  }));
  await assert.rejects(
    () => revokeAndQueueProviderRevocation({ verifiedOwnerId: OWNER, sessionId: SESSION, revocationId: REVOCATION, now: NOW, store: createPostgresSessionRevocationStore({ runner: h.runner }) }),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL account-session adapter lists owner rows, locks them and applies the all-scope plan', async () => {
  const h = harness();
  const result = await revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER,
    currentSessionId: SESSION,
    scope: { scope: 'all' },
    now: NOW,
    recentAuthVerified: true,
    mutationId: MUTATION,
    requestSha256: HASH,
    revocationIdFor: () => REVOCATION,
    store: createPostgresAccountSessionRevocationStore({ runner: h.runner }),
  });
  assert.deepEqual(result, { ownerId: OWNER, sessionIds: [SESSION], currentSessionRevoked: true, providerRevocationStatus: 'pending' });
  assert.equal(h.calls.some((call) => call.sql.includes('where owner_id = $1 order by issued_at desc, session_id desc for update')), true);
  assert.equal(h.calls.some((call) => call.sql.includes('on conflict (owner_id, session_id)')), true);
});

test('PostgreSQL account-session receipt save replays a concurrently inserted frozen receipt', async () => {
  const calls = [];
  const frozen = {
    owner_id: OWNER,
    mutation_id: MUTATION,
    request_sha256: HASH,
    session_ids: [SESSION],
    current_session_revoked: true,
    provider_revocation_status: 'pending',
  };
  let receiptInsert = true;
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_session_revocation_receipts')) return { rows: receiptInsert ? [] : [frozen] };
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null }] };
    if (sql.includes('insert into df_private.app_session_revocation_outbox')) return { rows: [{ revocation_id: REVOCATION, owner_id: OWNER, session_id: SESSION }] };
    if (sql.includes('update df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked' }] };
    if (sql.includes('insert into df_private.app_session_revocation_receipts')) {
      if (receiptInsert) { receiptInsert = false; return { rows: [] }; }
      return { rows: [frozen] };
    }
    return { rows: [] };
  } }) };
  const result = await revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER, currentSessionId: SESSION, scope: { scope: 'all' }, now: NOW,
    recentAuthVerified: true, mutationId: MUTATION, requestSha256: HASH,
    revocationIdFor: () => REVOCATION,
    store: createPostgresAccountSessionRevocationStore({ runner }),
  });
  assert.deepEqual(result, { ownerId: OWNER, sessionIds: [SESSION], currentSessionRevoked: true, providerRevocationStatus: 'pending' });
  assert.equal(calls.some((call) => call.sql.includes('on conflict (owner_id, mutation_id) do nothing')), true);
  assert.equal(calls.filter((call) => call.sql.includes('insert into df_private.app_session_revocation_receipts')).length, 1);
});

test('PostgreSQL account-session receipt save rejects a concurrent different request payload', async () => {
  const foreign = { owner_id: OWNER, mutation_id: MUTATION, request_sha256: 'b'.repeat(64), session_ids: [SESSION], current_session_revoked: true, provider_revocation_status: 'pending' };
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('insert into df_private.app_session_revocation_receipts')) return { rows: [] };
    if (sql.includes('from df_private.app_session_revocation_receipts')) return { rows: [foreign] };
    return { rows: [] };
  } }) };
  const store = createPostgresAccountSessionRevocationStore({ runner });
  await assert.rejects(
    () => store.withTransaction((transaction) => transaction.saveReceipt({ ownerId: OWNER, mutationId: MUTATION, requestSha256: HASH, sessionIds: [SESSION], currentSessionRevoked: true, providerRevocationStatus: 'pending' })),
    (error) => error?.code === 'IDEMPOTENCY_CONFLICT',
  );
});

test('PostgreSQL account-session adapter replays a frozen receipt before listing sessions', async () => {
  const h = harness({ receipt: {
    owner_id: OWNER,
    mutation_id: MUTATION,
    request_sha256: HASH,
    session_ids: [SESSION],
    current_session_revoked: true,
    provider_revocation_status: 'pending',
  } });
  const result = await revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER,
    currentSessionId: SESSION,
    scope: { scope: 'all' },
    now: NOW,
    recentAuthVerified: true,
    mutationId: MUTATION,
    requestSha256: HASH,
    revocationIdFor: () => REVOCATION,
    store: createPostgresAccountSessionRevocationStore({ runner: h.runner }),
  });
  assert.deepEqual(result, { ownerId: OWNER, sessionIds: [SESSION], currentSessionRevoked: true, providerRevocationStatus: 'pending' });
  assert.equal(h.calls.some((call) => call.sql.includes('from df_private.app_session_revocation_receipts')), true);
  assert.equal(h.calls.some((call) => call.sql.includes('order by issued_at desc')), false);
  assert.equal(h.calls.some((call) => call.sql.includes('app_session_revocation_outbox')), false);
});

test('PostgreSQL account-session adapter rejects malformed receipt writes before SQL', async () => {
  for (const overrides of [
    { sessionIds: [SESSION, SESSION] },
    { currentSessionRevoked: 'yes' },
    { providerRevocationStatus: 'unknown' },
  ]) {
    const h = harness();
    await assert.rejects(
      () => createPostgresAccountSessionRevocationStore({ runner: h.runner }).withTransaction((store) => store.saveReceipt({
        ownerId: OWNER, mutationId: MUTATION, requestSha256: HASH, sessionIds: [SESSION],
        currentSessionRevoked: true, providerRevocationStatus: 'pending', ...overrides,
      })),
      (error) => error?.code === 'VALIDATION_FAILED',
    );
    assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.app_session_revocation_receipts')), false);
  }
});

test('PostgreSQL account-session receipts reject sparse session ID arrays before replay or SQL', async () => {
  const sparse = [];
  sparse.length = 1;
  const h = harness();
  await assert.rejects(
    () => createPostgresAccountSessionRevocationStore({ runner: h.runner }).withTransaction((store) => store.saveReceipt({
      ownerId: OWNER, mutationId: MUTATION, requestSha256: HASH, sessionIds: sparse,
      currentSessionRevoked: true, providerRevocationStatus: 'confirmed',
    })),
    (error) => error?.code === 'VALIDATION_FAILED',
  );
  assert.equal(h.calls.length, 0);

  const read = harness({ receipt: {
    owner_id: OWNER, mutation_id: MUTATION, request_sha256: HASH, session_ids: sparse,
    current_session_revoked: true, provider_revocation_status: 'confirmed',
  } });
  await assert.rejects(
    () => createPostgresAccountSessionRevocationStore({ runner: read.runner }).withTransaction((store) => store.loadReceipt({ ownerId: OWNER, mutationId: MUTATION })),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL account-session adapter rejects a receipt row that differs from the requested write', async () => {
  const h = harness();
  const base = h.runner.withTransaction;
  h.runner.withTransaction = async (run) => base((client) => run({
    query: async (sql, params) => {
      const result = await client.query(sql, params);
      if (sql.includes('insert into df_private.app_session_revocation_receipts')) result.rows[0].request_sha256 = 'b'.repeat(64);
      return result;
    },
  }));
  await assert.rejects(
    () => createPostgresAccountSessionRevocationStore({ runner: h.runner }).withTransaction((store) => store.saveReceipt({ ownerId: OWNER, mutationId: MUTATION, requestSha256: HASH, sessionIds: [SESSION], currentSessionRevoked: true, providerRevocationStatus: 'pending' })),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL app-session adapter rejects runtime type confusion before SQL', async () => {
  const h = harness();
  const sessionStore = createPostgresSessionRevocationStore({ runner: h.runner });
  await assert.rejects(() => sessionStore.withTransaction((store) => store.enqueueProviderRevocation({ revocationId: Symbol('id'), ownerId: OWNER, sessionId: SESSION })), (error) => error?.code === 'VALIDATION_FAILED');
  const accountStore = createPostgresAccountSessionRevocationStore({ runner: h.runner });
  await assert.rejects(() => accountStore.withTransaction((store) => store.listSessions(Symbol('owner'))), (error) => error?.code === 'VALIDATION_FAILED');
  await assert.rejects(() => accountStore.withTransaction((store) => store.saveReceipt({ ownerId: OWNER, mutationId: MUTATION, requestSha256: Symbol('hash'), sessionIds: [], currentSessionRevoked: false, providerRevocationStatus: 'pending' })), (error) => error?.code === 'VALIDATION_FAILED');
  assert.equal(h.calls.length, 0);
});

test('PostgreSQL app-session adapter rejects malformed runner and query results safely', async () => {
  assert.throws(() => createPostgresAppSessionStore(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresSessionRevocationStore({ runner: { withTransaction: 'not-a-function' } }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAccountSessionRevocationStore({ runner: null }), /VALIDATION_FAILED/);

  const malformedRunner = { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) };
  await assert.rejects(
    () => issueAppSessionTransactionally({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: EXPIRY, store: createPostgresAppSessionStore({ runner: malformedRunner }) }),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL app-session adapter rejects duplicate singleton rows and non-callable operations', async () => {
  const duplicate = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('from df_private.app_sessions') ? { rows: [
    { owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null },
    { owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null },
  ] } : { rows: [] } }) };
  await assert.rejects(() => createPostgresSessionRevocationStore({ runner: duplicate }).withTransaction((store) => store.loadSession(OWNER, SESSION)), /DEPENDENCY_UNAVAILABLE/);
  const app = createPostgresAppSessionStore({ runner: duplicate });
  assert.throws(() => app.withTransaction(null), /VALIDATION_FAILED/);
  const account = createPostgresAccountSessionRevocationStore({ runner: duplicate });
  assert.throws(() => account.withTransaction(null), /VALIDATION_FAILED/);
});
