/** Pure, server-side completion gate for an owner-bound AI generation job. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const FAILURE_CODES = new Set(['PROVIDER_UNAVAILABLE', 'INVALID_OUTPUT', 'DEADLINE_EXCEEDED', 'ACCESS_REVOKED', 'INTERNAL_FAILURE', 'INPUT_STALE']);

export type AiCompletionRequest = {
  ownerId: string;
  requestId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  version: number;
  deadlineAt: string;
  completedAt: string | null;
  failureCode: string | null;
  reservedActions: number;
  consumedActions: number;
  proposalId: string | null;
  proposalContractVersion: number | null;
};

export type AiCompletionJob = {
  ownerId: string;
  requestId: string;
  state: 'queued' | 'running' | 'reconciling';
  leaseId: string | null;
  leaseUntil: string | null;
  fence: number;
};

export type AiCompletionResult =
  | { kind: 'completed'; request: AiCompletionRequest; job: AiCompletionJob; proposalId: string; contractVersion: 2; settlement: 'consume' }
  | { kind: 'failed'; request: AiCompletionRequest; job: AiCompletionJob; failureCode: string; settlement: 'release' };

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function transition(): never { throw new SafeBoundaryError(409, 'INVALID_TRANSITION'); }
function validInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }

function validateBase(request: AiCompletionRequest, job: AiCompletionJob): void {
  if (!request || typeof request !== 'object' || !job || typeof job !== 'object'
    || ![request.ownerId, request.requestId, job.ownerId, job.requestId].every((value) => isUuid(value))
    || request.ownerId !== job.ownerId || request.requestId !== job.requestId
    || !Number.isSafeInteger(request.version) || request.version < 1
    || !validInstant(request.deadlineAt) || (request.completedAt !== null && !validInstant(request.completedAt))
    || !['pending', 'completed', 'failed', 'cancelled'].includes(request.status)
    || !Number.isSafeInteger(request.reservedActions) || request.reservedActions < 0
    || !Number.isSafeInteger(request.consumedActions) || request.consumedActions < 0
    || (request.proposalId !== null && !isUuid(request.proposalId))
    || (request.proposalContractVersion !== null && request.proposalContractVersion !== 2)
    || !['queued', 'running', 'reconciling'].includes(job.state)
    || !Number.isSafeInteger(job.fence) || job.fence < 1
    || (job.leaseId !== null && !isUuid(job.leaseId))
    || (job.leaseUntil !== null && !validInstant(job.leaseUntil))) invalid();
}

function validateWorker(request: AiCompletionRequest, job: AiCompletionJob, input: { workerId: string; fence: number; now: string }): void {
  validateBase(request, job);
  if (!isUuid(input.workerId) || !Number.isSafeInteger(input.fence) || input.fence < 1 || !validInstant(input.now)) invalid();
  if (request.status !== 'pending' || job.state !== 'running' || job.leaseId !== input.workerId || job.fence !== input.fence
    || job.leaseUntil === null || Date.parse(job.leaseUntil) <= Date.parse(input.now) || Date.parse(request.deadlineAt) <= Date.parse(input.now)) transition();
}

/** Completes only a live fenced pending request; settlement and storage happen in the caller's transaction. */
export function completeAiGeneration(input: {
  request: AiCompletionRequest;
  job: AiCompletionJob;
  workerId: string;
  fence: number;
  now: string;
  outcome: { kind: 'success'; proposalId: string } | { kind: 'failure'; failureCode: string };
}): AiCompletionResult {
  if (!input || typeof input !== 'object' || !input.outcome || typeof input.outcome !== 'object') invalid();
  validateWorker(input.request, input.job, input);
  if (input.outcome.kind === 'success') {
    if (!isUuid(input.outcome.proposalId)) invalid();
    return {
      kind: 'completed',
      request: { ...input.request, status: 'completed', version: input.request.version + 1, completedAt: input.now, failureCode: null, reservedActions: 0, consumedActions: 1, proposalId: input.outcome.proposalId, proposalContractVersion: 2 },
      job: { ...input.job, state: 'reconciling', leaseId: null, leaseUntil: null },
      proposalId: input.outcome.proposalId, contractVersion: 2, settlement: 'consume',
    };
  }
  if (!FAILURE_CODES.has(input.outcome.failureCode)) invalid();
  return {
    kind: 'failed',
    request: { ...input.request, status: 'failed', version: input.request.version + 1, completedAt: input.now, failureCode: input.outcome.failureCode, reservedActions: 0, consumedActions: 0, proposalId: null, proposalContractVersion: null },
    job: { ...input.job, state: 'reconciling', leaseId: null, leaseUntil: null },
    failureCode: input.outcome.failureCode, settlement: 'release',
  };
}
