/** Local lease/fencing state machine for sync snapshot jobs. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_]{0,79}$/;

export type SyncSnapshotWorkerJob = {
  jobId: string;
  ownerId: string;
  snapshotId: string;
  state: 'queued' | 'running' | 'succeeded' | 'failed' | 'expired';
  leaseOwner: string | null;
  fencingVersion: number;
  leaseExpiresAt: string | null;
  attemptCount: number;
  nextAttemptAt: string;
  safeErrorCode: string | null;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function clock(value: string): number { const parsed = Date.parse(value); if (!Number.isFinite(parsed)) invalid(); return parsed; }

function validJob(job: unknown): job is SyncSnapshotWorkerJob {
  if (!job || typeof job !== 'object' || Array.isArray(job)) return false;
  const value = job as Partial<SyncSnapshotWorkerJob>;
  const leasePair = value.leaseOwner !== null && value.leaseExpiresAt !== null;
  const leaseFieldsMatch = (value.leaseOwner === null) === (value.leaseExpiresAt === null);
  return typeof value.jobId === 'string' && UUID.test(value.jobId)
    && typeof value.ownerId === 'string' && UUID.test(value.ownerId)
    && typeof value.snapshotId === 'string' && UUID.test(value.snapshotId)
    && ['queued', 'running', 'succeeded', 'failed', 'expired'].includes(String(value.state))
    && (value.leaseOwner === null || (typeof value.leaseOwner === 'string' && UUID.test(value.leaseOwner)))
    && (value.leaseExpiresAt === null || (typeof value.leaseExpiresAt === 'string' && Number.isFinite(Date.parse(value.leaseExpiresAt))))
    && Number.isSafeInteger(value.fencingVersion) && (value.fencingVersion as number) >= 0
    && Number.isSafeInteger(value.attemptCount) && (value.attemptCount as number) >= 0
    && typeof value.nextAttemptAt === 'string' && Number.isFinite(Date.parse(value.nextAttemptAt))
    && (value.safeErrorCode === null || (typeof value.safeErrorCode === 'string' && SAFE_ERROR.test(value.safeErrorCode)))
    && leaseFieldsMatch
    && ((value.state === 'running') === leasePair)
    && (value.state !== 'failed' || value.safeErrorCode !== null)
    && (value.state === 'failed' || value.safeErrorCode === null);
}

function validateJob(job: SyncSnapshotWorkerJob): void { if (!validJob(job)) dependencyFailure(); }

export function claimSyncSnapshotJob(input: { job: SyncSnapshotWorkerJob; workerId: string; now: string; leaseExpiresAt: string; maxAttempts: number }): SyncSnapshotWorkerJob | null {
  validateJob(input.job);
  const now = clock(input.now); const leaseExpiresAt = clock(input.leaseExpiresAt);
  if (!UUID.test(input.workerId) || leaseExpiresAt <= now || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1) invalid();
  if (['succeeded', 'failed', 'expired'].includes(input.job.state)) return null;
  const expiredLease = input.job.state === 'running' && input.job.leaseExpiresAt !== null && Date.parse(input.job.leaseExpiresAt) <= now;
  const due = input.job.state === 'queued' && Date.parse(input.job.nextAttemptAt) <= now;
  if (!expiredLease && !due) return null;
  if (input.job.attemptCount >= input.maxAttempts) return { ...input.job, state: 'failed', leaseOwner: null, leaseExpiresAt: null, safeErrorCode: 'ATTEMPTS_EXHAUSTED' };
  return { ...input.job, state: 'running', leaseOwner: input.workerId, leaseExpiresAt: input.leaseExpiresAt, fencingVersion: input.job.fencingVersion + 1, attemptCount: input.job.attemptCount + 1, safeErrorCode: null };
}

function assertLease(input: { job: SyncSnapshotWorkerJob; workerId: string; now: string }): void {
  validateJob(input.job);
  const now = clock(input.now);
  if (!UUID.test(input.workerId) || input.job.state !== 'running' || input.job.leaseOwner !== input.workerId || input.job.leaseExpiresAt === null || Date.parse(input.job.leaseExpiresAt) <= now) invalid();
}

export function completeSyncSnapshotJob(input: { job: SyncSnapshotWorkerJob; workerId: string; now: string }): SyncSnapshotWorkerJob {
  assertLease(input);
  return { ...input.job, state: 'succeeded', leaseOwner: null, leaseExpiresAt: null, safeErrorCode: null };
}

export function failSyncSnapshotJob(input: { job: SyncSnapshotWorkerJob; workerId: string; now: string; retryAt: string; safeErrorCode: string; maxAttempts: number }): SyncSnapshotWorkerJob {
  assertLease(input);
  const now = clock(input.now); const retryAt = clock(input.retryAt);
  if (retryAt <= now || !SAFE_ERROR.test(input.safeErrorCode) || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1) invalid();
  const exhausted = input.job.attemptCount >= input.maxAttempts;
  return { ...input.job, state: exhausted ? 'failed' : 'queued', leaseOwner: null, leaseExpiresAt: null, nextAttemptAt: input.retryAt, safeErrorCode: exhausted ? input.safeErrorCode : null };
}
