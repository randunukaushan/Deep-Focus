import assert from 'node:assert/strict';
import test from 'node:test';

const { applyCreateGoal, applyPatchGoal, applyDeleteGoal } = await import('../../supabase/functions/_shared/postgres-goal-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const GOAL = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);

test('createGoal applier binds owner and preserves focus-time units and bounds', async () => {
  const calls = [];
  const client = { query: async (sql, params) => { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params }); return sql.includes('from df_private.workspaces') ? { rows: [{ owner_id: OWNER, id: WORKSPACE }] } : { rows: [{ id: GOAL, owner_id: OWNER, workspace_id: WORKSPACE, version: 1, status: 'active' }] }; } };
  const result = await applyCreateGoal(client, { actorId: OWNER, operation: 'createGoal', mutationId: MUTATION, requestSha256: HASH, body: {
    id: GOAL, workspaceId: WORKSPACE, title: 'Deep work', description: null, type: 'focus_time', period: 'weekly',
    startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 3600000, targetUnit: 'ms',
  } });
  assert.deepEqual(result, { responseBody: { id: GOAL, version: 1, status: 'active' }, responseStatus: 201 });
  const call = calls.find((entry) => entry.sql.includes('insert into df_private.goals'));
  assert.match(call.sql, /insert into df_private\.goals/i);
  assert.deepEqual(call.params, [GOAL, OWNER, WORKSPACE, 'Deep work', null, 'focus_time', 'weekly', 3600000, 'ms', '2026-10-05T00:00:00.000Z', '2026-10-12T00:00:00.000Z', 'Asia/Colombo']);
});

test('createGoal applier rejects a workspace not owned by the verified actor', async () => {
  let goalInsert = false;
  const client = { query: async (sql) => { if (sql.includes('from df_private.workspaces')) return { rows: [] }; goalInsert = true; return { rows: [{ id: GOAL, version: 1, status: 'active' }] }; } };
  await assert.rejects(applyCreateGoal(client, { actorId: OWNER, operation: 'createGoal', mutationId: MUTATION, requestSha256: HASH, body: {
    id: GOAL, workspaceId: WORKSPACE, title: 'Goal', type: 'session_count', period: 'weekly', startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 1, targetUnit: 'count',
  } }), /NOT_FOUND/);
  assert.equal(goalInsert, false);
});

test('createGoal rejects owner injection, incompatible units and inverted periods before SQL', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  const base = { id: GOAL, workspaceId: WORKSPACE, title: 'Goal', period: 'weekly', startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 1, targetUnit: 'count' };
  await assert.rejects(applyCreateGoal(client, { actorId: OWNER, operation: 'createGoal', mutationId: MUTATION, requestSha256: HASH, body: { ...base, type: 'session_count', ownerId: OWNER } }), /VALIDATION_FAILED/);
  await assert.rejects(applyCreateGoal(client, { actorId: OWNER, operation: 'createGoal', mutationId: MUTATION, requestSha256: HASH, body: { ...base, type: 'focus_time' } }), /VALIDATION_FAILED/);
  await assert.rejects(applyCreateGoal(client, { actorId: OWNER, operation: 'createGoal', mutationId: MUTATION, requestSha256: HASH, body: { ...base, type: 'session_count', startsAt: base.endsAt, endsAt: base.startsAt } }), /VALIDATION_FAILED/);
  assert.equal(calls, 0);
});

test('createGoal applier fails closed for malformed database results', async () => {
  const client = { query: async (sql) => sql.includes('from df_private.workspaces')
    ? { rows: [{ owner_id: OWNER, id: WORKSPACE }] }
    : { rows: [{ id: GOAL, owner_id: OWNER, workspace_id: WORKSPACE, version: 0, status: 'active' }] } };
  await assert.rejects(applyCreateGoal(client, { actorId: OWNER, operation: 'createGoal', mutationId: MUTATION, requestSha256: HASH, body: {
    id: GOAL, workspaceId: WORKSPACE, title: 'Goal', type: 'session_count', period: 'weekly', startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 1, targetUnit: 'count',
  } }), /DEPENDENCY_UNAVAILABLE/);
});

test('createGoal applier rejects a foreign returned workspace row', async () => {
  let goalInsert = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: '55555555-5555-4555-8555-555555555555', id: WORKSPACE }] };
    goalInsert = true;
    return { rows: [{ id: GOAL, version: 1, status: 'active' }] };
  } };
  await assert.rejects(applyCreateGoal(client, { actorId: OWNER, operation: 'createGoal', mutationId: MUTATION, requestSha256: HASH, body: {
    id: GOAL, workspaceId: WORKSPACE, title: 'Goal', type: 'session_count', period: 'weekly', startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 1, targetUnit: 'count',
  } }), /NOT_FOUND/);
  assert.equal(goalInsert, false);
});

test('createGoal applier rejects foreign returned goal metadata', async () => {
  let goalInsert = false;
  const client = { query: async (sql) => {
    if (sql.includes('from df_private.workspaces')) return { rows: [{ owner_id: OWNER, id: WORKSPACE }] };
    goalInsert = true;
    return { rows: [{ id: GOAL, owner_id: '99999999-9999-4999-8999-999999999999', workspace_id: WORKSPACE, version: 1, status: 'active' }] };
  } };
  await assert.rejects(applyCreateGoal(client, { actorId: OWNER, operation: 'createGoal', mutationId: MUTATION, requestSha256: HASH, body: {
    id: GOAL, workspaceId: WORKSPACE, title: 'Goal', type: 'session_count', period: 'weekly', startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 1, targetUnit: 'count',
  } }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(goalInsert, true);
});

test('patchGoal updates only approved fields with owner and optimistic-version checks', async () => {
  let call;
  const client = { query: async (sql, params) => { call = { sql: sql.replace(/\s+/g, ' ').trim(), params }; return { rows: [{ id: GOAL, owner_id: OWNER, version: 4, status: 'active' }] }; } };
  const result = await applyPatchGoal(client, { actorId: OWNER, operation: 'patchGoal', resourceId: GOAL, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 3, title: 'Updated goal', description: null } });
  assert.deepEqual(result, { responseBody: { id: GOAL, version: 4, status: 'active' }, responseStatus: 200 });
  assert.match(call.sql, /update df_private\.goals set title = \$4, description = \$5, version = version \+ 1/i);
  assert.deepEqual(call.params, [GOAL, OWNER, 3, 'Updated goal', null]);
});

test('patchGoal rejects empty, malformed and stale changes', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  await assert.rejects(applyPatchGoal(client, { actorId: OWNER, operation: 'patchGoal', resourceId: GOAL, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 1 } }), /VALIDATION_FAILED/);
  await assert.rejects(applyPatchGoal(client, { actorId: OWNER, operation: 'patchGoal', resourceId: 'not-a-uuid', mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 1, title: 'Goal' } }), /VALIDATION_FAILED/);
  await assert.rejects(applyPatchGoal(client, { actorId: OWNER, operation: 'patchGoal', resourceId: GOAL, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 9, title: 'Goal' } }), /VERSION_CONFLICT/);
  assert.equal(calls, 1);
});

test('deleteGoal soft-deletes the owned goal and finalizes a canonical tombstone receipt', async () => {
  const client = { query: async () => ({ rows: [{ id: GOAL, owner_id: OWNER, version: 4, status: 'active', deleted_at: '2026-10-11T00:00:00.000Z' }] }) };
  const result = await applyDeleteGoal(client, { actorId: OWNER, operation: 'deleteGoal', resourceId: GOAL, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 3 } });
  assert.deepEqual(result.finalizeResponse('42'), { data: { tombstone: { id: GOAL, entity: 'goal', version: 4, deletedAt: '2026-10-11T00:00:00.000Z' }, receipt: { receiptId: MUTATION, mutationId: MUTATION, command: 'goal.delete', targetId: GOAL, entityVersion: 4, committedThrough: '42' } } });
});

test('deleteGoal rejects malformed, stale and already-deleted results', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  await assert.rejects(applyDeleteGoal(client, { actorId: OWNER, operation: 'deleteGoal', resourceId: GOAL, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 3, title: 'no' } }), /VALIDATION_FAILED/);
  await assert.rejects(applyDeleteGoal(client, { actorId: OWNER, operation: 'deleteGoal', resourceId: GOAL, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 3 } }), /VERSION_CONFLICT/);
  assert.equal(calls, 1);
});
