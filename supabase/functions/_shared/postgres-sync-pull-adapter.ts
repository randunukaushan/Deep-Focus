/** Local PostgreSQL candidate for owner-bound, snapshot-consistent sync pull reads. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { AuthorizedPullChange, SyncPullReadStore } from './sync-pull.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function rowToChange(row: Record<string, unknown>, ownerId: string): AuthorizedPullChange {
  if (row.owner_id !== ownerId
    || typeof row.sequence !== 'string' || !DECIMAL.test(row.sequence)
    || typeof row.entity_kind !== 'string' || !['profile', 'goal', 'task', 'focus_session', 'settings', 'break'].includes(row.entity_kind)
    || typeof row.entity_id !== 'string' || !UUID.test(row.entity_id)
    || typeof row.operation !== 'string' || !['upsert', 'delete'].includes(row.operation)
    || (row.operation === 'delete' ? row.payload !== null : !row.payload || typeof row.payload !== 'object' || Array.isArray(row.payload))) dependencyFailure();
  return {
    sequence: row.sequence,
    entityKind: row.entity_kind === 'focus_session' ? 'session' : row.entity_kind as AuthorizedPullChange['entityKind'],
    entityId: row.entity_id,
    operation: row.operation as AuthorizedPullChange['operation'],
    payload: row.payload as Record<string, unknown>,
  };
}

export function createPostgresSyncPullStore(input: { runner: PostgresTransactionRunner; sessionId: string }): SyncPullReadStore {
  return {
    readPage: ({ ownerId, after, highWater, limit }) => input.runner.withTransaction(async (client) => {
      if (!UUID.test(ownerId) || !DECIMAL.test(after) || (highWater !== null && !DECIMAL.test(highWater)) || !Number.isInteger(limit) || limit < 1 || limit > 100) dependencyFailure();
      await recheckPostgresAppSession(client, ownerId, input.sessionId);
      const highWaterResult = highWater === null
        ? await client.query<{ high_water: string }>(
          `select coalesce(max(sequence), 0)::text as high_water
           from df_private.sync_changes where owner_id = $1`, [ownerId])
        : { rows: [{ high_water: highWater }] };
      const currentHighWater = highWaterResult.rows[0]?.high_water;
      if (typeof currentHighWater !== 'string' || !DECIMAL.test(currentHighWater)) dependencyFailure();
      const result = await client.query(
        `select owner_id, sequence::text as sequence, entity_kind, entity_id, operation, payload
         from df_private.sync_changes
         where owner_id = $1 and sequence > $2::bigint and sequence <= $3::bigint
         order by sequence asc limit $4`,
        [ownerId, after, currentHighWater, limit],
      );
      return { highWater: currentHighWater, changes: result.rows.map((row) => rowToChange(row, ownerId)) };
    }),
  };
}
