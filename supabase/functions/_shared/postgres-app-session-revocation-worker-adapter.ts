/** Local PostgreSQL persistence adapter for the revocation worker state machine. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { claimRevocationJob, completeRevocationJob, failRevocationJob, type RevocationOutboxJob } from './app-session-revocation-worker.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function transitionFailure(): never { throw new SafeBoundaryError(409, 'INVALID_TRANSITION'); }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_.-]{0,63}$/;

function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isTimestamp(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function resultRows(result: unknown): unknown[] { if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure(); return result.rows; }

function rowToJob(row: unknown, expectedRevocationId?: string): RevocationOutboxJob {
  if (!isRecord(row)) dependencyFailure();
  const job = {
    revocationId: row.revocation_id,
    ownerId: row.owner_id,
    sessionId: row.session_id,
    state: row.state,
    attemptCount: row.attempt_count,
    nextAttemptAt: row.next_attempt_at,
    leaseId: row.lease_id ?? null,
    leaseUntil: row.lease_until ?? null,
    providerErrorCode: row.provider_error_code ?? null,
  } as RevocationOutboxJob;
  const leaseFieldsMatch = (job.leaseId === null) === (job.leaseUntil === null);
  if ((expectedRevocationId !== undefined && job.revocationId !== expectedRevocationId)
    || !isUuid(job.revocationId) || !isUuid(job.ownerId) || !isUuid(job.sessionId)
    || !['pending', 'processing', 'succeeded', 'failed'].includes(job.state) || !Number.isSafeInteger(job.attemptCount) || job.attemptCount < 0 || typeof job.nextAttemptAt !== 'string' || !Number.isFinite(Date.parse(job.nextAttemptAt))
    || (job.leaseId !== null && !isUuid(job.leaseId))
    || (job.leaseUntil !== null && !isTimestamp(job.leaseUntil))
    || (job.providerErrorCode !== null && (typeof job.providerErrorCode !== 'string' || !SAFE_ERROR.test(job.providerErrorCode)))
    || !leaseFieldsMatch
    || ((job.state === 'processing') !== (job.leaseId !== null && job.leaseUntil !== null))) dependencyFailure();
  return job;
}

function returnedJob(rows: unknown[], expected: RevocationOutboxJob, revocationId: string): RevocationOutboxJob {
  if (rows.length !== 1) dependencyFailure();
  const job = rowToJob(rows[0], revocationId);
  if (job.ownerId !== expected.ownerId || job.sessionId !== expected.sessionId) dependencyFailure();
  return job;
}

const SELECT = 'select revocation_id, owner_id, session_id, state, attempt_count, next_attempt_at, lease_id, lease_until, provider_error_code from df_private.app_session_revocation_outbox';

function validateIdentity(revocationId: string, workerLeaseId: string, now: string): void {
  if (!isUuid(revocationId) || !isUuid(workerLeaseId) || !isTimestamp(now)) {
    throw new SafeBoundaryError(422, 'VALIDATION_FAILED');
  }
}

function validateListRequest(request: unknown): asserts request is { now: string; limit: number } {
  const limit = isRecord(request) && typeof request.limit === 'number' ? request.limit : null;
  if (!isRecord(request) || !isTimestamp(request.now) || limit === null || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) invalidRequest();
}
function invalidRequest(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

export function createPostgresRevocationWorkerStore(input: { runner: PostgresTransactionRunner }) {
  if (!isRecord(input) || !isRecord(input.runner) || typeof input.runner.withTransaction !== 'function') invalidRequest();
  return {
    listDue: (request: { now: string; limit: number }) => {
      validateListRequest(request);
      return input.runner.withTransaction(async (client) => {
      if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
      const result = await client.query(`${SELECT}
        where (state = 'pending' and next_attempt_at <= $1)
           or (state = 'processing' and lease_until <= $1)
        order by next_attempt_at asc, revocation_id asc limit ${request.limit as number}`, [request.now]);
      return resultRows(result).map((row) => rowToJob(row));
      });
    },
    claim: (request: { revocationId: string; workerLeaseId: string; now: string; leaseUntil: string; maxAttempts: number }) => {
      validateClaimRequest(request);
      return input.runner.withTransaction(async (client) => {
      if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
      validateIdentity(request.revocationId, request.workerLeaseId, request.now);
      if (!isTimestamp(request.leaseUntil) || Date.parse(request.leaseUntil) <= Date.parse(request.now)
        || !Number.isSafeInteger(request.maxAttempts) || request.maxAttempts < 1) throw new SafeBoundaryError(422, 'VALIDATION_FAILED');
      const result = await client.query(`${SELECT} where revocation_id = $1 for update`, [request.revocationId]);
      const rows = resultRows(result);
      if (rows.length === 0) return null;
      if (rows.length !== 1) dependencyFailure();
      const next = claimRevocationJob({ job: rowToJob(rows[0], request.revocationId), ...request });
      if (!next) return null;
      const updated = await client.query(`update df_private.app_session_revocation_outbox
        set state = $2, attempt_count = $3, lease_id = $4, lease_until = $5, provider_error_code = $6, updated_at = now()
        where revocation_id = $1
        returning revocation_id, owner_id, session_id, state, attempt_count, next_attempt_at, lease_id, lease_until, provider_error_code`,
      [next.revocationId, next.state, next.attemptCount, next.leaseId, next.leaseUntil, next.providerErrorCode]);
      const updatedRows = resultRows(updated);
      return returnedJob(updatedRows, rowToJob(rows[0], request.revocationId), request.revocationId);
      });
    },
    complete: (request: { revocationId: string; workerLeaseId: string; now: string }) => {
      validateCompleteRequest(request);
      return input.runner.withTransaction(async (client) => {
      if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
      validateIdentity(request.revocationId, request.workerLeaseId, request.now);
      const result = await client.query(`${SELECT} where revocation_id = $1 for update`, [request.revocationId]);
      const rows = resultRows(result);
      if (rows.length !== 1) transitionFailure();
      const next = completeRevocationJob({ job: rowToJob(rows[0], request.revocationId), ...request });
      const updated = await client.query(`update df_private.app_session_revocation_outbox
        set state = 'succeeded', lease_id = null, lease_until = null, provider_error_code = null, updated_at = now()
        where revocation_id = $1 and state = 'processing' and lease_id = $2
        returning revocation_id, owner_id, session_id, state, attempt_count, next_attempt_at, lease_id, lease_until, provider_error_code`,
      [next.revocationId, request.workerLeaseId]);
      const updatedRows = resultRows(updated);
      return returnedJob(updatedRows, rowToJob(rows[0], request.revocationId), request.revocationId);
      });
    },
    fail: (request: { revocationId: string; workerLeaseId: string; now: string; retryAt: string; providerErrorCode: string; maxAttempts: number }) => {
      validateFailRequest(request);
      return input.runner.withTransaction(async (client) => {
      if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
      validateIdentity(request.revocationId, request.workerLeaseId, request.now);
      if (!isTimestamp(request.retryAt) || Date.parse(request.retryAt) <= Date.parse(request.now)
        || typeof request.providerErrorCode !== 'string' || !SAFE_ERROR.test(request.providerErrorCode)
        || !Number.isSafeInteger(request.maxAttempts) || request.maxAttempts < 1) throw new SafeBoundaryError(422, 'VALIDATION_FAILED');
      const result = await client.query(`${SELECT} where revocation_id = $1 for update`, [request.revocationId]);
      const rows = resultRows(result);
      if (rows.length !== 1) transitionFailure();
      const next = failRevocationJob({ job: rowToJob(rows[0], request.revocationId), ...request });
      const updated = await client.query(`update df_private.app_session_revocation_outbox
        set state = $2, lease_id = null, lease_until = null, next_attempt_at = $3, provider_error_code = $4, updated_at = now()
        where revocation_id = $1 and state = 'processing' and lease_id = $5
        returning revocation_id, owner_id, session_id, state, attempt_count, next_attempt_at, lease_id, lease_until, provider_error_code`,
      [next.revocationId, next.state, next.nextAttemptAt, next.providerErrorCode, request.workerLeaseId]);
      const updatedRows = resultRows(updated);
      return returnedJob(updatedRows, rowToJob(rows[0], request.revocationId), request.revocationId);
      });
    },
  };
}

function validateClaimRequest(request: unknown): asserts request is { revocationId: string; workerLeaseId: string; now: string; leaseUntil: string; maxAttempts: number } {
  const maxAttempts = isRecord(request) && typeof request.maxAttempts === 'number' ? request.maxAttempts : null;
  if (!isRecord(request) || !isUuid(request.revocationId) || !isUuid(request.workerLeaseId) || !isTimestamp(request.now)
    || !isTimestamp(request.leaseUntil) || Date.parse(request.leaseUntil) <= Date.parse(request.now)
    || maxAttempts === null || !Number.isSafeInteger(maxAttempts) || maxAttempts < 1) invalidRequest();
}
function validateCompleteRequest(request: unknown): asserts request is { revocationId: string; workerLeaseId: string; now: string } {
  if (!isRecord(request) || !isUuid(request.revocationId) || !isUuid(request.workerLeaseId) || !isTimestamp(request.now)) invalidRequest();
}
function validateFailRequest(request: unknown): asserts request is { revocationId: string; workerLeaseId: string; now: string; retryAt: string; providerErrorCode: string; maxAttempts: number } {
  const maxAttempts = isRecord(request) && typeof request.maxAttempts === 'number' ? request.maxAttempts : null;
  if (!isRecord(request) || !isUuid(request.revocationId) || !isUuid(request.workerLeaseId) || !isTimestamp(request.now)
    || !isTimestamp(request.retryAt) || Date.parse(request.retryAt) <= Date.parse(request.now)
    || typeof request.providerErrorCode !== 'string' || !SAFE_ERROR.test(request.providerErrorCode)
    || maxAttempts === null || !Number.isSafeInteger(maxAttempts) || maxAttempts < 1) invalidRequest();
}
