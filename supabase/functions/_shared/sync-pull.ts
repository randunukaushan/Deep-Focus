// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { signSyncCursor, verifySyncCursor } from './sync-cursor.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

export type AuthorizedPullChange = {
  sequence: string;
  entityKind: 'profile' | 'goal' | 'task' | 'session' | 'focus_session' | 'settings' | 'break' | 'reminder';
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown> | null;
};

export type SyncPullReadStore = {
  /** Must read within one consistent, owner-scoped database snapshot. */
  readPage: (input: { ownerId: string; after: string; highWater: string | null; limit: number }) => Promise<{
    highWater: string;
    changes: AuthorizedPullChange[];
  }>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const MAX_SYNC_PAYLOAD_BYTES = 65536;

function boundedPayload(value: unknown): boolean {
  if (!isPlainJsonValueForBoundary(value)) return false;
  try {
    const serialized = JSON.stringify(value, (_key, child) => {
      if (typeof child === 'number' && !Number.isFinite(child)) throw new TypeError('SYNC_UNHASHABLE_PAYLOAD');
      return child;
    });
    return typeof serialized === 'string' && new TextEncoder().encode(serialized).byteLength <= MAX_SYNC_PAYLOAD_BYTES;
  } catch { return false; }
}

function compareDecimal(left: string, right: string): number {
  return left.length === right.length ? left.localeCompare(right) : left.length - right.length;
}

function validateChange(change: AuthorizedPullChange, after: string, highWater: string): void {
  if (!DECIMAL.test(change.sequence) || change.sequence === '0' || compareDecimal(change.sequence, after) <= 0
    || compareDecimal(change.sequence, highWater) > 0 || !UUID.test(change.entityId)
    || !['profile', 'goal', 'task', 'session', 'focus_session', 'settings', 'break', 'reminder'].includes(change.entityKind)
    || !['upsert', 'delete'].includes(change.operation)
    || (change.operation === 'delete'
      ? change.payload !== null
      : !change.payload || typeof change.payload !== 'object' || Array.isArray(change.payload) || !boundedPayload(change.payload))) {
    throw new Error('SYNC_CHANGE_INVALID');
  }
}

/** Reads an owner-bound page and emits a newly signed cursor; no client owner is accepted. */
export async function readAuthorizedSyncPage(input: {
  actorId: string;
  cursor: string | null;
  limit: number;
  secret: string;
  now: string;
  expiresAt: string;
  store: SyncPullReadStore;
}): Promise<{ changes: AuthorizedPullChange[]; nextCursor: string }> {
  if (!UUID.test(input.actorId) || !Number.isInteger(input.limit) || input.limit < 1 || input.limit > 100
    || !Number.isFinite(Date.parse(input.now)) || !Number.isFinite(Date.parse(input.expiresAt))
    || Date.parse(input.expiresAt) <= Date.parse(input.now)) throw new Error('SYNC_PULL_INVALID');
  let after = '0';
  let highWater: string | null = null;
  if (input.cursor !== null) {
    const verified = await verifySyncCursor(input.cursor, input.secret, { ownerId: input.actorId, limit: input.limit, now: input.now });
    after = verified.after;
    highWater = verified.highWater;
  }
  const page = await input.store.readPage({ ownerId: input.actorId, after, highWater, limit: input.limit });
  if (!DECIMAL.test(page.highWater) || BigInt(page.highWater) < BigInt(after)
    || !Array.isArray(page.changes) || page.changes.length > input.limit) throw new Error('SYNC_PULL_INVALID');
  for (let index = 0; index < page.changes.length; index += 1) {
    validateChange(page.changes[index], after, page.highWater);
    if (index > 0 && compareDecimal(page.changes[index - 1].sequence, page.changes[index].sequence) >= 0) {
      throw new Error('SYNC_SEQUENCE_ORDER_INVALID');
    }
  }
  const nextAfter = page.changes.at(-1)?.sequence ?? after;
  const nextCursor = await signSyncCursor({
    version: 1,
    ownerId: input.actorId,
    endpoint: 'sync',
    limit: input.limit,
    after: nextAfter,
    highWater: page.highWater,
    expiresAt: input.expiresAt,
  }, input.secret);
  return { changes: page.changes, nextCursor };
}
