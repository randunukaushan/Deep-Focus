/** Local, isolated V2 SQLite storage candidate; main app wiring remains gated. */

import * as Crypto from 'expo-crypto';
// @ts-expect-error The domain test loader resolves TypeScript modules directly.
import { validateV2PullPage, type V2LocalGroup } from './sync-v2-pull-apply.ts';

export const SQLITE_V2_SYNC_SCHEMA_VERSION = 1;
export const SQLITE_V2_SYNC_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sync_v2_schema_meta (
  version INTEGER PRIMARY KEY CHECK (version = 1)
);
CREATE TABLE IF NOT EXISTS sync_v2_pull_state (
  owner_id TEXT PRIMARY KEY,
  privacy_epoch TEXT NOT NULL,
  high_water TEXT NOT NULL,
  next_cursor TEXT NOT NULL,
  last_committed_through TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sync_v2_groups (
  owner_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  privacy_epoch TEXT NOT NULL,
  committed_through TEXT NOT NULL,
  change_count INTEGER NOT NULL CHECK (change_count BETWEEN 1 AND 500),
  group_digest TEXT NOT NULL CHECK (length(group_digest) = 64),
  applied_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, transaction_id),
  UNIQUE (owner_id, committed_through)
);
CREATE TABLE IF NOT EXISTS sync_v2_changes (
  owner_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  sequence TEXT NOT NULL,
  entity_kind TEXT NOT NULL CHECK (entity_kind IN ('profile','goal','task','focus_session','settings','break','reminder','plan')),
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('upsert','delete')),
  payload_json TEXT,
  change_hash TEXT NOT NULL CHECK (length(change_hash) = 64),
  PRIMARY KEY (owner_id, transaction_id, sequence),
  FOREIGN KEY (owner_id, transaction_id) REFERENCES sync_v2_groups(owner_id, transaction_id) ON DELETE RESTRICT,
  CHECK ((operation = 'delete' AND payload_json IS NULL) OR (operation = 'upsert' AND payload_json IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS sync_v2_changes_owner_sequence ON sync_v2_changes(owner_id, sequence);
`;

const OWNER = /^account:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') { if (!Number.isFinite(value)) throw new Error('SYNC_V2_STORAGE_INVALID'); return JSON.stringify(value); }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (!value || typeof value !== 'object') throw new Error('SYNC_V2_STORAGE_INVALID');
  return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`).join(',')}}`;
}
async function hash(value: unknown): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, canonical(value));
}
function sameChange(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  return left.sequence === right.sequence && left.entityKind === right.entityKind && left.entityId === right.entityId
    && left.operation === right.operation && canonical(left.payload) === canonical(right.payload);
}
function groupChanges(group: V2LocalGroup): Record<string, unknown>[] { return group.changes.map((change) => ({ sequence: change.sequence, entityKind: change.entityKind, entityId: change.entityId, operation: change.operation, payload: change.payload })); }

export type SqliteV2Database = { execAsync(sql: string): Promise<void>; getFirstAsync<T>(sql: string, ...parameters: unknown[]): Promise<T | null>; getAllAsync<T>(sql: string, ...parameters: unknown[]): Promise<T[]>; runAsync(sql: string, ...parameters: unknown[]): Promise<unknown> };
export async function ensureSqliteV2SyncSchema(db: SqliteV2Database): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON');
  await db.execAsync(SQLITE_V2_SYNC_SCHEMA_SQL);
  await db.runAsync('INSERT OR IGNORE INTO sync_v2_schema_meta(version) VALUES (?)', SQLITE_V2_SYNC_SCHEMA_VERSION);
}

export async function applySqliteV2SyncPage(db: SqliteV2Database, ownerId: string, page: unknown, updatedAt: string): Promise<{ applied: number; replayed: number; nextCursor: string }> {
  if (!OWNER.test(ownerId) || !Number.isFinite(Date.parse(updatedAt))) throw new Error('SYNC_V2_OWNER_INVALID');
  const validated = await validateV2PullPage(page);
  await ensureSqliteV2SyncSchema(db);
  await db.execAsync('BEGIN IMMEDIATE');
  try {
    const state = await db.getFirstAsync<{ privacy_epoch: string; high_water: string; last_committed_through: string }>('SELECT privacy_epoch,high_water,last_committed_through FROM sync_v2_pull_state WHERE owner_id = ?', ownerId);
    if (state && (state.privacy_epoch !== validated.privacyEpoch || state.high_water !== validated.highWater)) throw new Error('SYNC_V2_STATE_CONFLICT');
    let last = state?.last_committed_through ?? '0';
    let applied = 0;
    let replayed = 0;
    for (const group of validated.groups) {
      const existing = await db.getFirstAsync<{ privacy_epoch: string; committed_through: string; change_count: number; group_digest: string }>('SELECT privacy_epoch,committed_through,change_count,group_digest FROM sync_v2_groups WHERE owner_id = ? AND transaction_id = ?', ownerId, group.transactionId);
      if (existing) {
        if (existing.privacy_epoch !== validated.privacyEpoch || existing.committed_through !== group.committedThrough || existing.change_count !== group.changeCount || existing.group_digest !== group.groupDigest) throw new Error('SYNC_V2_REPLAY_CONFLICT');
        const stored = await db.getAllAsync<Record<string, unknown>>('SELECT sequence,entity_kind AS entityKind,entity_id AS entityId,operation,payload_json AS payloadJson,change_hash AS changeHash FROM sync_v2_changes WHERE owner_id = ? AND transaction_id = ? ORDER BY sequence', ownerId, group.transactionId);
        if (stored.length !== group.changes.length) throw new Error('SYNC_V2_REPLAY_CONFLICT');
        for (let index = 0; index < stored.length; index += 1) {
          const row = stored[index];
          const expectedChange = groupChanges(group)[index];
          if (!sameChange({ ...row, payload: row.payloadJson === null ? null : JSON.parse(String(row.payloadJson)) }, expectedChange)
            || row.changeHash !== await hash(group.changes[index])) throw new Error('SYNC_V2_REPLAY_CONFLICT');
        }
        replayed += 1;
        continue;
      }
      if (BigInt(group.committedThrough) <= BigInt(last)) throw new Error('SYNC_V2_SEQUENCE_CONFLICT');
      await db.runAsync('INSERT INTO sync_v2_groups(owner_id,transaction_id,privacy_epoch,committed_through,change_count,group_digest,applied_at) VALUES (?,?,?,?,?,?,?)', ownerId, group.transactionId, validated.privacyEpoch, group.committedThrough, group.changeCount, group.groupDigest, updatedAt);
      for (const change of group.changes) {
        await db.runAsync('INSERT INTO sync_v2_changes(owner_id,transaction_id,sequence,entity_kind,entity_id,operation,payload_json,change_hash) VALUES (?,?,?,?,?,?,?,?)', ownerId, group.transactionId, change.sequence, change.entityKind, change.entityId, change.operation, change.payload === null ? null : canonical(change.payload), await hash(change));
      }
      last = group.committedThrough;
      applied += 1;
    }
    await db.runAsync(`INSERT INTO sync_v2_pull_state(owner_id,privacy_epoch,high_water,next_cursor,last_committed_through,updated_at) VALUES (?,?,?,?,?,?)
      ON CONFLICT(owner_id) DO UPDATE SET privacy_epoch=excluded.privacy_epoch,high_water=excluded.high_water,next_cursor=excluded.next_cursor,last_committed_through=excluded.last_committed_through,updated_at=excluded.updated_at`, ownerId, validated.privacyEpoch, validated.highWater, validated.nextCursor, last, updatedAt);
    await db.execAsync('COMMIT');
    return { applied, replayed, nextCursor: validated.nextCursor };
  } catch (error) {
    try { await db.execAsync('ROLLBACK'); } catch { /* preserve the original failure */ }
    throw error;
  }
}
