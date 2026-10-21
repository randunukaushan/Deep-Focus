/** Server-only transactional adapter for versioned migration receipts. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { assertMigrationReceipt, type MigrationReceipt } from './migration-receipt-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

function mismatch(): never { throw new SafeBoundaryError(409, 'MIGRATION_CHECKSUM_MISMATCH'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function requireClient(value: unknown): asserts value is { query: (sql: string, params?: unknown[]) => Promise<unknown> } {
  if (!isRecord(value) || typeof value.query !== 'function') unavailable();
}
function rowsOf(value: unknown): unknown[] {
  if (!isRecord(value) || !Array.isArray(value.rows) || !isPlainJsonValueForBoundary(value.rows)) unavailable();
  return value.rows;
}

function row(value: Record<string, unknown>, expected: MigrationReceipt): MigrationReceipt {
  const actual = { migrationId: value.migration_id, checksumSha256: value.checksum_sha256, schemaVersion: value.schema_version, appliedBy: value.applied_by };
  if (actual.migrationId !== expected.migrationId || actual.checksumSha256 !== expected.checksumSha256
    || actual.schemaVersion !== expected.schemaVersion || actual.appliedBy !== expected.appliedBy) mismatch();
  assertMigrationReceipt(actual);
  return actual;
}

export function createPostgresMigrationReceiptStore(input: { runner: PostgresTransactionRunner }) {
  if (!isRecord(input) || !validRunner(input.runner)) unavailable();
  return {
    record: async (receipt: MigrationReceipt): Promise<{ receipt: MigrationReceipt; replayed: boolean }> => {
      assertMigrationReceipt(receipt);
      return input.runner.withTransaction(async (client) => {
        requireClient(client);
        const existing = await client.query(`select migration_id, checksum_sha256, schema_version, applied_by
          from df_private.schema_migration_receipts where migration_id = $1 for update`, [receipt.migrationId]);
        const existingRows = rowsOf(existing);
        if (existingRows.length > 1) unavailable();
        if (existingRows.length === 1 && isRecord(existingRows[0])) return { receipt: row(existingRows[0], receipt), replayed: true };
        if (existingRows.length !== 0) unavailable();
        const inserted = await client.query(`insert into df_private.schema_migration_receipts
          (migration_id, checksum_sha256, schema_version, applied_by)
          values ($1, $2, $3, $4)
          returning migration_id, checksum_sha256, schema_version, applied_by`,
        [receipt.migrationId, receipt.checksumSha256, receipt.schemaVersion, receipt.appliedBy]);
        const insertedRows = rowsOf(inserted);
        if (insertedRows.length !== 1 || !isRecord(insertedRows[0])) unavailable();
        return { receipt: row(insertedRows[0], receipt), replayed: false };
      });
    },
  };
}
