/** Local lease/fencing state machine for provider-revocation outbox workers. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_.-]{0,63}$/;

function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isTimestamp(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

export type RevocationOutboxJob = {
  revocationId: string;
  ownerId: string;
  sessionId: string;
  state: 'pending' | 'processing' | 'succeeded' | 'failed';
  attemptCount: number;
  nextAttemptAt: string;
  leaseId: string | null;
  leaseUntil: string | null;
  providerErrorCode: string | null;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function validJob(job: unknown): job is RevocationOutboxJob {
  if (!job || typeof job !== 'object' || Array.isArray(job)) return false;
  const value = job as Partial<RevocationOutboxJob>;
  const leaseFieldsMatch = (value.leaseId === null) === (value.leaseUntil === null);
  return isUuid(value.revocationId)
    && isUuid(value.ownerId)
    && isUuid(value.sessionId)
    && ['pending', 'processing', 'succeeded', 'failed'].includes(String(value.state))
    && typeof value.attemptCount === 'number' && Number.isSafeInteger(value.attemptCount) && value.attemptCount >= 0
    && isTimestamp(value.nextAttemptAt)
    && (value.leaseId === null || isUuid(value.leaseId))
    && (value.leaseUntil === null || isTimestamp(value.leaseUntil))
    && (value.providerErrorCode === null || (typeof value.providerErrorCode === 'string' && SAFE_ERROR.test(value.providerErrorCode)))
    && leaseFieldsMatch
    && ((value.state === 'processing') === (value.leaseId !== null && value.leaseUntil !== null));
}

function validateClock(now: unknown): number {
  if (!isTimestamp(now)) invalid();
  const time = Date.parse(now);
  if (!Number.isFinite(time)) invalid();
  return time;
}

function validateJob(job: RevocationOutboxJob): void {
  if (!validJob(job)) dependencyFailure();
}

/** Claims only due work or a processing row whose lease has expired. */
export function claimRevocationJob(input: {
  job: RevocationOutboxJob;
  workerLeaseId: string;
  now: string;
  leaseUntil: string;
  maxAttempts: number;
}): RevocationOutboxJob | null {
  validateJob(input.job);
  const now = validateClock(input.now);
  if (!isTimestamp(input.leaseUntil)) invalid();
  const leaseUntil = Date.parse(input.leaseUntil);
  if (!isUuid(input.workerLeaseId) || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1
    || !Number.isFinite(leaseUntil) || leaseUntil <= now) invalid();
  if (input.job.state === 'succeeded' || input.job.state === 'failed') return null;
  const processingLeaseExpired = input.job.state === 'processing' && input.job.leaseUntil !== null && Date.parse(input.job.leaseUntil) <= now;
  const due = input.job.state === 'pending' && Date.parse(input.job.nextAttemptAt) <= now;
  if (!processingLeaseExpired && !due) return null;
  if (input.job.attemptCount >= input.maxAttempts) {
    return { ...input.job, state: 'failed', leaseId: null, leaseUntil: null, providerErrorCode: 'ATTEMPTS_EXHAUSTED' };
  }
  return { ...input.job, state: 'processing', attemptCount: input.job.attemptCount + 1, leaseId: input.workerLeaseId, leaseUntil: input.leaseUntil, providerErrorCode: null };
}

function assertLease(input: { job: RevocationOutboxJob; workerLeaseId: string; now: string }): number {
  validateJob(input.job);
  const now = validateClock(input.now);
  if (!isUuid(input.workerLeaseId) || input.job.state !== 'processing' || input.job.leaseId !== input.workerLeaseId
    || input.job.leaseUntil === null || Date.parse(input.job.leaseUntil) <= now) invalid();
  return now;
}

/** A stale or expired worker can never publish provider success. */
export function completeRevocationJob(input: { job: RevocationOutboxJob; workerLeaseId: string; now: string }): RevocationOutboxJob {
  assertLease(input);
  return { ...input.job, state: 'succeeded', leaseId: null, leaseUntil: null, providerErrorCode: null };
}

/** Records a safe provider error and either schedules a retry or exhausts the job. */
export function failRevocationJob(input: {
  job: RevocationOutboxJob;
  workerLeaseId: string;
  now: string;
  retryAt: string;
  providerErrorCode: string;
  maxAttempts: number;
}): RevocationOutboxJob {
  assertLease(input);
  if (!isTimestamp(input.retryAt) || typeof input.providerErrorCode !== 'string' || !SAFE_ERROR.test(input.providerErrorCode)
    || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1) invalid();
  const retryAt = Date.parse(input.retryAt);
  if (!Number.isFinite(retryAt) || retryAt <= Date.parse(input.now)) invalid();
  const exhausted = input.job.attemptCount >= input.maxAttempts;
  return {
    ...input.job,
    state: exhausted ? 'failed' : 'pending',
    leaseId: null,
    leaseUntil: null,
    nextAttemptAt: input.retryAt,
    providerErrorCode: input.providerErrorCode,
  };
}
