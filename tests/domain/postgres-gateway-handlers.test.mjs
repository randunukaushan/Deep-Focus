import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresGatewayHandlers } = await import('../../supabase/functions/_shared/postgres-gateway-handlers.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '66666666-6666-4666-8666-666666666666';
const TASK = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);

function runnerHarness() {
  const calls = [];
  let commits = 0;
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: [{ owner_id: params[0], last_sequence: params[1] }] };
    if (sql.includes('last_sequence')) return { rows: [{ last_sequence: '0' }] };
    if (sql.includes('sync_heads')) return { rows: [{ owner_id: OWNER }] };
    if (sql.includes('mutation_receipts') && sql.trimStart().startsWith('select')) return { rows: [] };
    if (sql.includes('insert into df_private.mutation_receipts')) return { rows: [{ owner_id: params[0], operation: params[1], mutation_id: params[2] }] };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: [{ owner_id: params[0], sequence: params[1], change_hash: params[6] }] };
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] };
    if (sql.includes('insert into df_private.tasks')) return { rows: [{ id: TASK, owner_id: OWNER, workspace_id: WORKSPACE, version: 1, status: 'pending' }] };
    if (sql.includes('update df_private.profiles')) return { rows: [{ owner_id: OWNER, display_name: 'Updated', account_state: 'active', version: 2 }] };
    if (sql.includes('from df_private.tasks')) return { rows: [{ owner_id: OWNER, id: TASK, workspace_id: WORKSPACE, goal_id: null, title: 'Read', description: null, status: 'pending', priority: null, due_kind: 'none', due_date: null, due_at: null, version: 1 }] };
    if (sql.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, display_name: 'Updated', account_state: 'active', version: 2 }] };
    return { rows: [] };
  } };
  return { client, calls, get commits() { return commits; }, runner: { withTransaction: async (run) => { const result = await run(client); commits += 1; return result; } } };
}

test('gateway handler registry carries the verified context through transaction and createTask applier', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => { throw new Error('must be replaced'); } });
  const result = await handlers.createTask({ actorId: OWNER, sessionId: SESSION, operation: 'createTask', idempotencyKey: MUTATION, requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } });
  assert.deepEqual(result, { status: 201, body: { id: TASK, version: 1, status: 'pending' } });
  assert.equal(h.commits, 1);
  assert.equal(h.calls.filter((call) => call.sql.includes('sync_heads')).length, 3);
  assert.equal(h.calls.filter((call) => call.sql.includes('insert into df_private.tasks')).length, 1);
  assert.equal(h.calls.filter((call) => call.sql.startsWith('insert into df_private.mutation_receipts')).length, 1);
});

test('gateway handler registry exposes only supported write appliers and requires idempotency', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 201 }) });
  assert.deepEqual(Object.keys(handlers).sort(), ['applySessionEvent', 'applyTaskAction', 'createGoal', 'createTask', 'deleteGoal', 'deleteTask', 'getGoal', 'getMe', 'getSession', 'getSettings', 'getTask', 'listGoals', 'listSessions', 'listTasks', 'patchGoal', 'patchMe', 'patchSettings', 'patchTask', 'recordBreak', 'startSession']);
  await assert.rejects(handlers.createTask({ actorId: OWNER, operation: 'createTask', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /VALIDATION_FAILED/);
});

test('gateway profile update remains transactional and owner-scoped', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  const result = await handlers.patchMe({ actorId: OWNER, sessionId: SESSION, operation: 'patchMe', idempotencyKey: MUTATION, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Updated' } });
  assert.deepEqual(result, { status: 200, body: { id: OWNER, displayName: 'Updated', accountState: 'active', version: 2 } });
  assert.equal(h.calls.some((call) => call.sql.includes('update df_private.profiles')), true);
});

test('gateway handler registry keeps a route resource ID server-derived for patchTask', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  await assert.rejects(handlers.patchTask({ actorId: OWNER, sessionId: SESSION, operation: 'patchTask', idempotencyKey: MUTATION, requestSha256: HASH, resourceId: TASK, body: { expectedVersion: 1, title: 'New' } }), /VERSION_CONFLICT|DEPENDENCY_UNAVAILABLE/);
  assert.equal(h.calls.some((call) => call.sql.includes('where id = $1 and owner_id = $2')), true);
});

test('task delete handler returns a committed tombstone receipt through the transaction boundary', async () => {
  const calls = [];
  let receiptBody;
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.app_sessions')) return { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', revoked_at: null }] };
    if (sql.includes('from df_private.profiles')) return { rows: [{ owner_id: OWNER, display_name: 'Owner', account_state: 'active', version: 1 }] };
    if (sql.includes('mutation_receipts') && sql.trimStart().startsWith('select')) return { rows: [] };
    if (sql.includes('sync_heads') && sql.trimStart().startsWith('select')) return { rows: [{ owner_id: OWNER, last_sequence: '41' }] };
    if (sql.trimStart().startsWith('update df_private.tasks')) return { rows: [{ id: TASK, owner_id: OWNER, version: 2, status: 'pending', deleted_at: '2026-10-11T00:00:00.000Z' }] };
    if (sql.includes('from df_private.tasks')) return { rows: [{ owner_id: OWNER, id: TASK, version: 2, deleted_at: '2026-10-11T00:00:00.000Z' }] };
    if (sql.includes('insert into df_private.sync_changes')) return { rows: [{ owner_id: OWNER, sequence: '42', change_hash: params[6] }] };
    if (sql.includes('update df_private.sync_heads')) return { rows: [{ owner_id: OWNER, last_sequence: '42' }] };
    if (sql.includes('insert into df_private.mutation_receipts')) { receiptBody = JSON.parse(params[4]); return { rows: [{ owner_id: OWNER, operation: params[1], mutation_id: params[2] }] }; }
    return { rows: [] };
  } };
  const runner = { withTransaction: async (run) => run(client) };
  const handlers = createPostgresGatewayHandlers({ runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 200 }) });
  const result = await handlers.deleteTask({ actorId: OWNER, sessionId: SESSION, operation: 'deleteTask', idempotencyKey: MUTATION, requestSha256: HASH, resourceId: TASK, body: { expectedVersion: 1 } });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.tombstone.entity, 'task');
  assert.equal(result.body.data.receipt.committedThrough, '42');
  assert.equal(receiptBody.data.receipt.command, 'task.delete');
  assert.equal(calls.some((call) => call.sql.startsWith('update df_private.tasks')), true);
});

test('authenticated mutation gateway rejects missing session before owner writes', async () => {
  const h = runnerHarness();
  const handlers = createPostgresGatewayHandlers({ runner: h.runner, applyMutation: async () => ({ responseBody: {}, responseStatus: 201 }) });
  await assert.rejects(() => handlers.createTask({ actorId: OWNER, operation: 'createTask', idempotencyKey: MUTATION, requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /AUTH_REQUIRED/);
  assert.equal(h.calls.length, 0);
});
