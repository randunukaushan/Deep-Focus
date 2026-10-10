/**
 * Server-only sync pull commit boundary.
 *
 * The injected store must lock the owner's sync head inside withTransaction.
 * This module never trusts an owner ID from a client payload and never opens a
 * database connection itself; the reviewed Edge Function adapter owns that
 * wiring and the final PostgreSQL transaction.
 */

export type ServerSyncChange = {
  sequence: string;
  entityKind: 'profile' | 'goal' | 'task' | 'session' | 'focus_session' | 'settings' | 'break';
  entityId: string;
  operation: 'upsert' | 'delete';
  payload: Record<string, unknown> | null;
};

export type StoredSyncChange = ServerSyncChange & { changeHash: string };

export type SyncTransactionStore = {
  withTransaction<T>(operation: (transaction: SyncTransaction) => Promise<T>): Promise<T>;
};

export type SyncTransaction = {
  readHeadForUpdate(ownerId: string): Promise<{ lastSequence: string }>;
  readChange(ownerId: string, sequence: string): Promise<StoredSyncChange | null>;
  appendChange(ownerId: string, change: ServerSyncChange, changeHash: string): Promise<void>;
  advanceHead(ownerId: string, sequence: string): Promise<void>;
};

export type SyncPageCommitResult = {
  applied: number;
  replayed: number;
  lastSequence: string;
  nextCursor: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
// Keep legacy opaque cursors valid while accepting the signed payload.signature
// cursor emitted by the server pull boundary. The transaction layer only
// validates the opaque shape; signature/owner/expiry verification belongs to
// the pull boundary before this value is passed here.
const CURSOR = /^(?=.{1,4096}$)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/;

function compareDecimal(left: string, right: string): number {
  return left.length === right.length ? left.localeCompare(right) : left.length - right.length;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (!value || typeof value !== 'object') throw new TypeError('SYNC_UNHASHABLE_PAYLOAD');
  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(',')}}`;
}

export async function hashSyncChange(change: ServerSyncChange): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalJson({
      sequence: change.sequence,
      entityKind: change.entityKind,
      entityId: change.entityId,
      operation: change.operation,
      payload: change.operation === 'delete' ? null : change.payload,
    })),
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function validateChange(change: ServerSyncChange): void {
  if (!DECIMAL.test(change.sequence) || !UUID.test(change.entityId)
    || !['profile', 'goal', 'task', 'session', 'focus_session', 'settings', 'break'].includes(change.entityKind)
    || !['upsert', 'delete'].includes(change.operation)
    || (change.operation === 'delete'
      ? change.payload !== null
      : !change.payload || typeof change.payload !== 'object' || Array.isArray(change.payload))) {
    throw new Error('SYNC_CHANGE_INVALID');
  }
}

/** Commits one server-authorized page; head lock, replay checks and writes share one transaction. */
export async function commitAuthorizedSyncPage(input: {
  actorId: string;
  cursorOwnerId: string;
  cursorLastSequence: string;
  nextCursor: string;
  changes: ServerSyncChange[];
  store: SyncTransactionStore;
}): Promise<SyncPageCommitResult> {
  if (!UUID.test(input.actorId) || input.actorId !== input.cursorOwnerId
    || !DECIMAL.test(input.cursorLastSequence) || !CURSOR.test(input.nextCursor)
    || !Array.isArray(input.changes) || input.changes.length > 100) throw new Error('SYNC_PAGE_INVALID');
  for (let index = 0; index < input.changes.length; index += 1) {
    validateChange(input.changes[index]);
    if (index > 0 && compareDecimal(input.changes[index - 1].sequence, input.changes[index].sequence) >= 0) {
      throw new Error('SYNC_SEQUENCE_ORDER_INVALID');
    }
  }
  const normalizedChanges = input.changes.map((change) => ({
    ...change,
    entityKind: change.entityKind === 'session' ? 'focus_session' as const : change.entityKind,
  }));
  const hashed = await Promise.all(normalizedChanges.map(async (change) => ({ change, hash: await hashSyncChange(change) })));
  return input.store.withTransaction(async (transaction) => {
    const head = await transaction.readHeadForUpdate(input.actorId);
    if (!head || !DECIMAL.test(head.lastSequence) || head.lastSequence !== input.cursorLastSequence) {
      throw new Error('SYNC_HEAD_CHANGED');
    }
    let lastSequence = head.lastSequence;
    let applied = 0;
    let replayed = 0;
    for (const item of hashed) {
      const existing = await transaction.readChange(input.actorId, item.change.sequence);
      if (existing) {
        if (existing.changeHash !== item.hash) throw new Error('SYNC_REPLAY_CONFLICT');
        replayed += 1;
        continue;
      }
      if (compareDecimal(item.change.sequence, lastSequence) <= 0) throw new Error('SYNC_SEQUENCE_ORDER_INVALID');
      await transaction.appendChange(input.actorId, item.change, item.hash);
      lastSequence = item.change.sequence;
      applied += 1;
    }
    if (applied > 0) await transaction.advanceHead(input.actorId, lastSequence);
    return { applied, replayed, lastSequence, nextCursor: input.nextCursor };
  });
}
