import assert from 'node:assert/strict';
import test from 'node:test';

const { applyTaskAction } = await import('../../supabase/functions/_shared/postgres-task-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const BODY = { id: TASK, expectedVersion: 2, action: 'complete', occurredAt: '2026-10-10T01:05:00.000Z' };

test('task action locks the owner task and applies a versioned completion', async () => {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.trimStart().startsWith('select')) return { rows: [{ id: TASK, owner_id: OWNER, status: 'in_progress', version: 2, deleted_at: null }] };
    return { rows: [{ id: TASK, owner_id: OWNER, version: 3, status: 'completed' }] };
  } };
  const result = await applyTaskAction(client, { actorId: OWNER, operation: 'applyTaskAction', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: BODY });
  assert.deepEqual(result, { responseBody: { id: TASK, version: 3, status: 'completed' }, responseStatus: 200 });
  assert.deepEqual(calls[0].params, [TASK, OWNER]);
  assert.deepEqual(calls[1].params, [TASK, OWNER, 2, 'completed', BODY.occurredAt]);
  assert.match(calls[1].sql, /version = \$3/);
});

test('task action rejects route/body mismatch, stale versions and invalid transitions', async () => {
  const client = { query: async (sql) => sql.trimStart().startsWith('select') ? { rows: [{ id: TASK, owner_id: OWNER, status: 'completed', version: 2, deleted_at: null }] } : { rows: [] } };
  await assert.rejects(applyTaskAction(client, { actorId: OWNER, operation: 'applyTaskAction', mutationId: MUTATION, resourceId: '33333333-3333-4333-8333-333333333333', requestSha256: HASH, body: BODY }), /VALIDATION_FAILED/);
  await assert.rejects(applyTaskAction(client, { actorId: OWNER, operation: 'applyTaskAction', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { ...BODY, expectedVersion: 1 } }), /VERSION_CONFLICT/);
  await assert.rejects(applyTaskAction(client, { actorId: OWNER, operation: 'applyTaskAction', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { ...BODY, expectedVersion: 2, action: 'begin' } }), /INVALID_TRANSITION/);
});

test('task archive uses the same owner/version predicate and rejects deleted rows', async () => {
  let updateCalls = 0;
  const client = { query: async (sql) => {
    if (sql.trimStart().startsWith('select')) return { rows: [{ id: TASK, owner_id: OWNER, status: 'pending', version: 2, deleted_at: '2026-10-10T00:00:00.000Z' }] };
    updateCalls += 1; return { rows: [] };
  } };
  await assert.rejects(applyTaskAction(client, { actorId: OWNER, operation: 'applyTaskAction', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: { id: TASK, expectedVersion: 2, action: 'archive', occurredAt: '2026-10-10T01:05:00.000Z' } }), /NOT_FOUND/);
  assert.equal(updateCalls, 0);
});

test('task action rejects foreign returned owner metadata before updating', async () => {
  let updateCalls = 0;
  const client = { query: async (sql) => {
    if (sql.trimStart().startsWith('select')) return { rows: [{ id: TASK, owner_id: '99999999-9999-4999-8999-999999999999', status: 'in_progress', version: 2, deleted_at: null }] };
    updateCalls += 1; return { rows: [{ id: TASK, version: 3, status: 'completed' }] };
  } };
  await assert.rejects(applyTaskAction(client, { actorId: OWNER, operation: 'applyTaskAction', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: BODY }), /NOT_FOUND/);
  assert.equal(updateCalls, 0);
});

test('task action rejects foreign returned update ownership metadata', async () => {
  const client = { query: async (sql) => {
    if (sql.trimStart().startsWith('select')) return { rows: [{ id: TASK, owner_id: OWNER, status: 'in_progress', version: 2, deleted_at: null }] };
    return { rows: [{ id: TASK, owner_id: '99999999-9999-4999-8999-999999999999', version: 3, status: 'completed' }] };
  } };
  await assert.rejects(applyTaskAction(client, { actorId: OWNER, operation: 'applyTaskAction', mutationId: MUTATION, resourceId: TASK, requestSha256: HASH, body: BODY }), /DEPENDENCY_UNAVAILABLE/);
});
