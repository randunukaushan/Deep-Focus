/** Server-only ownership and idempotency admission. Database transaction still owns the final commit. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isBoundedJsonResponse } from './json-response-boundary.ts';

export type MutationReceipt = {
  ownerId: string;
  operation: string;
  mutationId: string;
  requestSha256: string;
  responseBody: Record<string, unknown>;
  responseStatus: number;
};

export type MutationDecision =
  | { action: 'execute'; ownerId: string; operation: string; mutationId: string }
  | { action: 'replay'; responseBody: Record<string, unknown>; responseStatus: number }
  | { action: 'reject'; reason: 'invalid_actor' | 'invalid_mutation' | 'not_found' | 'idempotency_conflict' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const OPERATION = /^[a-z][A-Za-z0-9.]{0,79}$/;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256.test(value);
}

function isOperation(value: unknown): value is string {
  return typeof value === 'string' && OPERATION.test(value);
}

function validStoredReceipt(receipt: MutationReceipt): boolean {
  if (!receipt || typeof receipt !== 'object' || !isSha256(receipt.requestSha256) || !Number.isInteger(receipt.responseStatus) || receipt.responseStatus < 200 || receipt.responseStatus > 299
    || !isBoundedJsonResponse(receipt.responseBody)) return false;
  return true;
}

export function decideOwnedMutation(input: {
  actorId: string;
  resourceOwnerId: string | null;
  operation: string;
  mutationId: string;
  requestSha256: string;
  existingReceipt: MutationReceipt | null;
}): MutationDecision {
  if (!isUuid(input.actorId)) return { action: 'reject', reason: 'invalid_actor' };
  if (!isUuid(input.mutationId) || !isSha256(input.requestSha256) || !isOperation(input.operation)) {
    return { action: 'reject', reason: 'invalid_mutation' };
  }
  if (input.resourceOwnerId !== input.actorId) return { action: 'reject', reason: 'not_found' };
  const receipt = input.existingReceipt;
  if (!receipt) return { action: 'execute', ownerId: input.actorId, operation: input.operation, mutationId: input.mutationId };
  if (receipt.ownerId !== input.actorId || receipt.operation !== input.operation || receipt.mutationId !== input.mutationId) {
    return { action: 'reject', reason: 'idempotency_conflict' };
  }
  if (receipt.requestSha256 !== input.requestSha256) return { action: 'reject', reason: 'idempotency_conflict' };
  if (!validStoredReceipt(receipt)) return { action: 'reject', reason: 'idempotency_conflict' };
  return { action: 'replay', responseBody: receipt.responseBody, responseStatus: receipt.responseStatus };
}
