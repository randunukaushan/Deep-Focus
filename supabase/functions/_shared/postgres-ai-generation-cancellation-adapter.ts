/** Local PostgreSQL candidate for atomic AI-generation cancellation. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateAiGenerationRequestStatus, type AiGenerationRequestStatus } from './ai-generation-request-response-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { cancelAiGenerationRequest } from './ai-generation-cancellation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type AiGenerationCancellationRequest = {
  ownerId: string;
  requestId: string;
  mutationId: string;
  requestSha256: string;
  now: string;
};

export type AiGenerationCancellationResponse = {
  outcome: 'cancelled' | 'already_cancelled' | 'already_terminal';
  request: AiGenerationRequestStatus;
  replayed?: boolean;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function conflict(): never { throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT'); }
function validUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validSha256(value: unknown): value is string { return typeof value === 'string' && SHA256.test(value); }
function validInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionRunner).withTransaction === 'function'; }
function validClient(value: unknown): value is PostgresTransactionClient { return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionClient).query === 'function'; }
function resultRows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) unavailable();
  return (result as { rows: Record<string, unknown>[] }).rows;
}

function validateInput(input: AiGenerationCancellationRequest): void {
  if (!input || typeof input !== 'object' || !validUuid(input.ownerId) || !validUuid(input.requestId) || !validUuid(input.mutationId)
    || !validSha256(input.requestSha256) || !validInstant(input.now)) invalid();
}

const REQUEST_COLUMNS = 'owner_id, request_id, action_type, version, created_at, updated_at, deadline_at, status, completed_at, failure_code, reserved_actions, consumed_actions, proposal_id, proposal_contract_version, reservation_id';

function mapRequest(row: Record<string, unknown>, expected: { ownerId: string; requestId: string }): { status: AiGenerationRequestStatus; reservationId: string } {
  if (!row || typeof row !== 'object' || Array.isArray(row)
    || row.owner_id !== expected.ownerId || row.request_id !== expected.requestId || !validUuid(row.reservation_id)) unavailable();
  const status = validateAiGenerationRequestStatus({
    requestId: row.request_id, actionType: row.action_type, version: row.version, createdAt: row.created_at,
    updatedAt: row.updated_at, deadlineAt: row.deadline_at, status: row.status, completedAt: row.completed_at,
    result: row.proposal_id === null ? null : { proposalId: row.proposal_id, contractVersion: row.proposal_contract_version },
    failureCode: row.failure_code, reservedActions: row.reserved_actions, consumedActions: row.consumed_actions,
  });
  return { status, reservationId: row.reservation_id };
}

function mapReceipt(row: Record<string, unknown>, expected: { ownerId: string; mutationId: string; requestId: string; requestSha256: string }): AiGenerationCancellationResponse {
  if (!row || typeof row !== 'object' || Array.isArray(row)
    || row.owner_id !== expected.ownerId || row.mutation_id !== expected.mutationId || row.request_id !== expected.requestId
    || row.request_sha256 !== expected.requestSha256 || !['cancelled', 'already_cancelled', 'already_terminal'].includes(String(row.outcome))
    || !row.response_body || typeof row.response_body !== 'object' || Array.isArray(row.response_body)
    || row.response_status !== 200 || !isPlainJsonValueForBoundary(row.response_body)) unavailable();
  const body = row.response_body as Record<string, unknown>;
  if (Object.keys(body).sort().join(',') !== 'outcome,request') unavailable();
  const request = validateAiGenerationRequestStatus(body.request);
  if (body.outcome !== row.outcome) unavailable();
  return { outcome: body.outcome as AiGenerationCancellationResponse['outcome'], request, replayed: true };
}

async function releaseReservation(client: PostgresTransactionClient, ownerId: string, reservationId: string): Promise<void> {
  const receipt = await client.query(`select owner_id, receipt_id, capability, period_key, units, policy_version, status
    from df_private.usage_reservation_receipts where owner_id = $1 and receipt_id = $2 for update`, [ownerId, reservationId]);
  const receiptRows = resultRows(receipt);
  const row = receiptRows[0];
  if (receiptRows.length !== 1 || row?.owner_id !== ownerId || row.receipt_id !== reservationId
    || row.capability !== 'ai' || row.status !== 'reserved' || row.units !== 1 || typeof row.period_key !== 'string' || typeof row.policy_version !== 'string') unavailable();
  const allowance = await client.query(`update df_private.capability_allowances
    set reserved_units = reserved_units - $4, updated_at = now()
    where owner_id = $1 and capability = $2 and period_key = $3 and reserved_units >= $4
    returning owner_id, capability, period_key`, [ownerId, 'ai', row.period_key, row.units]);
  const allowanceRows = resultRows(allowance);
  if (allowanceRows.length !== 1 || allowanceRows[0]?.owner_id !== ownerId || allowanceRows[0]?.capability !== 'ai' || allowanceRows[0]?.period_key !== row.period_key) unavailable();
  const released = await client.query(`update df_private.usage_reservation_receipts set status = 'released', updated_at = now()
    where owner_id = $1 and receipt_id = $2 and status = 'reserved'
    returning owner_id, receipt_id, status`, [ownerId, reservationId]);
  const releasedRows = resultRows(released);
  if (releasedRows.length !== 1 || releasedRows[0]?.owner_id !== ownerId || releasedRows[0]?.receipt_id !== reservationId || releasedRows[0]?.status !== 'released') unavailable();
}

export function createPostgresAiGenerationCancellationStore(input: { runner: PostgresTransactionRunner }) {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  return {
    cancel: (request: AiGenerationCancellationRequest): Promise<AiGenerationCancellationResponse> => {
      validateInput(request);
      return input.runner.withTransaction(async (client) => {
      if (!validClient(client)) unavailable();
      const existing = await client.query(`select owner_id, request_id, mutation_id, request_sha256, outcome, response_body, response_status
        from df_private.ai_generation_cancel_receipts where owner_id = $1 and mutation_id = $2 for update`, [request.ownerId, request.mutationId]);
      const existingRows = resultRows(existing);
      if (existingRows.length > 1) unavailable();
      if (existingRows.length === 1) return mapReceipt(existingRows[0], request);

      const stored = await client.query(`select ${REQUEST_COLUMNS} from df_private.ai_generation_requests
        where owner_id = $1 and request_id = $2 for update`, [request.ownerId, request.requestId]);
      const storedRows = resultRows(stored);
      if (storedRows.length !== 1) throw new SafeBoundaryError(404, 'NOT_FOUND');
      const current = mapRequest(storedRows[0], request);
      const next = cancelAiGenerationRequest({ request: current.status, reservationId: current.reservationId, now: request.now });
      let committed = current.status;
      if (next.releaseReservation) {
        await releaseReservation(client, request.ownerId, next.reservationId);
        const updated = await client.query(`update df_private.ai_generation_requests
          set status = $3, version = $4, updated_at = $5, completed_at = $5,
              reserved_actions = $6, consumed_actions = $7
          where owner_id = $1 and request_id = $2 and status = $8 and version = $9
          returning ${REQUEST_COLUMNS}`, [request.ownerId, request.requestId, next.request.status, next.request.version, request.now, next.request.reservedActions, next.request.consumedActions, current.status.status, current.status.version]);
        const updatedRows = resultRows(updated);
        if (updatedRows.length !== 1) unavailable();
        committed = mapRequest(updatedRows[0], request).status;
      }
      if (committed.status !== next.request.status || committed.version !== next.request.version) unavailable();
      const responseBody = { outcome: next.outcome, request: committed };
      const receipt = await client.query(`insert into df_private.ai_generation_cancel_receipts
        (owner_id, request_id, mutation_id, request_sha256, outcome, response_body, response_status, applied_at)
        values ($1, $2, $3, $4, $5, $6::jsonb, 200, $7)
        on conflict (owner_id, request_id) do nothing
        returning owner_id, request_id, mutation_id, request_sha256, outcome, response_body, response_status`, [request.ownerId, request.requestId, request.mutationId, request.requestSha256, next.outcome, JSON.stringify(responseBody), request.now]);
      const receiptRows = resultRows(receipt);
      if (receiptRows.length !== 1) conflict();
      const storedReceipt = mapReceipt(receiptRows[0], request);
      if (storedReceipt.outcome !== next.outcome || JSON.stringify(storedReceipt.request) !== JSON.stringify(committed)) unavailable();
      return { outcome: next.outcome, request: committed };
      });
    },
  };
}
