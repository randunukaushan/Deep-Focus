/** Local PostgreSQL adapter candidate for durable AI proposal apply receipts. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateAiApplyReceipt, type AiApplyReceipt, type AiApplyReceiptStore, type AiApplyReceiptTransaction } from './ai-apply-receipt-guard.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256 = /^[a-f0-9]{64}$/;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function resultRows(result: unknown): unknown[] {
  if (!result || typeof result !== 'object' || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) dependencyFailure();
  return (result as { rows: unknown[] }).rows;
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256.test(value);
}

function isDecimal(value: unknown): value is string | number {
  return (typeof value === 'string' && DECIMAL.test(value))
    || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && DECIMAL.test(String(value)));
}

function validateIds(ownerId: unknown, id: unknown): asserts ownerId is string {
  if (!isUuid(ownerId) || !isUuid(id)) invalid();
}

function asReceipt(row: unknown, expected: { ownerId: string; id: string; field: 'mutation_id' | 'proposal_id' }): AiApplyReceipt {
  if (!row || typeof row !== 'object' || Array.isArray(row)) dependencyFailure();
  const record = row as Record<string, unknown>;
  if (record.owner_id !== expected.ownerId || record[expected.field] !== expected.id
    || !isUuid(record.owner_id) || !isUuid(record.proposal_id) || !isUuid(record.mutation_id)
    || !Number.isSafeInteger(record.proposal_version) || (record.proposal_version as number) < 1
    || !isSha256(record.review_digest) || !isSha256(record.request_sha256)
    || !record.response_body || typeof record.response_body !== 'object' || Array.isArray(record.response_body)
    || typeof record.response_status !== 'number' || !Number.isInteger(record.response_status)
    || record.response_status < 200 || record.response_status > 299
    || !isDecimal(record.committed_through)
    || typeof record.applied_at !== 'string' || !Number.isFinite(Date.parse(record.applied_at))) {
    dependencyFailure();
  }
  const receipt = {
    ownerId: record.owner_id,
    proposalId: record.proposal_id,
    proposalVersion: record.proposal_version as number,
    reviewDigest: record.review_digest,
    mutationId: record.mutation_id,
    requestSha256: record.request_sha256,
    responseBody: record.response_body as Record<string, unknown>,
    responseStatus: record.response_status,
    committedThrough: String(record.committed_through),
    appliedAt: record.applied_at,
  };
  if (!validateAiApplyReceipt(receipt)) dependencyFailure();
  return receipt;
}

export function createPostgresAiApplyReceiptTransaction(client: PostgresTransactionClient): AiApplyReceiptTransaction {
  const select = 'select owner_id, proposal_id, proposal_version, review_digest, mutation_id, request_sha256, response_body, response_status, committed_through, applied_at from df_private.ai_apply_receipts';
  return {
    readByMutation: async (ownerId, mutationId) => {
      validateIds(ownerId, mutationId);
      const result = await client.query(`${select} where owner_id = $1 and mutation_id = $2 for update`, [ownerId, mutationId]);
      const rows = resultRows(result);
      return rows.length === 0 ? null : asReceipt(rows[0], { ownerId, id: mutationId, field: 'mutation_id' });
    },
    readByProposal: async (ownerId, proposalId) => {
      validateIds(ownerId, proposalId);
      const result = await client.query(`${select} where owner_id = $1 and proposal_id = $2 for update`, [ownerId, proposalId]);
      const rows = resultRows(result);
      return rows.length === 0 ? null : asReceipt(rows[0], { ownerId, id: proposalId, field: 'proposal_id' });
    },
    writeReceipt: async (receipt) => {
      if (!validateAiApplyReceipt(receipt)) invalid();
      const inserted = await client.query(
        `insert into df_private.ai_apply_receipts
         (owner_id, proposal_id, proposal_version, review_digest, mutation_id, request_sha256, response_body, response_status, committed_through, applied_at)
         values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10)
         returning owner_id, proposal_id, proposal_version, review_digest, mutation_id, request_sha256, response_body, response_status, committed_through, applied_at`,
        [receipt.ownerId, receipt.proposalId, receipt.proposalVersion, receipt.reviewDigest, receipt.mutationId, receipt.requestSha256, JSON.stringify(receipt.responseBody), receipt.responseStatus, receipt.committedThrough, receipt.appliedAt],
      );
      const insertedRows = resultRows(inserted);
      if (insertedRows.length !== 1) dependencyFailure();
      const stored = asReceipt(insertedRows[0], { ownerId: receipt.ownerId, id: receipt.mutationId, field: 'mutation_id' });
      if (stored.proposalId !== receipt.proposalId
        || stored.proposalVersion !== receipt.proposalVersion
        || stored.reviewDigest !== receipt.reviewDigest
        || stored.requestSha256 !== receipt.requestSha256
        || JSON.stringify(stored.responseBody) !== JSON.stringify(receipt.responseBody)
        || stored.responseStatus !== receipt.responseStatus
        || stored.committedThrough !== receipt.committedThrough
        || stored.appliedAt !== receipt.appliedAt) dependencyFailure();
    },
  };
}

export function createPostgresAiApplyReceiptStore(input: { runner: PostgresTransactionRunner }): AiApplyReceiptStore {
  return {
    withOwnerTransaction: (ownerId, operation) => {
      if (!isUuid(ownerId)) invalid();
      return input.runner.withTransaction((client) => operation(createPostgresAiApplyReceiptTransaction(client)));
    },
  };
}
