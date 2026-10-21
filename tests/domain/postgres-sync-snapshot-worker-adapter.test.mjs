import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSyncSnapshotWorkerStore } = await import('../../supabase/functions/_shared/postgres-sync-snapshot-worker-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const JOB = '22222222-2222-4222-8222-222222222222';
const SNAPSHOT = '33333333-3333-4333-8333-333333333333';
const WORKER = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-10-11T02:00:00.000Z';
const LEASE = '2026-10-11T02:05:00.000Z';
const RETRY = '2026-10-11T02:01:00.000Z';

function job(overrides = {}) { return { owner_id: OWNER, job_id: JOB, snapshot_id: SNAPSHOT, state: 'queued', lease_owner: null, fencing_version: 0, lease_expires_at: null, attempt_count: 0, next_attempt_at: NOW, safe_error_code: null, ...overrides }; }

function harness(row = job(), returnedRow = null) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => {
    const normalized = sql.replace(/\s+/g, ' ').trim(); calls.push({ sql: normalized, params });
    if (normalized.startsWith('update df_private.sync_snapshot_jobs')) {
      const nextState = normalized.includes("set state = 'succeeded'") ? 'succeeded' : params[2];
      const isClaim = normalized.includes('fencing_version = $9');
      const isFail = normalized.includes('next_attempt_at = $4');
      return { rows: [returnedRow ?? { ...row, state: nextState, lease_owner: nextState === 'running' ? WORKER : null, lease_expires_at: nextState === 'running' ? LEASE : null, fencing_version: nextState === 'running' ? 1 : row.fencing_version, safe_error_code: isFail ? params[4] : isClaim ? params[7] : null, next_attempt_at: isFail ? params[3] : row.next_attempt_at }] };
    }
    if (normalized.includes('from df_private.sync_snapshot_jobs')) return { rows: [row] };
    return { rows: [] };
  } }) };
  return { runner, calls };
}

test('worker adapter claims with owner/job/fencing predicates and maps the row', async () => {
  const h = harness();
  const claimed = await createPostgresSyncSnapshotWorkerStore(h).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 });
  assert.equal(claimed.state, 'running');
  assert.equal(claimed.fencingVersion, 1);
  assert.equal(h.calls.some((call) => call.sql.includes('for update')), true);
  assert.deepEqual(h.calls.at(-1).params.slice(0, 2), [OWNER, JOB]);
});

test('worker adapter listDue fails closed when storage returns a sparse job array', async () => {
  const sparse = [];
  sparse[1] = job();
  const runner = { withTransaction: async (run) => run({ query: async () => ({ rows: sparse }) }) };
  await assert.rejects(() => createPostgresSyncSnapshotWorkerStore({ runner }).listDue({ now: NOW, limit: 10 }), /DEPENDENCY_UNAVAILABLE/);
});

test('worker adapter normalizes PostgreSQL bigint fencing versions', async () => {
  const h = harness(job({ fencing_version: '0' }));
  const claimed = await createPostgresSyncSnapshotWorkerStore(h).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 });
  assert.equal(claimed.fencingVersion, 1);
});

test('worker adapter completes only the current fenced lease', async () => {
  const h = harness(job({ state: 'running', lease_owner: WORKER, fencing_version: 1, lease_expires_at: LEASE, attempt_count: 1 }));
  const completed = await createPostgresSyncSnapshotWorkerStore(h).complete({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW });
  assert.equal(completed.state, 'succeeded');
  assert.equal(h.calls.at(-1).params.at(-1), 1);
});

test('worker adapter retries without persisting a transient error code', async () => {
  const h = harness(job({ state: 'running', lease_owner: WORKER, fencing_version: 1, lease_expires_at: LEASE, attempt_count: 1 }));
  const retried = await createPostgresSyncSnapshotWorkerStore(h).fail({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, retryAt: RETRY, safeErrorCode: 'DEPENDENCY_UNAVAILABLE', maxAttempts: 3 });
  assert.equal(retried.state, 'queued');
  assert.equal(retried.safeErrorCode, null);
  assert.equal(h.calls.at(-1).params[4], null);
});

test('worker adapter validates before storage and rejects malformed returned rows', async () => {
  let calls = 0;
  const noQuery = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  await assert.rejects(() => createPostgresSyncSnapshotWorkerStore({ runner: noQuery }).claim({ ownerId: 'bad', jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
  const malformed = harness(job({ state: 'queued', safe_error_code: 'raw error' }));
  await assert.rejects(() => createPostgresSyncSnapshotWorkerStore({ runner: malformed.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  const partialLease = harness(job({ lease_owner: WORKER, lease_expires_at: null }));
  await assert.rejects(() => createPostgresSyncSnapshotWorkerStore({ runner: partialLease.runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('worker adapter rejects a foreign row returned by a claimed owner query', async () => {
  const h = harness(job(), job({ owner_id: '88888888-8888-4888-8888-888888888888' }));
  await assert.rejects(() => createPostgresSyncSnapshotWorkerStore(h).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('worker adapter rejects a returned job bound to another snapshot', async () => {
  const h = harness(job(), job({ snapshot_id: '88888888-8888-4888-8888-888888888888' }));
  await assert.rejects(() => createPostgresSyncSnapshotWorkerStore(h).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});

test('worker adapter rejects malformed dependencies and requests before opening a transaction', async () => {
  let transactions = 0;
  const runner = { withTransaction: async () => { transactions += 1; throw new Error('must not open'); } };
  assert.throws(() => createPostgresSyncSnapshotWorkerStore({ runner: null }), /VALIDATION_FAILED/);
  const store = createPostgresSyncSnapshotWorkerStore({ runner });
  await assert.rejects(() => store.listDue({ now: Symbol('now'), limit: 1 }), /VALIDATION_FAILED/);
  await assert.rejects(() => store.claim({ ownerId: OWNER, jobId: JOB, workerId: Symbol('worker'), now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /VALIDATION_FAILED/);
  await assert.rejects(() => store.complete({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: 'bad' }), /VALIDATION_FAILED/);
  await assert.rejects(() => store.fail({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, retryAt: RETRY, safeErrorCode: 'raw error', maxAttempts: 3 }), /VALIDATION_FAILED/);
  assert.equal(transactions, 0);
});

test('worker claim fails closed on sparse current rows before lease update', async () => {
  const sparse = [];
  sparse[1] = job();
  let updates = 0;
  const runner = { withTransaction: async (run) => run({ query: async (sql) => {
    if (sql.includes('from df_private.sync_snapshot_jobs')) return { rows: sparse };
    updates += 1;
    return { rows: [] };
  } }) };
  await assert.rejects(() => createPostgresSyncSnapshotWorkerStore({ runner }).claim({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(updates, 0);
});
