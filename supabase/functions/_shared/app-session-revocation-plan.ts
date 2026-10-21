/** Local candidate for the owner-bound account-session revocation contract. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { AppSessionRecord } from './app-session.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isTimestamp(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

export type SessionRevocationScope =
  | { scope: 'one'; sessionId: string }
  | { scope: 'others' | 'all' };

export type SessionRevocationPlan = {
  ownerId: string;
  sessionIds: string[];
  currentSessionRevoked: boolean;
};

export type SessionRevocationReceipt = SessionRevocationPlan & {
  mutationId: string;
  requestSha256: string;
  providerRevocationStatus: 'pending' | 'confirmed' | 'needs_retry';
};

export type SessionRevocationPlanStore = {
  listSessions: (ownerId: string) => Promise<AppSessionRecord[]>;
  loadReceipt: (input: { ownerId: string; mutationId: string }) => Promise<SessionRevocationReceipt | null>;
  saveReceipt: (receipt: SessionRevocationReceipt) => Promise<SessionRevocationReceipt | undefined>;
  enqueueProviderRevocation: (input: { revocationId: string; ownerId: string; sessionId: string }) => Promise<'created' | 'existing'>;
  revokeSession: (input: { ownerId: string; sessionId: string; revokedAt: string }) => Promise<void>;
};

export type SessionRevocationPlanTransaction = {
  withTransaction: <T>(operation: (store: SessionRevocationPlanStore) => Promise<T>) => Promise<T>;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function conflict(): never { throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT'); }

function validRecord(value: unknown): value is AppSessionRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Partial<AppSessionRecord>;
  if (!isUuid(record.ownerId)
    || !isUuid(record.sessionId)
    || !['active', 'revoked'].includes(String(record.status))
    || !isTimestamp(record.issuedAt) || !isTimestamp(record.expiresAt)
    || (record.revokedAt !== null && typeof record.revokedAt !== 'string')) return false;
  const issuedAt = Date.parse(record.issuedAt);
  const expiresAt = Date.parse(record.expiresAt);
  const revokedAt = record.revokedAt === null ? null : Date.parse(record.revokedAt);
  return Number.isFinite(issuedAt) && Number.isFinite(expiresAt) && expiresAt > issuedAt
    && ((record.status === 'revoked') === (record.revokedAt !== null))
    && (revokedAt === null || (Number.isFinite(revokedAt) && revokedAt >= issuedAt));
}

function validateInput(input: { verifiedOwnerId: string; currentSessionId: string; now: string; recentAuthVerified: boolean; scope: SessionRevocationScope }): void {
  if (!isUuid(input.verifiedOwnerId) || !isUuid(input.currentSessionId)
    || !isTimestamp(input.now) || input.recentAuthVerified !== true
    || !input.scope || typeof input.scope !== 'object' || Array.isArray(input.scope)
    || !['one', 'others', 'all'].includes(input.scope.scope)) invalid();
  if (input.scope.scope === 'one' && !isUuid(input.scope.sessionId)) invalid();
}

function validateReceipt(receipt: SessionRevocationReceipt, expected: { ownerId: string; mutationId: string; requestSha256: string }): void {
  if (receipt.ownerId !== expected.ownerId || receipt.mutationId !== expected.mutationId) dependencyFailure();
  if (!/^[a-f0-9]{64}$/.test(receipt.requestSha256)) dependencyFailure();
  if (receipt.requestSha256 !== expected.requestSha256) conflict();
  if (!Array.isArray(receipt.sessionIds) || !isPlainJsonValueForBoundary(receipt.sessionIds) || new Set(receipt.sessionIds).size !== receipt.sessionIds.length
    || receipt.sessionIds.some((sessionId) => !isUuid(sessionId))
    || typeof receipt.currentSessionRevoked !== 'boolean'
    || !['pending', 'confirmed', 'needs_retry'].includes(receipt.providerRevocationStatus)) dependencyFailure();
}

/** Selects only active, owned, non-expired sessions; no provider or database write occurs here. */
export function planSessionRevocation(input: {
  verifiedOwnerId: string;
  currentSessionId: string;
  scope: SessionRevocationScope;
  records: AppSessionRecord[];
  now: string;
  recentAuthVerified: boolean;
}): SessionRevocationPlan {
  validateInput(input);
  if (!Array.isArray(input.records) || !isPlainJsonValueForBoundary(input.records) || input.records.some((record) => !validRecord(record))) dependencyFailure();
  if (new Set(input.records.map((record) => record.sessionId)).size !== input.records.length) dependencyFailure();
  if (input.records.some((record) => record.ownerId !== input.verifiedOwnerId)) dependencyFailure();
  const active = input.records.filter((record) => record.ownerId === input.verifiedOwnerId
    && record.status === 'active' && record.revokedAt === null && Date.parse(record.expiresAt) > Date.parse(input.now));
  const scope = input.scope;
  if (scope.scope === 'one') {
    return {
      ownerId: input.verifiedOwnerId,
      sessionIds: active.some((record) => record.sessionId === scope.sessionId) ? [scope.sessionId] : [],
      currentSessionRevoked: scope.sessionId === input.currentSessionId
        && active.some((record) => record.sessionId === input.currentSessionId),
    };
  }
  const selected = scope.scope === 'all'
    ? active
    : active.filter((record) => record.sessionId !== input.currentSessionId);
  return {
    ownerId: input.verifiedOwnerId,
    sessionIds: selected.map((record) => record.sessionId),
    currentSessionRevoked: selected.some((record) => record.sessionId === input.currentSessionId),
  };
}

/** Executes the selected plan in one caller-owned transaction; a failed outbox write aborts all revocations. */
export async function revokeAccountSessionsTransactionally(input: {
  verifiedOwnerId: string;
  currentSessionId: string;
  scope: SessionRevocationScope;
  now: string;
  recentAuthVerified: boolean;
  mutationId: string;
  requestSha256: string;
  revocationIdFor: (sessionId: string) => string;
  store: SessionRevocationPlanTransaction;
}): Promise<SessionRevocationPlan & { providerRevocationStatus: 'pending' | 'confirmed' | 'needs_retry' }> {
  validateInput(input);
  if (!isUuid(input.mutationId) || typeof input.requestSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(input.requestSha256)) invalid();
  return input.store.withTransaction(async (transaction) => {
    const existing = await transaction.loadReceipt({ ownerId: input.verifiedOwnerId, mutationId: input.mutationId });
    if (existing) {
      validateReceipt(existing, { ownerId: input.verifiedOwnerId, mutationId: input.mutationId, requestSha256: input.requestSha256 });
      return {
        ownerId: existing.ownerId,
        sessionIds: existing.sessionIds,
        currentSessionRevoked: existing.currentSessionRevoked,
        providerRevocationStatus: existing.providerRevocationStatus,
      };
    }
    const records = await transaction.listSessions(input.verifiedOwnerId);
    const plan = planSessionRevocation({ ...input, records });
    const outboxStates = await Promise.all(plan.sessionIds.map(async (sessionId) => {
      const revocationId = input.revocationIdFor(sessionId);
      if (!isUuid(revocationId)) invalid();
      return transaction.enqueueProviderRevocation({ revocationId, ownerId: plan.ownerId, sessionId });
    }));
    for (const sessionId of plan.sessionIds) await transaction.revokeSession({ ownerId: plan.ownerId, sessionId, revokedAt: input.now });
    const providerRevocationStatus = outboxStates.length === 0 || outboxStates.every((state) => state === 'existing' || state === 'created') ? 'pending' : 'needs_retry';
    const saved = await transaction.saveReceipt({ ...plan, mutationId: input.mutationId, requestSha256: input.requestSha256, providerRevocationStatus });
    if (saved) {
      validateReceipt(saved, { ownerId: input.verifiedOwnerId, mutationId: input.mutationId, requestSha256: input.requestSha256 });
      return {
        ownerId: saved.ownerId,
        sessionIds: saved.sessionIds,
        currentSessionRevoked: saved.currentSessionRevoked,
        providerRevocationStatus: saved.providerRevocationStatus,
      };
    }
    return { ...plan, providerRevocationStatus };
  });
}
