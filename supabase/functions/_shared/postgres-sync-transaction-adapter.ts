/** Local PostgreSQL adapter for authorized sync-page commit/replay handling. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { StoredSyncChange, SyncTransactionStore } from './sync-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function storedChange(row: Record<string, unknown>, ownerId: string): StoredSyncChange {
  if (row.owner_id !== ownerId
    || typeof row.sequence !== 'string' || typeof row.entity_kind !== 'string' || typeof row.entity_id !== 'string'
    || typeof row.operation !== 'string' || !row.payload || typeof row.payload !== 'object' || Array.isArray(row.payload)
    || typeof row.change_hash !== 'string') dependencyFailure();
  return {
    sequence: row.sequence,
    entityKind: row.entity_kind as StoredSyncChange['entityKind'],
    entityId: row.entity_id,
    operation: row.operation as StoredSyncChange['operation'],
    payload: row.payload as Record<string, unknown>,
    changeHash: row.change_hash,
  };
}

export function createPostgresSyncTransactionStore(input: { runner: PostgresTransactionRunner; sessionId: string }): SyncTransactionStore {
  return {
    withTransaction: (operation) => input.runner.withTransaction(async (client) => operation({
      readHeadForUpdate: async (ownerId) => {
        await recheckPostgresAppSession(client, ownerId, input.sessionId);
        const result = await client.query<{ last_sequence: string }>(`select last_sequence::text as last_sequence from df_private.sync_heads where owner_id = $1 for update`, [ownerId]);
        const row = result.rows[0];
        if (!row || typeof row.last_sequence !== 'string' || !/^\d+$/.test(row.last_sequence)) dependencyFailure();
        return { lastSequence: row.last_sequence };
      },
      readChange: async (ownerId, sequence) => {
        const result = await client.query(`select owner_id, sequence::text as sequence, entity_kind, entity_id, operation, payload, change_hash from df_private.sync_changes where owner_id = $1 and sequence = $2::bigint`, [ownerId, sequence]);
        return result.rows.length === 0 ? null : storedChange(result.rows[0], ownerId);
      },
      appendChange: async (ownerId, change, changeHash) => {
        const inserted = await client.query<{ owner_id: string; sequence: string; change_hash: string }>(
          `insert into df_private.sync_changes (owner_id, sequence, entity_kind, entity_id, operation, payload, change_hash)
           values ($1, $2::bigint, $3, $4, $5, $6::jsonb, $7)
           returning owner_id, sequence::text as sequence, change_hash`,
          [ownerId, change.sequence, change.entityKind, change.entityId, change.operation, JSON.stringify(change.payload), changeHash],
        );
        if (inserted.rows.length !== 1 || inserted.rows[0]?.owner_id !== ownerId || inserted.rows[0]?.sequence !== change.sequence || inserted.rows[0]?.change_hash !== changeHash) dependencyFailure();
      },
      advanceHead: async (ownerId, sequence) => {
        const result = await client.query<{ owner_id: string; last_sequence: string }>(`update df_private.sync_heads set last_sequence = $2::bigint where owner_id = $1 and last_sequence < $2::bigint returning owner_id, last_sequence::text as last_sequence`, [ownerId, sequence]);
        if (result.rows.length !== 1 || result.rows[0]?.owner_id !== ownerId || result.rows[0]?.last_sequence !== sequence) dependencyFailure();
      },
    })),
  };
}
