import assert from 'node:assert/strict';
import test from 'node:test';

const { appendPostgresV2SyncGroup, buildV2SyncGroup, createPostgresV2SyncGroupAdapter } = await import('../../supabase/functions/_shared/postgres-sync-v2-transaction-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TRANSACTION = '22222222-2222-4222-8222-222222222222';
const PLAN = '33333333-3333-4333-8333-333333333333';
const WORKSPACE = '44444444-4444-4444-8444-444444444444';
const TASK = '55555555-5555-4555-8555-555555555555';
const BLOCK = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-10-11T00:00:00.000Z';

const plan = { id: PLAN, workspaceId: WORKSPACE, localDate: '2026-10-11', timeZone: 'Asia/Colombo', availableStart: NOW, availableEnd: '2026-10-11T02:00:00.000Z', explanation: null, blocks: [{ id: BLOCK, kind: 'focus', taskId: TASK, startsAt: '2026-10-11T00:10:00.000Z', endsAt: '2026-10-11T00:35:00.000Z', reminderId: null }], version: 1, createdAt: NOW, sourceProposalId: WORKSPACE, state: 'active', updatedAt: NOW };
const changes = [{ entityKind: 'plan', entityId: PLAN, operation: 'upsert', payload: plan }, { entityKind: 'reminder', entityId: TASK, operation: 'delete', payload: null }];

function harness({ existing = [], storedChanges = [], epoch = '1', failInsert = false, groupInsertRow = null, changeInsertRows = null, headUpdateRow = null } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, account_state: 'active' }] };
    if (sql.includes('from df_private.sync_v2_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '7', privacy_epoch: epoch }] };
    if (sql.includes('from df_private.sync_v2_transaction_groups')) return { rows: existing };
    if (sql.includes('from df_private.sync_v2_changes')) return { rows: storedChanges };
    if (sql.includes('insert into df_private.sync_v2_transaction_groups')) { if (failInsert) throw new Error('injected'); return { rows: [groupInsertRow ?? { owner_id: params[0], transaction_id: params[1], contract_version: 2, privacy_epoch: params[2], committed_through: params[3], change_count: params[4], group_digest: params[5] }] }; }
    if (sql.includes('insert into df_private.sync_v2_changes')) { const index = calls.filter((call) => call.sql.includes('insert into df_private.sync_v2_changes')).length - 1; return { rows: [changeInsertRows?.[index] ?? { owner_id: params[0], sequence: params[1], transaction_id: params[2], entity_kind: params[3], entity_id: params[4], operation: params[5], change_hash: params[7] }] }; }
    if (sql.includes('update df_private.sync_v2_heads')) return { rows: [headUpdateRow ?? { owner_id: params[0], last_sequence: params[1], privacy_epoch: params[2] }] };
    throw new Error(`unexpected query: ${sql}`);
  } };
  return { client, calls };
}

test('v2 group builder assigns ordered sequences and rejects duplicate entity identities', async () => {
  const group = await buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '8', changes });
  assert.deepEqual(group.changes.map((change) => change.sequence), ['8', '9']);
  assert.equal(group.committedThrough, '9');
  assert.match(group.groupDigest, /^[a-f0-9]{64}$/);
  await assert.rejects(() => buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '8', changes: [changes[0], changes[0]] }), /VALIDATION_FAILED/);
  await assert.rejects(() => buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '9223372036854775808', firstSequence: '8', changes }), /VALIDATION_FAILED/);
  await assert.rejects(() => buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '9223372036854775807', changes }), /VALIDATION_FAILED/);
  await assert.rejects(() => buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '8', changes: [{ ...changes[0], payload: { ...plan, explanation: NaN } }, changes[1]] }), /VALIDATION_FAILED/);
});

test('v2 sync group rejects sparse, symbol-bearing, and custom-prototype payloads before hashing', async () => {
  const sparse = []; sparse[1] = 'gap';
  const symbolBearing = []; symbolBearing.push('value'); symbolBearing[Symbol('metadata')] = 'hidden';
  class CustomPayload { constructor() { this.value = 'hidden-shape'; } }
  for (const payload of [{ values: sparse }, { values: symbolBearing }, new CustomPayload()]) {
    await assert.rejects(() => buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '8', changes: [{ entityKind: 'reminder', entityId: TASK, operation: 'upsert', payload }] }), /VALIDATION_FAILED/);
  }
});

test('v2 PostgreSQL adapter appends the group and advances only the v2 head', async () => {
  const h = harness();
  const result = await appendPostgresV2SyncGroup(h.client, { ownerId: OWNER, transactionId: TRANSACTION, privacyEpoch: '1', changes });
  assert.equal(result.action, 'applied');
  assert.equal(result.group.committedThrough, '9');
  assert.equal(h.calls.filter((call) => call.sql.includes('insert into df_private.sync_v2_changes')).length, 2);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.sync_changes')), false);
  assert.match(h.calls.at(-1).sql, /update df_private\.sync_v2_heads/i);
});

test('v2 adapter replays the exact stored group and rejects a changed replay', async () => {
  const first = await buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '8', changes });
  const h = harness({ existing: [{ transaction_id: TRANSACTION, contract_version: 2, privacy_epoch: '1', committed_through: '9', change_count: 2, group_digest: first.groupDigest }], storedChanges: first.changes.map(({ sequence, entityKind, entityId, operation, payload }) => ({ sequence, entity_kind: entityKind, entity_id: entityId, operation, payload })) });
  const replay = await appendPostgresV2SyncGroup(h.client, { ownerId: OWNER, transactionId: TRANSACTION, privacyEpoch: '1', changes });
  assert.equal(replay.action, 'replayed');
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.sync_v2_changes')), false);
  await assert.rejects(() => appendPostgresV2SyncGroup(h.client, { ownerId: OWNER, transactionId: TRANSACTION, privacyEpoch: '1', changes: [{ ...changes[0], payload: { ...plan, explanation: 'changed' } }, changes[1]] }), /IDEMPOTENCY_CONFLICT/);
});

test('v2 adapter rejects a stale privacy epoch before writing', async () => {
  const h = harness({ epoch: '2' });
  await assert.rejects(() => appendPostgresV2SyncGroup(h.client, { ownerId: OWNER, transactionId: TRANSACTION, privacyEpoch: '1', changes }), /SYNC_RESET_REQUIRED/);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.sync_v2_transaction_groups')), false);
});

test('v2 adapter fails closed when the database returns altered group metadata', async () => {
  const h = harness({ groupInsertRow: { owner_id: OWNER, transaction_id: TRANSACTION, contract_version: 2, privacy_epoch: '1', committed_through: '9', change_count: 2, group_digest: 'b'.repeat(64) } });
  await assert.rejects(() => appendPostgresV2SyncGroup(h.client, { ownerId: OWNER, transactionId: TRANSACTION, privacyEpoch: '1', changes }), /DEPENDENCY_UNAVAILABLE/);
});

test('v2 adapter fails closed when the database returns an altered change hash', async () => {
  const h = harness({ changeInsertRows: [{ owner_id: OWNER, sequence: '8', transaction_id: TRANSACTION, entity_kind: 'plan', entity_id: PLAN, operation: 'upsert', change_hash: 'b'.repeat(64) }] });
  await assert.rejects(() => appendPostgresV2SyncGroup(h.client, { ownerId: OWNER, transactionId: TRANSACTION, privacyEpoch: '1', changes }), /DEPENDENCY_UNAVAILABLE/);
});

test('v2 adapter fails closed for malformed database results and runner configuration', async () => {
  const request = { ownerId: OWNER, transactionId: TRANSACTION, privacyEpoch: '1', changes };
  await assert.rejects(() => appendPostgresV2SyncGroup({ query: async () => ({ rows: null }) }, request), /DEPENDENCY_UNAVAILABLE/);

  const malformedHead = { query: async (sql) => {
    if (sql.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, account_state: 'active' }] };
    if (sql.includes('from df_private.sync_v2_heads')) return { rows: [{}] };
    return { rows: [] };
  } };
  await assert.rejects(() => appendPostgresV2SyncGroup(malformedHead, request), /DEPENDENCY_UNAVAILABLE/);

  const malformedExisting = { query: async (sql) => {
    if (sql.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, account_state: 'active' }] };
    if (sql.includes('from df_private.sync_v2_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '7', privacy_epoch: '1' }] };
    if (sql.includes('from df_private.sync_v2_transaction_groups')) return { rows: [{ transaction_id: TRANSACTION, contract_version: 2, privacy_epoch: '1', committed_through: 'not-a-number', change_count: 2, group_digest: 'a'.repeat(64) }] };
    return { rows: [] };
  } };
  await assert.rejects(() => appendPostgresV2SyncGroup(malformedExisting, request), /DEPENDENCY_UNAVAILABLE/);

  assert.throws(() => createPostgresV2SyncGroupAdapter({ runner: {} }), /VALIDATION_FAILED/);
});

test('v2 adapter fails closed when the owner profile result rows are sparse', async () => {
  const rows = [];
  rows[1] = { owner_id: OWNER, account_state: 'active' };
  const client = { query: async () => ({ rows }) };
  await assert.rejects(
    () => appendPostgresV2SyncGroup(client, { ownerId: OWNER, transactionId: TRANSACTION, privacyEpoch: '1', changes }),
    /DEPENDENCY_UNAVAILABLE/,
  );
});

test('v2 builder and adapter reject malformed runtime types before transaction access', async () => {
  await assert.rejects(() => buildV2SyncGroup({ transactionId: Symbol('transaction'), privacyEpoch: '1', firstSequence: '1', changes }), /VALIDATION_FAILED/);
  await assert.rejects(() => buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '1', changes: [{ ...changes[0], entityId: Symbol('entity') }, changes[1]] }), /VALIDATION_FAILED/);
  let opened = false;
  const adapter = createPostgresV2SyncGroupAdapter({ runner: { withTransaction: async () => { opened = true; throw new Error('must not open'); } } });
  await assert.rejects(() => adapter.append({ ownerId: Symbol('owner'), transactionId: TRANSACTION, privacyEpoch: '1', changes }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});
