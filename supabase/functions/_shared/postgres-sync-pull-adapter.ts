/** Local PostgreSQL candidate for owner-bound, snapshot-consistent sync pull reads. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { AuthorizedPullChange, SyncPullReadStore } from './sync-pull.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { hashSyncChange } from './sync-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const MAX_SYNC_PAYLOAD_BYTES = 65536;

function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
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

async function rowToChange(row: unknown, ownerId: string): Promise<AuthorizedPullChange> {
  if (!isRecord(row) || row.owner_id !== ownerId
    || typeof row.sequence !== 'string' || !DECIMAL.test(row.sequence) || row.sequence === '0'
    || typeof row.entity_kind !== 'string' || !['profile', 'goal', 'task', 'focus_session', 'settings', 'break', 'reminder'].includes(row.entity_kind)
    || typeof row.entity_id !== 'string' || !UUID.test(row.entity_id)
    || typeof row.operation !== 'string' || !['upsert', 'delete'].includes(row.operation)
    || (row.operation === 'delete' ? row.payload !== null : !row.payload || typeof row.payload !== 'object' || Array.isArray(row.payload))) dependencyFailure();
  if (row.operation === 'upsert') {
    if (!isPlainJsonValueForBoundary(row.payload)) dependencyFailure();
    try {
      const serialized = JSON.stringify(row.payload, (_key, child) => {
        if (typeof child === 'number' && !Number.isFinite(child)) throw new TypeError('SYNC_UNHASHABLE_PAYLOAD');
        return child;
      });
      if (typeof serialized !== 'string' || new TextEncoder().encode(serialized).byteLength > MAX_SYNC_PAYLOAD_BYTES) dependencyFailure();
    } catch { dependencyFailure(); }
  }
  if (typeof row.change_hash !== 'string' || !/^[a-f0-9]{64}$/.test(row.change_hash)) dependencyFailure();
  const stored = { sequence: row.sequence, entityKind: row.entity_kind as AuthorizedPullChange['entityKind'], entityId: row.entity_id, operation: row.operation as AuthorizedPullChange['operation'], payload: row.payload as Record<string, unknown> };
  if (await hashSyncChange(stored) !== row.change_hash) dependencyFailure();
  return {
    sequence: row.sequence,
    entityKind: row.entity_kind === 'focus_session' ? 'session' : row.entity_kind as AuthorizedPullChange['entityKind'],
    entityId: row.entity_id,
    operation: row.operation as AuthorizedPullChange['operation'],
    payload: row.payload as Record<string, unknown>,
  };
}

export function createPostgresSyncPullStore(input: { runner: PostgresTransactionRunner; sessionId: string }): SyncPullReadStore {
  if (!isRecord(input) || !validRunner(input.runner)) invalid();
  return {
    readPage: ({ ownerId, after, highWater, limit }) => input.runner.withTransaction(async (client) => {
      if (!isUuid(input.sessionId)) invalid();
      requireClient(client);
      if (!isUuid(ownerId) || !DECIMAL.test(after) || (highWater !== null && !DECIMAL.test(highWater)) || !Number.isInteger(limit) || limit < 1 || limit > 100) dependencyFailure();
      await recheckPostgresAppSession(client, ownerId, input.sessionId);
      const highWaterResult = await client.query<{ high_water: string }>(
        `select coalesce(max(sequence), 0)::text as high_water
         from df_private.sync_changes where owner_id = $1`, [ownerId]);
      const currentHighWater = oneRow(highWaterResult).high_water;
      if (typeof currentHighWater !== 'string' || !DECIMAL.test(currentHighWater)
        || (highWater !== null && BigInt(currentHighWater) < BigInt(highWater))) dependencyFailure();
      const boundedHighWater = highWater ?? currentHighWater;
      const result = await client.query(
        `select owner_id, sequence::text as sequence, entity_kind, entity_id, operation, payload, change_hash
         from df_private.sync_changes
         where owner_id = $1 and sequence > $2::bigint and sequence <= $3::bigint
         order by sequence asc limit $4`,
        [ownerId, after, boundedHighWater, limit],
      );
      const changeRows = rowArray(result);
      const changes = await Promise.all(changeRows.map((row) => rowToChange(row, ownerId)));
      let previous = BigInt(after);
      const bound = BigInt(boundedHighWater);
      for (const change of changes) {
        const sequence = BigInt(change.sequence);
        if (sequence <= previous || sequence > bound) dependencyFailure();
        previous = sequence;
      }
      return { highWater: boundedHighWater, changes };
    }),
  };
}
