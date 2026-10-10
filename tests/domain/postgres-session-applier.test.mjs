import assert from 'node:assert/strict';
import test from 'node:test';

const { applyStartSession } = await import('../../supabase/functions/_shared/postgres-session-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const TASK = '55555555-5555-4555-8555-555555555555';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);

test('startSession binds owner and snapshots an owner-scoped task title', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.includes('from df_private.tasks')) return { rows: [{ owner_id: OWNER, workspace_id: WORKSPACE, id: TASK, title: 'Read' }] };
    return { rows: [{ id: SESSION, owner_id: OWNER, workspace_id: WORKSPACE, version: 1, status: 'active' }] };
  } };
  const result = await applyStartSession(client, { actorId: OWNER, operation: 'startSession', mutationId: MUTATION, requestSha256: HASH, body: {
    id: SESSION, workspaceId: WORKSPACE, taskId: TASK, plannedMs: 1500000, startedAt: '2026-10-10T01:00:00.000Z',
  } });
  assert.deepEqual(result, { responseBody: { id: SESSION, version: 1, status: 'active' }, responseStatus: 201 });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].params, [TASK, OWNER, WORKSPACE]);
  assert.deepEqual(calls[1].params, [SESSION, OWNER, WORKSPACE, TASK, 'Read', 1500000, '2026-10-10T01:00:00.000Z']);
  assert.match(calls[1].sql, /contract_version, planned_ms, focused_ms, paused_ms/);
});

test('startSession rejects foreign or missing tasks before inserting a session', async () => {
  let insertCalls = 0;
  const client = { query: async (sql) => { if (sql.includes('from df_private.tasks')) return { rows: [] }; insertCalls += 1; return { rows: [] }; } };
  await assert.rejects(applyStartSession(client, { actorId: OWNER, operation: 'startSession', mutationId: MUTATION, requestSha256: HASH, body: { id: SESSION, workspaceId: WORKSPACE, taskId: TASK, plannedMs: 1, startedAt: '2026-10-10T01:00:00.000Z' } }), /NOT_FOUND/);
  assert.equal(insertCalls, 0);
});

test('startSession fails closed when a returned task row has foreign ownership metadata', async () => {
  let sessionInsertCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.tasks')) return { rows: [{ owner_id: '66666666-6666-4666-8666-666666666666', workspace_id: WORKSPACE, id: TASK, title: 'Foreign' }] };
    sessionInsertCalled = true;
    return { rows: [{ id: SESSION, version: 1, status: 'active' }] };
  } };
  await assert.rejects(applyStartSession(client, { actorId: OWNER, operation: 'startSession', mutationId: MUTATION, requestSha256: HASH, body: {
    id: SESSION, workspaceId: WORKSPACE, taskId: TASK, plannedMs: 1, startedAt: '2026-10-10T01:00:00.000Z',
  } }), /NOT_FOUND/);
  assert.equal(sessionInsertCalled, false);
});

test('startSession without a task rejects a workspace not owned by the verified actor', async () => {
  let sessionInsertCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [] };
    sessionInsertCalled = true;
    return { rows: [{ id: SESSION, version: 1, status: 'active' }] };
  } };
  await assert.rejects(applyStartSession(client, { actorId: OWNER, operation: 'startSession', mutationId: MUTATION, requestSha256: HASH, body: {
    id: SESSION, workspaceId: WORKSPACE, plannedMs: 1500000, startedAt: '2026-10-10T01:00:00.000Z',
  } }), /NOT_FOUND/);
  assert.equal(sessionInsertCalled, false);
});

test('startSession without a task rejects foreign returned workspace metadata', async () => {
  let sessionInsertCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: '77777777-7777-4777-8777-777777777777', id: WORKSPACE }] };
    sessionInsertCalled = true;
    return { rows: [{ id: SESSION, version: 1, status: 'active' }] };
  } };
  await assert.rejects(applyStartSession(client, { actorId: OWNER, operation: 'startSession', mutationId: MUTATION, requestSha256: HASH, body: {
    id: SESSION, workspaceId: WORKSPACE, plannedMs: 1, startedAt: '2026-10-10T01:00:00.000Z',
  } }), /NOT_FOUND/);
  assert.equal(sessionInsertCalled, false);
});

test('startSession rejects foreign returned session metadata', async () => {
  let sessionInsertCalled = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] };
    sessionInsertCalled = true;
    return { rows: [{ id: SESSION, owner_id: '88888888-8888-4888-8888-888888888888', workspace_id: WORKSPACE, version: 1, status: 'active' }] };
  } };
  await assert.rejects(applyStartSession(client, { actorId: OWNER, operation: 'startSession', mutationId: MUTATION, requestSha256: HASH, body: {
    id: SESSION, workspaceId: WORKSPACE, plannedMs: 1, startedAt: '2026-10-10T01:00:00.000Z',
  } }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(sessionInsertCalled, true);
});

test('startSession rejects ownership injection and unsafe timer inputs before SQL', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  const base = { id: SESSION, workspaceId: WORKSPACE, plannedMs: 1500000, startedAt: '2026-10-10T01:00:00.000Z' };
  await assert.rejects(applyStartSession(client, { actorId: OWNER, operation: 'startSession', mutationId: MUTATION, requestSha256: HASH, body: { ...base, ownerId: OWNER } }), /VALIDATION_FAILED/);
  await assert.rejects(applyStartSession(client, { actorId: OWNER, operation: 'startSession', mutationId: MUTATION, requestSha256: HASH, body: { ...base, plannedMs: 0 } }), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
});
