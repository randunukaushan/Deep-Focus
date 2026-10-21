import assert from 'node:assert/strict';
import test from 'node:test';

const { recheckPostgresAppSession } = await import('../../supabase/functions/_shared/postgres-session-guard.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';

function client(rows) {
  let calls = 0;
  return { get calls() { return calls; }, query: async () => { calls += 1; return { rows }; } };
}

test('session guard accepts one active, unrevoked owner-bound row', async () => {
  await recheckPostgresAppSession(client([{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }]), OWNER, SESSION);
});

test('session guard rejects malformed runtime identities before SQL', async () => {
  const h = client([]);
  await assert.rejects(() => recheckPostgresAppSession(h, Symbol('owner'), SESSION), /VALIDATION_FAILED/);
  assert.equal(h.calls, 0);
});

test('session guard rejects missing, foreign or revoked sessions as authentication failures', async () => {
  await assert.rejects(() => recheckPostgresAppSession(client([]), OWNER, SESSION), /AUTH_REQUIRED/);
  await assert.rejects(() => recheckPostgresAppSession(client([{ owner_id: '33333333-3333-4333-8333-333333333333', session_id: SESSION, status: 'active', revoked_at: null }]), OWNER, SESSION), /AUTH_REQUIRED/);
  await assert.rejects(() => recheckPostgresAppSession(client([{ owner_id: OWNER, session_id: SESSION, status: 'revoked', revoked_at: '2026-10-10T00:00:00.000Z' }]), OWNER, SESSION), /AUTH_REQUIRED/);
});

test('session guard fails closed on malformed or ambiguous database results', async () => {
  const malformed = { query: async () => ({ rows: null }) };
  await assert.rejects(() => recheckPostgresAppSession(malformed, OWNER, SESSION), /DEPENDENCY_UNAVAILABLE/);
  const duplicate = client([{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }, { owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }]);
  await assert.rejects(() => recheckPostgresAppSession(duplicate, OWNER, SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('session guard fails closed on sparse database rows before accepting the session', async () => {
  const rows = [];
  rows[1] = { owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null };
  await assert.rejects(() => recheckPostgresAppSession(client(rows), OWNER, SESSION), /DEPENDENCY_UNAVAILABLE/);
});

test('session guard rejects malformed database client dependencies safely', async () => {
  await assert.rejects(() => recheckPostgresAppSession(null, OWNER, SESSION), /DEPENDENCY_UNAVAILABLE/);
  await assert.rejects(() => recheckPostgresAppSession({ query: 'not-a-function' }, OWNER, SESSION), /DEPENDENCY_UNAVAILABLE/);
});
