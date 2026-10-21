/** Local migration coordinator; the caller supplies the real transaction boundary. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { buildMigrationManifest } from './migration-manifest.ts';
import type { MigrationReceipt } from './migration-receipt-validation.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { assertMigrationReceipt } from './migration-receipt-validation.ts';

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function mismatch(): never { throw new SafeBoundaryError(409, 'MIGRATION_CHECKSUM_MISMATCH'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export type MigrationRunResult = {
  migrationId: string;
  status: 'applied' | 'replayed';
  receipt: MigrationReceipt;
};

export type MigrationRunnerTransaction = {
  loadReceipt: (migrationId: string) => Promise<unknown | null>;
  executeMigration: (input: { migrationId: string; checksumSha256: string; sqlText: string }) => Promise<void>;
  saveReceipt: (receipt: MigrationReceipt) => Promise<void>;
};

export type MigrationRunnerStore = {
  withMigrationTransaction: <T>(migrationId: string, operation: (transaction: MigrationRunnerTransaction) => Promise<T>) => Promise<T>;
};

/** Validates the complete manifest before applying any migration. */
export async function runMigrations(input: {
  files: { name: string; text: string }[];
  schemaVersion: number;
  appliedBy?: MigrationReceipt['appliedBy'];
  store: MigrationRunnerStore;
}): Promise<MigrationRunResult[]> {
  if (!isRecord(input) || !isRecord(input.store) || typeof input.store.withMigrationTransaction !== 'function') invalid();
  const receipts = await buildMigrationManifest({ files: input.files, schemaVersion: input.schemaVersion, appliedBy: input.appliedBy });
  const byId = new Map(input.files.map((file) => [file.name.slice(0, -4), file.text]));
  const results: MigrationRunResult[] = [];
  for (const receipt of receipts) {
    const sqlText = byId.get(receipt.migrationId);
    if (typeof sqlText !== 'string') unavailable();
    const result = await input.store.withMigrationTransaction(receipt.migrationId, async (transaction) => {
      const existing = await transaction.loadReceipt(receipt.migrationId);
      if (existing !== null) {
        assertMigrationReceipt(existing);
        if (existing.migrationId !== receipt.migrationId || existing.checksumSha256 !== receipt.checksumSha256
          || existing.schemaVersion !== receipt.schemaVersion || existing.appliedBy !== receipt.appliedBy) mismatch();
        return { migrationId: receipt.migrationId, status: 'replayed' as const, receipt: existing };
      }
      await transaction.executeMigration({ migrationId: receipt.migrationId, checksumSha256: receipt.checksumSha256, sqlText });
      await transaction.saveReceipt(receipt);
      return { migrationId: receipt.migrationId, status: 'applied' as const, receipt };
    });
    results.push(result);
  }
  return results;
}
