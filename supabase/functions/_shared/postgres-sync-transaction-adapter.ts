/** Local PostgreSQL adapter for authorized sync-page commit/replay handling. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { StoredSyncChange, SyncTransactionStore } from './sync-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { hashSyncChange } from './sync-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function requireClient(value: unknown): asserts value is { query: (sql: string, params?: unknown[]) => Promise<unknown> } {
  if (!isRecord(value) || typeof value.query !== 'function') dependencyFailure();
}
function oneRow(result: unknown): Record<string, unknown> {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows) || result.rows.length !== 1 || !isRecord(result.rows[0])) dependencyFailure();
  return result.rows[0];
}
function rowArray(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure();
  return result.rows;
}

async function storedChange(row: unknown, ownerId: string): Promise<StoredSyncChange> {
  if (!isRecord(row) || row.owner_id !== ownerId
    || typeof row.sequence !== 'string' || !/^(?:0|[1-9][0-9]*)$/.test(row.sequence) || row.sequence === '0'
    || typeof row.entity_kind !== 'string' || !['profile', 'goal', 'task', 'session', 'focus_session', 'settings', 'break', 'reminder'].includes(row.entity_kind)
    || typeof row.entity_id !== 'string' || !UUID.test(row.entity_id)
    || typeof row.operation !== 'string' || !['upsert', 'delete'].includes(row.operation)
    || (row.operation === 'delete' ? row.payload !== null : !row.payload || typeof row.payload !== 'object' || Array.isArray(row.payload))
    || typeof row.change_hash !== 'string' || !/^[a-f0-9]{64}$/.test(row.change_hash)) dependencyFailure();
  const change = {
    sequence: row.sequence,
    entityKind: row.entity_kind as StoredSyncChange['entityKind'],
    entityId: row.entity_id,
    operation: row.operation as StoredSyncChange['operation'],
    payload: row.payload as Record<string, unknown>,
  };
  if (await hashSyncChange(change) !== row.change_hash) dependencyFailure();
  return { ...change, changeHash: row.change_hash as string };
}

export function createPostgresSyncTransactionStore(input: { runner: PostgresTransactionRunner; sessionId: string }): SyncTransactionStore {
  if (!isRecord(input) || !validRunner(input.runner)) invalid();
  return {
    withTransaction: (operation) => {
      if (typeof operation !== 'function') invalid();
      return input.runner.withTransaction(async (client) => {
        requireClient(client);
        return operation({
      readHeadForUpdate: async (ownerId) => {
        await recheckPostgresAppSession(client, ownerId, input.sessionId);
        const result = await client.query<{ last_sequence: string }>(`select last_sequence::text as last_sequence from df_private.sync_heads where owner_id = $1 for update`, [ownerId]);
        const row = oneRow(result);
        if (typeof row.last_sequence !== 'string' || !/^\d+$/.test(row.last_sequence)) dependencyFailure();
        return { lastSequence: row.last_sequence };
      },
      readChange: async (ownerId, sequence) => {
        const result = await client.query(`select owner_id, sequence::text as sequence, entity_kind, entity_id, operation, payload, change_hash from df_private.sync_changes where owner_id = $1 and sequence = $2::bigint`, [ownerId, sequence]);
        const rows = rowArray(result);
        if (rows.length === 0) return null;
        if (rows.length !== 1) dependencyFailure();
        return await storedChange(rows[0], ownerId);
      },
      appendChange: async (ownerId, change, changeHash) => {
        const inserted = await client.query(
          `insert into df_private.sync_changes (owner_id, sequence, entity_kind, entity_id, operation, payload, change_hash)
           values ($1, $2::bigint, $3, $4, $5, $6::jsonb, $7)
           returning owner_id, sequence::text as sequence, entity_kind, entity_id, operation, change_hash`,
          [ownerId, change.sequence, change.entityKind, change.entityId, change.operation, JSON.stringify(change.payload), changeHash],
        );
        const insertedRow = oneRow(inserted);
        if (insertedRow.owner_id !== ownerId || insertedRow.sequence !== change.sequence
          || insertedRow.entity_kind !== (change.entityKind === 'session' ? 'focus_session' : change.entityKind)
          || insertedRow.entity_id !== change.entityId || insertedRow.operation !== change.operation
          || insertedRow.change_hash !== changeHash) dependencyFailure();
      },
      advanceHead: async (ownerId, sequence) => {
        const result = await client.query<{ owner_id: string; last_sequence: string }>(`update df_private.sync_heads set last_sequence = $2::bigint where owner_id = $1 and last_sequence < $2::bigint returning owner_id, last_sequence::text as last_sequence`, [ownerId, sequence]);
        const advancedRow = oneRow(result);
        if (advancedRow.owner_id !== ownerId || advancedRow.last_sequence !== sequence) dependencyFailure();
      },
        });
      });
    },
  };
}
