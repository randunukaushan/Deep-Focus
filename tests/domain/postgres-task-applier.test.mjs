import assert from 'node:assert/strict';
import test from 'node:test';

const { applyCreateTask } = await import('../../supabase/functions/_shared/postgres-task-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const HASH = 'a'.repeat(64);

test('createTask applier binds owner from trusted context and maps typed due fields', async () => {
  let received;
  const client = { query: async (sql, params) => { if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] }; received = { sql: sql.replace(/\s+/g, ' ').trim(), params }; return { rows: [{ id: TASK, owner_id: OWNER, workspace_id: WORKSPACE, version: 1, status: 'pending' }] }; } };
  const result = await applyCreateTask(client, {
    actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH,
    body: { id: TASK, workspaceId: WORKSPACE, title: 'Read', description: null, priority: 'high', due: { kind: 'date', date: '2026-10-10' } },
  });
  assert.deepEqual(result, { responseBody: { id: TASK, version: 1, status: 'pending' }, responseStatus: 201 });
  assert.match(received.sql, /insert into df_private\.tasks/i);
  assert.deepEqual(received.params, [TASK, OWNER, WORKSPACE, null, 'Read', null, 'high', 'date', '2026-10-10', null]);
});

test('createTask applier never accepts a body owner field or unsafe deadline', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  await assert.rejects(applyCreateTask(client, { actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read', ownerId: OWNER } }), /VALIDATION_FAILED/);
  await assert.rejects(applyCreateTask(client, { actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read', due: { kind: 'url', value: 'https://bad.example' } } }), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
});

test('createTask applier rejects a goal that is not owned in the same workspace', async () => {
  let insertCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] };
    if (sql.includes('from df_private.goals')) return { rows: [] };
    insertCalled = true;
    return { rows: [{ id: TASK, version: 1, status: 'pending' }] };
  } };
  await assert.rejects(applyCreateTask(client, {
    actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH,
    body: { id: TASK, workspaceId: WORKSPACE, goalId: '44444444-4444-4444-8444-444444444444', title: 'Read' },
  }), /NOT_FOUND/);
  assert.equal(insertCalled, false);
});

test('createTask applier rejects foreign returned goal metadata', async () => {
  let insertCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] };
    if (sql.includes('from df_private.goals')) return { rows: [{ owner_id: '99999999-9999-4999-8999-999999999999', workspace_id: WORKSPACE, id: '44444444-4444-4444-8444-444444444444' }] };
    insertCalled = true;
    return { rows: [{ id: TASK, version: 1, status: 'pending' }] };
  } };
  await assert.rejects(applyCreateTask(client, { actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, goalId: '44444444-4444-4444-8444-444444444444', title: 'Read' } }), /NOT_FOUND/);
  assert.equal(insertCalled, false);
});

test('createTask applier fails closed for an unexpected operation or malformed result', async () => {
  const client = { query: async (sql) => sql.includes('from df_private.workspaces') ? { rows: [{ owner_id: OWNER, id: WORKSPACE }] } : { rows: [{ id: TASK, version: 1, status: 'pending' }] } };
  await assert.rejects(applyCreateTask(client, { actorId: OWNER, operation: 'patchTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /VALIDATION_FAILED/);
  await assert.rejects(applyCreateTask({ query: async (sql) => sql.includes('from df_private.workspaces') ? { rows: [{ owner_id: OWNER, id: WORKSPACE }] } : { rows: [{ id: TASK, version: 0, status: 'pending' }] } }, { actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /DEPENDENCY_UNAVAILABLE/);
});

test('createTask applier rejects a workspace not owned by the verified actor', async () => {
  let taskInsertCalled = false;
  const client = { query: async (sql) => { if (sql.includes('from df_private.workspaces')) return { rows: [] }; taskInsertCalled = true; return { rows: [{ id: TASK, version: 1, status: 'pending' }] }; } };
  await assert.rejects(applyCreateTask(client, { actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /NOT_FOUND/);
  assert.equal(taskInsertCalled, false);
});

test('createTask applier rejects foreign returned workspace metadata', async () => {
  let taskInsertCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: '88888888-8888-4888-8888-888888888888', id: WORKSPACE }] };
    taskInsertCalled = true;
    return { rows: [{ id: TASK, version: 1, status: 'pending' }] };
  } };
  await assert.rejects(applyCreateTask(client, { actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /NOT_FOUND/);
  assert.equal(taskInsertCalled, false);
});

test('createTask applier rejects foreign returned task metadata', async () => {
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] };
    return { rows: [{ id: TASK, owner_id: '99999999-9999-4999-8999-999999999999', workspace_id: WORKSPACE, version: 1, status: 'pending' }] };
  } };
  await assert.rejects(applyCreateTask(client, { actorId: OWNER, operation: 'createTask', mutationId: '44444444-4444-4444-8444-444444444444', requestSha256: HASH, body: { id: TASK, workspaceId: WORKSPACE, title: 'Read' } }), /DEPENDENCY_UNAVAILABLE/);
});
