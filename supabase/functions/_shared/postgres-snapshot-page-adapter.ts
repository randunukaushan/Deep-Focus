/** Local PostgreSQL candidate for owner-bound ready snapshot page reads. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { SnapshotPage } from '../../../src/features/sync/snapshot-mirror.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const DIGEST = /^[a-f0-9]{64}$/;
const CURSOR = /^(?=.{1,2048}$)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function validEntity(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entity = value as Record<string, unknown>;
  return ['task', 'goal', 'session', 'break', 'settings', 'reminder'].includes(String(entity.entity))
    && typeof entity.entityId === 'string' && UUID.test(entity.entityId)
    && Number.isSafeInteger(entity.version) && (entity.version as number) > 0
    && (entity.operation === 'delete'
      ? entity.payload === null
      : entity.operation === 'upsert' && !!entity.payload && typeof entity.payload === 'object' && !Array.isArray(entity.payload));
}

function pageFromRow(row: Record<string, unknown>, expected: { ownerId: string; snapshotId: string; pageIndex: number }): SnapshotPage {
  const highWater = typeof row.high_water === 'string' ? row.high_water : Number.isSafeInteger(row.high_water) && (row.high_water as number) >= 0 ? String(row.high_water) : null;
  const snapshotHighWater = typeof row.snapshot_high_water === 'string' ? row.snapshot_high_water : Number.isSafeInteger(row.snapshot_high_water) && (row.snapshot_high_water as number) >= 0 ? String(row.snapshot_high_water) : null;
  if (row.owner_id !== expected.ownerId || row.snapshot_owner_id !== expected.ownerId
    || row.snapshot_record_id !== expected.snapshotId || row.snapshot_id !== expected.snapshotId || row.page_index !== expected.pageIndex
    || typeof row.snapshot_id !== 'string' || !UUID.test(row.snapshot_id)
    || !Number.isInteger(row.page_index) || (row.page_index as number) < 0
    || !Number.isInteger(row.page_count) || (row.page_count as number) < 1
    || highWater === null || snapshotHighWater === null || !DECIMAL.test(highWater) || !DECIMAL.test(snapshotHighWater)
    || (row.page_index as number) >= (row.page_count as number)
    || row.snapshot_page_count !== row.page_count || snapshotHighWater !== highWater
    || typeof row.page_digest !== 'string' || !DIGEST.test(row.page_digest)
    || !row.payload || typeof row.payload !== 'object' || Array.isArray(row.payload)
    || !Array.isArray((row.payload as Record<string, unknown>).data)
    || ((row.payload as Record<string, unknown>).data as unknown[]).length > 100
    || !((row.payload as Record<string, unknown>).data as unknown[]).every(validEntity)
    || (row.next_cursor !== null && (typeof row.next_cursor !== 'string' || !CURSOR.test(row.next_cursor)))) unavailable();
  const payload = row.payload as Record<string, unknown>;
  return {
    snapshotId: row.snapshot_id,
    pageIndex: row.page_index as number,
    pageCount: row.page_count as number,
    highWater,
    data: payload.data as SnapshotPage['data'],
    pageDigest: row.page_digest,
    nextCursor: row.next_cursor as string | null,
  };
}

export async function readReadySnapshotPage(client: PostgresTransactionClient, input: {
  ownerId: string;
  snapshotId: string;
  pageIndex: number;
  now: string;
  sessionId: string;
}): Promise<SnapshotPage | null> {
  if (!UUID.test(input.ownerId) || !UUID.test(input.snapshotId) || !Number.isInteger(input.pageIndex)
    || input.pageIndex < 0 || input.pageIndex > 100 || !Number.isFinite(Date.parse(input.now))) invalid();
  await recheckPostgresAppSession(client, input.ownerId, input.sessionId);
  const result = await client.query(
    `select p.owner_id, p.snapshot_id, p.page_index, p.page_count, p.high_water, p.page_digest, p.payload, p.next_cursor,
            s.owner_id as snapshot_owner_id, s.snapshot_id as snapshot_record_id, s.page_count as snapshot_page_count,
            s.high_water::text as snapshot_high_water
     from df_private.sync_snapshot_pages p
     join df_private.sync_snapshots s on s.owner_id = p.owner_id and s.snapshot_id = p.snapshot_id
     where p.owner_id = $1 and p.snapshot_id = $2 and p.page_index = $3
       and s.status = 'ready' and s.expires_at > $4::timestamptz`,
    [input.ownerId, input.snapshotId, input.pageIndex, input.now],
  );
  return result.rows.length === 0 ? null : pageFromRow(result.rows[0], input);
}

export function createPostgresSnapshotPageReader(input: { runner: PostgresTransactionRunner }): {
  readPage: (value: { ownerId: string; snapshotId: string; pageIndex: number; now: string; sessionId: string }) => Promise<SnapshotPage | null>;
} {
  return { readPage: (value) => input.runner.withTransaction((client) => readReadySnapshotPage(client, value)) };
}
