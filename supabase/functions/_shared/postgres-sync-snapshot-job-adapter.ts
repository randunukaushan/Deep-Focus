/** Local PostgreSQL adapter for idempotent owner-bound snapshot enqueue. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_]{0,79}$/;
function invalid(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function conflict(): never { throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function requireClient(value: unknown): asserts value is PostgresTransactionClient {
  if (!isRecord(value) || typeof value.query !== 'function') invalid();
}
function rowsOf(value: unknown): unknown[] {
  if (!isRecord(value) || !Array.isArray(value.rows) || !isPlainJsonValueForBoundary(value.rows)) invalid();
  return value.rows;
}
function validate(input: unknown): asserts input is { ownerId: string; jobId: string; snapshotId: string; operationId: string; now: string } {
  if (!isRecord(input) || ![input.ownerId, input.jobId, input.snapshotId, input.operationId].every((value) => typeof value === 'string' && UUID.test(value))
    || typeof input.now !== 'string' || !Number.isFinite(Date.parse(input.now))) invalid();
}
function row(row: Record<string, unknown>, ownerId: string, operationId: string, expected?: { jobId: string; snapshotId: string }) {
  if (row.owner_id !== ownerId || row.operation_id !== operationId || !UUID.test(String(row.job_id)) || !UUID.test(String(row.snapshot_id))
    || !['queued', 'running', 'succeeded', 'failed', 'expired'].includes(String(row.state))
    || !Number.isFinite(Date.parse(String(row.updated_at))) || (row.safe_error_code !== null && (typeof row.safe_error_code !== 'string' || !SAFE_ERROR.test(row.safe_error_code)))
    || (row.state !== 'failed' && row.safe_error_code !== null)) invalid();
  if (expected !== undefined && (row.job_id !== expected.jobId || row.snapshot_id !== expected.snapshotId)) conflict();
  return { jobId: String(row.job_id), snapshotId: String(row.snapshot_id), state: row.state as 'queued' | 'running' | 'succeeded' | 'failed' | 'expired', updatedAt: String(row.updated_at), safeErrorCode: row.safe_error_code as string | null };
}

export function createPostgresSyncSnapshotJobStore(input: { runner: PostgresTransactionRunner }) {
  if (!isRecord(input) || !validRunner(input.runner)) invalid();
  return {
    enqueue: (request: { ownerId: string; jobId: string; snapshotId: string; operationId: string; now: string }) => input.runner.withTransaction(async (client) => {
      validate(request);
      requireClient(client);
      const created = await client.query(`insert into df_private.sync_snapshot_jobs
        (owner_id, job_id, snapshot_id, operation_id, state, next_attempt_at, updated_at)
        values ($1, $2, $3, $4, 'queued', $5, $5)
        on conflict (owner_id, operation_id) do nothing
        returning owner_id, job_id, snapshot_id, operation_id, state, updated_at, safe_error_code`,
      [request.ownerId, request.jobId, request.snapshotId, request.operationId, request.now]);
      const createdRows = rowsOf(created);
      if (createdRows.length === 1 && isRecord(createdRows[0])) return row(createdRows[0], request.ownerId, request.operationId, { jobId: request.jobId, snapshotId: request.snapshotId });
      if (createdRows.length !== 0) invalid();
      const existing = await client.query(`select owner_id, job_id, snapshot_id, operation_id, state, updated_at, safe_error_code
        from df_private.sync_snapshot_jobs where owner_id = $1 and operation_id = $2`, [request.ownerId, request.operationId]);
      const existingRows = rowsOf(existing);
      if (existingRows.length !== 1 || !isRecord(existingRows[0])) invalid();
      return row(existingRows[0], request.ownerId, request.operationId, { jobId: request.jobId, snapshotId: request.snapshotId });
    }),
  };
}
