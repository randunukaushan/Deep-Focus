import type { CapabilityAdmission, ServerCapability } from './entitlement-boundary.ts';

/**
 * Server-only allowance decision. The caller must persist an accepted result
 * in one transaction with its idempotency receipt; this module never trusts a
 * client counter and never contacts a billing or model provider.
 */
export type UsageAllowance = {
  ownerId: string;
  capability: ServerCapability;
  periodKey: string;
  limitUnits: number;
  consumedUnits: number;
  reservedUnits: number;
  policyVersion: string;
};

export type UsageReservationDecision =
  | { allowed: true; ownerId: string; capability: ServerCapability; periodKey: string; units: number; remainingUnits: number; policyVersion: string }
  | { allowed: false; reason: 'capability_denied' | 'owner_mismatch' | 'invalid_allowance' | 'invalid_request' | 'limit_exceeded' | 'already_settled' };

export type UsageReservationReceipt = {
  receiptId: string;
  ownerId: string;
  decision: UsageReservationDecision;
  status: 'reserved' | 'consumed' | 'released';
};

export type UsageReservationStore = {
  /** Both reads and the commit must use the same server-side transaction/lock. */
  readReceipt: (ownerId: string, receiptId: string) => Promise<UsageReservationReceipt | null>;
  readAllowance: (ownerId: string, capability: ServerCapability, periodKey: string) => Promise<UsageAllowance | null>;
  commitReservation: (input: {
    receiptId: string;
    ownerId: string;
    capability: ServerCapability;
    periodKey: string;
    units: number;
    decision: Extract<UsageReservationDecision, { allowed: true }>;
  }) => Promise<void>;
  commitSettlement: (input: {
    receiptId: string;
    ownerId: string;
    from: 'reserved';
    to: 'consumed' | 'released';
  }) => Promise<void>;
};

export type UsageTransactionStore = {
  withTransaction: <T>(operation: (store: UsageReservationStore) => Promise<T>) => Promise<T>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function decideUsageReservation(input: {
  admission: CapabilityAdmission;
  allowance: UsageAllowance | null;
  verifiedActorId: string;
  capability: ServerCapability;
  units: number;
}): UsageReservationDecision {
  if (!input.admission.allowed) return { allowed: false, reason: 'capability_denied' };
  if (input.admission.ownerId !== input.verifiedActorId || input.admission.capability !== input.capability) {
    return { allowed: false, reason: 'owner_mismatch' };
  }
  if (!input.allowance || input.allowance.ownerId !== input.verifiedActorId || input.allowance.capability !== input.capability
    || !input.allowance.periodKey || !input.allowance.policyVersion
    || !Number.isSafeInteger(input.allowance.limitUnits) || input.allowance.limitUnits < 0
    || !Number.isSafeInteger(input.allowance.consumedUnits) || input.allowance.consumedUnits < 0
    || !Number.isSafeInteger(input.allowance.reservedUnits) || input.allowance.reservedUnits < 0
    || input.allowance.consumedUnits + input.allowance.reservedUnits > input.allowance.limitUnits) {
    return { allowed: false, reason: 'invalid_allowance' };
  }
  if (!Number.isSafeInteger(input.units) || input.units < 1 || input.units > 1000) {
    return { allowed: false, reason: 'invalid_request' };
  }
  const remainingUnits = input.allowance.limitUnits - input.allowance.consumedUnits - input.allowance.reservedUnits;
  if (input.units > remainingUnits) return { allowed: false, reason: 'limit_exceeded' };
  return {
    allowed: true,
    ownerId: input.verifiedActorId,
    capability: input.capability,
    periodKey: input.allowance.periodKey,
    units: input.units,
    remainingUnits: remainingUnits - input.units,
    policyVersion: input.allowance.policyVersion,
  };
}

export async function reserveUsageAtomically(input: {
  admission: CapabilityAdmission;
  verifiedActorId: string;
  capability: ServerCapability;
  periodKey: string;
  units: number;
  receiptId: string;
  store: UsageReservationStore;
}): Promise<UsageReservationDecision & { replayed?: boolean }> {
  if (!UUID.test(input.verifiedActorId) || !UUID.test(input.receiptId) || !input.periodKey.trim()) {
    return { allowed: false, reason: 'invalid_request' };
  }
  const previous = await input.store.readReceipt(input.verifiedActorId, input.receiptId);
  if (previous) {
    if (previous.ownerId !== input.verifiedActorId || previous.receiptId !== input.receiptId) {
      return { allowed: false, reason: 'owner_mismatch' };
    }
    if (previous.status !== 'reserved') return { allowed: false, reason: 'already_settled' };
    return { ...previous.decision, replayed: true };
  }
  // A new reservation must not inspect allowance state after capability
  // admission has already failed. Reserved replays above remain recoverable.
  if (!input.admission.allowed) return { allowed: false, reason: 'capability_denied' };
  const allowance = await input.store.readAllowance(input.verifiedActorId, input.capability, input.periodKey);
  const decision = decideUsageReservation({ ...input, allowance });
  if (!decision.allowed) return decision;
  // The store must insert the receipt and increment reserved_units atomically.
  // A failed commit is deliberately propagated so callers cannot report a grant.
  await input.store.commitReservation({
    receiptId: input.receiptId, ownerId: input.verifiedActorId, capability: input.capability,
    periodKey: input.periodKey, units: input.units, decision,
  });
  return decision;
}

/** Keeps receipt lookup, allowance read and reservation commit in one caller-owned transaction. */
export async function reserveUsageTransactionally(input: {
  admission: CapabilityAdmission;
  verifiedActorId: string;
  capability: ServerCapability;
  periodKey: string;
  units: number;
  receiptId: string;
  store: UsageTransactionStore;
}): Promise<UsageReservationDecision & { replayed?: boolean }> {
  return input.store.withTransaction((transaction) => reserveUsageAtomically({ ...input, store: transaction }));
}

export type UsageSettlementDecision =
  | { allowed: true; receiptId: string; ownerId: string; status: 'consumed' | 'released'; replayed?: boolean }
  | { allowed: false; reason: 'invalid_request' | 'missing_receipt' | 'owner_mismatch' | 'invalid_transition' };

export async function settleUsageReceipt(input: {
  verifiedActorId: string;
  receiptId: string;
  action: 'consume' | 'release';
  store: Pick<UsageReservationStore, 'readReceipt' | 'commitSettlement'>;
}): Promise<UsageSettlementDecision> {
  if (!UUID.test(input.verifiedActorId) || !UUID.test(input.receiptId)) return { allowed: false, reason: 'invalid_request' };
  const receipt = await input.store.readReceipt(input.verifiedActorId, input.receiptId);
  if (!receipt) return { allowed: false, reason: 'missing_receipt' };
  if (receipt.ownerId !== input.verifiedActorId || receipt.receiptId !== input.receiptId) {
    return { allowed: false, reason: 'owner_mismatch' };
  }
  const target = input.action === 'consume' ? 'consumed' : 'released';
  if (receipt.status === target) return { allowed: true, receiptId: input.receiptId, ownerId: input.verifiedActorId, status: target, replayed: true };
  if (receipt.status !== 'reserved') return { allowed: false, reason: 'invalid_transition' };
  await input.store.commitSettlement({ receiptId: input.receiptId, ownerId: input.verifiedActorId, from: 'reserved', to: target });
  return { allowed: true, receiptId: input.receiptId, ownerId: input.verifiedActorId, status: target };
}

/** Keeps settlement read and state transition in one caller-owned transaction. */
export async function settleUsageTransactionally(input: {
  verifiedActorId: string;
  receiptId: string;
  action: 'consume' | 'release';
  store: UsageTransactionStore;
}): Promise<UsageSettlementDecision> {
  return input.store.withTransaction((transaction) => settleUsageReceipt({ ...input, store: transaction }));
}

export type UsageExecutionResult<T> =
  | { allowed: true; receiptId: string; result: T; replayed?: boolean }
  | { allowed: false; reason: 'reservation_denied' | 'provider_failed' | 'settlement_failed'; released?: boolean };

/** Runs a provider call only while usage is reserved, then settles it exactly once. */
export async function executeReservedUsage<T>(input: {
  receiptId: string;
  reserve: () => Promise<UsageReservationDecision & { replayed?: boolean }>;
  execute: () => Promise<T>;
  settle: (action: 'consume' | 'release') => Promise<UsageSettlementDecision>;
}): Promise<UsageExecutionResult<T>> {
  const reservation = await input.reserve();
  if (!reservation.allowed) return { allowed: false, reason: 'reservation_denied' };
  try {
    const result = await input.execute();
    const settled = await input.settle('consume');
    if (!settled.allowed || settled.status !== 'consumed') return { allowed: false, reason: 'settlement_failed' };
    return { allowed: true, receiptId: input.receiptId, result, ...(reservation.replayed ? { replayed: true } : {}) };
  } catch {
    try {
      const released = await input.settle('release');
      if (!released.allowed || released.status !== 'released') return { allowed: false, reason: 'settlement_failed', released: false };
      return { allowed: false, reason: 'provider_failed', released: true };
    } catch {
      return { allowed: false, reason: 'settlement_failed', released: false };
    }
  }
}
