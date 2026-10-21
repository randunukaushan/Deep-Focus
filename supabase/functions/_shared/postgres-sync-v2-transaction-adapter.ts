/** Local, review-gated PostgreSQL candidate for atomic v2 sync groups. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateSavedPlanWire } from './plan-replication-wire.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const SHA256 = /^[a-f0-9]{64}$/;
const BIGINT_MAX = 9223372036854775807n;
const ENTITY_KINDS = new Set(['profile', 'goal', 'task', 'focus_session', 'settings', 'break', 'reminder', 'plan']);

export type V2SyncChange = { entityKind: string; entityId: string; operation: 'upsert' | 'delete'; payload: unknown };
export type V2SyncGroup = {
  transactionId: string; contractVersion: 2; privacyEpoch: string; committedThrough: string;
  changeCount: number; groupDigest: string; changes: (V2SyncChange & { sequence: string })[];
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isDecimal(value: unknown): value is string { return typeof value === 'string' && DECIMAL.test(value); }
function resultRows(result: unknown): unknown[] { if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) unavailable(); return result.rows; }
function canonical(value: unknown): string {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') { if (!Number.isFinite(value)) invalid(); return JSON.stringify(value); }
  if (Array.isArray(value)) {
    const keys = Object.keys(value);
    if (Object.getOwnPropertySymbols(value).length > 0
      || keys.length !== value.length
      || keys.some((key) => !/^(?:0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) invalid();
    return `[${value.map(canonical).join(',')}]`;
  }
  if (!value || typeof value !== 'object') invalid();
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) invalid();
  if (Object.getOwnPropertySymbols(value).length > 0) invalid();
  return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`).join(',')}}`;
}
export async function hashV2Value(value: unknown): Promise<string> {
  const result = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value)));
  const hex = Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, '0')).join('');
  if (!SHA256.test(hex)) unavailable();
  return hex;
}
function positiveDecimal(value: unknown): boolean { return typeof value === 'string' && DECIMAL.test(value) && BigInt(value) > 0n && BigInt(value) <= BIGINT_MAX; }

function validateChange(change: unknown): asserts change is V2SyncChange {
  if (!isRecord(change) || typeof change.entityKind !== 'string' || !ENTITY_KINDS.has(change.entityKind) || !isUuid(change.entityId)
    || (change.operation !== 'upsert' && change.operation !== 'delete') || (change.operation === 'delete' ? change.payload !== null : (!change.payload || typeof change.payload !== 'object' || Array.isArray(change.payload)))) invalid();
  if (change.entityKind === 'plan' && change.operation === 'upsert') validateSavedPlanWire(change.payload);
}

export async function buildV2SyncGroup(input: { transactionId: string; privacyEpoch: string; firstSequence: string; changes: V2SyncChange[] }): Promise<V2SyncGroup> {
  if (!isRecord(input) || !isUuid(input.transactionId) || !positiveDecimal(input.privacyEpoch) || !isDecimal(input.firstSequence) || BigInt(input.firstSequence) < 1n || BigInt(input.firstSequence) > BIGINT_MAX - 499n
    || !Array.isArray(input.changes) || input.changes.length < 1 || input.changes.length > 500) invalid();
  const seen = new Set<string>(); const changes = input.changes.map((change, index) => {
    validateChange(change);
    const key = `${change.entityKind}:${change.entityId}`;
    if (seen.has(key)) invalid();
    seen.add(key);
    return { ...change, sequence: (BigInt(input.firstSequence) + BigInt(index)).toString() };
  });
  const committedThrough = changes.at(-1)?.sequence;
  if (!committedThrough) unavailable();
  const groupDigest = await hashV2Value({ contractVersion: 2, privacyEpoch: input.privacyEpoch, transactionId: input.transactionId, committedThrough, changes });
  return { transactionId: input.transactionId, contractVersion: 2, privacyEpoch: input.privacyEpoch, committedThrough, changeCount: changes.length, groupDigest, changes };
}

function sameGroup(left: V2SyncGroup, right: V2SyncGroup): boolean {
  return left.transactionId === right.transactionId && left.privacyEpoch === right.privacyEpoch && left.committedThrough === right.committedThrough
    && left.changeCount === right.changeCount && left.groupDigest === right.groupDigest && canonical(left.changes) === canonical(right.changes);
}

export async function appendPostgresV2SyncGroup(client: PostgresTransactionClient, input: { ownerId: string; transactionId: string; privacyEpoch: string; changes: V2SyncChange[] }): Promise<{ action: 'applied' | 'replayed'; group: V2SyncGroup }> {
  if (!client || typeof client !== 'object' || typeof client.query !== 'function' || !isRecord(input) || !Array.isArray(input.changes)
    || !isUuid(input.ownerId) || !isUuid(input.transactionId)) invalid();
  const profile = await client.query<{ owner_id: string; account_state: string }>('select owner_id, account_state from df_private.profiles where owner_id = $1 and account_state = \'active\' for update', [input.ownerId]);
  const profileRows = resultRows(profile);
  if (profileRows.length !== 1 || !isRecord(profileRows[0]) || profileRows[0].owner_id !== input.ownerId) throw new SafeBoundaryError(403, 'ACCESS_DENIED');
  const head = await client.query<{ owner_id: string; last_sequence: string; privacy_epoch: string }>('select owner_id, last_sequence::text as last_sequence, privacy_epoch::text as privacy_epoch from df_private.sync_v2_heads where owner_id = $1 for update', [input.ownerId]);
  const headRows = resultRows(head);
  if (headRows.length !== 1 || !isRecord(headRows[0])) unavailable();
  const current = headRows[0];
  if (current.owner_id !== input.ownerId || typeof current.last_sequence !== 'string' || !DECIMAL.test(current.last_sequence) || typeof current.privacy_epoch !== 'string' || !positiveDecimal(current.privacy_epoch)) unavailable();
  const existing = await client.query<{ transaction_id: string; contract_version: number; privacy_epoch: string; committed_through: string; change_count: number; group_digest: string }>('select transaction_id, contract_version, privacy_epoch::text as privacy_epoch, committed_through::text as committed_through, change_count, group_digest from df_private.sync_v2_transaction_groups where owner_id = $1 and transaction_id = $2', [input.ownerId, input.transactionId]);
  const existingRows = resultRows(existing);
  const existingRow = existingRows.length === 1 && isRecord(existingRows[0]) ? existingRows[0] : null;
  if (existingRows.length > 1 || (existingRows.length === 1 && existingRow === null)) unavailable();
  if (existingRow && (typeof existingRow.transaction_id !== 'string' || existingRow.transaction_id !== input.transactionId
    || existingRow.contract_version !== 2 || typeof existingRow.privacy_epoch !== 'string' || !positiveDecimal(existingRow.privacy_epoch)
    || typeof existingRow.committed_through !== 'string' || !positiveDecimal(existingRow.committed_through)
    || typeof existingRow.change_count !== 'number' || !Number.isInteger(existingRow.change_count) || existingRow.change_count < 1 || existingRow.change_count > 500
    || typeof existingRow.group_digest !== 'string' || !SHA256.test(existingRow.group_digest))) unavailable();
  const firstSequence = existingRow ? (BigInt(existingRow.committed_through as string) - BigInt(input.changes.length) + 1n).toString() : (BigInt(current.last_sequence) + 1n).toString();
  if (existingRow && BigInt(firstSequence) < 1n) unavailable();
  if (input.privacyEpoch !== current.privacy_epoch) throw new SafeBoundaryError(410, 'SYNC_RESET_REQUIRED');
  const group = await buildV2SyncGroup({ transactionId: input.transactionId, privacyEpoch: input.privacyEpoch, firstSequence, changes: input.changes });
  if (existingRow) {
    const row = existingRow;
    const stored: V2SyncGroup = {
      transactionId: row.transaction_id as string,
      contractVersion: 2,
      privacyEpoch: row.privacy_epoch as string,
      committedThrough: row.committed_through as string,
      changeCount: row.change_count as number,
      groupDigest: row.group_digest as string,
      changes: [],
    };
    const storedChanges = await client.query<{ sequence: string; entity_kind: string; entity_id: string; operation: 'upsert' | 'delete'; payload: unknown }>('select sequence::text as sequence, entity_kind, entity_id, operation, payload from df_private.sync_v2_changes where owner_id = $1 and transaction_id = $2 order by sequence', [input.ownerId, input.transactionId]);
    const storedChangeRows = resultRows(storedChanges);
    const storedChangeRecords = storedChangeRows.filter(isRecord);
    if (storedChangeRows.length !== row.change_count || storedChangeRecords.length !== storedChangeRows.length) unavailable();
    stored.changes = storedChangeRecords.map((change) => ({ sequence: change.sequence as string, entityKind: change.entity_kind as string, entityId: change.entity_id as string, operation: change.operation as 'upsert' | 'delete', payload: change.payload }));
    if (row.contract_version !== 2 || !sameGroup(stored, group)) throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT');
    return { action: 'replayed', group: stored };
  }
  const insertedGroup = await client.query(`insert into df_private.sync_v2_transaction_groups (owner_id, transaction_id, contract_version, privacy_epoch, committed_through, change_count, group_digest)
    values ($1, $2, 2, $3::bigint, $4::bigint, $5, $6) returning owner_id, transaction_id, contract_version, privacy_epoch::text as privacy_epoch, committed_through::text as committed_through, change_count, group_digest`, [input.ownerId, group.transactionId, group.privacyEpoch, group.committedThrough, group.changeCount, group.groupDigest]);
  const insertedGroupRows = resultRows(insertedGroup);
  if (insertedGroupRows.length !== 1 || !isRecord(insertedGroupRows[0])) unavailable();
  const insertedGroupRow = insertedGroupRows[0];
  if (insertedGroupRow.owner_id !== input.ownerId || insertedGroupRow.transaction_id !== group.transactionId
    || insertedGroupRow.contract_version !== 2 || insertedGroupRow.privacy_epoch !== group.privacyEpoch
    || insertedGroupRow.committed_through !== group.committedThrough || insertedGroupRow.change_count !== group.changeCount
    || insertedGroupRow.group_digest !== group.groupDigest) unavailable();
  for (const change of group.changes) {
    const changeHash = await hashV2Value(change);
    const inserted = await client.query(`insert into df_private.sync_v2_changes (owner_id, sequence, transaction_id, entity_kind, entity_id, operation, payload, change_hash)
      values ($1, $2::bigint, $3, $4, $5, $6, $7::jsonb, $8) returning owner_id, sequence::text as sequence, transaction_id, entity_kind, entity_id, operation, change_hash`, [input.ownerId, change.sequence, group.transactionId, change.entityKind, change.entityId, change.operation, change.payload === null ? null : JSON.stringify(change.payload), changeHash]);
    const insertedRows = resultRows(inserted);
    if (insertedRows.length !== 1 || !isRecord(insertedRows[0])) unavailable();
    const insertedChange = insertedRows[0];
    if (insertedChange.owner_id !== input.ownerId || insertedChange.sequence !== change.sequence
      || insertedChange.transaction_id !== group.transactionId || insertedChange.entity_kind !== change.entityKind
      || insertedChange.entity_id !== change.entityId || insertedChange.operation !== change.operation
      || insertedChange.change_hash !== changeHash) unavailable();
  }
  const advanced = await client.query('update df_private.sync_v2_heads set last_sequence = $2::bigint, updated_at = now() where owner_id = $1 and privacy_epoch = $3::bigint and last_sequence = $4::bigint returning owner_id, last_sequence::text as last_sequence, privacy_epoch::text as privacy_epoch', [input.ownerId, group.committedThrough, input.privacyEpoch, current.last_sequence]);
  const advancedRows = resultRows(advanced);
  if (advancedRows.length !== 1 || !isRecord(advancedRows[0]) || advancedRows[0].owner_id !== input.ownerId
    || advancedRows[0].last_sequence !== group.committedThrough || advancedRows[0].privacy_epoch !== input.privacyEpoch) unavailable();
  return { action: 'applied', group };
}

export function createPostgresV2SyncGroupAdapter(input: { runner: PostgresTransactionRunner }) {
  if (!input || !input.runner || typeof input.runner.withTransaction !== 'function') invalid();
  return { append: async (request: { ownerId: string; transactionId: string; privacyEpoch: string; changes: V2SyncChange[] }) => {
    if (!isRecord(request) || !isUuid(request.ownerId) || !isUuid(request.transactionId) || !Array.isArray(request.changes)) invalid();
    return input.runner.withTransaction((client) => appendPostgresV2SyncGroup(client, request));
  } };
}
