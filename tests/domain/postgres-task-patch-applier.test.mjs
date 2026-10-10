import assert from 'node:assert/strict';
import test from 'node:test';

const { applyPatchTask } = await import('../../supabase/functions/_shared/postgres-task-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const HASH = 'a'.repeat(64);
const MUTATION = '44444444-4444-4444-8444-444444444444';

test('patchTask applies only requested fields and increments from the expected version', async () => {
  let call;
  const client = { query: async (sql, params) => { call = { sql: sql.replace(/\s+/g, ' ').trim(), params }; return { rows: [{ id: TASK, owner_id: OWNER, version: 3, status: 'pending' }] }; } };
  const result = await applyPatchTask(client, { actorId: OWNER, operation: 'patchTask', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { expectedVersion: 2, title: 'New title', description: null, due: { kind: 'none' } } });
  assert.deepEqual(result, { responseBody: { id: TASK, version: 3, status: 'pending' }, responseStatus: 200 });
  assert.match(call.sql, /update df_private\.tasks set/);
  assert.match(call.sql, /where id = \$1 and owner_id = \$2 and version = \$3/);
  assert.deepEqual(call.params, [TASK, OWNER, 2, 'New title', null, 'none', null, null]);
});

test('patchTask rejects owner injection, missing changes and stale rows before claiming success', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  await assert.rejects(applyPatchTask(client, { actorId: OWNER, operation: 'patchTask', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { expectedVersion: 2, ownerId: OWNER } }), /VALIDATION_FAILED/);
  await assert.rejects(applyPatchTask(client, { actorId: OWNER, operation: 'patchTask', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { expectedVersion: 2 } }), /VALIDATION_FAILED/);
  await assert.rejects(applyPatchTask(client, { actorId: OWNER, operation: 'patchTask', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { expectedVersion: 2, title: 'New' } }), /VERSION_CONFLICT/);
  assert.equal(calls, 1);
});

test('patchTask does not update terminal or deleted records through the SQL predicate', async () => {
  let sql;
  const client = { query: async (value) => { sql = value; return { rows: [] }; } };
  await assert.rejects(applyPatchTask(client, { actorId: OWNER, operation: 'patchTask', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { expectedVersion: 4, priority: 'high' } }), /VERSION_CONFLICT/);
  assert.match(sql, /deleted_at is null/);
});

test('patchTask rejects a goal that is not in the same owner workspace', async () => {
  const calls = [];
  const client = { query: async (sql) => { calls.push(sql); return sql.includes('left join df_private.goals') ? { rows: [{ workspace_id: '55555555-5555-4555-8555-555555555555', goal_id: null }] } : { rows: [] }; } };
  await assert.rejects(applyPatchTask(client, { actorId: OWNER, operation: 'patchTask', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { expectedVersion: 2, goalId: '66666666-6666-4666-8666-666666666666' } }), /NOT_FOUND/);
  assert.equal(calls.length, 1);
});

test('patchTask rejects foreign returned task or goal metadata before updating', async () => {
  let updateCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('left join df_private.goals')) {
      return { rows: [{
        task_id: TASK,
        owner_id: '99999999-9999-4999-8999-999999999999',
        workspace_id: WORKSPACE,
        goal_owner_id: OWNER,
        goal_workspace_id: WORKSPACE,
        goal_id: '66666666-6666-4666-8666-666666666666',
      }] };
    }
    updateCalled = true;
    return { rows: [{ id: TASK, version: 3, status: 'pending' }] };
  } };
  await assert.rejects(applyPatchTask(client, {
    actorId: OWNER,
    operation: 'patchTask',
    mutationId: MUTATION,
    resourceId: TASK,
    requestSha256: HASH,
    body: { expectedVersion: 2, goalId: '66666666-6666-4666-8666-666666666666' },
  }), /NOT_FOUND/);
  assert.equal(updateCalled, false);
});

test('patchTask rejects foreign returned update ownership metadata', async () => {
  const client = { query: async () => ({ rows: [{ id: TASK, owner_id: '99999999-9999-4999-8999-999999999999', version: 3, status: 'pending' }] }) };
  await assert.rejects(applyPatchTask(client, {
    actorId: OWNER,
    operation: 'patchTask',
    mutationId: MUTATION,
    resourceId: TASK,
    requestSha256: HASH,
    body: { expectedVersion: 2, title: 'New title' },
  }), /DEPENDENCY_UNAVAILABLE/);
});
