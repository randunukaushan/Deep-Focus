/** Server-only AI generation job lease and fencing state machine. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const ERROR_CODES = new Set(['PROVIDER_UNAVAILABLE', 'INVALID_OUTPUT', 'DEADLINE_EXCEEDED', 'ACCESS_REVOKED', 'INTERNAL_FAILURE', 'INPUT_STALE']);

export type AiGenerationJob = {
  ownerId: string;
  requestId: string;
  state: 'queued' | 'running' | 'reconciling';
  dispatchKey: string;
  attemptCount: number;
  fence: number;
  leaseId: string | null;
  leaseUntil: string | null;
  lastErrorCode: string | null;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function validInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function validateJob(job: unknown): asserts job is AiGenerationJob {
  if (!isRecord(job)) dependencyFailure();
  const leasePair = (job.leaseId === null) === (job.leaseUntil === null);
  if (!isUuid(job.ownerId) || !isUuid(job.requestId) || !isUuid(job.dispatchKey)
    || (typeof job.state !== 'string' || !['queued', 'running', 'reconciling'].includes(job.state))
    || typeof job.attemptCount !== 'number' || !Number.isSafeInteger(job.attemptCount) || job.attemptCount < 0
    || typeof job.fence !== 'number' || !Number.isSafeInteger(job.fence) || job.fence < 1
    || !leasePair
    || (job.leaseUntil !== null && !validInstant(job.leaseUntil))
    || (job.state === 'running') !== (job.leaseId !== null && job.leaseUntil !== null)
    || (job.leaseId !== null && !isUuid(job.leaseId))
    || (job.lastErrorCode !== null && (typeof job.lastErrorCode !== 'string' || !ERROR_CODES.has(job.lastErrorCode)))) dependencyFailure();
}

function validateClaim(input: unknown): void {
  if (!isRecord(input) || !isUuid(input.workerId) || !validInstant(input.now) || !validInstant(input.leaseUntil)
    || Date.parse(input.leaseUntil) <= Date.parse(input.now)
    || typeof input.maxAttempts !== 'number' || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1 || input.maxAttempts > 100) invalid();
}

/** Claims queued work or a running job whose lease expired; every claim fences the prior worker. */
export function claimAiGenerationJob(input: {
  job: AiGenerationJob;
  workerId: string;
  now: string;
  leaseUntil: string;
  maxAttempts: number;
}): AiGenerationJob | null {
  if (!input || typeof input !== 'object') invalid();
  validateJob(input.job);
  validateClaim(input);
  const now = Date.parse(input.now);
  const due = input.job.state === 'queued'
    || input.job.state === 'reconciling'
    || (input.job.state === 'running' && input.job.leaseUntil !== null && Date.parse(input.job.leaseUntil) <= now);
  if (!due || input.job.attemptCount >= input.maxAttempts) return null;
  return { ...input.job, state: 'running', attemptCount: input.job.attemptCount + 1, fence: input.job.fence + 1, leaseId: input.workerId, leaseUntil: input.leaseUntil, lastErrorCode: null };
}

function validateLease(input: { job: AiGenerationJob; workerId: string; now: string; fence: number }): void {
  if (!input || typeof input !== 'object') invalid();
  validateJob(input.job);
  if (!isUuid(input.workerId) || !validInstant(input.now) || !Number.isSafeInteger(input.fence) || input.fence < 1
    || input.job.state !== 'running' || input.job.leaseId !== input.workerId || input.job.leaseUntil === null
    || Date.parse(input.job.leaseUntil) <= Date.parse(input.now) || input.job.fence !== input.fence) invalid();
}

/** Records that provider acknowledgement is unknown; it never authorizes a blind second call. */
export function enterAiGenerationReconciliation(input: {
  job: AiGenerationJob;
  workerId: string;
  now: string;
  fence: number;
  errorCode?: string | null;
}): AiGenerationJob {
  if (!input || typeof input !== 'object') invalid();
  validateLease(input);
  if (input.errorCode !== undefined && input.errorCode !== null && !ERROR_CODES.has(input.errorCode)) invalid();
  return { ...input.job, state: 'reconciling', leaseId: null, leaseUntil: null, lastErrorCode: input.errorCode ?? null };
}

/** A current worker may renew only its own fence; stale workers cannot extend a lease. */
export function renewAiGenerationJob(input: {
  job: AiGenerationJob;
  workerId: string;
  now: string;
  leaseUntil: string;
  fence: number;
}): AiGenerationJob {
  if (!input || typeof input !== 'object') invalid();
  validateLease({ job: input.job, workerId: input.workerId, now: input.now, fence: input.fence });
  if (!validInstant(input.leaseUntil) || Date.parse(input.leaseUntil) <= Date.parse(input.now)) invalid();
  return { ...input.job, leaseUntil: input.leaseUntil };
}
