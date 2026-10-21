/** Executes only the reviewed AI proposal command catalog inside one transaction. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { AiProposalApplyTransaction } from './ai-proposal-apply-transaction.ts';
import type { AiProposalRecord } from './postgres-ai-proposal-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyCreateTask, applyPatchTask } from './postgres-task-applier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { applyCreateReminder } from './postgres-reminder-applier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { appendOwnedSyncChange } from './postgres-sync-change-writer.ts';
import type { PostgresMutationApplyInput } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependency(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isSha256(value: unknown): value is string { return typeof value === 'string' && SHA256.test(value); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }

type ProposalOperation = Record<string, unknown> & { id?: unknown; command?: unknown; targetId?: unknown; payload?: unknown };

function operationInput(ownerId: string, proposal: AiProposalRecord, operation: ProposalOperation): PostgresMutationApplyInput & { resourceId?: string } {
  if (!isUuid(operation.id) || typeof operation.command !== 'string'
    || !isUuid(operation.targetId)
    || !operation.payload || typeof operation.payload !== 'object' || Array.isArray(operation.payload)) invalid();
  if (operation.command === 'task.create' && operation.targetId !== (operation.payload as Record<string, unknown>).id) invalid();
  if (operation.command === 'reminder.create' && operation.targetId !== (operation.payload as Record<string, unknown>).id) invalid();
  const operationName = operation.command === 'task.create' ? 'createTask' : operation.command === 'task.patch' ? 'patchTask' : operation.command === 'reminder.create' ? 'createReminder' : null;
  if (!operationName) dependency();
  return { actorId: ownerId, operation: operationName, mutationId: operation.id, requestSha256: proposal.reviewDigest, body: operation.payload as Record<string, unknown>, ...(operationName === 'patchTask' ? { resourceId: operation.targetId } : {}) };
}

export async function executePostgresAiProposalOperations(input: {
  transaction: AiProposalApplyTransaction;
  ownerId: string;
  proposal: AiProposalRecord;
  selectedOperationIds: string[];
}): Promise<{ responseBody: Record<string, unknown>; responseStatus: number; committedThrough: string }> {
  if (!isRecord(input) || !isRecord(input.transaction)) invalid();
  const client = input.transaction.client;
  if (!client || typeof client.query !== 'function' || !isUuid(input.ownerId)
    || !isRecord(input.proposal) || !isUuid(input.proposal.ownerId) || input.proposal.ownerId !== input.ownerId
    || !isUuid(input.proposal.id) || !isSha256(input.proposal.reviewDigest)
    || !Array.isArray(input.proposal.operations) || !Array.isArray(input.selectedOperationIds)
    || input.selectedOperationIds.length < 1 || input.selectedOperationIds.length > 25
    || input.selectedOperationIds.some((id) => !isUuid(id))
    || new Set(input.selectedOperationIds).size !== input.selectedOperationIds.length) invalid();
  const selected = new Set(input.selectedOperationIds);
  const applied: Record<string, unknown>[] = [];
  let committedThrough = '0';
  for (const raw of input.proposal.operations) {
    if (!isRecord(raw) || !isUuid(raw.id)) invalid();
    const operation = raw as ProposalOperation & { id: string };
    if (!selected.has(operation.id)) continue;
    const mutation = operationInput(input.ownerId, input.proposal, operation);
    const result = mutation.operation === 'createTask'
      ? await applyCreateTask(client, mutation)
      : mutation.operation === 'patchTask'
        ? await applyPatchTask(client, mutation)
        : await applyCreateReminder(client, mutation);
    committedThrough = await appendOwnedSyncChange(client, mutation, result);
    applied.push({ id: operation.id, command: operation.command, targetId: operation.targetId, response: result.responseBody });
  }
  if (applied.length !== input.selectedOperationIds.length) invalid();
  return { responseBody: { data: { applied } }, responseStatus: 200, committedThrough };
}
