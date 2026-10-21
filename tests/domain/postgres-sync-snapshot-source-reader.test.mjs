import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresSyncSnapshotSourceReader } = await import('../../supabase/functions/_shared/postgres-sync-snapshot-source-reader.ts');
const OWNER = '11111111-1111-4111-8111-111111111111';
const ID = '22222222-2222-4222-8222-222222222222';

function harness() {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.sync_heads')) return { rows: [{ last_sequence: '17' }] };
    if (sql.includes('from df_private.goals')) return { rows: [{ id: ID, title: 'Goal', version: 2, deleted_at: null }] };
    if (sql.includes('from df_private.tasks')) return { rows: [{ id: ID, title: 'Task', version: 1, deleted_at: '2026-10-11T02:00:00.000Z' }] };
    if (sql.includes('from df_private.focus_sessions')) return { rows: [] };
    if (sql.includes('from df_private.break_records')) return { rows: [] };
    if (sql.includes('from df_private.user_settings')) return { rows: [] };
    if (sql.includes('from df_private.task_reminders')) return { rows: [] };
    throw new Error(`unexpected query: ${sql}`);
  } };
  return { client, calls };
}

test('source reader returns only owner-bound rows and preserves tombstones', async () => {
  const h = harness();
  const result = await createPostgresSyncSnapshotSourceReader().read(h.client, OWNER);
  assert.equal(result.highWater, '17');
  assert.deepEqual(result.records, [
    { entity: 'goal', entityId: ID, version: 2, operation: 'upsert', payload: { id: ID, title: 'Goal', version: 2, deleted_at: null } },
    { entity: 'task', entityId: ID, version: 1, operation: 'delete', payload: null },
  ]);
  assert.equal(h.calls.every((call) => call.params[0] === OWNER), true);
});

test('source reader rejects malformed high-water and malformed rows', async () => {
  const malformed = { query: async (sql) => sql.includes('sync_heads') ? { rows: [{ last_sequence: '-1' }] } : { rows: [] } };
  await assert.rejects(() => createPostgresSyncSnapshotSourceReader().read(malformed, OWNER), /DEPENDENCY_UNAVAILABLE/);
  await assert.rejects(() => createPostgresSyncSnapshotSourceReader().read(malformed, 'not-an-owner'), /VALIDATION_FAILED/);
});

test('source reader rejects unsafe owner runtime types before opening a query', async () => {
  const calls = [];
  const client = { query: async () => { calls.push(true); return { rows: [] }; } };
  await assert.rejects(() => createPostgresSyncSnapshotSourceReader().read(client, Symbol('owner')), /VALIDATION_FAILED/);
  assert.equal(calls.length, 0);
});

test('source reader normalizes bigint strings in snapshot payloads', async () => {
  const client = { query: async (sql) => {
    if (sql.includes('sync_heads')) return { rows: [{ last_sequence: '17' }] };
    if (sql.includes('from df_private.goals')) return { rows: [{ id: ID, title: 'Goal', target_value: '1500000', version: 2, deleted_at: null }] };
    if (sql.includes('from df_private.focus_sessions')) return { rows: [{ id: ID, planned_ms: '1500000', focused_ms: '1200000', paused_ms: '300000', last_event_sequence: '2', version: 1, deleted_at: null }] };
    return { rows: [] };
  } };
  const result = await createPostgresSyncSnapshotSourceReader().read(client, OWNER);
  assert.equal(result.records.find((record) => record.entity === 'goal').payload.target_value, 1500000);
  assert.equal(result.records.find((record) => record.entity === 'session').payload.focused_ms, 1200000);
});

test('source reader rejects unsafe bigint strings before creating a snapshot', async () => {
  const client = { query: async (sql) => {
    if (sql.includes('sync_heads')) return { rows: [{ last_sequence: '17' }] };
    if (sql.includes('from df_private.goals')) return { rows: [{ id: ID, target_value: '9007199254740992', version: 1, deleted_at: null }] };
    return { rows: [] };
  } };
  await assert.rejects(() => createPostgresSyncSnapshotSourceReader().read(client, OWNER), /DEPENDENCY_UNAVAILABLE/);
});

test('source reader rejects malformed database rows and result shapes before materializing records', async () => {
  const malformedRow = { query: async (sql) => {
    if (sql.includes('sync_heads')) return { rows: [{ last_sequence: '17' }] };
    if (sql.includes('from df_private.goals')) return { rows: [null] };
    return { rows: [] };
  } };
  await assert.rejects(() => createPostgresSyncSnapshotSourceReader().read(malformedRow, OWNER), /DEPENDENCY_UNAVAILABLE/);

  const malformedHead = { query: async (sql) => sql.includes('sync_heads') ? { rows: null } : { rows: [] } };
  await assert.rejects(() => createPostgresSyncSnapshotSourceReader().read(malformedHead, OWNER), /DEPENDENCY_UNAVAILABLE/);
});

test('source reader fails closed when a source table returns sparse rows', async () => {
  const sparse = [];
  sparse[1] = { id: ID, title: 'Goal', version: 1, deleted_at: null };
  const client = { query: async (sql) => {
    if (sql.includes('sync_heads')) return { rows: [{ last_sequence: '17' }] };
    if (sql.includes('from df_private.goals')) return { rows: sparse };
    return { rows: [] };
  } };
  await assert.rejects(() => createPostgresSyncSnapshotSourceReader().read(client, OWNER), /DEPENDENCY_UNAVAILABLE/);
});

test('source reader fails closed before querying with a malformed database client', async () => {
  await assert.rejects(() => createPostgresSyncSnapshotSourceReader().read({ query: 'not-a-function' }, OWNER), /DEPENDENCY_UNAVAILABLE/);
});
