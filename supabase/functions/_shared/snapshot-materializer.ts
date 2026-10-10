/** Pure snapshot materialization boundary; digest and cursor policy stay injected. */

import type { SnapshotEntity, SnapshotPage } from '../../../src/features/sync/snapshot-mirror.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const DIGEST = /^[a-f0-9]{64}$/;
const CURSOR = /^(?=.{1,2048}$)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/;
const PAGE_LIMIT = 100;

export type SnapshotDigestInput = {
  snapshotId: string;
  pageIndex: number;
  highWater: string;
  data: SnapshotEntity[];
};

export type SnapshotMaterializationInput = {
  snapshotId: string;
  highWater: string;
  records: SnapshotEntity[];
  digestPage: (input: SnapshotDigestInput) => Promise<string>;
  digestManifest: (records: SnapshotEntity[]) => Promise<string>;
  nextCursor: (pageIndex: number, pageCount: number) => string | null | Promise<string | null>;
};

export type SnapshotMaterializationResult = {
  pages: SnapshotPage[];
  manifestDigest: string;
  pageCount: number;
};

function invalid(code: string): never { throw new Error(code); }

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

function compareEntities(left: SnapshotEntity, right: SnapshotEntity): number {
  const kind = left.entity.localeCompare(right.entity, 'en', { numeric: false });
  return kind !== 0 ? kind : left.entityId.localeCompare(right.entityId, 'en', { numeric: false });
}

function validateInput(input: SnapshotMaterializationInput): void {
  if (!UUID.test(input.snapshotId) || !DECIMAL.test(input.highWater) || !Array.isArray(input.records)
    || typeof input.digestPage !== 'function' || typeof input.digestManifest !== 'function'
    || typeof input.nextCursor !== 'function') invalid('SNAPSHOT_MATERIALIZATION_INVALID');
  const identities = new Set<string>();
  for (const record of input.records) {
    if (!validEntity(record)) invalid('SNAPSHOT_ENTITY_INVALID');
    const identity = `${record.entity}:${record.entityId}`;
    if (identities.has(identity)) invalid('SNAPSHOT_DUPLICATE_ENTITY');
    identities.add(identity);
  }
}

function validateDigest(value: unknown, code: string): string {
  if (typeof value !== 'string' || !DIGEST.test(value)) invalid(code);
  return value;
}

function validateCursor(value: unknown, final: boolean): string | null {
  if (final ? value !== null : typeof value !== 'string' || !CURSOR.test(value)) invalid('SNAPSHOT_CURSOR_INVALID');
  return value as string | null;
}

/**
 * Orders and partitions already-authorized records. It does not query storage,
 * calculate JCS, mint cursors or claim that a snapshot is ready.
 */
export async function materializeSnapshot(input: SnapshotMaterializationInput): Promise<SnapshotMaterializationResult> {
  validateInput(input);
  const records = [...input.records].sort(compareEntities);
  const pageCount = Math.max(1, Math.ceil(records.length / PAGE_LIMIT));
  const pages: SnapshotPage[] = [];
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
    const data = records.slice(pageIndex * PAGE_LIMIT, (pageIndex + 1) * PAGE_LIMIT);
    const pageDigest = validateDigest(await input.digestPage({ snapshotId: input.snapshotId, pageIndex, highWater: input.highWater, data }), 'SNAPSHOT_PAGE_DIGEST_INVALID');
    const nextCursor = validateCursor(await input.nextCursor(pageIndex, pageCount), pageIndex === pageCount - 1);
    pages.push({ snapshotId: input.snapshotId, pageIndex, pageCount, highWater: input.highWater, data, pageDigest, nextCursor });
  }
  const manifestDigest = validateDigest(await input.digestManifest(records), 'SNAPSHOT_MANIFEST_DIGEST_INVALID');
  return { pages, manifestDigest, pageCount };
}
