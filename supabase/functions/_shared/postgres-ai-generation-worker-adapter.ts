/** Local PostgreSQL adapter for owner-bound AI generation job leases. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { claimAiGenerationJob, enterAiGenerationReconciliation, renewAiGenerationJob, type AiGenerationJob } from './ai-generation-worker.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const ERROR_CODES = new Set(['PROVIDER_UNAVAILABLE', 'INVALID_OUTPUT', 'DEADLINE_EXCEEDED', 'ACCESS_REVOKED', 'INTERNAL_FAILURE', 'INPUT_STALE']);
const SELECT = `select owner_id, request_id, state, dispatch_key, attempt_count, fence,
  lease_id, lease_until, last_error_code from df_private.ai_generation_jobs`;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function transition(): never { throw new SafeBoundaryError(409, 'INVALID_TRANSITION'); }
function validUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }
function counter(value: unknown): number | null {
  if (Number.isSafeInteger(value) && (value as number) >= 0) return value as number;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value); return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function identity(ownerId: unknown, requestId: unknown): asserts ownerId is string {
  if (!validUuid(ownerId) || !validUuid(requestId)) invalid();
}
function requireSameDispatch(left: AiGenerationJob, right: AiGenerationJob): void {
  if (left.dispatchKey !== right.dispatchKey) unavailable();
}

function rows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || Array.isArray(result)
    || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) unavailable();
  return (result as { rows: Record<string, unknown>[] }).rows;
}

function rowToJob(row: unknown, expected?: { ownerId: string; requestId: string }): AiGenerationJob {
  if (!row || typeof row !== 'object' || Array.isArray(row)) unavailable();
  const record = row as Record<string, unknown>;
  const fence = counter(record.fence);
  const attemptCount = counter(record.attempt_count);
  const job = {
    ownerId: record.owner_id, requestId: record.request_id, state: record.state, dispatchKey: record.dispatch_key,
    attemptCount, fence, leaseId: record.lease_id ?? null, leaseUntil: record.lease_until ?? null, lastErrorCode: record.last_error_code ?? null,
  } as AiGenerationJob;
  const leasePair = (job.leaseId === null) === (job.leaseUntil === null);
  if ((expected !== undefined && (job.ownerId !== expected.ownerId || job.requestId !== expected.requestId))
    || !validUuid(job.ownerId) || !validUuid(job.requestId) || !validUuid(job.dispatchKey)
    || !['queued', 'running', 'reconciling'].includes(job.state)
    || attemptCount === null || fence === null || !leasePair
    || (job.leaseId !== null && !validUuid(job.leaseId))
    || (job.leaseUntil !== null && !validInstant(job.leaseUntil))
    || (job.state === 'running') !== (job.leaseId !== null && job.leaseUntil !== null)
    || (job.lastErrorCode !== null && (typeof job.lastErrorCode !== 'string' || !ERROR_CODES.has(job.lastErrorCode)))) unavailable();
  return { ...job, attemptCount, fence };
}

function returned(result: unknown, expected: { ownerId: string; requestId: string }): AiGenerationJob {
  const resultRows = rows(result);
  if (resultRows.length !== 1) unavailable();
  return rowToJob(resultRows[0], expected);
}

export function createPostgresAiGenerationWorkerStore(input: { runner: PostgresTransactionRunner }) {
  return {
    listDue: (request: { now: string; limit: number }) => input.runner.withTransaction(async (client) => {
      if (!request || typeof request !== 'object' || !validInstant(request.now) || !Number.isSafeInteger(request.limit) || request.limit < 1 || request.limit > 100) invalid();
      const result = await client.query(`${SELECT}
        where (state = 'queued')
           or (state = 'running' and lease_until <= $1)
        order by state, lease_until asc nulls first, request_id asc limit ${request.limit}`, [request.now]);
      return rows(result).map((row) => rowToJob(row));
    }),
    claim: (request: { ownerId: string; requestId: string; workerId: string; now: string; leaseUntil: string; maxAttempts: number }) => input.runner.withTransaction(async (client) => {
      if (!request || typeof request !== 'object') invalid();
      identity(request.ownerId, request.requestId);
      if (!validUuid(request.workerId) || !validInstant(request.now) || !validInstant(request.leaseUntil)
        || Date.parse(request.leaseUntil) <= Date.parse(request.now) || !Number.isSafeInteger(request.maxAttempts)
        || request.maxAttempts < 1 || request.maxAttempts > 100) invalid();
      const result = await client.query(`${SELECT} where owner_id = $1 and request_id = $2 for update`, [request.ownerId, request.requestId]);
      const currentRows = rows(result);
      if (currentRows.length === 0) return null;
      const current = rowToJob(currentRows[0], { ownerId: request.ownerId, requestId: request.requestId });
      const next = claimAiGenerationJob({ job: current, workerId: request.workerId, now: request.now, leaseUntil: request.leaseUntil, maxAttempts: request.maxAttempts });
      if (!next) return null;
      const updated = await client.query(`${`update df_private.ai_generation_jobs
        set state = 'running', lease_id = $3, lease_until = $4, fence = $5,
            attempt_count = $6, last_error_code = null, updated_at = now()
        where owner_id = $1 and request_id = $2 and fence = $7
        returning owner_id, request_id, state, dispatch_key, attempt_count, fence, lease_id, lease_until, last_error_code`}`,
      [request.ownerId, request.requestId, next.leaseId, next.leaseUntil, next.fence, next.attemptCount, current.fence]);
      const claimed = returned(updated, { ownerId: request.ownerId, requestId: request.requestId });
      requireSameDispatch(claimed, current);
      return claimed;
    }),
    renew: (request: { ownerId: string; requestId: string; workerId: string; now: string; leaseUntil: string; fence: number }) => input.runner.withTransaction(async (client) => {
      if (!request || typeof request !== 'object') invalid();
      identity(request.ownerId, request.requestId);
      if (!validUuid(request.workerId) || !validInstant(request.now) || !validInstant(request.leaseUntil)
        || Date.parse(request.leaseUntil) <= Date.parse(request.now) || !Number.isSafeInteger(request.fence) || request.fence < 1) invalid();
      const result = await client.query(`${SELECT} where owner_id = $1 and request_id = $2 for update`, [request.ownerId, request.requestId]);
      const currentRows = rows(result);
      if (currentRows.length !== 1) transition();
      const current = rowToJob(currentRows[0], { ownerId: request.ownerId, requestId: request.requestId });
      const next = renewAiGenerationJob({ job: current, workerId: request.workerId, now: request.now, leaseUntil: request.leaseUntil, fence: request.fence });
      const updated = await client.query(`update df_private.ai_generation_jobs set lease_until = $3, updated_at = now()
        where owner_id = $1 and request_id = $2 and state = 'running' and lease_id = $4 and fence = $5
        returning owner_id, request_id, state, dispatch_key, attempt_count, fence, lease_id, lease_until, last_error_code`,
      [request.ownerId, request.requestId, next.leaseUntil, request.workerId, request.fence]);
      const renewed = returned(updated, { ownerId: request.ownerId, requestId: request.requestId });
      requireSameDispatch(renewed, current);
      return renewed;
    }),
    reconcile: (request: { ownerId: string; requestId: string; workerId: string; now: string; fence: number; errorCode?: string | null }) => input.runner.withTransaction(async (client) => {
      if (!request || typeof request !== 'object') invalid();
      identity(request.ownerId, request.requestId);
      if (!validUuid(request.workerId) || !validInstant(request.now) || !Number.isSafeInteger(request.fence) || request.fence < 1
        || (request.errorCode !== undefined && request.errorCode !== null && !ERROR_CODES.has(request.errorCode))) invalid();
      const result = await client.query(`${SELECT} where owner_id = $1 and request_id = $2 for update`, [request.ownerId, request.requestId]);
      const currentRows = rows(result);
      if (currentRows.length !== 1) transition();
      const current = rowToJob(currentRows[0], { ownerId: request.ownerId, requestId: request.requestId });
      const next = enterAiGenerationReconciliation({ job: current, workerId: request.workerId, now: request.now, fence: request.fence, errorCode: request.errorCode });
      const updated = await client.query(`update df_private.ai_generation_jobs set state = 'reconciling', lease_id = null, lease_until = null,
        last_error_code = $3, updated_at = now()
        where owner_id = $1 and request_id = $2 and state = 'running' and lease_id = $4 and fence = $5
        returning owner_id, request_id, state, dispatch_key, attempt_count, fence, lease_id, lease_until, last_error_code`,
      [request.ownerId, request.requestId, next.lastErrorCode, request.workerId, request.fence]);
      const reconciled = returned(updated, { ownerId: request.ownerId, requestId: request.requestId });
      requireSameDispatch(reconciled, current);
      return reconciled;
    }),
  };
}
