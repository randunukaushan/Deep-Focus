/** Local, review-gated durable batch idempotency contract for V2 push. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_RESPONSE_BODY_BYTES = 262144;

export type V2BatchReceipt = {
  ownerId: string;
  batchId: string;
  requestSha256: string;
  responseBody: Record<string, unknown>;
  responseStatus: 200;
  createdAt: string;
};

export type V2BatchReceiptTransaction = {
  readReceipt: (ownerId: string, batchId: string) => Promise<V2BatchReceipt | null>;
  writeReceipt: (receipt: V2BatchReceipt) => Promise<void>;
};

export type V2BatchReceiptStore = {
  withTransaction: <T>(operation: (transaction: V2BatchReceiptTransaction) => Promise<T>) => Promise<T>;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function conflict(): never { throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT'); }
function dependency(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function validInstant(value: unknown): value is string { return typeof value === 'string' && INSTANT.test(value) && Number.isFinite(Date.parse(value)); }
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
function validBody(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (!isPlainJsonValue(value, new WeakSet<object>())) return false;
  try {
    const json = JSON.stringify(value, (_key, nested) => {
      if (typeof nested === 'number' && !Number.isFinite(nested)) throw new Error('NON_FINITE_JSON_NUMBER');
      return nested;
    });
    return new TextEncoder().encode(json).byteLength <= MAX_RESPONSE_BODY_BYTES;
  }
  catch { return false; }
}

function validateRequest(input: { ownerId: string; batchId: string; requestSha256: string; createdAt: string }): void {
  if (!UUID.test(input.ownerId) || !UUID.test(input.batchId) || !SHA256.test(input.requestSha256) || !validInstant(input.createdAt)) invalid();
}

function validateReceipt(receipt: V2BatchReceipt, expected: { ownerId: string; batchId: string; requestSha256: string }): void {
  if (!receipt || receipt.ownerId !== expected.ownerId || receipt.batchId !== expected.batchId || receipt.requestSha256 !== expected.requestSha256
    || receipt.responseStatus !== 200 || !validBody(receipt.responseBody) || !validInstant(receipt.createdAt)) dependency();
}

/**
 * Executes the admitted batch and writes its response receipt in the same
 * injected transaction. A receipt write failure propagates, so callers never
 * receive a false successful batch that cannot be replayed.
 */
export async function executeV2PushWithBatchReceipt(input: {
  ownerId: string;
  batchId: string;
  requestSha256: string;
  createdAt: string;
  store: V2BatchReceiptStore;
  execute: () => Promise<{ responseBody: Record<string, unknown>; responseStatus: 200 }>;
}): Promise<{ action: 'applied' | 'replayed'; responseBody: Record<string, unknown>; responseStatus: 200 }> {
  validateRequest(input);
  return input.store.withTransaction(async (transaction) => {
    const existing = await transaction.readReceipt(input.ownerId, input.batchId);
    if (existing) {
      if (existing.ownerId !== input.ownerId || existing.batchId !== input.batchId) dependency();
      if (existing.requestSha256 !== input.requestSha256) conflict();
      validateReceipt(existing, input);
      return { action: 'replayed', responseBody: existing.responseBody, responseStatus: existing.responseStatus };
    }
    const result = await input.execute();
    if (!result || result.responseStatus !== 200 || !validBody(result.responseBody)) dependency();
    const receipt: V2BatchReceipt = {
      ownerId: input.ownerId, batchId: input.batchId, requestSha256: input.requestSha256,
      responseBody: result.responseBody, responseStatus: 200, createdAt: input.createdAt,
    };
    await transaction.writeReceipt(receipt);
    return { action: 'applied', responseBody: result.responseBody, responseStatus: 200 };
  });
}

/** Used by a real adapter after a unique-key insert race; foreign rows fail closed. */
export function validateV2BatchReceiptReplay(receipt: V2BatchReceipt, input: { ownerId: string; batchId: string; requestSha256: string }): V2BatchReceipt {
  validateReceipt(receipt, input);
  return receipt;
}
