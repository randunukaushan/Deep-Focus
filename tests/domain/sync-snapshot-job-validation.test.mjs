import assert from 'node:assert/strict';
import test from 'node:test';

const { validateEmptySyncSnapshotRequest, validateSyncSnapshotJob } = await import('../../supabase/functions/_shared/sync-snapshot-job-validation.ts');

const JOB = '11111111-1111-4111-8111-111111111111';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const base = { id: JOB, snapshotId: SNAPSHOT, kind: 'snapshot', state: 'queued', updatedAt: '2026-10-11T02:00:00.000Z', safeErrorCode: null };

test('snapshot request and coarse job response have exact bounded shapes', () => {
  assert.deepEqual(validateEmptySyncSnapshotRequest({}), {});
  assert.deepEqual(validateSyncSnapshotJob(base), base);
  assert.throws(() => validateEmptySyncSnapshotRequest({ scope: 'all' }), /INVALID_SYNC_SNAPSHOT_JOB/);
  assert.throws(() => validateSyncSnapshotJob({ ...base, state: 'ready' }), /INVALID_SYNC_SNAPSHOT_JOB/);
  assert.throws(() => validateSyncSnapshotJob({ ...base, safeErrorCode: 'FAILED', state: 'queued' }), /INVALID_SYNC_SNAPSHOT_JOB/);
});
