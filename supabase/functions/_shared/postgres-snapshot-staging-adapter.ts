/** Local PostgreSQL candidate for atomic, owner-bound snapshot page staging. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { SnapshotEntity, SnapshotPage } from '../../../src/features/sync/snapshot-mirror.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { boundedSnapshotPagePayloadJson } from './snapshot-payload-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const DIGEST = /^[a-f0-9]{64}$/;
const CURSOR = /^(?=.{1,2048}$)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/;
const MAX_POSTGRES_BIGINT = 9223372036854775807n;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

type SnapshotMetadata = {
  owner_id: string;
  snapshot_id: string;
  contract_version: number;
  high_water: string | number;
  created_at: string;
  expires_at: string;
  page_count: number;
  manifest_digest: string;
  status: 'building' | 'ready' | 'expired' | 'failed';
};

type SnapshotPageRow = {
  owner_id: string;
  snapshot_id: string;
  page_index: number;
  page_count: number;
  high_water: string | number;
  page_digest: string;
  payload: unknown;
  next_cursor: string | null;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function conflict(): never { throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function validRunner(value: unknown): value is PostgresTransactionRunner { return isRecord(value) && typeof value.withTransaction === 'function'; }
function requireClient(value: unknown): asserts value is PostgresTransactionClient {
  if (!isRecord(value) || typeof value.query !== 'function') unavailable();
}
function rowsOf(value: unknown): unknown[] {
  if (!isRecord(value) || !Array.isArray(value.rows) || !isPlainJsonValueForBoundary(value.rows)) unavailable();
  return value.rows;
}

function decimal(value: unknown): value is string {
  return typeof value === 'string' && DECIMAL.test(value) && BigInt(value) <= MAX_POSTGRES_BIGINT;
}

function validEntity(value: unknown): value is SnapshotEntity {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entity = value as Partial<SnapshotEntity>;
  return ['task', 'goal', 'session', 'break', 'settings', 'reminder'].includes(entity.entity ?? '')
    && typeof entity.entityId === 'string' && UUID.test(entity.entityId)
    && typeof entity.version === 'number' && Number.isSafeInteger(entity.version) && entity.version > 0
    && (entity.operation === 'delete'
      ? entity.payload === null
      : entity.operation === 'upsert' && !!entity.payload && typeof entity.payload === 'object' && !Array.isArray(entity.payload));
}

function validateInput(input: SnapshotStagingInput): void {
  if (!input || typeof input !== 'object'
    || !isUuid(input.ownerId) || !isUuid(input.sessionId) || !isUuid(input.snapshotId) || input.contractVersion !== 1
    || !decimal(input.highWater) || !Number.isInteger(input.pageCount) || input.pageCount < 1
    || typeof input.manifestDigest !== 'string' || !DIGEST.test(input.manifestDigest)
    || typeof input.createdAt !== 'string' || !Number.isFinite(Date.parse(input.createdAt))
    || typeof input.expiresAt !== 'string' || !Number.isFinite(Date.parse(input.expiresAt)) || Date.parse(input.expiresAt) <= Date.parse(input.createdAt)
    || !Array.isArray(input.pages) || input.pages.length !== input.pageCount) invalid();

  const identities = new Set<string>();
  for (const page of input.pages) {
    if (!page || typeof page !== 'object' || !isUuid(page.snapshotId) || page.snapshotId !== input.snapshotId
      || !Number.isInteger(page.pageIndex) || !Number.isInteger(page.pageCount)
      || page.pageIndex < 0 || page.pageIndex >= input.pageCount || page.pageCount !== input.pageCount
      || page.highWater !== input.highWater || typeof page.pageDigest !== 'string' || !DIGEST.test(page.pageDigest)
      || !Array.isArray(page.data)
      || page.data.length > 100 || !page.data.every(validEntity)
      || boundedSnapshotPagePayloadJson({ data: page.data }) === null
      || (page.pageIndex === input.pageCount - 1 ? page.nextCursor !== null : page.nextCursor === null)
      || (page.nextCursor !== null && (typeof page.nextCursor !== 'string' || !CURSOR.test(page.nextCursor)))) invalid();
    for (const entity of page.data) {
      const identity = `${entity.entity}:${entity.entityId}`;
      if (identities.has(identity)) invalid();
      identities.add(identity);
    }
  }
  const ordered = [...input.pages].sort((left, right) => left.pageIndex - right.pageIndex);
  if (ordered.some((page, index) => page.pageIndex !== index)) invalid();
}

function asDecimal(value: unknown): string | null {
  if (typeof value === 'string' && DECIMAL.test(value)) return value;
  if (Number.isSafeInteger(value) && (value as number) >= 0) return String(value);
  return null;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('SNAPSHOT_UNHASHABLE');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const keys = Object.keys(value);
    if (Object.getOwnPropertySymbols(value).length > 0
      || keys.length !== value.length
      || keys.some((key) => !/^(?:0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) throw new Error('SNAPSHOT_UNHASHABLE');
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) throw new Error('SNAPSHOT_UNHASHABLE');
    if (Object.getOwnPropertySymbols(value).length > 0) throw new Error('SNAPSHOT_UNHASHABLE');
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  throw new Error('SNAPSHOT_UNHASHABLE');
}

function samePage(row: SnapshotPageRow, page: SnapshotPage, input: SnapshotStagingInput): boolean {
  try {
    return row.owner_id === input.ownerId
      && row.snapshot_id === input.snapshotId
      && row.page_index === page.pageIndex
      && row.page_count === page.pageCount
      && asDecimal(row.high_water) === page.highWater
      && row.page_digest === page.pageDigest
      && row.next_cursor === page.nextCursor
      && canonicalJson(row.payload) === canonicalJson({ data: page.data });
  } catch {
    unavailable();
  }
}

function sameMetadata(row: SnapshotMetadata, input: SnapshotStagingInput): boolean {
  return row.owner_id === input.ownerId
    && row.snapshot_id === input.snapshotId
    && row.contract_version === input.contractVersion
    && asDecimal(row.high_water) === input.highWater
    && Date.parse(row.created_at) === Date.parse(input.createdAt)
    && Date.parse(row.expires_at) === Date.parse(input.expiresAt)
    && row.page_count === input.pageCount
    && row.manifest_digest === input.manifestDigest;
}

export type SnapshotStagingInput = {
  ownerId: string;
  sessionId: string;
  snapshotId: string;
  contractVersion: 1;
  highWater: string;
  createdAt: string;
  expiresAt: string;
  pageCount: number;
  manifestDigest: string;
  pages: SnapshotPage[];
};

export type SnapshotStagingResult = { snapshotId: string; status: 'ready'; pageCount: number };

export async function stageSnapshotPages(client: PostgresTransactionClient, input: SnapshotStagingInput): Promise<SnapshotStagingResult> {
  validateInput(input);
  requireClient(client);
  await recheckPostgresAppSession(client, input.ownerId, input.sessionId);
  await client.query(
    `insert into df_private.sync_snapshots
       (owner_id, snapshot_id, contract_version, high_water, created_at, expires_at, page_count, manifest_digest, status)
     values ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7, $8, 'building')
     on conflict (owner_id, snapshot_id) do nothing`,
    [input.ownerId, input.snapshotId, input.contractVersion, input.highWater, input.createdAt, input.expiresAt, input.pageCount, input.manifestDigest],
  );

  const metadataResult = await client.query<SnapshotMetadata>(
    `select owner_id, snapshot_id, contract_version, high_water::text, created_at::text, expires_at::text,
            page_count, manifest_digest, status
     from df_private.sync_snapshots
     where owner_id = $1 and snapshot_id = $2
     for update`,
    [input.ownerId, input.snapshotId],
  );
  const metadataRows = rowsOf(metadataResult);
  const metadata = metadataRows[0] as SnapshotMetadata | undefined;
  if (!metadata || !sameMetadata(metadata, input)) conflict();
  if (metadata.status === 'ready') {
    const readyCount = await client.query<{ page_count: number }>(
      `select count(*)::int as page_count
       from df_private.sync_snapshot_pages
       where owner_id = $1 and snapshot_id = $2`,
      [input.ownerId, input.snapshotId],
    );
    const readyCountRows = rowsOf(readyCount);
    if ((readyCountRows[0] as { page_count?: unknown } | undefined)?.page_count !== input.pageCount) unavailable();
    return { snapshotId: input.snapshotId, status: 'ready', pageCount: input.pageCount };
  }
  if (metadata.status !== 'building') conflict();

  for (const page of input.pages) {
    await client.query(
      `insert into df_private.sync_snapshot_pages
         (owner_id, snapshot_id, page_index, page_count, high_water, page_digest, payload, next_cursor)
       values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
       on conflict (owner_id, snapshot_id, page_index) do nothing`,
        [input.ownerId, input.snapshotId, page.pageIndex, page.pageCount, page.highWater, page.pageDigest, boundedSnapshotPagePayloadJson({ data: page.data }), page.nextCursor],
    );
    const pageResult = await client.query<SnapshotPageRow>(
      `select owner_id, snapshot_id, page_index, page_count, high_water::text, page_digest, payload, next_cursor
       from df_private.sync_snapshot_pages
       where owner_id = $1 and snapshot_id = $2 and page_index = $3`,
      [input.ownerId, input.snapshotId, page.pageIndex],
    );
    const pageRows = rowsOf(pageResult);
    if (pageRows.length !== 1 || !isRecord(pageRows[0]) || !samePage(pageRows[0] as SnapshotPageRow, page, input)) conflict();
  }

  const countResult = await client.query<{ page_count: number }>(
    `select count(*)::int as page_count
     from df_private.sync_snapshot_pages
     where owner_id = $1 and snapshot_id = $2`,
    [input.ownerId, input.snapshotId],
  );
  const countRows = rowsOf(countResult);
  if ((countRows[0] as { page_count?: unknown } | undefined)?.page_count !== input.pageCount) unavailable();
  const readyResult = await client.query<{ owner_id: string; snapshot_id: string; status: 'ready' }>(
    `update df_private.sync_snapshots
     set status = 'ready'
     where owner_id = $1 and snapshot_id = $2 and status = 'building'
     returning owner_id, snapshot_id, status`,
    [input.ownerId, input.snapshotId],
  );
  const readyRows = rowsOf(readyResult);
  if (readyRows.length !== 1 || !isRecord(readyRows[0]) || readyRows[0].owner_id !== input.ownerId
    || readyRows[0].snapshot_id !== input.snapshotId || readyRows[0].status !== 'ready') unavailable();
  return { snapshotId: input.snapshotId, status: 'ready', pageCount: input.pageCount };
}

export function createPostgresSnapshotStager(input: { runner: PostgresTransactionRunner }): {
  stage: (value: SnapshotStagingInput) => Promise<SnapshotStagingResult>;
} {
  if (!isRecord(input) || !validRunner(input.runner)) invalid();
  return { stage: (value) => input.runner.withTransaction((client) => stageSnapshotPages(client, value)) };
}
