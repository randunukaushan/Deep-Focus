/** Local server-only adapter for owner-bound export download-grant admission. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { requireRecentAuthentication } from './recent-auth-policy.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;

export type DownloadGrantRecord = { ownerId: string; grantId: string; jobId: string; expiresAt: string; consumedAt: string | null };

function failure(code: 'DEPENDENCY_UNAVAILABLE' | 'VALIDATION_FAILED' | 'INVALID_TRANSITION'): never {
  throw new SafeBoundaryError(code === 'INVALID_TRANSITION' ? 409 : 503, code);
}
function validUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validInstant(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function resultRows(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) failure('DEPENDENCY_UNAVAILABLE');
  return result.rows;
}
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function requireClient(value: unknown): asserts value is { query: (sql: string, params?: unknown[]) => Promise<unknown> } {
  if (!isRecord(value) || typeof value.query !== 'function') failure('DEPENDENCY_UNAVAILABLE');
}

function grantRow(row: unknown, ownerId: string, jobId: string): DownloadGrantRecord {
  if (!isRecord(row)) failure('DEPENDENCY_UNAVAILABLE');
  if (row.owner_id !== ownerId || row.job_id !== jobId || !validUuid(row.grant_id)
    || !validInstant(row.expires_at) || (row.consumed_at !== null && !validInstant(row.consumed_at))) failure('DEPENDENCY_UNAVAILABLE');
  return { ownerId, grantId: row.grant_id, jobId, expiresAt: row.expires_at, consumedAt: row.consumed_at ?? null };
}

function validateRequest(request: unknown): asserts request is { ownerId: string; grantId: string; jobId: string; tokenDigest: string; now: string; expiresAt: string; authenticatedAt: string; recentAuthMaxAgeMs: number } {
  if (!isRecord(request) || !validUuid(request.ownerId) || !validUuid(request.grantId) || !validUuid(request.jobId)
    || typeof request.tokenDigest !== 'string' || !SHA256.test(request.tokenDigest) || !validInstant(request.now) || !validInstant(request.expiresAt)
    || Date.parse(request.expiresAt) <= Date.parse(request.now)
    || !validInstant(request.authenticatedAt) || typeof request.recentAuthMaxAgeMs !== 'number' || !Number.isSafeInteger(request.recentAuthMaxAgeMs)) failure('VALIDATION_FAILED');
  requireRecentAuthentication({ authenticatedAt: request.authenticatedAt, now: request.now, maxAgeMs: request.recentAuthMaxAgeMs });
}

export function createPostgresPrivacyDownloadGrantStore(input: { runner: PostgresTransactionRunner }) {
  if (!isRecord(input) || !validRunner(input.runner)) failure('DEPENDENCY_UNAVAILABLE');
  return {
    issueExportGrant: (request: { ownerId: string; grantId: string; jobId: string; tokenDigest: string; now: string; expiresAt: string; authenticatedAt: string; recentAuthMaxAgeMs: number }) => input.runner.withTransaction(async (client) => {
      validateRequest(request);
      requireClient(client);
      const job = await client.query(`select job_id, owner_id, state, artifact_locator, artifact_expires_at
        from df_private.privacy_jobs where owner_id = $1 and job_id = $2 for update`, [request.ownerId, request.jobId]);
      const jobRows = resultRows(job);
      if (jobRows.length !== 1 || !isRecord(jobRows[0])) failure('INVALID_TRANSITION');
      const jobRow = jobRows[0];
      if (jobRow.owner_id !== request.ownerId || jobRow.job_id !== request.jobId
        || jobRow.state !== 'succeeded' || typeof jobRow.artifact_locator !== 'string'
        || !validInstant(jobRow.artifact_expires_at) || Date.parse(jobRow.artifact_expires_at) <= Date.parse(request.now)) failure('INVALID_TRANSITION');
      const created = await client.query(`insert into df_private.privacy_download_grants
        (owner_id, grant_id, job_id, token_digest, expires_at)
        values ($1, $2, $3, $4, $5)
        on conflict (owner_id, job_id) do nothing
        returning owner_id, grant_id, job_id, expires_at, consumed_at`,
      [request.ownerId, request.grantId, request.jobId, request.tokenDigest, request.expiresAt]);
      const createdRows = resultRows(created);
      if (createdRows.length > 1) failure('DEPENDENCY_UNAVAILABLE');
      if (createdRows.length === 1) {
        const grant = grantRow(createdRows[0], request.ownerId, request.jobId);
        if (Date.parse(grant.expiresAt) <= Date.parse(request.now)) failure('INVALID_TRANSITION');
        return grant;
      }
      const existing = await client.query(`select owner_id, grant_id, job_id, expires_at, consumed_at
        from df_private.privacy_download_grants where owner_id = $1 and job_id = $2`, [request.ownerId, request.jobId]);
      const existingRows = resultRows(existing);
      if (existingRows.length !== 1) failure('DEPENDENCY_UNAVAILABLE');
      const grant = grantRow(existingRows[0], request.ownerId, request.jobId);
      if (Date.parse(grant.expiresAt) <= Date.parse(request.now)) failure('INVALID_TRANSITION');
      return grant;
    }),
  };
}
