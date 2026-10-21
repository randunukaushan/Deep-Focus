/** Local PostgreSQL adapter for fenced sync-snapshot worker transitions. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { claimSyncSnapshotJob, completeSyncSnapshotJob, failSyncSnapshotJob, type SyncSnapshotWorkerJob } from './sync-snapshot-worker.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_]{0,79}$/;
const SELECT = `select owner_id, job_id, snapshot_id, state, lease_owner, fencing_version,
  lease_expires_at, attempt_count, next_attempt_at, safe_error_code
  from df_private.sync_snapshot_jobs`;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function validUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validInstant(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function safeCounter(value: unknown): number | null {
  if (Number.isSafeInteger(value) && (value as number) >= 0) return value as number;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function rowToJob(row: Record<string, unknown>, expected?: { ownerId: string; jobId: string }): SyncSnapshotWorkerJob {
  const fencingVersion = safeCounter(row.fencing_version);
  const job = {
    jobId: row.job_id,
    ownerId: row.owner_id,
    snapshotId: row.snapshot_id,
    state: row.state,
    leaseOwner: row.lease_owner ?? null,
    fencingVersion,
    leaseExpiresAt: row.lease_expires_at ?? null,
    attemptCount: row.attempt_count,
    nextAttemptAt: row.next_attempt_at,
    safeErrorCode: row.safe_error_code ?? null,
  } as SyncSnapshotWorkerJob;
  const leasePair = job.leaseOwner !== null && job.leaseExpiresAt !== null;
  const leaseFieldsMatch = (job.leaseOwner === null) === (job.leaseExpiresAt === null);
  if ((expected !== undefined && (job.ownerId !== expected.ownerId || job.jobId !== expected.jobId))
    || !validUuid(job.jobId) || !validUuid(job.ownerId) || !validUuid(job.snapshotId)
    || !['queued', 'running', 'succeeded', 'failed', 'expired'].includes(job.state)
    || (job.leaseOwner !== null && !validUuid(job.leaseOwner))
    || job.fencingVersion === null
    || (job.leaseExpiresAt !== null && !validInstant(job.leaseExpiresAt))
    || !Number.isSafeInteger(job.attemptCount) || job.attemptCount < 0
    || !validInstant(job.nextAttemptAt)
    || (job.safeErrorCode !== null && (typeof job.safeErrorCode !== 'string' || !SAFE_ERROR.test(job.safeErrorCode)))
    || !leaseFieldsMatch
    || (job.state === 'running') !== leasePair
    || (job.state === 'failed' ? job.safeErrorCode === null : job.safeErrorCode !== null)) unavailable();
  return job;
}

function ownerJob(ownerId: string, jobId: string): void { if (!validUuid(ownerId) || !validUuid(jobId)) invalid(); }
function requireSameSnapshot(left: SyncSnapshotWorkerJob, right: SyncSnapshotWorkerJob): void {
  if (left.snapshotId !== right.snapshotId) unavailable();
}

function rows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || Array.isArray(result)
    || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) unavailable();
  return (result as { rows: Record<string, unknown>[] }).rows;
}

function validateListDueRequest(request: unknown): asserts request is { now: string; limit: number } {
  if (!isRecord(request) || !validInstant(request.now) || !Number.isSafeInteger(request.limit) || (request.limit as number) < 1 || (request.limit as number) > 100) invalid();
}

function validateClaimRequest(request: unknown): asserts request is { ownerId: string; jobId: string; workerId: string; now: string; leaseExpiresAt: string; maxAttempts: number } {
  if (!isRecord(request) || !validUuid(request.ownerId) || !validUuid(request.jobId) || !validUuid(request.workerId)
    || !validInstant(request.now) || !validInstant(request.leaseExpiresAt) || !Number.isSafeInteger(request.maxAttempts) || (request.maxAttempts as number) < 1) invalid();
}

function validateCompleteRequest(request: unknown): asserts request is { ownerId: string; jobId: string; workerId: string; now: string } {
  if (!isRecord(request) || !validUuid(request.ownerId) || !validUuid(request.jobId) || !validUuid(request.workerId) || !validInstant(request.now)) invalid();
}

function validateFailRequest(request: unknown): asserts request is { ownerId: string; jobId: string; workerId: string; now: string; retryAt: string; safeErrorCode: string; maxAttempts: number } {
  if (!isRecord(request) || !validUuid(request.ownerId) || !validUuid(request.jobId) || !validUuid(request.workerId)
    || !validInstant(request.now) || !validInstant(request.retryAt) || typeof request.safeErrorCode !== 'string'
    || !SAFE_ERROR.test(request.safeErrorCode) || !Number.isSafeInteger(request.maxAttempts) || (request.maxAttempts as number) < 1) invalid();
}

export function createPostgresSyncSnapshotWorkerStore(input: { runner: PostgresTransactionRunner }) {
  if (!isRecord(input) || !validRunner(input.runner)) invalid();
  return {
    listDue: async (request: { now: string; limit: number }) => {
      validateListDueRequest(request);
      return input.runner.withTransaction(async (client) => {
      const result = await client.query(`${SELECT}
        where (state = 'queued' and next_attempt_at <= $1)
           or (state = 'running' and lease_expires_at <= $1)
        order by next_attempt_at asc, job_id asc limit ${request.limit}`, [request.now]);
      return rows(result).map((row) => rowToJob(row));
      });
    },
    claim: async (request: { ownerId: string; jobId: string; workerId: string; now: string; leaseExpiresAt: string; maxAttempts: number }) => {
      validateClaimRequest(request);
      return input.runner.withTransaction(async (client) => {
      ownerJob(request.ownerId, request.jobId);
      const result = await client.query(`${SELECT} where owner_id = $1 and job_id = $2 for update`, [request.ownerId, request.jobId]);
      const currentRows = rows(result);
      if (currentRows.length !== 1) return null;
      const current = rowToJob(currentRows[0], { ownerId: request.ownerId, jobId: request.jobId });
      const next = claimSyncSnapshotJob({ job: current, workerId: request.workerId, now: request.now, leaseExpiresAt: request.leaseExpiresAt, maxAttempts: request.maxAttempts });
      if (!next) return null;
      const updated = await client.query(`${`update df_private.sync_snapshot_jobs
        set state = $3, lease_owner = $4, lease_expires_at = $5, fencing_version = $6,
            attempt_count = $7, safe_error_code = $8, updated_at = now()
        where owner_id = $1 and job_id = $2 and fencing_version = $9
        returning owner_id, job_id, snapshot_id, state, lease_owner, fencing_version,
          lease_expires_at, attempt_count, next_attempt_at, safe_error_code`}`, [request.ownerId, request.jobId, next.state, next.leaseOwner, next.leaseExpiresAt, next.fencingVersion, next.attemptCount, next.safeErrorCode, current.fencingVersion]);
      const updatedRows = rows(updated);
      if (updatedRows.length !== 1) unavailable();
      const claimed = rowToJob(updatedRows[0], { ownerId: request.ownerId, jobId: request.jobId });
      requireSameSnapshot(claimed, current);
      return claimed;
      });
    },
    complete: async (request: { ownerId: string; jobId: string; workerId: string; now: string }) => {
      validateCompleteRequest(request);
      return input.runner.withTransaction(async (client) => {
      ownerJob(request.ownerId, request.jobId);
      const result = await client.query(`${SELECT} where owner_id = $1 and job_id = $2 for update`, [request.ownerId, request.jobId]);
      const currentRows = rows(result);
      if (currentRows.length !== 1) throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
      const current = rowToJob(currentRows[0], { ownerId: request.ownerId, jobId: request.jobId });
      completeSyncSnapshotJob({ job: current, workerId: request.workerId, now: request.now });
      const updated = await client.query(`update df_private.sync_snapshot_jobs
        set state = 'succeeded', lease_owner = null, lease_expires_at = null,
            safe_error_code = null, updated_at = now()
        where owner_id = $1 and job_id = $2 and state = 'running'
          and lease_owner = $3 and fencing_version = $4
        returning owner_id, job_id, snapshot_id, state, lease_owner, fencing_version,
          lease_expires_at, attempt_count, next_attempt_at, safe_error_code`, [request.ownerId, request.jobId, request.workerId, current.fencingVersion]);
      const updatedRows = rows(updated);
      if (updatedRows.length !== 1) throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
      const completed = rowToJob(updatedRows[0], { ownerId: request.ownerId, jobId: request.jobId });
      requireSameSnapshot(completed, current);
      return completed;
      });
    },
    fail: async (request: { ownerId: string; jobId: string; workerId: string; now: string; retryAt: string; safeErrorCode: string; maxAttempts: number }) => {
      validateFailRequest(request);
      return input.runner.withTransaction(async (client) => {
      ownerJob(request.ownerId, request.jobId);
      const result = await client.query(`${SELECT} where owner_id = $1 and job_id = $2 for update`, [request.ownerId, request.jobId]);
      const currentRows = rows(result);
      if (currentRows.length !== 1) throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
      const current = rowToJob(currentRows[0], { ownerId: request.ownerId, jobId: request.jobId });
      const next = failSyncSnapshotJob({ job: current, workerId: request.workerId, now: request.now, retryAt: request.retryAt, safeErrorCode: request.safeErrorCode, maxAttempts: request.maxAttempts });
      const updated = await client.query(`update df_private.sync_snapshot_jobs
        set state = $3, lease_owner = null, lease_expires_at = null,
            next_attempt_at = $4, safe_error_code = $5, updated_at = now()
        where owner_id = $1 and job_id = $2 and state = 'running'
          and lease_owner = $6 and fencing_version = $7
        returning owner_id, job_id, snapshot_id, state, lease_owner, fencing_version,
          lease_expires_at, attempt_count, next_attempt_at, safe_error_code`, [request.ownerId, request.jobId, next.state, next.nextAttemptAt, next.safeErrorCode, request.workerId, current.fencingVersion]);
      const updatedRows = rows(updated);
      if (updatedRows.length !== 1) throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
      const failed = rowToJob(updatedRows[0], { ownerId: request.ownerId, jobId: request.jobId });
      requireSameSnapshot(failed, current);
      return failed;
      });
    },
  };
}
