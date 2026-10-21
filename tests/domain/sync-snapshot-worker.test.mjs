import assert from 'node:assert/strict';
import test from 'node:test';
import { claimSyncSnapshotJob, completeSyncSnapshotJob, failSyncSnapshotJob } from '../../supabase/functions/_shared/sync-snapshot-worker.ts';

const base = { jobId: '11111111-1111-4111-8111-111111111111', ownerId: '22222222-2222-4222-8222-222222222222', snapshotId: '33333333-3333-4333-8333-333333333333', state: 'queued', leaseOwner: null, fencingVersion: 0, leaseExpiresAt: null, attemptCount: 0, nextAttemptAt: '2026-10-11T00:00:00.000Z', safeErrorCode: null };
const worker = '44444444-4444-4444-8444-444444444444';
const other = '55555555-5555-4555-8555-555555555555';
const now = '2026-10-11T00:01:00.000Z';

test('snapshot worker claims due work and fences each attempt', () => {
  const claimed = claimSyncSnapshotJob({ job: base, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  assert.equal(claimed?.state, 'running');
  assert.equal(claimed?.fencingVersion, 1);
  assert.equal(claimed?.leaseOwner, worker);
});

test('expired or foreign leases cannot complete a snapshot', () => {
  const claimed = claimSyncSnapshotJob({ job: base, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  assert.throws(() => completeSyncSnapshotJob({ job: claimed, workerId: other, now }), /VALIDATION_FAILED/);
  assert.throws(() => completeSyncSnapshotJob({ job: { ...claimed, leaseExpiresAt: now }, workerId: worker, now }), /VALIDATION_FAILED/);
});

test('successful snapshot completion is terminal and clears the lease', () => {
  const claimed = claimSyncSnapshotJob({ job: base, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  const completed = completeSyncSnapshotJob({ job: claimed, workerId: worker, now });
  assert.deepEqual({ state: completed.state, leaseOwner: completed.leaseOwner, safeErrorCode: completed.safeErrorCode }, { state: 'succeeded', leaseOwner: null, safeErrorCode: null });
});

test('retry clears transient error while exhausted attempts retain only a safe terminal code', () => {
  const claimed = claimSyncSnapshotJob({ job: base, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  const retry = failSyncSnapshotJob({ job: claimed, workerId: worker, now, retryAt: '2026-10-11T00:03:00.000Z', safeErrorCode: 'DEPENDENCY_UNAVAILABLE', maxAttempts: 3 });
  assert.deepEqual({ state: retry.state, safeErrorCode: retry.safeErrorCode }, { state: 'queued', safeErrorCode: null });
  const exhaustedClaim = claimSyncSnapshotJob({ job: { ...base, attemptCount: 3 }, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  assert.deepEqual({ state: exhaustedClaim.state, safeErrorCode: exhaustedClaim.safeErrorCode }, { state: 'failed', safeErrorCode: 'ATTEMPTS_EXHAUSTED' });
  assert.throws(() => failSyncSnapshotJob({ job: claimed, workerId: worker, now, retryAt: '2026-10-11T00:03:00.000Z', safeErrorCode: 'raw provider secret', maxAttempts: 3 }), /VALIDATION_FAILED/);
});

test('snapshot worker rejects a partial lease pair as corrupted state', () => {
  assert.throws(() => claimSyncSnapshotJob({ job: { ...base, leaseOwner: worker }, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => completeSyncSnapshotJob({ job: { ...base, state: 'running', leaseOwner: worker }, workerId: worker, now }), /DEPENDENCY_UNAVAILABLE/);
});
