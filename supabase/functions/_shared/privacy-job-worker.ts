/** Local lease/fencing state machine for privacy export/deletion workers. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_]{0,79}$/;

export type PrivacyWorkerJob = {
  jobId: string;
  ownerId: string;
  operationId: string;
  kind: 'export' | 'deletion';
  state: 'queued' | 'running' | 'succeeded' | 'failed' | 'expired';
  leaseOwner: string | null;
  fencingVersion: number;
  leaseExpiresAt: string | null;
  attemptCount: number;
  nextAttemptAt: string;
  safeErrorCode: string | null;
  artifactLocator: string | null;
  artifactExpiresAt: string | null;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function clock(value: string): number { const parsed = Date.parse(value); if (!Number.isFinite(parsed)) invalid(); return parsed; }

function validJob(job: unknown): job is PrivacyWorkerJob {
  if (!job || typeof job !== 'object' || Array.isArray(job)) return false;
  const value = job as Partial<PrivacyWorkerJob>;
  const leasePair = value.leaseOwner !== null && value.leaseExpiresAt !== null;
  const leaseFieldsMatch = (value.leaseOwner === null) === (value.leaseExpiresAt === null);
  const noArtifact = value.artifactLocator === null && value.artifactExpiresAt === null;
  return typeof value.jobId === 'string' && UUID.test(value.jobId)
    && typeof value.ownerId === 'string' && UUID.test(value.ownerId)
    && typeof value.operationId === 'string' && UUID.test(value.operationId)
    && (value.kind === 'export' || value.kind === 'deletion')
    && ['queued', 'running', 'succeeded', 'failed', 'expired'].includes(String(value.state))
    && (value.leaseOwner === null || (typeof value.leaseOwner === 'string' && UUID.test(value.leaseOwner)))
    && Number.isSafeInteger(value.fencingVersion) && (value.fencingVersion as number) >= 0
    && (value.leaseExpiresAt === null || (typeof value.leaseExpiresAt === 'string' && Number.isFinite(Date.parse(value.leaseExpiresAt))))
    && Number.isSafeInteger(value.attemptCount) && (value.attemptCount as number) >= 0
    && typeof value.nextAttemptAt === 'string' && Number.isFinite(Date.parse(value.nextAttemptAt))
    && (value.safeErrorCode === null || (typeof value.safeErrorCode === 'string' && SAFE_ERROR.test(value.safeErrorCode)))
    && (value.artifactLocator === null || (typeof value.artifactLocator === 'string' && value.artifactLocator.length > 0 && value.artifactLocator.length <= 2000))
    && (value.artifactExpiresAt === null || (typeof value.artifactExpiresAt === 'string' && Number.isFinite(Date.parse(value.artifactExpiresAt))))
    && leaseFieldsMatch
    && ((value.state === 'running') === leasePair)
    && (value.state === 'succeeded' || noArtifact);
}

function validateJob(job: PrivacyWorkerJob): void { if (!validJob(job)) dependencyFailure(); }

/** Claims only due queued work or a running job whose lease has expired. */
export function claimPrivacyJob(input: { job: PrivacyWorkerJob; workerId: string; now: string; leaseExpiresAt: string; maxAttempts: number }): PrivacyWorkerJob | null {
  validateJob(input.job);
  const now = clock(input.now);
  const leaseExpiresAt = clock(input.leaseExpiresAt);
  if (!UUID.test(input.workerId) || leaseExpiresAt <= now || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1) invalid();
  if (input.job.state === 'succeeded' || input.job.state === 'failed' || input.job.state === 'expired') return null;
  const expiredLease = input.job.state === 'running' && input.job.leaseExpiresAt !== null && Date.parse(input.job.leaseExpiresAt) <= now;
  const due = input.job.state === 'queued' && Date.parse(input.job.nextAttemptAt) <= now;
  if (!expiredLease && !due) return null;
  if (input.job.attemptCount >= input.maxAttempts) return { ...input.job, state: 'failed', leaseOwner: null, leaseExpiresAt: null, safeErrorCode: 'ATTEMPTS_EXHAUSTED' };
  return { ...input.job, state: 'running', leaseOwner: input.workerId, leaseExpiresAt: input.leaseExpiresAt, fencingVersion: input.job.fencingVersion + 1, attemptCount: input.job.attemptCount + 1, safeErrorCode: null };
}

function assertLease(input: { job: PrivacyWorkerJob; workerId: string; now: string }): void {
  validateJob(input.job);
  const now = clock(input.now);
  if (!UUID.test(input.workerId) || input.job.state !== 'running' || input.job.leaseOwner !== input.workerId || input.job.leaseExpiresAt === null || Date.parse(input.job.leaseExpiresAt) <= now) invalid();
}

export function completePrivacyJob(input: { job: PrivacyWorkerJob; workerId: string; now: string; artifactLocator?: string | null; artifactExpiresAt?: string | null }): PrivacyWorkerJob {
  assertLease(input);
  const artifactLocator = input.artifactLocator ?? null;
  const artifactExpiresAt = input.artifactExpiresAt ?? null;
  if ((artifactLocator === null) !== (artifactExpiresAt === null) || (artifactLocator !== null && (artifactLocator.length === 0 || artifactLocator.length > 2000 || artifactExpiresAt === null || Date.parse(artifactExpiresAt) <= Date.parse(input.now)))) invalid();
  return { ...input.job, state: 'succeeded', leaseOwner: null, leaseExpiresAt: null, safeErrorCode: null, artifactLocator, artifactExpiresAt };
}

export function failPrivacyJob(input: { job: PrivacyWorkerJob; workerId: string; now: string; retryAt: string; safeErrorCode: string; maxAttempts: number }): PrivacyWorkerJob {
  assertLease(input);
  const now = clock(input.now);
  if (clock(input.retryAt) <= now || !SAFE_ERROR.test(input.safeErrorCode) || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1) invalid();
  const exhausted = input.job.attemptCount >= input.maxAttempts;
  return { ...input.job, state: exhausted ? 'failed' : 'queued', leaseOwner: null, leaseExpiresAt: null, nextAttemptAt: input.retryAt, safeErrorCode: input.safeErrorCode, artifactLocator: null, artifactExpiresAt: null };
}
