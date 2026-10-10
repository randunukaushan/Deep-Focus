/** Server-only domain mutation transaction contract. The adapter owns the real DB transaction. */

import type { MutationReceipt } from './mutation-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const OPERATION = /^[a-z][A-Za-z0-9.]{0,79}$/;

export type DomainMutationTransaction = {
  recheckSession?: (actorId: string, sessionId: string) => Promise<void>;
  lockOwnerHead: (actorId: string) => Promise<void>;
  readReceipt: (actorId: string, operation: string, mutationId: string) => Promise<MutationReceipt | null>;
  apply: (input: { actorId: string; operation: string; mutationId: string; requestSha256: string; body: Record<string, unknown> | null; resourceId?: string }) => Promise<{ responseBody: Record<string, unknown>; responseStatus: number }>;
  writeReceipt: (receipt: MutationReceipt) => Promise<void>;
};

export type DomainMutationStore = {
  withTransaction: <T>(operation: (transaction: DomainMutationTransaction) => Promise<T>) => Promise<T>;
};

export type DomainMutationResult =
  | { action: 'applied'; receipt: MutationReceipt }
  | { action: 'replayed'; receipt: MutationReceipt };

function validate(input: { actorId: string; operation: string; mutationId: string; requestSha256: string; body: Record<string, unknown> | null; resourceId?: string; sessionId?: string }): void {
  if (!UUID.test(input.actorId) || !UUID.test(input.mutationId) || !OPERATION.test(input.operation) || !SHA256.test(input.requestSha256)
    || (input.body !== null && (typeof input.body !== 'object' || Array.isArray(input.body)))
    || (input.resourceId !== undefined && !UUID.test(input.resourceId))
    || (input.sessionId !== undefined && !UUID.test(input.sessionId))) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
}

export async function executeDomainMutation(input: {
  actorId: string;
  operation: string;
  mutationId: string;
  requestSha256: string;
  body: Record<string, unknown> | null;
  resourceId?: string;
  sessionId?: string;
  store: DomainMutationStore;
}): Promise<DomainMutationResult> {
  validate(input);
  return input.store.withTransaction(async (transaction) => {
    if (input.sessionId !== undefined) {
      if (!transaction.recheckSession) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
      await transaction.recheckSession(input.actorId, input.sessionId);
    }
    await transaction.lockOwnerHead(input.actorId);
    const existing = await transaction.readReceipt(input.actorId, input.operation, input.mutationId);
    if (existing) {
      if (existing.ownerId !== input.actorId || existing.operation !== input.operation || existing.requestSha256 !== input.requestSha256) {
        throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT');
      }
      return { action: 'replayed', receipt: existing };
    }
    const applied = await transaction.apply({
      actorId: input.actorId,
      operation: input.operation,
      mutationId: input.mutationId,
      requestSha256: input.requestSha256,
      body: input.body,
      ...(input.resourceId ? { resourceId: input.resourceId } : {}),
    });
    if (!Number.isInteger(applied.responseStatus) || applied.responseStatus < 200 || applied.responseStatus > 299) {
      throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    }
    const receipt: MutationReceipt = {
      ownerId: input.actorId,
      operation: input.operation,
      mutationId: input.mutationId,
      requestSha256: input.requestSha256,
      responseBody: applied.responseBody,
      responseStatus: applied.responseStatus,
    };
    await transaction.writeReceipt(receipt);
    return { action: 'applied', receipt };
  });
}
