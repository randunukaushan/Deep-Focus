export type SyncChange = {
  sequence: string;
  entityKind: 'profile' | 'goal' | 'task' | 'focus_session' | 'settings' | 'break' | 'reminder';
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown> | null;
};

export type SyncPullPage = {
  nextCursor: string;
  changes: SyncChange[];
};

export type SyncPullApplyDependencies = {
  applyPageAtomically: (ownerId: string, page: SyncPullPage) => Promise<void>;
};

const OWNER = /^account:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURSOR = /^(?=.{1,2048}$)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/;
const SEQUENCE = /^(?:0|[1-9][0-9]*)$/;
const ENTITY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_PAGE_BYTES = 65_536;

function boundedPage(value: unknown): boolean {
  try {
    const serialized = JSON.stringify(value, (_key, child) => {
      if (typeof child === 'number' && !Number.isFinite(child)) throw new TypeError('SYNC_PAGE_INVALID');
      return child;
    });
    return typeof serialized === 'string' && new TextEncoder().encode(serialized).byteLength <= MAX_PAGE_BYTES;
  } catch {
    return false;
  }
}

function validChange(value: unknown): value is SyncChange {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const change = value as Partial<SyncChange>;
  return typeof change.sequence === 'string' && SEQUENCE.test(change.sequence) && change.sequence !== '0'
    && ['profile', 'goal', 'task', 'focus_session', 'settings', 'break', 'reminder'].includes(change.entityKind ?? '')
    && typeof change.entityId === 'string' && ENTITY_ID.test(change.entityId)
    && ['upsert', 'delete'].includes(change.operation ?? '')
    && (change.operation === 'delete' ? change.payload === null : Boolean(change.payload && typeof change.payload === 'object' && !Array.isArray(change.payload)));
}

function validatePage(page: unknown): asserts page is SyncPullPage {
  if (!page || typeof page !== 'object' || Array.isArray(page)) throw new Error('SYNC_PAGE_INVALID');
  if (!boundedPage(page)) throw new Error('SYNC_PAGE_INVALID');
  const value = page as Partial<SyncPullPage>;
  if (typeof value.nextCursor !== 'string' || !CURSOR.test(value.nextCursor)
    || !Array.isArray(value.changes) || value.changes.length > 100 || value.changes.some((change) => !validChange(change))) {
    throw new Error('SYNC_PAGE_INVALID');
  }
}

/** The store callback must commit received changes and cursor together. */
export async function applyAuthorizedSyncPage(
  ownerId: string,
  page: unknown,
  dependencies: SyncPullApplyDependencies,
): Promise<void> {
  if (typeof ownerId !== 'string' || !OWNER.test(ownerId)) throw new Error('SYNC_OWNER_INVALID');
  if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies)
    || typeof dependencies.applyPageAtomically !== 'function') throw new Error('SYNC_DEPENDENCY_INVALID');
  validatePage(page);
  await dependencies.applyPageAtomically(ownerId, page);
}
