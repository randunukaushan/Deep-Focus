/** Local PostgreSQL composition boundary for owner-bound backup/restore work. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createBackupArtifact, prepareBackupRestore, validateBackupExportRequest, type BackupArtifact, type BackupRecord } from './backup-restore.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

function dependencyFailure(): never { throw new Error('BACKUP_ADAPTER_DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requireClient(client: PostgresTransactionClient): PostgresTransactionClient {
  if (!isRecord(client) || typeof client.query !== 'function') dependencyFailure();
  return client;
}

export type PostgresBackupSource = {
  readRecords: (client: PostgresTransactionClient, ownerId: string) => Promise<unknown[]>;
};

export type PostgresBackupWriter = {
  writeRecords: (client: PostgresTransactionClient, ownerId: string, records: BackupRecord[]) => Promise<void>;
};

/**
 * Keeps the database client inside one caller-owned transaction. The adapter
 * does not create credentials, choose tables, delete existing data, or make a
 * restore overwrite decision; those policies stay with the reviewed caller.
 */
export function createPostgresBackupRestoreAdapter(input: {
  runner: PostgresTransactionRunner;
  source: PostgresBackupSource;
  writer: PostgresBackupWriter;
}) {
  if (!isRecord(input)
    || !isRecord(input.runner) || typeof input.runner.withTransaction !== 'function'
    || !isRecord(input.source) || typeof input.source.readRecords !== 'function'
    || !isRecord(input.writer) || typeof input.writer.writeRecords !== 'function') dependencyFailure();
  return {
    export: async (request: {
      verifiedOwnerId: string;
      schemaVersion: number;
      createdAt: string;
    }): Promise<BackupArtifact> => {
      if (!validateBackupExportRequest(request)) throw new Error('BACKUP_EXPORT_INVALID');
      return input.runner.withTransaction(async (client) => createBackupArtifact({
        ...request,
        source: { readRecords: (ownerId) => input.source.readRecords(requireClient(client), ownerId) },
      }));
    },

    restore: async (request: {
      manifest: unknown;
      verifiedOwnerId: string;
      currentSchemaVersion: number;
      targetHasData: boolean;
      payload: unknown;
      computedPayloadSha256: string;
    }) => prepareBackupRestore(request).then((validated) => input.runner.withTransaction(async (client) => {
      await input.writer.writeRecords(requireClient(client), validated.ownerId, validated.records);
      return { restored: validated.records.length, ownerId: validated.ownerId, schemaVersion: validated.schemaVersion };
    })),
  };
}
