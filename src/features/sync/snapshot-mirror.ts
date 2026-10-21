export type SnapshotEntity = {
  entity: 'task' | 'goal' | 'session' | 'break' | 'settings' | 'reminder';
  entityId: string;
  version: number;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown> | null;
};

export type SnapshotPage = {
  snapshotId: string;
  pageIndex: number;
  pageCount: number;
  highWater: string;
  data: SnapshotEntity[];
  pageDigest: string;
  nextCursor: string | null;
};

export type SnapshotMirrorStore = {
  installStagedSnapshot: (input: {
    ownerId: string;
    snapshotId: string;
    highWater: string;
    resumeCursor: string;
    pages: SnapshotPage[];
  }) => Promise<void>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURSOR = /^(?=.{1,2048}$)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const DIGEST = /^[a-f0-9]{64}$/;
const OWNER = /^account:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validEntity(value: unknown): value is SnapshotEntity {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const entity = value as Partial<SnapshotEntity>;
  return ['task', 'goal', 'session', 'break', 'settings', 'reminder'].includes(entity.entity ?? '')
    && typeof entity.entityId === 'string' && UUID.test(entity.entityId)
    && typeof entity.version === 'number' && Number.isSafeInteger(entity.version) && entity.version > 0
    && ['upsert', 'delete'].includes(entity.operation ?? '')
    && (entity.operation === 'delete' ? entity.payload === null : !!entity.payload && typeof entity.payload === 'object' && !Array.isArray(entity.payload));
}

function validPage(value: unknown): value is SnapshotPage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const page = value as Partial<SnapshotPage>;
  return typeof page.snapshotId === 'string' && UUID.test(page.snapshotId)
    && typeof page.pageIndex === 'number' && Number.isSafeInteger(page.pageIndex) && page.pageIndex >= 0
    && typeof page.pageCount === 'number' && Number.isSafeInteger(page.pageCount) && page.pageCount > 0 && page.pageIndex < page.pageCount
    && typeof page.highWater === 'string' && DECIMAL.test(page.highWater)
    && Array.isArray(page.data) && page.data.length <= 100 && page.data.every(validEntity)
    && typeof page.pageDigest === 'string' && DIGEST.test(page.pageDigest)
    && (page.nextCursor === null || (typeof page.nextCursor === 'string' && CURSOR.test(page.nextCursor)));
}

/** Validates a complete immutable snapshot before the local mirror can swap. */
export async function installSnapshotMirror(input: {
  ownerId: string;
  snapshotId: string;
  highWater: string;
  pages: unknown;
  resumeCursor: string;
  digestPage: (page: SnapshotPage) => Promise<string>;
  store: SnapshotMirrorStore;
}): Promise<{ installedPages: number; entityCount: number; highWater: string }> {
  if (!OWNER.test(input.ownerId) || !UUID.test(input.snapshotId) || !DECIMAL.test(input.highWater)
    || !CURSOR.test(input.resumeCursor) || !Array.isArray(input.pages) || input.pages.length === 0) {
    throw new Error('SNAPSHOT_INVALID');
  }
  if (!input.pages.every(validPage)) throw new Error('SNAPSHOT_PAGE_INVALID');
  const pages = input.pages as SnapshotPage[];
  const pageCount = pages[0].pageCount;
  if (pages.length !== pageCount || pages.some((page) => page.snapshotId !== input.snapshotId
    || page.pageCount !== pageCount || page.highWater !== input.highWater)) throw new Error('SNAPSHOT_PAGE_SEQUENCE_INVALID');
  const ordered = [...pages].sort((left, right) => left.pageIndex - right.pageIndex);
  if (ordered.some((page, index) => page.pageIndex !== index)) throw new Error('SNAPSHOT_PAGE_SEQUENCE_INVALID');
  for (const page of ordered) {
    if (await input.digestPage(page) !== page.pageDigest) throw new Error('SNAPSHOT_DIGEST_INVALID');
    const final = page.pageIndex === pageCount - 1;
    if (final ? page.nextCursor !== null : page.nextCursor === null) throw new Error('SNAPSHOT_CURSOR_INVALID');
  }
  const identities = new Set<string>();
  for (const entity of ordered.flatMap((page) => page.data)) {
    const identity = `${entity.entity}:${entity.entityId}`;
    if (identities.has(identity)) throw new Error('SNAPSHOT_DUPLICATE_ENTITY');
    identities.add(identity);
  }
  await input.store.installStagedSnapshot({ ownerId: input.ownerId, snapshotId: input.snapshotId, highWater: input.highWater, resumeCursor: input.resumeCursor, pages: ordered });
  return { installedPages: ordered.length, entityCount: identities.size, highWater: input.highWater };
}
