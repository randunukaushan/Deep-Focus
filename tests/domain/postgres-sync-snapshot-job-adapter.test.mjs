import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSyncSnapshotJobStore } = await import('../../supabase/functions/_shared/postgres-sync-snapshot-job-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const JOB = '22222222-2222-4222-8222-222222222222';
const SNAPSHOT = '33333333-3333-4333-8333-333333333333';
const OPERATION = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-10-11T02:00:00.000Z';

function resultRow(overrides = {}) { return { owner_id: OWNER, job_id: JOB, snapshot_id: SNAPSHOT, operation_id: OPERATION, state: 'queued', updated_at: NOW, safe_error_code: null, ...overrides }; }

test('snapshot job enqueue is owner/idempotency bound and returns a coarse queued record', async () => {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql, params }); return { rows: [resultRow()] }; } }) };
  const result = await createPostgresSyncSnapshotJobStore({ runner }).enqueue({ ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT, operationId: OPERATION, now: NOW });
  assert.deepEqual(result, { jobId: JOB, snapshotId: SNAPSHOT, state: 'queued', updatedAt: NOW, safeErrorCode: null });
  assert.deepEqual(calls[0].params, [OWNER, JOB, SNAPSHOT, OPERATION, NOW]);
});

test('repeated snapshot enqueue with the same intent replays the existing job', async () => {
  let inserts = 0;
  const runner = { withTransaction: async (run) => run({ query: async (sql) => { if (sql.includes('insert into')) { inserts += 1; return { rows: [] }; } return { rows: [resultRow()] }; } }) };
  const result = await createPostgresSyncSnapshotJobStore({ runner }).enqueue({ ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT, operationId: OPERATION, now: NOW });
  assert.equal(result.jobId, JOB);
  assert.equal(inserts, 1);
});

test('snapshot enqueue rejects the same operation key with different intent', async () => {
  const runner = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('insert into') ? { rows: [] } : { rows: [resultRow()] } }) };
  await assert.rejects(() => createPostgresSyncSnapshotJobStore({ runner }).enqueue({
    ownerId: OWNER,
    jobId: '55555555-5555-4555-8555-555555555555',
    snapshotId: '66666666-6666-4666-8666-666666666666',
    operationId: OPERATION,
    now: NOW,
  }), /IDEMPOTENCY_CONFLICT/);
});

test('snapshot job enqueue rejects invalid input before database access', async () => {
  let calls = 0;
  const runner = { withTransaction: async (run) => run({ query: async () => { calls += 1; return { rows: [] }; } }) };
  await assert.rejects(() => createPostgresSyncSnapshotJobStore({ runner }).enqueue({ ownerId: OWNER, jobId: 'bad', snapshotId: SNAPSHOT, operationId: OPERATION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(calls, 0);
});

test('snapshot job enqueue rejects a non-failed row carrying a safe error code', async () => {
  const runner = { withTransaction: async (run) => run({ query: async (sql) => sql.includes('insert into') ? { rows: [] } : { rows: [resultRow({ state: 'queued', safe_error_code: 'DEPENDENCY_UNAVAILABLE' })] } }) };
  await assert.rejects(() => createPostgresSyncSnapshotJobStore({ runner }).enqueue({ ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT, operationId: OPERATION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('snapshot job store rejects malformed runner, client and result containers before trusting job state', async () => {
  assert.throws(() => createPostgresSyncSnapshotJobStore(null), /DEPENDENCY_UNAVAILABLE/);
  const malformedClient = createPostgresSyncSnapshotJobStore({ runner: { withTransaction: async (run) => run({ query: 'not-a-function' }) } });
  await assert.rejects(() => malformedClient.enqueue({ ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT, operationId: OPERATION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
  const malformedRows = createPostgresSyncSnapshotJobStore({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) } });
  await assert.rejects(() => malformedRows.enqueue({ ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT, operationId: OPERATION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('snapshot job store fails closed when the enqueue result rows are sparse', async () => {
  const rows = [];
  rows[1] = resultRow();
  const runner = { withTransaction: async (run) => run({ query: async () => ({ rows }) }) };
  await assert.rejects(
    () => createPostgresSyncSnapshotJobStore({ runner }).enqueue({ ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT, operationId: OPERATION, now: NOW }),
    /DEPENDENCY_UNAVAILABLE/,
  );
});
