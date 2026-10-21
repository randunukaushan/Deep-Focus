/** Local PostgreSQL persistence adapter for privacy-job worker recovery. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { claimPrivacyJob, completePrivacyJob, failPrivacyJob, type PrivacyWorkerJob } from './privacy-job-worker.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_]{0,79}$/;
const SELECT = `select job_id, owner_id, operation_id, kind, state, lease_owner, fencing_version,
  lease_expires_at, attempt_count, next_attempt_at, safe_error_code, artifact_locator,
  artifact_expires_at from df_private.privacy_jobs`;

function failure(code: 'DEPENDENCY_UNAVAILABLE' | 'VALIDATION_FAILED' | 'INVALID_TRANSITION'): never { throw new SafeBoundaryError(code === 'INVALID_TRANSITION' ? 409 : 503, code); }
function validUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validInstant(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function resultRows(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) failure('DEPENDENCY_UNAVAILABLE');
  return result.rows;
}
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function requireClient(value: unknown): asserts value is PostgresTransactionClient {
  if (!isRecord(value) || typeof value.query !== 'function') failure('DEPENDENCY_UNAVAILABLE');
}
function safeCounter(value: unknown): number | null {
  if (Number.isSafeInteger(value) && (value as number) >= 0) return value as number;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function rowToJob(row: unknown, expected?: { ownerId: string; jobId: string }): PrivacyWorkerJob {
  if (!isRecord(row)) failure('DEPENDENCY_UNAVAILABLE');
  const fencingVersion = safeCounter(row.fencing_version);
  const job = {
    jobId: row.job_id,
    ownerId: row.owner_id,
    operationId: row.operation_id,
    kind: row.kind,
    state: row.state,
    leaseOwner: row.lease_owner ?? null,
    fencingVersion,
    leaseExpiresAt: row.lease_expires_at ?? null,
    attemptCount: row.attempt_count,
    nextAttemptAt: row.next_attempt_at,
    safeErrorCode: row.safe_error_code ?? null,
    artifactLocator: row.artifact_locator ?? null,
    artifactExpiresAt: row.artifact_expires_at ?? null,
  } as PrivacyWorkerJob;
  const leasePair = job.leaseOwner !== null && job.leaseExpiresAt !== null;
  const leaseFieldsMatch = (job.leaseOwner === null) === (job.leaseExpiresAt === null);
  if ((expected !== undefined && (job.ownerId !== expected.ownerId || job.jobId !== expected.jobId))
    || !validUuid(job.jobId) || !validUuid(job.ownerId) || !validUuid(job.operationId)
    || (job.kind !== 'export' && job.kind !== 'deletion')
    || !['queued', 'running', 'succeeded', 'failed', 'expired'].includes(job.state)
    || (job.leaseOwner !== null && !validUuid(job.leaseOwner))
    || job.fencingVersion === null
    || (job.leaseExpiresAt !== null && !validInstant(job.leaseExpiresAt))
    || !Number.isSafeInteger(job.attemptCount) || job.attemptCount < 0
    || !validInstant(job.nextAttemptAt)
    || (job.safeErrorCode !== null && (typeof job.safeErrorCode !== 'string' || !SAFE_ERROR.test(job.safeErrorCode)))
    || (job.artifactLocator !== null && (typeof job.artifactLocator !== 'string' || job.artifactLocator.length === 0 || job.artifactLocator.length > 2000))
    || (job.artifactExpiresAt !== null && !validInstant(job.artifactExpiresAt))
    || !leaseFieldsMatch
    || ((job.state === 'running') !== leasePair)
    || (job.state !== 'succeeded' && (job.artifactLocator !== null || job.artifactExpiresAt !== null))) failure('DEPENDENCY_UNAVAILABLE');
  return job;
}

function validateOwnerAndJob(ownerId: string, jobId: string): void {
  if (!validUuid(ownerId) || !validUuid(jobId)) failure('VALIDATION_FAILED');
}

function ownedOperationJob(row: unknown, ownerId: string, operationId: string): PrivacyWorkerJob {
  if (!isRecord(row) || !validUuid(row.job_id)) failure('DEPENDENCY_UNAVAILABLE');
  const job = rowToJob(row, { ownerId, jobId: row.job_id });
  if (job.ownerId !== ownerId || job.operationId !== operationId) failure('DEPENDENCY_UNAVAILABLE');
  return job;
}

function returnedJob(rows: unknown[], expected: PrivacyWorkerJob, ownerId: string, jobId: string): PrivacyWorkerJob {
  if (rows.length !== 1) failure('DEPENDENCY_UNAVAILABLE');
  const job = rowToJob(rows[0], { ownerId, jobId });
  if (job.operationId !== expected.operationId) failure('DEPENDENCY_UNAVAILABLE');
  return job;
}

export function createPostgresPrivacyJobStore(input: { runner: PostgresTransactionRunner }) {
  if (!isRecord(input) || !validRunner(input.runner)) failure('DEPENDENCY_UNAVAILABLE');
  return {
    enqueueExport: (request: { ownerId: string; jobId: string; operationId: string; now: string }) => input.runner.withTransaction(async (client) => {
      validateOwnerAndJob(request.ownerId, request.jobId);
      if (!validUuid(request.operationId) || !validInstant(request.now)) failure('VALIDATION_FAILED');
      requireClient(client);
      const created = await client.query(`insert into df_private.privacy_jobs
        (job_id, owner_id, kind, operation_id, state, next_attempt_at, updated_at)
        values ($1, $2, 'export', $3, 'queued', $4, $4)
        on conflict (owner_id, operation_id) do nothing
        returning job_id, owner_id, operation_id, kind, state, lease_owner, fencing_version,
          lease_expires_at, attempt_count, next_attempt_at, safe_error_code, artifact_locator,
          artifact_expires_at`, [request.jobId, request.ownerId, request.operationId, request.now]);
      const createdRows = resultRows(created);
      if (createdRows.length > 1) failure('DEPENDENCY_UNAVAILABLE');
      if (createdRows.length === 1) return ownedOperationJob(createdRows[0], request.ownerId, request.operationId);
      const existing = await client.query(`${SELECT} where owner_id = $1 and operation_id = $2`, [request.ownerId, request.operationId]);
      const existingRows = resultRows(existing);
      if (existingRows.length !== 1) failure('DEPENDENCY_UNAVAILABLE');
      return ownedOperationJob(existingRows[0], request.ownerId, request.operationId);
    }),
    listDue: (request: { now: string; limit: number }) => input.runner.withTransaction(async (client) => {
      if (!validInstant(request.now) || !Number.isSafeInteger(request.limit) || request.limit < 1 || request.limit > 100) failure('VALIDATION_FAILED');
      requireClient(client);
      const result = await client.query(`${SELECT}
        where (state = 'queued' and next_attempt_at <= $1)
           or (state = 'running' and lease_expires_at <= $1)
        order by next_attempt_at asc, job_id asc limit ${request.limit}`, [request.now]);
      return resultRows(result).map((row) => rowToJob(row));
    }),
    claim: (request: { ownerId: string; jobId: string; workerId: string; now: string; leaseExpiresAt: string; maxAttempts: number }) => input.runner.withTransaction(async (client) => {
      validateOwnerAndJob(request.ownerId, request.jobId);
      requireClient(client);
      const result = await client.query(`${SELECT} where owner_id = $1 and job_id = $2 for update`, [request.ownerId, request.jobId]);
      const rows = resultRows(result);
      if (rows.length === 0) return null;
      if (rows.length !== 1) failure('DEPENDENCY_UNAVAILABLE');
      const next = claimPrivacyJob({ job: rowToJob(rows[0], { ownerId: request.ownerId, jobId: request.jobId }), workerId: request.workerId, now: request.now, leaseExpiresAt: request.leaseExpiresAt, maxAttempts: request.maxAttempts });
      if (!next) return null;
      const updated = await client.query(`update df_private.privacy_jobs
        set state = $3, lease_owner = $4, lease_expires_at = $5, fencing_version = $6,
            attempt_count = $7, safe_error_code = $8, updated_at = now()
        where owner_id = $1 and job_id = $2
        returning job_id, owner_id, operation_id, kind, state, lease_owner, fencing_version,
          lease_expires_at, attempt_count, next_attempt_at, safe_error_code, artifact_locator,
          artifact_expires_at`, [request.ownerId, request.jobId, next.state, next.leaseOwner, next.leaseExpiresAt, next.fencingVersion, next.attemptCount, next.safeErrorCode]);
      const updatedRows = resultRows(updated);
      return returnedJob(updatedRows, rowToJob(rows[0], { ownerId: request.ownerId, jobId: request.jobId }), request.ownerId, request.jobId);
    }),
    complete: (request: { ownerId: string; jobId: string; workerId: string; now: string; artifactLocator?: string | null; artifactExpiresAt?: string | null }) => input.runner.withTransaction(async (client) => {
      validateOwnerAndJob(request.ownerId, request.jobId);
      requireClient(client);
      const result = await client.query(`${SELECT} where owner_id = $1 and job_id = $2 for update`, [request.ownerId, request.jobId]);
      const rows = resultRows(result);
      if (rows.length !== 1) failure('INVALID_TRANSITION');
      const next = completePrivacyJob({ job: rowToJob(rows[0], { ownerId: request.ownerId, jobId: request.jobId }), workerId: request.workerId, now: request.now, artifactLocator: request.artifactLocator, artifactExpiresAt: request.artifactExpiresAt });
      const updated = await client.query(`update df_private.privacy_jobs
        set state = 'succeeded', lease_owner = null, lease_expires_at = null,
            safe_error_code = null, artifact_locator = $3, artifact_expires_at = $4, updated_at = now()
        where owner_id = $1 and job_id = $2 and state = 'running' and lease_owner = $5 and fencing_version = $6
        returning job_id, owner_id, operation_id, kind, state, lease_owner, fencing_version,
          lease_expires_at, attempt_count, next_attempt_at, safe_error_code, artifact_locator,
          artifact_expires_at`, [request.ownerId, request.jobId, next.artifactLocator, next.artifactExpiresAt, request.workerId, rowToJob(result.rows[0]).fencingVersion]);
      const updatedRows = resultRows(updated);
      return returnedJob(updatedRows, rowToJob(rows[0], { ownerId: request.ownerId, jobId: request.jobId }), request.ownerId, request.jobId);
    }),
    fail: (request: { ownerId: string; jobId: string; workerId: string; now: string; retryAt: string; safeErrorCode: string; maxAttempts: number }) => input.runner.withTransaction(async (client) => {
      validateOwnerAndJob(request.ownerId, request.jobId);
      requireClient(client);
      const result = await client.query(`${SELECT} where owner_id = $1 and job_id = $2 for update`, [request.ownerId, request.jobId]);
      const rows = resultRows(result);
      if (rows.length !== 1) failure('INVALID_TRANSITION');
      const next = failPrivacyJob({ job: rowToJob(rows[0], { ownerId: request.ownerId, jobId: request.jobId }), workerId: request.workerId, now: request.now, retryAt: request.retryAt, safeErrorCode: request.safeErrorCode, maxAttempts: request.maxAttempts });
      const updated = await client.query(`update df_private.privacy_jobs
        set state = $3, lease_owner = null, lease_expires_at = null, next_attempt_at = $4,
            safe_error_code = $5, artifact_locator = null, artifact_expires_at = null, updated_at = now()
        where owner_id = $1 and job_id = $2 and state = 'running' and lease_owner = $6 and fencing_version = $7
        returning job_id, owner_id, operation_id, kind, state, lease_owner, fencing_version,
          lease_expires_at, attempt_count, next_attempt_at, safe_error_code, artifact_locator,
          artifact_expires_at`, [request.ownerId, request.jobId, next.state, next.nextAttemptAt, next.safeErrorCode, request.workerId, rowToJob(result.rows[0]).fencingVersion]);
      const updatedRows = resultRows(updated);
      return returnedJob(updatedRows, rowToJob(rows[0], { ownerId: request.ownerId, jobId: request.jobId }), request.ownerId, request.jobId);
    }),
  };
}
