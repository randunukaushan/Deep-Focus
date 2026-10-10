import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAppSessionStore, createPostgresSessionRevocationStore } = await import('../../supabase/functions/_shared/postgres-app-session-adapter.ts');
const { issueAppSessionTransactionally } = await import('../../supabase/functions/_shared/app-session.ts');
const { revokeAndQueueProviderRevocation } = await import('../../supabase/functions/_shared/app-session-revocation.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const REVOCATION = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-10-10T00:00:00.000Z';
const EXPIRY = '2026-10-10T01:00:00.000Z';

function harness({ existing = true, outboxCreated = true, sessionInsertRows = [{ owner_id: OWNER, session_id: SESSION }] } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: existing ? [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: EXPIRY, revoked_at: null }] : [] };
    if (sql.includes('insert into df_private.app_session_revocation_outbox')) return { rows: outboxCreated ? [{ revocation_id: REVOCATION, owner_id: OWNER, session_id: SESSION }] : [] };
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
  assert.deepEqual(h.calls[0].params.slice(0, 2), [SESSION, OWNER]);
  assert.equal(h.calls[0].params[2], NOW);
});

test('PostgreSQL app-session adapter fails closed when session insert is not acknowledged', async () => {
  const h = harness({ existing: false, sessionInsertRows: [] });
  await assert.rejects(
    () => issueAppSessionTransactionally({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: EXPIRY, store: createPostgresAppSessionStore({ runner: h.runner }) }),
    (error) => error?.code === 'DEPENDENCY_UNAVAILABLE',
  );
});

test('PostgreSQL app-session adapter fails closed on foreign returned insert metadata', async () => {
  const h = harness({ existing: false, sessionInsertRows: [{ owner_id: '44444444-4444-4444-8444-444444444444', session_id: SESSION }] });
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
