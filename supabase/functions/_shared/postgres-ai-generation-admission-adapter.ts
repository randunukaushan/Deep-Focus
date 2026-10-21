/** Local PostgreSQL candidate for atomic AI allowance/request/job admission. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { readPostgresEntitlement } from './postgres-entitlement-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { admitServerCapability } from './entitlement-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { reserveUsageAtomically } from './usage-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresUsageStore } from './postgres-usage-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createAiGenerationRequestInTransaction, validateAiGenerationRequestCreateInput, type AiGenerationRequestCreateInput, type AiGenerationRequestCreateResult } from './postgres-ai-generation-request-creator.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionRunner).withTransaction === 'function'; }
function validClient(value: unknown): value is PostgresTransactionClient { return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionClient).query === 'function'; }
function rows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || Array.isArray(result)
    || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) unavailable();
  return (result as { rows: Record<string, unknown>[] }).rows;
}

function validateContext(input: { ownerId: string; sessionId: string; now: string; periodKey: string; request: AiGenerationRequestCreateInput }): void {
  if (!input || typeof input !== 'object' || !isUuid(input.ownerId) || !isUuid(input.sessionId)
    || typeof input.now !== 'string' || !Number.isFinite(Date.parse(input.now))
    || typeof input.periodKey !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(input.periodKey)) invalid();
  validateAiGenerationRequestCreateInput(input.request);
}

function mapReservationFailure(reason: string): never {
  if (reason === 'limit_exceeded') throw new SafeBoundaryError(429, 'AI_ALLOWANCE_EXCEEDED');
  if (reason === 'capability_denied') throw new SafeBoundaryError(403, 'AI_FEATURE_DISABLED');
  unavailable();
}

async function acceptInTransaction(client: PostgresTransactionClient, input: {
  ownerId: string;
  sessionId: string;
  now: string;
  periodKey: string;
  request: AiGenerationRequestCreateInput;
}): Promise<AiGenerationRequestCreateResult> {
  if (!validClient(client)) unavailable();
  await recheckPostgresAppSession(client, input.ownerId, input.sessionId);
  const existing = await client.query<{ owner_id: string; request_id: string; status: string }>(
    `select owner_id, request_id, status from df_private.ai_generation_requests where owner_id = $1 and request_id = $2 for update`,
    [input.ownerId, input.request.requestId],
  );
  const existingRows = rows(existing);
  if (existingRows.length > 1 || (existingRows[0] && (existingRows[0].owner_id !== input.ownerId || existingRows[0].request_id !== input.request.requestId))) unavailable();
  const existingStatus = existingRows[0]?.status;
  if (existingStatus !== undefined && (typeof existingStatus !== 'string' || !['pending', 'completed', 'failed', 'cancelled'].includes(existingStatus))) unavailable();
  const usage = createPostgresUsageStore(client);
  const priorReceipt = await usage.readReceipt(input.ownerId, input.request.reservationId);
  if (existingStatus === 'pending' && !priorReceipt) unavailable();
  if (existingStatus === undefined && priorReceipt) unavailable();
  if (existingStatus === 'completed' || existingStatus === 'failed' || existingStatus === 'cancelled') {
    return createAiGenerationRequestInTransaction(client, input.request);
  }
  const entitlement = await readPostgresEntitlement(client, input.ownerId, 'ai', input.sessionId);
  const admission = admitServerCapability({ verifiedActorId: input.ownerId, capability: 'ai', entitlement, now: input.now });
  const reservation = await reserveUsageAtomically({
    admission,
    verifiedActorId: input.ownerId,
    capability: 'ai',
    periodKey: input.periodKey,
    units: 1,
    receiptId: input.request.reservationId,
    store: usage,
  });
  if (!reservation.allowed) mapReservationFailure(reservation.reason);
  return createAiGenerationRequestInTransaction(client, input.request);
}

export function createPostgresAiGenerationAdmissionAdapter(input: { runner: PostgresTransactionRunner }) {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  return {
    accept: (value: { ownerId: string; sessionId: string; now: string; periodKey: string; request: AiGenerationRequestCreateInput }) => {
      validateContext(value);
      return input.runner.withTransaction((client) => acceptInTransaction(client, value));
    },
  };
}
