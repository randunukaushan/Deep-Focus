/** Pure server transaction boundary for an exact, user-confirmed AI apply. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { AiApplyIntent, AiApplyReceipt } from './ai-apply-receipt-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { decideAiProposalApply } from './ai-apply-receipt-guard.ts';
import type { AiProposalRecord } from './postgres-ai-proposal-adapter.ts';

export type AiProposalApplyTransaction = {
  /** Present only for the PostgreSQL adapter; domain tests may omit it. */
  client?: import('./postgres-domain-mutation-adapter.ts').PostgresTransactionClient;
  readReceiptByMutation: (ownerId: string, mutationId: string) => Promise<AiApplyReceipt | null>;
  readReceiptByProposal: (ownerId: string, proposalId: string) => Promise<AiApplyReceipt | null>;
  loadProposal: (ownerId: string, proposalId: string) => Promise<AiProposalRecord | null>;
  markProposalApplied: (input: { ownerId: string; proposalId: string; expectedVersion: number; reviewDigest: string; selectedOperationIds: string[]; appliedAt: string; now: string }) => Promise<AiProposalRecord>;
  writeReceipt: (receipt: AiApplyReceipt) => Promise<void>;
};

export type AiProposalApplyStore = {
  withOwnerTransaction: <T>(ownerId: string, work: (transaction: AiProposalApplyTransaction) => Promise<T>) => Promise<T>;
};

export type AiProposalApplyResult = { action: 'applied' | 'replayed'; receipt: AiApplyReceipt; selectedOperationIds: string[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function mismatch(): never { throw new SafeBoundaryError(409, 'AI_PROPOSAL_MISMATCH'); }

function normalizeSelection(proposal: AiProposalRecord, requested: string[]): string[] {
  if (!Array.isArray(requested) || requested.length < 1 || requested.length > 25
    || requested.some((id) => !UUID.test(id)) || new Set(requested).size !== requested.length) invalid();
  const selected = new Set(requested);
  const operations = proposal.operations.map((operation) => {
    if (typeof operation.id !== 'string' || !UUID.test(operation.id)) invalid();
    const dependsOn = operation.dependsOn;
    if (dependsOn !== undefined && (!Array.isArray(dependsOn) || dependsOn.some((id) => typeof id !== 'string' || !UUID.test(id)))) invalid();
    return { id: operation.id, dependsOn: (dependsOn ?? []) as string[] };
  });
  const known = new Set(operations.map((operation) => operation.id));
  if (requested.some((id) => !known.has(id))) mismatch();
  for (const operation of operations) {
    if (selected.has(operation.id) && operation.dependsOn.some((id) => !selected.has(id))) mismatch();
  }
  return operations.filter((operation) => selected.has(operation.id)).map((operation) => operation.id);
}

export async function applyAiProposalAtomically(input: {
  intent: AiApplyIntent;
  selectedOperationIds: string[];
  now: string;
  store: AiProposalApplyStore;
  applySelectedOperations: (transaction: AiProposalApplyTransaction, proposal: AiProposalRecord, selectedOperationIds: string[]) => Promise<{ responseBody: Record<string, unknown>; responseStatus: number; committedThrough: string }>;
}): Promise<AiProposalApplyResult> {
  if (!input.store || typeof input.store.withOwnerTransaction !== 'function' || typeof input.applySelectedOperations !== 'function'
    || !UUID.test(input.intent.ownerId) || !UUID.test(input.intent.proposalId) || !UUID.test(input.intent.mutationId)
    || !Number.isSafeInteger(input.intent.proposalVersion) || input.intent.proposalVersion < 1
    || typeof input.now !== 'string' || !Number.isFinite(Date.parse(input.now))) invalid();
  return input.store.withOwnerTransaction(input.intent.ownerId, async (transaction) => {
    const receiptByMutation = await transaction.readReceiptByMutation(input.intent.ownerId, input.intent.mutationId);
    const receiptByProposal = receiptByMutation === null
      ? await transaction.readReceiptByProposal(input.intent.ownerId, input.intent.proposalId)
      : null;
    const decision = decideAiProposalApply({ intent: input.intent, receiptByMutation, receiptByProposal });
    if (decision.action === 'replay') return { action: 'replayed', receipt: decision.receipt, selectedOperationIds: input.selectedOperationIds };
    if (decision.action === 'reject') throw new SafeBoundaryError(decision.reason === 'IDEMPOTENCY_CONFLICT' || decision.reason === 'AI_PROPOSAL_ALREADY_APPLIED' ? 409 : 422, decision.reason);

    const proposal = await transaction.loadProposal(input.intent.ownerId, input.intent.proposalId);
    if (!proposal || proposal.ownerId !== input.intent.ownerId || proposal.id !== input.intent.proposalId
      || proposal.version !== input.intent.proposalVersion || proposal.reviewDigest !== input.intent.reviewDigest
      || proposal.state !== 'ready' || Date.parse(proposal.expiresAt) <= Date.parse(input.now)) mismatch();
    const selectedOperationIds = normalizeSelection(proposal, input.selectedOperationIds);
    const applied = await input.applySelectedOperations(transaction, proposal, selectedOperationIds);
    if (!applied || !applied.responseBody || typeof applied.responseBody !== 'object' || Array.isArray(applied.responseBody)
      || !Number.isInteger(applied.responseStatus) || applied.responseStatus < 200 || applied.responseStatus > 299
      || !/^(?:0|[1-9][0-9]*)$/.test(applied.committedThrough)) invalid();
    const receipt: AiApplyReceipt = { ...input.intent, responseBody: applied.responseBody, responseStatus: applied.responseStatus, committedThrough: applied.committedThrough, appliedAt: input.now };
    await transaction.markProposalApplied({ ownerId: input.intent.ownerId, proposalId: input.intent.proposalId, expectedVersion: input.intent.proposalVersion, reviewDigest: input.intent.reviewDigest, selectedOperationIds, appliedAt: input.now, now: input.now });
    await transaction.writeReceipt(receipt);
    return { action: 'applied', receipt, selectedOperationIds };
  });
}
