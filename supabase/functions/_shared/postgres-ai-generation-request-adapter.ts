/** Local PostgreSQL candidate for an owner-bound AI generation status read. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateAiGenerationRequestStatus, type AiGenerationRequestStatus } from './ai-generation-request-response-validation.ts';
import type { PostgresTransactionClient } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AiGenerationRequestStatusReader = {
  loadStatus: (ownerId: string, requestId: string) => Promise<AiGenerationRequestStatus | null>;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function resultRows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || Array.isArray(result)
    || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) dependencyFailure();
  return (result as { rows: Record<string, unknown>[] }).rows;
}

function uuid(value: unknown): asserts value is string { if (typeof value !== 'string' || !UUID.test(value)) invalid(); }

function mapStatus(row: unknown, expected: { ownerId: string; requestId: string }): AiGenerationRequestStatus {
  if (!row || typeof row !== 'object' || Array.isArray(row)) dependencyFailure();
  const record = row as Record<string, unknown>;
  if (record.owner_id !== expected.ownerId || record.request_id !== expected.requestId
    || typeof record.owner_id !== 'string' || typeof record.request_id !== 'string'
    || record.action_type !== 'plan_my_day') dependencyFailure();
  const status: Record<string, unknown> = {
    requestId: record.request_id,
    actionType: record.action_type,
    version: record.version,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    deadlineAt: record.deadline_at,
    status: record.status,
    completedAt: record.completed_at,
    result: record.proposal_id === null ? null : { proposalId: record.proposal_id, contractVersion: record.proposal_contract_version },
    failureCode: record.failure_code,
    reservedActions: record.reserved_actions,
    consumedActions: record.consumed_actions,
  };
  return validateAiGenerationRequestStatus(status);
}

export function createPostgresAiGenerationRequestReader(client: PostgresTransactionClient): AiGenerationRequestStatusReader {
  const columns = 'owner_id, request_id, action_type, version, created_at, updated_at, deadline_at, status, completed_at, failure_code, reserved_actions, consumed_actions, proposal_id, proposal_contract_version';
  return {
    loadStatus: async (ownerId, requestId) => {
      uuid(ownerId); uuid(requestId);
      const result = await client.query(`select ${columns} from df_private.ai_generation_requests where owner_id = $1 and request_id = $2`, [ownerId, requestId]);
      const rows = resultRows(result);
      if (rows.length === 0) return null;
      if (rows.length !== 1) dependencyFailure();
      return mapStatus(rows[0], { ownerId, requestId });
    },
  };
}
