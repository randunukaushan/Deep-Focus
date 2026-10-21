/** Local, review-gated reader for complete v2 transaction groups. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { buildV2SyncGroup, hashV2Value, type V2SyncChange, type V2SyncGroup } from './postgres-sync-v2-transaction-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { signSyncV2Cursor, verifySyncV2Cursor } from './sync-v2-cursor.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const SHA256 = /^[a-f0-9]{64}$/;
const ENTITY_KINDS = new Set(['profile', 'goal', 'task', 'focus_session', 'settings', 'break', 'reminder', 'plan']);

export type V2PullInput = { ownerId: string; after: string; highWater: string | null; privacyEpoch: string; limit: number };
export type V2PullResult = { contractVersion: 2; privacyEpoch: string; highWater: string; groups: V2SyncGroup[]; committedThrough: string; caughtUp: boolean };
export type V2PullPage = V2PullResult & { nextCursor: string };

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function reset(): never { throw new SafeBoundaryError(410, 'SYNC_RESET_REQUIRED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isDecimal(value: unknown): value is string { return typeof value === 'string' && DECIMAL.test(value); }
function resultRows(result: unknown): unknown[] { if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure(); return result.rows; }
function validateInput(input: unknown): asserts input is V2PullInput {
  if (!isRecord(input) || !isUuid(input.ownerId) || !isDecimal(input.after)
    || (input.highWater !== null && !isDecimal(input.highWater))
    || !isDecimal(input.privacyEpoch) || BigInt(input.privacyEpoch) < 1n
    || (input.highWater !== null && BigInt(input.after) > BigInt(input.highWater))
    || !Number.isInteger(input.limit) || (input.limit as number) < 1 || (input.limit as number) > 100) invalid();
}

async function readGroup(client: PostgresTransactionClient, row: unknown, input: V2PullInput): Promise<V2SyncGroup> {
  if (!isRecord(row)) dependencyFailure();
  const transactionId = typeof row.transaction_id === 'string' ? row.transaction_id : null;
  const privacyEpoch = typeof row.privacy_epoch === 'string' ? row.privacy_epoch : null;
  const committedThrough = typeof row.committed_through === 'string' ? row.committed_through : null;
  const changeCount = typeof row.change_count === 'number' ? row.change_count : null;
  const groupDigest = typeof row.group_digest === 'string' ? row.group_digest : null;
  if (row.owner_id !== input.ownerId || transactionId === null || !UUID.test(transactionId)
    || row.contract_version !== 2 || privacyEpoch === null || privacyEpoch !== input.privacyEpoch
    || committedThrough === null || !DECIMAL.test(committedThrough)
    || changeCount === null || !Number.isInteger(changeCount) || changeCount < 1 || changeCount > 500
    || groupDigest === null || !SHA256.test(groupDigest)) dependencyFailure();
  if (BigInt(committedThrough) <= BigInt(input.after) || (input.highWater !== null && BigInt(committedThrough) > BigInt(input.highWater))) reset();
  const changesResult = await client.query(`select owner_id, sequence::text as sequence, transaction_id, entity_kind, entity_id, operation, payload, change_hash
    from df_private.sync_v2_changes where owner_id = $1 and transaction_id = $2 order by sequence asc`, [input.ownerId, transactionId]);
  const changeRows = resultRows(changesResult);
  if (changeRows.length !== changeCount) dependencyFailure();
  const changes: (V2SyncChange & { sequence: string })[] = [];
  let previous = BigInt(input.after);
  for (const rawChange of changeRows) {
    if (!isRecord(rawChange)) dependencyFailure();
    const change = rawChange;
    if (changes.length === 0 && typeof change.sequence === 'string' && DECIMAL.test(change.sequence) && BigInt(change.sequence) <= BigInt(input.after)) reset();
    if (change.owner_id !== input.ownerId || change.transaction_id !== transactionId
      || typeof change.sequence !== 'string' || !DECIMAL.test(change.sequence)
      || (changes.length > 0 && BigInt(change.sequence) <= previous)
      || BigInt(change.sequence) > BigInt(committedThrough)
      || typeof change.entity_kind !== 'string' || !ENTITY_KINDS.has(change.entity_kind)
      || typeof change.entity_id !== 'string' || !UUID.test(change.entity_id)
      || (change.operation !== 'upsert' && change.operation !== 'delete')
      || (change.operation === 'delete' ? change.payload !== null : (!change.payload || typeof change.payload !== 'object' || Array.isArray(change.payload)))
      || typeof change.change_hash !== 'string' || !SHA256.test(change.change_hash)) dependencyFailure();
    const candidate = { sequence: change.sequence, entityKind: change.entity_kind, entityId: change.entity_id, operation: change.operation, payload: change.payload } as V2SyncChange & { sequence: string };
    if (await hashV2Value(candidate) !== change.change_hash) dependencyFailure();
    changes.push(candidate);
    previous = BigInt(change.sequence);
  }
  if (changes.at(-1)?.sequence !== committedThrough) dependencyFailure();
  const verified = await buildV2SyncGroup({ transactionId, privacyEpoch: input.privacyEpoch, firstSequence: changes[0].sequence, changes: changes.map(({ sequence: _sequence, ...change }) => change) });
  if (verified.groupDigest !== groupDigest || verified.committedThrough !== committedThrough || verified.changeCount !== changeCount) dependencyFailure();
  return verified;
}

export async function readPostgresV2SyncGroups(client: PostgresTransactionClient, input: V2PullInput): Promise<V2PullResult> {
  if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
  validateInput(input);
  const headResult = await client.query<{ owner_id: string; last_sequence: string; privacy_epoch: string }>(
    'select owner_id, last_sequence::text as last_sequence, privacy_epoch::text as privacy_epoch from df_private.sync_v2_heads where owner_id = $1 for update', [input.ownerId]);
  const headRows = resultRows(headResult);
  if (headRows.length !== 1 || !isRecord(headRows[0])) dependencyFailure();
  const head = headRows[0];
  const lastSequence = typeof head.last_sequence === 'string' ? head.last_sequence : null;
  const headPrivacyEpoch = typeof head.privacy_epoch === 'string' ? head.privacy_epoch : null;
  if (head.owner_id !== input.ownerId || lastSequence === null || !DECIMAL.test(lastSequence) || headPrivacyEpoch === null || !DECIMAL.test(headPrivacyEpoch)) dependencyFailure();
  if (headPrivacyEpoch !== input.privacyEpoch) reset();
  if (input.highWater !== null && BigInt(input.highWater) > BigInt(lastSequence)) reset();
  const highWater = input.highWater ?? lastSequence;
  const groupsResult = await client.query(`select owner_id, transaction_id, contract_version, privacy_epoch::text as privacy_epoch,
    committed_through::text as committed_through, change_count, group_digest
    from df_private.sync_v2_transaction_groups where owner_id = $1 and committed_through > $2::bigint and committed_through <= $3::bigint
    order by committed_through asc limit $4`, [input.ownerId, input.after, highWater, input.limit]);
  const groupRows = resultRows(groupsResult);
  const groups: V2SyncGroup[] = [];
  for (const row of groupRows) groups.push(await readGroup(client, row, { ...input, highWater }));
  const committedThrough = groups.at(-1)?.committedThrough ?? input.after;
  return { contractVersion: 2, privacyEpoch: input.privacyEpoch, highWater, groups, committedThrough, caughtUp: committedThrough === highWater };
}

export function createPostgresV2SyncPullStore(input: { runner: PostgresTransactionRunner; sessionId: string }) {
  if (!input || !input.runner || typeof input.runner.withTransaction !== 'function' || typeof input.sessionId !== 'string' || !UUID.test(input.sessionId)) dependencyFailure();
  return { read: async (request: V2PullInput) => {
    validateInput(request);
    return input.runner.withTransaction(async (client) => {
    await recheckPostgresAppSession(client, request.ownerId, input.sessionId);
    return readPostgresV2SyncGroups(client, request);
    });
  } };
}

export async function readPostgresV2SyncPage(client: PostgresTransactionClient, input: { ownerId: string; cursor: string; limit: number; now: string; secret: string }): Promise<V2PullPage> {
  if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
  if (!isRecord(input) || !isUuid(input.ownerId) || typeof input.cursor !== 'string' || !Number.isInteger(input.limit)
    || input.limit < 1 || input.limit > 100 || typeof input.now !== 'string' || !Number.isFinite(Date.parse(input.now))
    || typeof input.secret !== 'string' || input.secret.length < 32) invalid();
  let cursor;
  try { cursor = await verifySyncV2Cursor(input.cursor, input.secret, { ownerId: input.ownerId, limit: input.limit, now: input.now }); }
  catch { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
  const result = await readPostgresV2SyncGroups(client, { ownerId: cursor.ownerId, after: cursor.after, highWater: cursor.highWater, privacyEpoch: cursor.privacyEpoch, limit: cursor.limit });
  const nextCursor = await signSyncV2Cursor({ ...cursor, after: result.committedThrough }, input.secret);
  return { ...result, nextCursor };
}
