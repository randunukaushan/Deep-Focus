/** Local PostgreSQL candidate for atomic, already-authorized AI request creation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiGenerationRequestReader } from './postgres-ai-generation-request-adapter.ts';
import type { AiGenerationRequestStatus } from './ai-generation-request-response-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_SNAPSHOT_BYTES = 128 * 1024;

export type AiGenerationRequestCreateInput = {
  ownerId: string;
  requestId: string;
  reservationId: string;
  dispatchKey: string;
  intentSha256: string;
  inputSnapshot: Record<string, unknown>;
  inputVersions: unknown[];
  createdAt: string;
  deadlineAt: string;
};

export type AiGenerationRequestCreateResult = {
  status: AiGenerationRequestStatus;
  replayed: boolean;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function conflict(): never { throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT'); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionRunner).withTransaction === 'function'; }
function validClient(value: unknown): value is PostgresTransactionClient { return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionClient).query === 'function'; }
function resultRows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) dependencyFailure();
  return (result as { rows: Record<string, unknown>[] }).rows;
}

export function validateAiGenerationRequestCreateInput(input: AiGenerationRequestCreateInput): void {
  if (!input || typeof input !== 'object') invalid();
  if (![input.ownerId, input.requestId, input.reservationId, input.dispatchKey].every((value) => typeof value === 'string' && UUID.test(value))
    || typeof input.intentSha256 !== 'string' || !SHA256.test(input.intentSha256)
    || !input.inputSnapshot || typeof input.inputSnapshot !== 'object' || Array.isArray(input.inputSnapshot)
    || !Array.isArray(input.inputVersions)
    || typeof input.createdAt !== 'string' || !INSTANT.test(input.createdAt) || !Number.isFinite(Date.parse(input.createdAt))
    || typeof input.deadlineAt !== 'string' || !INSTANT.test(input.deadlineAt) || !Number.isFinite(Date.parse(input.deadlineAt))
    || Date.parse(input.deadlineAt) <= Date.parse(input.createdAt)) invalid();
  if (!isPlainJsonValueForBoundary(input.inputSnapshot) || !isPlainJsonValueForBoundary(input.inputVersions)) invalid();
  let snapshot: string;
  let versions: string;
  try {
    snapshot = JSON.stringify(input.inputSnapshot);
    versions = JSON.stringify(input.inputVersions);
  } catch { invalid(); }
  if (typeof snapshot !== 'string' || typeof versions !== 'string'
    || snapshot.length > MAX_SNAPSHOT_BYTES || versions.length > MAX_SNAPSHOT_BYTES) invalid();
}

async function ensureJob(client: PostgresTransactionClient, input: AiGenerationRequestCreateInput): Promise<void> {
  const result = await client.query(`insert into df_private.ai_generation_jobs
    (owner_id, request_id, state, dispatch_key, attempt_count, fence)
    values ($1, $2, 'queued', $3, 0, 1)
    returning owner_id, request_id, dispatch_key`, [input.ownerId, input.requestId, input.dispatchKey]);
  const rows = resultRows(result);
  const row = rows[0];
  if (rows.length !== 1 || row?.owner_id !== input.ownerId || row?.request_id !== input.requestId || row?.dispatch_key !== input.dispatchKey) dependencyFailure();
}

export async function createAiGenerationRequestInTransaction(client: PostgresTransactionClient, input: AiGenerationRequestCreateInput): Promise<AiGenerationRequestCreateResult> {
  validateAiGenerationRequestCreateInput(input);
  if (!validClient(client)) dependencyFailure();
  const snapshot = JSON.stringify(input.inputSnapshot);
  const versions = JSON.stringify(input.inputVersions);
  const inserted = await client.query(`insert into df_private.ai_generation_requests
    (owner_id, request_id, action_type, intent_sha256, input_snapshot, input_versions, reservation_id,
     status, version, created_at, updated_at, deadline_at, reserved_actions, consumed_actions)
    values ($1, $2, 'plan_my_day', $3, $4::jsonb, $5::jsonb, $6, 'pending', 1, $7, $7, $8, 1, 0)
    on conflict (owner_id, request_id) do nothing
    returning owner_id, request_id, intent_sha256, reservation_id`,
  [input.ownerId, input.requestId, input.intentSha256, snapshot, versions, input.reservationId, input.createdAt, input.deadlineAt]);
  const insertedRows = resultRows(inserted);
  const created = insertedRows[0];
  let replayed = false;
  if (insertedRows.length > 1) dependencyFailure();
  if (insertedRows.length === 1) {
    if (created?.owner_id !== input.ownerId || created.request_id !== input.requestId || created.intent_sha256 !== input.intentSha256 || created.reservation_id !== input.reservationId) dependencyFailure();
    await ensureJob(client, input);
  } else {
    const existing = await client.query(`select owner_id, request_id, intent_sha256, reservation_id, status
      from df_private.ai_generation_requests where owner_id = $1 and request_id = $2 for update`, [input.ownerId, input.requestId]);
    const existingRows = resultRows(existing);
    const row = existingRows[0];
    if (existingRows.length !== 1 || !row || typeof row !== 'object'
      || row.owner_id !== input.ownerId || row.request_id !== input.requestId) dependencyFailure();
    if (row.intent_sha256 !== input.intentSha256) conflict();
    if (row.reservation_id !== input.reservationId) conflict();
    if (row.status === 'pending') {
      const job = await client.query(`select owner_id, request_id, dispatch_key from df_private.ai_generation_jobs where owner_id = $1 and request_id = $2`, [input.ownerId, input.requestId]);
      const jobRows = resultRows(job);
      if (jobRows.length !== 1 || jobRows[0]?.owner_id !== input.ownerId || jobRows[0]?.request_id !== input.requestId) dependencyFailure();
      if (jobRows[0]?.dispatch_key !== input.dispatchKey) conflict();
    }
    replayed = true;
  }
  const status = await createPostgresAiGenerationRequestReader(client).loadStatus(input.ownerId, input.requestId);
  if (!status) dependencyFailure();
  return { status, replayed };
}

export function createPostgresAiGenerationRequestCreator(input: { runner: PostgresTransactionRunner }): {
  create: (value: AiGenerationRequestCreateInput) => Promise<AiGenerationRequestCreateResult>;
} {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  return { create: (value) => { validateAiGenerationRequestCreateInput(value); return input.runner.withTransaction((client) => createAiGenerationRequestInTransaction(client, value)); } };
}
