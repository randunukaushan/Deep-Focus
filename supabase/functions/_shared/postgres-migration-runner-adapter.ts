/** Server-only PostgreSQL transaction adapter for the local migration runner candidate. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { assertMigrationReceipt, type MigrationReceipt } from './migration-receipt-validation.ts';
import type { MigrationRunnerStore, MigrationRunnerTransaction } from './migration-runner.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const MIGRATION_ID = /^[0-9]{14}_[a-z0-9_]{1,96}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const FIRST_MIGRATION = '20261009071127_personal_core_v1';
const DESTRUCTIVE = /\b(?:drop\s+(?:schema|table|type|column)|truncate(?:\s+table)?|delete\s+from|alter\s+table\s+(?:if\s+exists\s+)?[a-z0-9_."]+\s+drop\s+column)\b/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function mismatch(): never { throw new SafeBoundaryError(409, 'MIGRATION_CHECKSUM_MISMATCH'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function resultRows(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable();
  return result.rows;
}
function requireClient(client: unknown): asserts client is { query: (sql: string, params?: unknown[]) => Promise<unknown> } {
  if (!isRecord(client) || typeof client.query !== 'function') unavailable();
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function receiptFromRow(value: unknown, expectedId: string): MigrationReceipt {
  if (!isRecord(value)) unavailable();
  const receipt = {
    migrationId: value.migration_id,
    checksumSha256: value.checksum_sha256,
    schemaVersion: value.schema_version,
    appliedBy: value.applied_by,
  };
  assertMigrationReceipt(receipt);
  if (receipt.migrationId !== expectedId) unavailable();
  return receipt;
}

function assertMigrationId(value: string): void {
  if (typeof value !== 'string' || !MIGRATION_ID.test(value)) invalid();
}

function extractTransactionBody(sqlText: string): string {
  const begin = /^\s*(?:(?:--[^\r\n]*|\/\*[\s\S]*?\*\/)\s*)*begin\s*;/i.exec(sqlText);
  const commit = /commit\s*;\s*$/i.exec(sqlText);
  if (!begin || !commit || commit.index <= begin.index + begin[0].length) invalid();
  const body = sqlText.slice(begin.index + begin[0].length, commit.index).trim();
  if (!body || /\b(?:begin|commit|rollback)\s*;/i.test(body)) invalid();
  return body;
}

/**
 * Binds one migration execution to one injected PostgreSQL transaction. The
 * caller must run the validated manifest through `runMigrations`; this adapter
 * does not choose a migration list or connect to a remote project.
 */
export function createPostgresMigrationRunnerStore(input: { runner: PostgresTransactionRunner }): MigrationRunnerStore {
  if (!input || !input.runner || typeof input.runner.withTransaction !== 'function') invalid();
  return {
    withMigrationTransaction: async <T>(migrationId: string, operation: (transaction: MigrationRunnerTransaction) => Promise<T>): Promise<T> => {
      assertMigrationId(migrationId);
      if (typeof operation !== 'function') invalid();
      return input.runner.withTransaction(async (client) => {
        requireClient(client);
        let lock: Promise<void> | undefined;
        const acquireLock = (): Promise<void> => {
          // All cooperating runners use the same database-local lock, including
          // when no receipt row (or even private schema) exists yet.
          lock ??= (async () => {
            await client.query('set transaction isolation level read committed', []);
            await client.query('select pg_advisory_xact_lock(1145457987, 1)', []);
          })();
          return lock;
        };
        const transaction: MigrationRunnerTransaction = {
          loadReceipt: async (requestedId) => {
            assertMigrationId(requestedId);
            if (requestedId !== migrationId) invalid();
            await acquireLock();
            const catalog = resultRows(await client.query(`select
              to_regclass('df_private.schema_migration_receipts') is not null as receipts_exist,
              to_regnamespace('df_private') is not null as schema_exists`, []));
            if (catalog.length !== 1 || !isRecord(catalog[0])
              || typeof catalog[0].receipts_exist !== 'boolean' || typeof catalog[0].schema_exists !== 'boolean') unavailable();
            if (!catalog[0].receipts_exist) {
              // Do not silently adopt a partial or externally managed schema.
              if (migrationId !== FIRST_MIGRATION || catalog[0].schema_exists) unavailable();
              return null;
            }
            const result = await client.query(`select migration_id, checksum_sha256, schema_version, applied_by
              from df_private.schema_migration_receipts where migration_id = $1 for update`, [migrationId]);
            const rows = resultRows(result);
            if (rows.length > 1) unavailable();
            return rows.length === 0 ? null : receiptFromRow(rows[0], migrationId);
          },
          executeMigration: async (request) => {
            assertMigrationId(request.migrationId);
            if (request.migrationId !== migrationId || typeof request.sqlText !== 'string' || request.sqlText.length > 2_000_000
              || !/\bbegin\s*;/i.test(request.sqlText) || !/commit\s*;\s*$/i.test(request.sqlText)
              || DESTRUCTIVE.test(request.sqlText) || !SHA256.test(request.checksumSha256)) invalid();
            if (await sha256(request.sqlText) !== request.checksumSha256) mismatch();
            const body = extractTransactionBody(request.sqlText);
            await acquireLock();
            await client.query(body, []);
          },
          saveReceipt: async (receipt) => {
            assertMigrationReceipt(receipt);
            if (receipt.migrationId !== migrationId) invalid();
            await acquireLock();
            const result = await client.query(`insert into df_private.schema_migration_receipts
              (migration_id, checksum_sha256, schema_version, applied_by)
              values ($1, $2, $3, $4)
              returning migration_id, checksum_sha256, schema_version, applied_by`,
            [receipt.migrationId, receipt.checksumSha256, receipt.schemaVersion, receipt.appliedBy]);
            const rows = resultRows(result);
            if (rows.length !== 1) unavailable();
            const stored = receiptFromRow(rows[0], migrationId);
            if (stored.checksumSha256 !== receipt.checksumSha256
              || stored.schemaVersion !== receipt.schemaVersion
              || stored.appliedBy !== receipt.appliedBy) mismatch();
          },
        };
        return operation(transaction);
      });
    },
  };
}
