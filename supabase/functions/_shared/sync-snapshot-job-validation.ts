/** Local validation for the coarse durable sync-snapshot request response. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATES = new Set(['queued', 'running', 'succeeded', 'failed', 'expired']);

export type SyncSnapshotJob = { id: string; snapshotId: string; kind: 'snapshot'; state: 'queued' | 'running' | 'succeeded' | 'failed' | 'expired'; updatedAt: string; safeErrorCode: string | null };

function invalid(): never { throw new RangeError('INVALID_SYNC_SNAPSHOT_JOB'); }

export function validateSyncSnapshotJob(value: unknown): SyncSnapshotJob {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  const job = value as Record<string, unknown>;
  if (Object.keys(job).sort().join(',') !== 'id,kind,safeErrorCode,snapshotId,state,updatedAt'
    || typeof job.id !== 'string' || !UUID.test(job.id)
    || job.kind !== 'snapshot' || typeof job.snapshotId !== 'string' || !UUID.test(job.snapshotId)
    || typeof job.state !== 'string' || !STATES.has(job.state)
    || typeof job.updatedAt !== 'string' || !Number.isFinite(Date.parse(job.updatedAt))
    || (job.safeErrorCode !== null && (typeof job.safeErrorCode !== 'string' || !/^[A-Z][A-Z0-9_]{0,79}$/.test(job.safeErrorCode)))
    || (job.state !== 'failed' && job.safeErrorCode !== null)) invalid();
  return { id: job.id, snapshotId: job.snapshotId, kind: 'snapshot', state: job.state as SyncSnapshotJob['state'], updatedAt: job.updatedAt, safeErrorCode: job.safeErrorCode as string | null };
}

export function validateEmptySyncSnapshotRequest(value: unknown): Record<string, never> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 0) invalid();
  return {};
}
