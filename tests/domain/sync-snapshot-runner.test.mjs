import assert from 'node:assert/strict';
import test from 'node:test';

const { runSyncSnapshotJob } = await import('../../supabase/functions/_shared/sync-snapshot-runner.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const JOB = '22222222-2222-4222-8222-222222222222';
const SNAPSHOT = '33333333-3333-4333-8333-333333333333';
const WORKER = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-10-11T02:00:00.000Z';
const LEASE = '2026-10-11T02:05:00.000Z';

function job(overrides = {}) { return { jobId: JOB, ownerId: OWNER, snapshotId: SNAPSHOT, state: 'running', leaseOwner: WORKER, fencingVersion: 1, leaseExpiresAt: LEASE, attemptCount: 1, nextAttemptAt: NOW, safeErrorCode: null, ...overrides }; }
function store(overrides = {}) { return { claim: async () => job(), complete: async () => job({ state: 'succeeded', leaseOwner: null, leaseExpiresAt: null }), fail: async (input) => job({ state: 'queued', leaseOwner: null, leaseExpiresAt: null, safeErrorCode: null, nextAttemptAt: input.retryAt }), ...overrides }; }

test('runner passes only verified job identity to materializer and completes success', async () => {
  let materializerInput;
  const result = await runSyncSnapshotJob({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3, store: store(), materialize: async (input) => { materializerInput = input; } });
  assert.equal(result.state, 'succeeded');
  assert.deepEqual(materializerInput, { ownerId: OWNER, jobId: JOB, snapshotId: SNAPSHOT });
});

test('runner maps materializer failure to bounded safe retry without raw error data', async () => {
  let failed;
  const result = await runSyncSnapshotJob({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3, retryBaseDelayMs: 1000, retryMaxDelayMs: 5000, store: store({ fail: async (input) => { failed = input; return job({ state: 'queued', leaseOwner: null, leaseExpiresAt: null, nextAttemptAt: input.retryAt, safeErrorCode: null }); } }), materialize: async () => { throw { code: 'TIMEOUT', message: 'secret=must-not-persist' }; } });
  assert.equal(result.state, 'queued');
  assert.equal(failed.safeErrorCode, 'TIMEOUT');
  assert.equal(failed.retryAt, '2026-10-11T02:00:02.000Z');
});

test('runner replaces unsafe materializer error codes and does not run without a claim', async () => {
  let called = false;
  const result = await runSyncSnapshotJob({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3, store: store({ claim: async () => null, fail: async () => { throw new Error('must not fail'); } }), materialize: async () => { called = true; } });
  assert.equal(result, null);
  assert.equal(called, false);
  let failed;
  await runSyncSnapshotJob({ ownerId: OWNER, jobId: JOB, workerId: WORKER, now: NOW, leaseExpiresAt: LEASE, maxAttempts: 3, store: store({ fail: async (input) => { failed = input; return job({ state: 'queued', leaseOwner: null, leaseExpiresAt: null }); } }), materialize: async () => { throw { code: 'raw secret' }; } });
  assert.equal(failed.safeErrorCode, 'DEPENDENCY_UNAVAILABLE');
});
