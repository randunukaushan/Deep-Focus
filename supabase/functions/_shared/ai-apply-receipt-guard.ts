/** Server-only decision contract for durable, owner-bound AI proposal apply receipts. */

export type AiApplyIntent = {
  ownerId: string;
  proposalId: string;
  proposalVersion: number;
  reviewDigest: string;
  mutationId: string;
  requestSha256: string;
};

export type AiApplyReceipt = AiApplyIntent & {
  responseBody: Record<string, unknown>;
  responseStatus: number;
  committedThrough: string;
  appliedAt: string;
};

export type AiApplyDecision =
  | { action: 'execute'; intent: AiApplyIntent }
  | { action: 'replay'; receipt: AiApplyReceipt }
  | { action: 'reject'; reason: 'IDEMPOTENCY_CONFLICT' | 'AI_PROPOSAL_ALREADY_APPLIED' | 'VALIDATION_FAILED' };

export type AiApplyReceiptTransaction = {
  readByMutation: (ownerId: string, mutationId: string) => Promise<AiApplyReceipt | null>;
  readByProposal: (ownerId: string, proposalId: string) => Promise<AiApplyReceipt | null>;
  writeReceipt: (receipt: AiApplyReceipt) => Promise<void>;
};

export type AiApplyReceiptStore = {
  withOwnerTransaction: <T>(ownerId: string, work: (transaction: AiApplyReceiptTransaction) => Promise<T>) => Promise<T>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const MAX_RESPONSE_BODY_BYTES = 262144;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256.test(value);
}

function validIntent(value: unknown): boolean {
  return isRecord(value) && isUuid(value.ownerId) && isUuid(value.proposalId) && isUuid(value.mutationId)
    && typeof value.proposalVersion === 'number' && Number.isSafeInteger(value.proposalVersion) && value.proposalVersion > 0
    && isSha256(value.reviewDigest) && isSha256(value.requestSha256);
}

function sameIntent(left: AiApplyIntent, right: AiApplyIntent): boolean {
  return left.ownerId === right.ownerId && left.proposalId === right.proposalId
    && left.proposalVersion === right.proposalVersion && left.reviewDigest === right.reviewDigest
    && left.mutationId === right.mutationId && left.requestSha256 === right.requestSha256;
}

function isPlainJsonValue(value: unknown, active: WeakSet<object>): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object') return false;
  if (active.has(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null && !Array.isArray(value)) return false;
  active.add(value);
  try {
    if (Array.isArray(value)) {
      const keys = Object.keys(value);
      return Object.getOwnPropertySymbols(value).length === 0
        && keys.length === value.length
        && keys.every((key) => /^(?:0|[1-9][0-9]*)$/.test(key) && Number(key) < value.length)
        && value.every((item) => isPlainJsonValue(item, active));
    }
    const object = value as Record<string, unknown>;
    return Object.getOwnPropertySymbols(object).length === 0
      && Object.keys(object).every((key) => isPlainJsonValue(object[key], active));
  } finally {
    active.delete(value);
  }
}

function validResponseBody(value: unknown): value is Record<string, unknown> {
  if (!isPlainJsonValue(value, new WeakSet<object>()) || !value || typeof value !== 'object' || Array.isArray(value)) return false;
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string'
      && new TextEncoder().encode(serialized).byteLength <= MAX_RESPONSE_BODY_BYTES;
  } catch {
    return false;
  }
}

export function validateAiApplyReceipt(value: unknown): value is AiApplyReceipt {
  if (!isRecord(value) || !validIntent(value)) return false;
  return validResponseBody(value.responseBody) && typeof value.responseStatus === 'number'
    && Number.isInteger(value.responseStatus) && value.responseStatus >= 200 && value.responseStatus <= 299
    && typeof value.committedThrough === 'string' && DECIMAL.test(value.committedThrough)
    && typeof value.appliedAt === 'string' && Number.isFinite(Date.parse(value.appliedAt));
}

/**
 * The caller must execute and persist the result under one owner-head
 * transaction with unique (owner, proposal) and (owner, mutation) keys.
 */
export function decideAiProposalApply(input: {
  intent: AiApplyIntent;
  receiptByMutation: AiApplyReceipt | null;
  receiptByProposal: AiApplyReceipt | null;
}): AiApplyDecision {
  if (!isRecord(input) || !validIntent(input.intent)) return { action: 'reject', reason: 'VALIDATION_FAILED' };
  if (input.receiptByMutation !== null) {
    if (!validateAiApplyReceipt(input.receiptByMutation) || !sameIntent(input.receiptByMutation, input.intent)) {
      return { action: 'reject', reason: 'IDEMPOTENCY_CONFLICT' };
    }
    return { action: 'replay', receipt: input.receiptByMutation };
  }
  if (input.receiptByProposal !== null) {
    if (!validateAiApplyReceipt(input.receiptByProposal) || input.receiptByProposal.ownerId !== input.intent.ownerId || input.receiptByProposal.proposalId !== input.intent.proposalId) {
      return { action: 'reject', reason: 'AI_PROPOSAL_ALREADY_APPLIED' };
    }
    return { action: 'reject', reason: 'AI_PROPOSAL_ALREADY_APPLIED' };
  }
  return { action: 'execute', intent: input.intent };
}

/**
 * Composes the decision with a caller-owned transaction. The apply callback
 * must write selected domain rows and the durable receipt through
 * transaction.writeReceipt in that same
 * transaction; this module never opens a database or performs provider I/O.
 */
export async function applyAiProposalWithReceipt(input: {
  intent: AiApplyIntent;
  store: AiApplyReceiptStore;
  apply: (transaction: AiApplyReceiptTransaction, intent: AiApplyIntent) => Promise<AiApplyReceipt>;
}): Promise<{ action: 'applied' | 'replayed'; receipt: AiApplyReceipt }> {
  if (!isRecord(input) || !validIntent(input.intent) || !input.store || typeof input.store !== 'object'
    || typeof input.store.withOwnerTransaction !== 'function' || typeof input.apply !== 'function') {
    throw new Error('VALIDATION_FAILED');
  }
  return input.store.withOwnerTransaction(input.intent.ownerId, async (transaction) => {
    const decision = decideAiProposalApply({
      intent: input.intent,
      receiptByMutation: await transaction.readByMutation(input.intent.ownerId, input.intent.mutationId),
      receiptByProposal: await transaction.readByProposal(input.intent.ownerId, input.intent.proposalId),
    });
    if (decision.action === 'replay') return { action: 'replayed', receipt: decision.receipt };
    if (decision.action === 'reject') throw new Error(decision.reason);
    const receipt = await input.apply(transaction, input.intent);
    if (!validateAiApplyReceipt(receipt) || !sameIntent(receipt, input.intent)) throw new Error('DEPENDENCY_UNAVAILABLE');
    return { action: 'applied', receipt };
  });
}
