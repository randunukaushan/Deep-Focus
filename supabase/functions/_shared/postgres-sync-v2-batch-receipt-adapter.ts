/** Local PostgreSQL adapter candidate for the V2 push batch receipt contract. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateV2BatchReceiptReplay } from './sync-v2-batch-receipt.ts';
import type { V2BatchReceipt, V2BatchReceiptStore, V2BatchReceiptTransaction } from './sync-v2-batch-receipt.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

type BatchReceiptRow = {
  owner_id: string;
  batch_id: string;
  request_sha256: string;
  response_body: unknown;
  response_status: number;
  created_at: string;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validateIdentity(ownerId: unknown, batchId: unknown): asserts ownerId is string {
  if (!isUuid(ownerId) || !isUuid(batchId)) invalid();
}
function resultRows(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable();
  return result.rows;
}
function asReceipt(row: unknown, expected: { ownerId: string; batchId: string }): V2BatchReceipt {
  if (!isRecord(row)) unavailable();
  if (!row || row.owner_id !== expected.ownerId || row.batch_id !== expected.batchId || !isUuid(row.owner_id) || !isUuid(row.batch_id)
    || typeof row.request_sha256 !== 'string' || !SHA256.test(row.request_sha256)
    || !row.response_body || typeof row.response_body !== 'object' || Array.isArray(row.response_body)
    || row.response_status !== 200 || typeof row.created_at !== 'string' || !INSTANT.test(row.created_at) || !Number.isFinite(Date.parse(row.created_at))) unavailable();
  const receipt = { ownerId: row.owner_id, batchId: row.batch_id, requestSha256: row.request_sha256, responseBody: row.response_body as Record<string, unknown>, responseStatus: 200 as const, createdAt: row.created_at };
  try { return validateV2BatchReceiptReplay(receipt, { ownerId: expected.ownerId, batchId: expected.batchId, requestSha256: row.request_sha256 }); }
  catch { unavailable(); }
}

export function createPostgresV2BatchReceiptStore(input: {
  runner: PostgresTransactionRunner;
}): V2BatchReceiptStore {
  if (!input || !input.runner || typeof input.runner.withTransaction !== 'function') invalid();
  return {
    withTransaction: async <T>(operation: (transaction: V2BatchReceiptTransaction) => Promise<T>) => {
      if (typeof operation !== 'function') invalid();
      return input.runner.withTransaction(async (client) => {
      if (!client || typeof client !== 'object' || typeof client.query !== 'function') unavailable();
      const transaction: V2BatchReceiptTransaction = {
        readReceipt: async (ownerId, batchId) => {
          validateIdentity(ownerId, batchId);
          const result = await client.query<BatchReceiptRow>(
            `select owner_id, batch_id, request_sha256, response_body, response_status, created_at
             from df_private.sync_v2_batch_receipts
             where owner_id = $1 and batch_id = $2
             for update`,
            [ownerId, batchId],
          );
          const rows = resultRows(result);
          if (rows.length > 1) unavailable();
          return rows.length === 0 ? null : asReceipt(rows[0], { ownerId, batchId });
        },
        writeReceipt: async (receipt) => {
          validateIdentity(receipt.ownerId, receipt.batchId);
          if (typeof receipt.requestSha256 !== 'string' || !SHA256.test(receipt.requestSha256) || receipt.responseStatus !== 200 || !receipt.responseBody || typeof receipt.responseBody !== 'object' || Array.isArray(receipt.responseBody)
            || typeof receipt.createdAt !== 'string' || !INSTANT.test(receipt.createdAt) || !Number.isFinite(Date.parse(receipt.createdAt))) invalid();
          try { validateV2BatchReceiptReplay(receipt, { ownerId: receipt.ownerId, batchId: receipt.batchId, requestSha256: receipt.requestSha256 }); }
          catch { invalid(); }
          const inserted = await client.query(
            `insert into df_private.sync_v2_batch_receipts
             (owner_id, batch_id, request_sha256, response_body, response_status, created_at)
             values ($1, $2, $3, $4::jsonb, $5, $6)
             returning owner_id, batch_id, request_sha256, response_body, response_status, created_at`,
            [receipt.ownerId, receipt.batchId, receipt.requestSha256, JSON.stringify(receipt.responseBody), receipt.responseStatus, receipt.createdAt],
          );
          const rows = resultRows(inserted);
          if (rows.length !== 1) unavailable();
          const stored = asReceipt(rows[0], { ownerId: receipt.ownerId, batchId: receipt.batchId });
          if (stored.requestSha256 !== receipt.requestSha256
            || JSON.stringify(stored.responseBody) !== JSON.stringify(receipt.responseBody)
            || stored.responseStatus !== receipt.responseStatus
            || stored.createdAt !== receipt.createdAt) unavailable();
        },
      };
      return operation(transaction);
      });
    },
  };
}
