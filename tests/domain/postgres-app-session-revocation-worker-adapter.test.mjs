import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresRevocationWorkerStore } = await import('../../supabase/functions/_shared/postgres-app-session-revocation-worker-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const REVOCATION = '33333333-3333-4333-8333-333333333333';
const LEASE = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-10-11T01:00:00.000Z';
const LATER = '2026-10-11T01:05:00.000Z';

function job(overrides = {}) {
  return { revocation_id: REVOCATION, owner_id: OWNER, session_id: SESSION, state: 'pending', attempt_count: 0, next_attempt_at: '2026-10-11T00:00:00.000Z', lease_id: null, lease_until: null, provider_error_code: null, ...overrides };
}

function makeRunner(query) {
  let transactions = 0;
  return {
    get transactions() { return transactions; },
    runner: { withTransaction: async (run) => { transactions += 1; return run({ query }); } },
  };
}

test('worker adapter lists validated due rows without trusting malformed shapes', async () => {
  const h = makeRunner(async () => ({ rows: [job()] }));
  const store = createPostgresRevocationWorkerStore({ runner: h.runner });
  const result = await store.listDue({ now: NOW, limit: 10 });
  assert.deepEqual(result, [{ revocationId: REVOCATION, ownerId: OWNER, sessionId: SESSION, state: 'pending', attemptCount: 0, nextAttemptAt: '2026-10-11T00:00:00.000Z', leaseId: null, leaseUntil: null, providerErrorCode: null }]);
  assert.equal(h.transactions, 1);
});

test('worker adapter claims, completes and fails only validated lease rows', async () => {
  const calls = [];
  let hasClaimed = false;
  const h = makeRunner(async (sql) => {
    calls.push(sql);
    if (sql.includes('update df_private.app_session_revocation_outbox')) {
      if (sql.includes("set state = 'succeeded'")) return { rows: [job({ state: 'succeeded' })] };
      hasClaimed = true;
      return { rows: [job({ state: 'processing', attempt_count: 1, lease_id: LEASE, lease_until: LATER })] };
    }
    return { rows: [job(hasClaimed ? { state: 'processing', attempt_count: 1, lease_id: LEASE, lease_until: LATER } : {})] };
  });
  const store = createPostgresRevocationWorkerStore({ runner: h.runner });
  const claimed = await store.claim({ revocationId: REVOCATION, workerLeaseId: LEASE, now: NOW, leaseUntil: LATER, maxAttempts: 3 });
  assert.equal(claimed.state, 'processing');
  const completed = await store.complete({ revocationId: REVOCATION, workerLeaseId: LEASE, now: NOW });
  assert.equal(completed.state, 'succeeded');
  assert.equal(calls.filter((sql) => sql.includes('update df_private')).length, 2);
});

test('worker adapter rejects malformed result containers and duplicate rows', async () => {
  const malformed = createPostgresRevocationWorkerStore({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) } });
  await assert.rejects(() => malformed.listDue({ now: NOW, limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
  const duplicate = createPostgresRevocationStoreForRows([job(), job()]);
  await assert.rejects(() => duplicate.claim({ revocationId: REVOCATION, workerLeaseId: LEASE, now: NOW, leaseUntil: LATER, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('worker adapter fails closed when due rows are sparse', async () => {
  const rows = [];
  rows[1] = job();
  const sparse = createPostgresRevocationStoreForRows(rows);
  await assert.rejects(() => sparse.listDue({ now: NOW, limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
});

test('worker adapter rejects returned rows that cross owner or session identity', async () => {
  const h = makeRunner(async (sql) => {
    if (sql.includes('update df_private.app_session_revocation_outbox')) {
      return { rows: [job({ owner_id: '55555555-5555-4555-8555-555555555555' })] };
    }
    return { rows: [job()] };
  });
  const store = createPostgresRevocationWorkerStore({ runner: h.runner });
  await assert.rejects(
    () => store.claim({ revocationId: REVOCATION, workerLeaseId: LEASE, now: NOW, leaseUntil: LATER, maxAttempts: 3 }),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('worker adapter rejects malformed configuration and requests before opening a transaction', async () => {
  assert.throws(() => createPostgresRevocationWorkerStore({ runner: {} }), /VALIDATION_FAILED/);
  let opened = 0;
  const store = createPostgresRevocationWorkerStore({ runner: { withTransaction: async () => { opened += 1; throw new Error('must not open'); } } });
  assert.throws(() => store.listDue({ now: NOW, limit: 0 }), /VALIDATION_FAILED/);
  assert.throws(() => store.claim({ revocationId: 'bad', workerLeaseId: LEASE, now: NOW, leaseUntil: LATER, maxAttempts: 3 }), /VALIDATION_FAILED/);
  assert.equal(opened, 0);
});

function createPostgresRevocationStoreForRows(rows) {
  return createPostgresRevocationWorkerStore({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows }) }) } });
}
