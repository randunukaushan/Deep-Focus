import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresV2SyncPullStore, readPostgresV2SyncGroups, readPostgresV2SyncPage } = await import('../../supabase/functions/_shared/postgres-sync-v2-pull-adapter.ts');
const { buildV2SyncGroup, hashV2Value } = await import('../../supabase/functions/_shared/postgres-sync-v2-transaction-adapter.ts');
const { signSyncV2Cursor, verifySyncV2Cursor } = await import('../../supabase/functions/_shared/sync-v2-cursor.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TRANSACTION = '22222222-2222-4222-8222-222222222222';
const PLAN = '33333333-3333-4333-8333-333333333333';
const WORKSPACE = '44444444-4444-4444-8444-444444444444';
const TASK = '55555555-5555-4555-8555-555555555555';
const BLOCK = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-10-11T00:00:00.000Z';
const SECRET = 'v2-pull-integration-secret-that-is-long-enough-123456';
const plan = { id: PLAN, workspaceId: WORKSPACE, localDate: '2026-10-11', timeZone: 'Asia/Colombo', availableStart: NOW, availableEnd: '2026-10-11T02:00:00.000Z', explanation: null, blocks: [{ id: BLOCK, kind: 'focus', taskId: TASK, startsAt: '2026-10-11T00:10:00.000Z', endsAt: '2026-10-11T00:35:00.000Z', reminderId: null }], version: 1, createdAt: NOW, sourceProposalId: WORKSPACE, state: 'active', updatedAt: NOW };
const changes = [{ entityKind: 'plan', entityId: PLAN, operation: 'upsert', payload: plan }, { entityKind: 'reminder', entityId: TASK, operation: 'delete', payload: null }];

async function fixture() {
  const group = await buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '8', changes });
  const rows = await Promise.all(group.changes.map(async (change) => ({ owner_id: OWNER, sequence: change.sequence, transaction_id: TRANSACTION, entity_kind: change.entityKind, entity_id: change.entityId, operation: change.operation, payload: change.payload, change_hash: await hashV2Value(change) })));
  return { group, rows };
}

async function harness({ groupRow, changeRows, epoch = '1', lastSequence = '9' }) {
  const fixtureRows = changeRows ?? [];
  return { query: async (sql, params) => {
    if (sql.includes('from df_private.sync_v2_heads')) return { rows: [{ owner_id: OWNER, last_sequence: lastSequence, privacy_epoch: epoch }] };
    if (sql.includes('from df_private.sync_v2_transaction_groups')) return { rows: groupRow ? [groupRow] : [] };
    if (sql.includes('from df_private.sync_v2_changes')) return { rows: fixtureRows };
    throw new Error(`unexpected query: ${sql} ${JSON.stringify(params)}`);
  } };
}

test('v2 pull returns a complete verified group and advances to its boundary', async () => {
  const { group, rows } = await fixture();
  const client = await harness({ groupRow: { owner_id: OWNER, transaction_id: TRANSACTION, contract_version: 2, privacy_epoch: '1', committed_through: '9', change_count: 2, group_digest: group.groupDigest }, changeRows: rows });
  const result = await readPostgresV2SyncGroups(client, { ownerId: OWNER, after: '7', highWater: '9', privacyEpoch: '1', limit: 50 });
  assert.equal(result.groups.length, 1);
  assert.equal(result.committedThrough, '9');
  assert.equal(result.groups[0].changes.length, 2);
  assert.equal(result.caughtUp, true);
});

test('v2 pull returns an empty caught-up page without inventing a group', async () => {
  const client = await harness({});
  const result = await readPostgresV2SyncGroups(client, { ownerId: OWNER, after: '9', highWater: null, privacyEpoch: '1', limit: 50 });
  assert.deepEqual(result.groups, []);
  assert.equal(result.committedThrough, '9');
  assert.equal(result.caughtUp, true);
});

test('v2 pull rejects a stale privacy epoch before group access', async () => {
  let groupRead = false;
  const client = { query: async (sql) => { if (sql.includes('from df_private.sync_v2_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '9', privacy_epoch: '2' }] }; groupRead = true; return { rows: [] }; } };
  await assert.rejects(() => readPostgresV2SyncGroups(client, { ownerId: OWNER, after: '7', highWater: '9', privacyEpoch: '1', limit: 50 }), /SYNC_RESET_REQUIRED/);
  assert.equal(groupRead, false);
});

test('v2 pull rejects a missing change instead of returning a partial plan group', async () => {
  const { group, rows } = await fixture();
  const client = await harness({ groupRow: { owner_id: OWNER, transaction_id: TRANSACTION, contract_version: 2, privacy_epoch: '1', committed_through: '9', change_count: 2, group_digest: group.groupDigest }, changeRows: rows.slice(0, 1) });
  await assert.rejects(() => readPostgresV2SyncGroups(client, { ownerId: OWNER, after: '7', highWater: '9', privacyEpoch: '1', limit: 50 }), /DEPENDENCY_UNAVAILABLE/);
});

test('v2 pull rejects a cursor that lands inside a transaction group', async () => {
  const { group, rows } = await fixture();
  const client = await harness({ groupRow: { owner_id: OWNER, transaction_id: TRANSACTION, contract_version: 2, privacy_epoch: '1', committed_through: '9', change_count: 2, group_digest: group.groupDigest }, changeRows: rows });
  await assert.rejects(() => readPostgresV2SyncGroups(client, { ownerId: OWNER, after: '8', highWater: '9', privacyEpoch: '1', limit: 50 }), /SYNC_RESET_REQUIRED/);
});

test('v2 pull page verifies a signed cursor and emits the next signed boundary', async () => {
  const { group, rows } = await fixture();
  const client = await harness({ groupRow: { owner_id: OWNER, transaction_id: TRANSACTION, contract_version: 2, privacy_epoch: '1', committed_through: '9', change_count: 2, group_digest: group.groupDigest }, changeRows: rows });
  const cursor = await signSyncV2Cursor({ version: 2, endpoint: 'replication-v2-pull', ownerId: OWNER, privacyEpoch: '1', limit: 50, after: '7', highWater: '9', expiresAt: '2026-10-11T01:00:00.000Z' }, SECRET);
  const result = await readPostgresV2SyncPage(client, { ownerId: OWNER, cursor, limit: 50, now: '2026-10-11T00:00:00.000Z', secret: SECRET });
  const next = await verifySyncV2Cursor(result.nextCursor, SECRET, { ownerId: OWNER, limit: 50, now: '2026-10-11T00:00:00.000Z' });
  assert.equal(next.after, '9');
  assert.equal(next.highWater, '9');
  assert.equal(result.caughtUp, true);
});

test('v2 pull fails closed for malformed query results and runner dependencies', async () => {
  const malformedHead = { query: async () => ({ rows: null }) };
  await assert.rejects(() => readPostgresV2SyncGroups(malformedHead, { ownerId: OWNER, after: '7', highWater: '9', privacyEpoch: '1', limit: 50 }), /DEPENDENCY_UNAVAILABLE/);

  const malformedGroup = { query: async (sql) => {
    if (sql.includes('from df_private.sync_v2_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '9', privacy_epoch: '1' }] };
    if (sql.includes('from df_private.sync_v2_transaction_groups')) return { rows: [{}] };
    return { rows: [] };
  } };
  await assert.rejects(() => readPostgresV2SyncGroups(malformedGroup, { ownerId: OWNER, after: '7', highWater: '9', privacyEpoch: '1', limit: 50 }), /DEPENDENCY_UNAVAILABLE|SYNC_RESET_REQUIRED/);

  assert.throws(() => createPostgresV2SyncPullStore({ runner: {}, sessionId: 'bad' }), /DEPENDENCY_UNAVAILABLE/);
  let opened = false;
  const store = createPostgresV2SyncPullStore({ sessionId: '77777777-7777-4777-8777-777777777777', runner: { withTransaction: async () => { opened = true; throw new Error('must not open'); } } });
  await assert.rejects(() => store.read({ ownerId: OWNER, after: '0', highWater: null, privacyEpoch: '1', limit: 50 }), /must not open/);
  assert.equal(opened, true);
});

test('v2 pull fails closed when the sync-head result rows are sparse', async () => {
  const rows = [];
  rows[1] = { owner_id: OWNER, last_sequence: '9', privacy_epoch: '1' };
  const client = { query: async () => ({ rows }) };
  await assert.rejects(
    () => readPostgresV2SyncGroups(client, { ownerId: OWNER, after: '7', highWater: '9', privacyEpoch: '1', limit: 50 }),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('v2 pull rejects malformed request types before transaction or query access', async () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  const store = createPostgresV2SyncPullStore({ runner, sessionId: '77777777-7777-4777-8777-777777777777' });
  await assert.rejects(() => store.read({ ownerId: Symbol('owner'), after: '0', highWater: null, privacyEpoch: '1', limit: 50 }), /VALIDATION_FAILED/);
  await assert.rejects(() => store.read({ ownerId: OWNER, after: 'not-decimal', highWater: null, privacyEpoch: '1', limit: 50 }), /VALIDATION_FAILED/);
  const client = { query: async () => { throw new Error('must not query'); } };
  await assert.rejects(() => readPostgresV2SyncPage(client, { ownerId: OWNER, cursor: 'x', limit: 50, now: Symbol('clock'), secret: SECRET }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});
