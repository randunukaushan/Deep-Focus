import assert from 'node:assert/strict';
import test from 'node:test';

const { appendOwnedSyncChange } = await import('../../supabase/functions/_shared/postgres-sync-change-writer.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const HASH = 'a'.repeat(64);

function harness(rows = [{ last_sequence: '41' }], advancedRows = [{ owner_id: OWNER, last_sequence: '42' }], insertedRows = null) {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.tasks')) return { rows: [{ owner_id: OWNER, id: TASK, workspace_id: WORKSPACE, goal_id: null, title: 'Read', description: null, status: 'pending', priority: 'high', due_kind: 'none', due_date: null, due_at: null, version: 3 }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: advancedRows };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: insertedRows ?? [{ owner_id: params[0], sequence: params[1], change_hash: params[6] }] };
    if (sql.includes('last_sequence')) return { rows };
    return { rows: [] };
  } };
  return { client, calls };
}

const mutation = { actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } };
const applied = { responseBody: { id: TASK, version: 1, status: 'pending' }, responseStatus: 201 };

test('sync change writer reads the committed entity and appends the next owner sequence atomically', async () => {
  const h = harness();
  await appendOwnedSyncChange(h.client, mutation, applied);
  const insert = h.calls.find((call) => call.sql.startsWith('insert into df_private.sync_changes'));
  assert.deepEqual(insert.params.slice(0, 4), [OWNER, '42', 'task', TASK]);
  assert.equal(insert.params[4], 'upsert');
  assert.deepEqual(JSON.parse(insert.params[5]), { id: TASK, workspaceId: WORKSPACE, goalId: null, title: 'Read', description: null, status: 'pending', priority: 'high', due: { kind: 'none' }, version: 3 });
  assert.equal(insert.params[6].length, 64);
  assert.deepEqual(h.calls.at(-1).params, [OWNER, '42']);
});

test('sync change writer fails closed when the change insert is not acknowledged', async () => {
  const h = harness([{ last_sequence: '41' }], [{ owner_id: OWNER, last_sequence: '42' }], []);
  await assert.rejects(() => appendOwnedSyncChange(h.client, mutation, applied), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.some((call) => call.sql.startsWith('update df_private.sync_heads')), false);
});

test('sync change writer fails closed when the locked owner head is unavailable', async () => {
  const h = harness([]);
  await assert.rejects(() => appendOwnedSyncChange(h.client, mutation, applied), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.some((call) => call.sql.startsWith('insert into df_private.sync_changes')), false);
});

test('sync change writer fails closed when head advancement changes no row', async () => {
  const h = harness([{ last_sequence: '41' }], []);
  await assert.rejects(() => appendOwnedSyncChange(h.client, mutation, applied), /DEPENDENCY_UNAVAILABLE/);
});

test('sync change writer fails closed when the committed entity row belongs to another owner', async () => {
  const h = harness();
  const originalQuery = h.client.query;
  h.client.query = async (sql, params) => {
    const result = await originalQuery(sql, params);
    if (sql.includes('from df_private.tasks')) result.rows[0].owner_id = '55555555-5555-4555-8555-555555555555';
    return result;
  };
  await assert.rejects(() => appendOwnedSyncChange(h.client, mutation, applied), /DEPENDENCY_UNAVAILABLE/);
});

test('sync change writer fails closed when the advanced head belongs to another owner', async () => {
  const h = harness([{ last_sequence: '41' }], [{ owner_id: '55555555-5555-4555-8555-555555555555', last_sequence: '42' }]);
  await assert.rejects(() => appendOwnedSyncChange(h.client, mutation, applied), /DEPENDENCY_UNAVAILABLE/);
});

test('sync change writer fails closed when the returned insert row belongs to another owner', async () => {
  const h = harness([{ last_sequence: '41' }], [{ last_sequence: '42' }], [{ owner_id: '55555555-5555-4555-8555-555555555555', sequence: '42', change_hash: 'a'.repeat(64) }]);
  await assert.rejects(() => appendOwnedSyncChange(h.client, mutation, applied), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.some((call) => call.sql.startsWith('update df_private.sync_heads')), false);
});

test('sync change writer appends a null-payload goal tombstone for deleteGoal', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.goals')) return { rows: [{ owner_id: OWNER, id: '77777777-7777-4777-8777-777777777777', version: 4, deleted_at: '2026-10-11T00:00:00.000Z' }] };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: [{ owner_id: OWNER, sequence: '42', change_hash: params[6] }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '42' }] };
    if (sql.includes('last_sequence')) return { rows: [{ last_sequence: '41' }] };
    return { rows: [] };
  } };
  await appendOwnedSyncChange(client, { actorId: OWNER, operation: 'deleteGoal', mutationId: '44444444-4444-4444-8444-444444444444', resourceId: '77777777-7777-4777-8777-777777777777', requestSha256: HASH, body: { expectedVersion: 3 } }, { responseBody: {}, responseStatus: 200 });
  const insert = calls.find((call) => call.sql.startsWith('insert into df_private.sync_changes'));
  assert.deepEqual(insert.params.slice(0, 5), [OWNER, '42', 'goal', '77777777-7777-4777-8777-777777777777', 'delete']);
  assert.equal(insert.params[5], null);
  assert.equal(insert.params[6].length, 64);
});

test('sync change writer appends a null-payload task tombstone for deleteTask', async () => {
  const calls = [];
  const taskId = '77777777-7777-4777-8777-777777777777';
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.tasks') && sql.includes('deleted_at')) return { rows: [{ owner_id: OWNER, id: taskId, version: 4, deleted_at: '2026-10-11T00:00:00.000Z' }] };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: [{ owner_id: OWNER, sequence: '42', change_hash: params[6] }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '42' }] };
    if (sql.includes('last_sequence')) return { rows: [{ last_sequence: '41' }] };
    return { rows: [] };
  } };
  await appendOwnedSyncChange(client, { actorId: OWNER, operation: 'deleteTask', mutationId: '44444444-4444-4444-8444-444444444444', resourceId: taskId, requestSha256: HASH, body: { expectedVersion: 3 } }, { responseBody: {}, responseStatus: 200 });
  const insert = calls.find((call) => call.sql.startsWith('insert into df_private.sync_changes'));
  assert.deepEqual(insert.params.slice(0, 5), [OWNER, '42', 'task', taskId, 'delete']);
  assert.equal(insert.params[5], null);
  assert.equal(insert.params[6].length, 64);
});

test('sync change writer serializes an owned break record without trusting client duration', async () => {
  const breakId = '88888888-8888-4888-8888-888888888888';
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.break_records')) return { rows: [{ owner_id: OWNER, id: breakId, focus_session_id: '99999999-9999-4999-8999-999999999999', started_at: '2026-10-11T01:25:00.000Z', ended_at: '2026-10-11T01:30:00.000Z', planned_ms: 300000, actual_ms: 300000, outcome: 'completed', version: 1, verification_state: 'pending' }] };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: [{ owner_id: OWNER, sequence: '42', change_hash: params[6] }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '42' }] };
    if (sql.includes('last_sequence')) return { rows: [{ last_sequence: '41' }] };
    return { rows: [] };
  } };
  await appendOwnedSyncChange(client, { actorId: OWNER, operation: 'recordBreak', mutationId: '44444444-4444-4444-8444-444444444444', resourceId: breakId, requestSha256: HASH, body: { id: breakId, focusSessionId: '99999999-9999-4999-8999-999999999999', startedAt: '2026-10-11T01:25:00.000Z', endedAt: '2026-10-11T01:30:00.000Z', plannedMs: 1, outcome: 'completed' } }, { responseBody: {}, responseStatus: 201 });
  const insert = calls.find((call) => call.sql.startsWith('insert into df_private.sync_changes'));
  assert.deepEqual(insert.params.slice(0, 5), [OWNER, '42', 'break', breakId, 'upsert']);
  assert.deepEqual(JSON.parse(insert.params[5]), { id: breakId, focusSessionId: '99999999-9999-4999-8999-999999999999', startedAt: '2026-10-11T01:25:00.000Z', endedAt: '2026-10-11T01:30:00.000Z', plannedMs: 300000, actualMs: 300000, outcome: 'completed', version: 1, verificationState: 'pending' });
});
