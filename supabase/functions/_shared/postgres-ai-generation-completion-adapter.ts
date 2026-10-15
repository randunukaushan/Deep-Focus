/** Local PostgreSQL candidate for atomic, fenced AI completion publication. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { completeAiGeneration, type AiCompletionJob, type AiCompletionRequest } from './ai-generation-completion.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresUsageStore } from './postgres-usage-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiProposalTransaction, type AiProposalRecord } from './postgres-ai-proposal-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAiGenerationRequestReader } from './postgres-ai-generation-request-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const REQUEST_COLUMNS = 'owner_id, request_id, status, version, deadline_at, completed_at, failure_code, reserved_actions, consumed_actions, proposal_id, proposal_contract_version, reservation_id';
const JOB_COLUMNS = 'owner_id, request_id, state, lease_id, lease_until, fence';

export type AiGenerationCompletionInput = {
  ownerId: string;
  requestId: string;
  workerId: string;
  fence: number;
  now: string;
  outcome: { kind: 'success'; proposal: AiProposalRecord } | { kind: 'failure'; failureCode: string };
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function validInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }
function resultRows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) unavailable();
  return (result as { rows: Record<string, unknown>[] }).rows;
}

function mapRequest(row: Record<string, unknown>, expected: { ownerId: string; requestId: string }): AiCompletionRequest & { reservationId: string } {
  if (row.owner_id !== expected.ownerId || row.request_id !== expected.requestId
    || typeof row.owner_id !== 'string' || !UUID.test(row.owner_id) || typeof row.request_id !== 'string' || !UUID.test(row.request_id)
    || row.status !== 'pending' || !Number.isSafeInteger(row.version) || (row.version as number) < 1
    || !validInstant(row.deadline_at) || row.completed_at !== null || row.failure_code !== null
    || row.reserved_actions !== 1 || row.consumed_actions !== 0 || row.proposal_id !== null || row.proposal_contract_version !== null
    || typeof row.reservation_id !== 'string' || !UUID.test(row.reservation_id)) unavailable();
  return { ownerId: row.owner_id, requestId: row.request_id, status: 'pending', version: row.version as number, deadlineAt: row.deadline_at, completedAt: null, failureCode: null, reservedActions: 1, consumedActions: 0, proposalId: null, proposalContractVersion: null, reservationId: row.reservation_id };
}

function mapJob(row: Record<string, unknown>, expected: { ownerId: string; requestId: string }): AiCompletionJob {
  if (row.owner_id !== expected.ownerId || row.request_id !== expected.requestId
    || typeof row.owner_id !== 'string' || !UUID.test(row.owner_id) || typeof row.request_id !== 'string' || !UUID.test(row.request_id)
    || row.state !== 'running' || typeof row.lease_id !== 'string' || !UUID.test(row.lease_id)
    || !validInstant(row.lease_until) || !Number.isSafeInteger(row.fence) || (row.fence as number) < 1) unavailable();
  return { ownerId: row.owner_id, requestId: row.request_id, state: 'running', leaseId: row.lease_id, leaseUntil: row.lease_until, fence: row.fence as number };
}

function validateInput(input: AiGenerationCompletionInput): void {
  if (![input.ownerId, input.requestId, input.workerId].every((value) => typeof value === 'string' && UUID.test(value))
    || !Number.isSafeInteger(input.fence) || input.fence < 1 || !validInstant(input.now)) invalid();
  if (input.outcome.kind === 'success') {
    if (!input.outcome.proposal || typeof input.outcome.proposal !== 'object'
      || input.outcome.proposal.ownerId !== input.ownerId || input.outcome.proposal.generationRequestId !== input.requestId
      || input.outcome.proposal.contractVersion !== 2) invalid();
  } else if (typeof input.outcome.failureCode !== 'string') invalid();
}

async function updateRequest(client: PostgresTransactionClient, input: AiGenerationCompletionInput, next: AiCompletionRequest): Promise<void> {
  const updated = await client.query(`update df_private.ai_generation_requests
    set status = $5, version = $6, updated_at = $7, completed_at = $7, failure_code = $8,
        reserved_actions = $9, consumed_actions = $10, proposal_id = $11, proposal_contract_version = $12
    where owner_id = $1 and request_id = $2 and status = 'pending' and version = $3
    returning owner_id, request_id`, [input.ownerId, input.requestId, next.version - 1, next.status, next.version, input.now, next.failureCode, next.reservedActions, next.consumedActions, next.proposalId, next.proposalContractVersion]);
  const updatedRows = resultRows(updated);
  if (updatedRows.length !== 1 || updatedRows[0]?.owner_id !== input.ownerId || updatedRows[0]?.request_id !== input.requestId) unavailable();
}

async function clearJob(client: PostgresTransactionClient, input: AiGenerationCompletionInput): Promise<void> {
  const updated = await client.query(`update df_private.ai_generation_jobs
    set state = 'reconciling', lease_id = null, lease_until = null, updated_at = now()
    where owner_id = $1 and request_id = $2 and state = 'running' and lease_id = $3 and fence = $4
    returning owner_id, request_id, state, lease_id, lease_until, fence`, [input.ownerId, input.requestId, input.workerId, input.fence]);
  const updatedRows = resultRows(updated);
  const row = updatedRows[0];
  if (updatedRows.length !== 1 || row?.owner_id !== input.ownerId || row?.request_id !== input.requestId
    || row?.state !== 'reconciling' || row?.lease_id !== null || row?.lease_until !== null || row?.fence !== input.fence) unavailable();
}

export function createPostgresAiGenerationCompletionStore(input: { runner: PostgresTransactionRunner }) {
  return {
    complete: (value: AiGenerationCompletionInput) => {
      validateInput(value);
      return input.runner.withTransaction(async (client) => {
        const requestResult = await client.query(`select ${REQUEST_COLUMNS} from df_private.ai_generation_requests where owner_id = $1 and request_id = $2 for update`, [value.ownerId, value.requestId]);
        const requestRows = resultRows(requestResult);
        if (requestRows.length !== 1) unavailable();
        const rawRequest = requestRows[0];
        if (rawRequest.owner_id !== value.ownerId || rawRequest.request_id !== value.requestId) unavailable();
        if (rawRequest.status !== 'pending') {
          if (!['completed', 'failed', 'cancelled'].includes(String(rawRequest.status))) unavailable();
          const terminalStatus = await createPostgresAiGenerationRequestReader(client).loadStatus(value.ownerId, value.requestId);
          if (!terminalStatus) unavailable();
          return { status: terminalStatus, settlement: 'none' as const, replayed: true };
        }
        const storedRequest = mapRequest(rawRequest, value);
        const jobResult = await client.query(`select ${JOB_COLUMNS} from df_private.ai_generation_jobs where owner_id = $1 and request_id = $2 for update`, [value.ownerId, value.requestId]);
        const jobRows = resultRows(jobResult);
        if (jobRows.length !== 1) unavailable();
        const storedJob = mapJob(jobRows[0], value);
        const transition = completeAiGeneration({ request: storedRequest, job: storedJob, workerId: value.workerId, fence: value.fence, now: value.now, outcome: value.outcome.kind === 'success' ? { kind: 'success', proposalId: value.outcome.proposal.id } : value.outcome });
        await createPostgresUsageStore(client).commitSettlement({ ownerId: value.ownerId, receiptId: storedRequest.reservationId, from: 'reserved', to: transition.settlement === 'consume' ? 'consumed' : 'released' });
        if (transition.kind === 'completed') await createPostgresAiProposalTransaction(client).create(value.outcome.kind === 'success' ? value.outcome.proposal : (() => { unavailable(); })(), value.now);
        await updateRequest(client, value, transition.request);
        await clearJob(client, value);
        const status = await createPostgresAiGenerationRequestReader(client).loadStatus(value.ownerId, value.requestId);
        if (!status) unavailable();
        return { status, settlement: transition.settlement };
      });
    },
  };
}
