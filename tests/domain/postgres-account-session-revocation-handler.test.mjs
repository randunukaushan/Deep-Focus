import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAccountSessionRevocationHandler } = await import('../../supabase/functions/_shared/postgres-account-session-revocation-handler.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const MUTATION = '33333333-3333-4333-8333-333333333333';
const REVOCATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T03:00:00.000Z';

function harness() {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_session_revocation_receipts')) return { rows: [] };
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: '2026-10-10T00:00:00.000Z', expires_at: '2026-10-12T00:00:00.000Z', revoked_at: null }] };
    if (sql.includes('app_session_revocation_outbox')) return { rows: [{ revocation_id: REVOCATION, owner_id: OWNER, session_id: SESSION }] };
    if (sql.includes('app_session_revocation_receipts')) return { rows: [{ owner_id: params[0], mutation_id: params[1], request_sha256: params[2], session_ids: JSON.parse(params[3]), current_session_revoked: params[4], provider_revocation_status: params[5] }] };
    if (sql.includes('update df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'revoked' }] };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('handler composes admitted all-scope request into one owner-bound response', async () => {
  const h = harness();
  const handler = createPostgresAccountSessionRevocationHandler({ runner: h.runner, now: () => NOW, createRevocationId: () => REVOCATION });
  const result = await handler({ actorId: OWNER, currentSessionId: SESSION, requestId: MUTATION, requestSha256: HASH, body: { scope: 'all' } });
  assert.deepEqual(result, { responseStatus: 200, responseBody: { data: { revokedCount: 1, currentSessionRevoked: true, providerRevocationStatus: 'pending' } } });
  assert.equal(h.calls.some((call) => call.sql.includes('for update')), true);
  assert.equal(h.calls.some((call) => call.sql.includes('app_session_revocation_outbox')), true);
  assert.equal(h.calls.some((call) => call.sql.includes('app_session_revocation_receipts')), true);
});

test('handler rejects a body shape or identity before opening a transaction', async () => {
  let transactions = 0;
  const handler = createPostgresAccountSessionRevocationHandler({ runner: { withTransaction: async () => { transactions += 1; throw new Error('must not run'); } }, now: () => NOW });
  await assert.rejects(() => handler({ actorId: OWNER, currentSessionId: SESSION, requestId: MUTATION, requestSha256: HASH, body: { scope: 'all', sessionId: SESSION } }), /VALIDATION_FAILED/);
  await assert.rejects(() => handler({ actorId: 'not-an-id', currentSessionId: SESSION, requestId: MUTATION, requestSha256: HASH, body: { scope: 'all' } }), /VALIDATION_FAILED/);
  assert.equal(transactions, 0);
});

test('handler rejects runtime type confusion before opening a transaction', async () => {
  let transactions = 0;
  const handler = createPostgresAccountSessionRevocationHandler({ runner: { withTransaction: async () => { transactions += 1; throw new Error('must not run'); } }, now: () => NOW });
  await assert.rejects(() => handler({ actorId: Symbol('owner'), currentSessionId: SESSION, requestId: MUTATION, requestSha256: HASH, body: { scope: 'all' } }), /VALIDATION_FAILED/);
  await assert.rejects(() => handler({ actorId: OWNER, currentSessionId: SESSION, requestId: MUTATION, requestSha256: HASH, body: null }), /VALIDATION_FAILED/);
  assert.equal(transactions, 0);
});

test('handler rejects malformed dependencies and request containers at the boundary', async () => {
  assert.throws(() => createPostgresAccountSessionRevocationHandler({ runner: {}, now: () => NOW }), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAccountSessionRevocationHandler({ runner: { withTransaction: async () => null }, now: null }), /VALIDATION_FAILED/);
  const handler = createPostgresAccountSessionRevocationHandler({ runner: { withTransaction: async () => { throw new Error('must not open'); } }, now: () => NOW });
  await assert.rejects(() => handler(null), /VALIDATION_FAILED/);
});
