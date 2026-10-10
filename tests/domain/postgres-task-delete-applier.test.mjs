import assert from 'node:assert/strict';
import test from 'node:test';

const { applyDeleteTask } = await import('../../supabase/functions/_shared/postgres-task-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const MUTATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);

test('deleteTask soft-deletes the owned task and finalizes a task tombstone receipt', async () => {
  const client = { query: async () => ({ rows: [{ id: TASK, owner_id: OWNER, version: 4, status: 'pending', deleted_at: '2026-10-11T00:00:00.000Z' }] }) };
  const result = await applyDeleteTask(client, { actorId: OWNER, operation: 'deleteTask', resourceId: TASK, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 3 } });
  assert.deepEqual(result.finalizeResponse('42'), { data: { tombstone: { id: TASK, entity: 'task', version: 4, deletedAt: '2026-10-11T00:00:00.000Z' }, receipt: { receiptId: MUTATION, mutationId: MUTATION, command: 'task.delete', targetId: TASK, entityVersion: 4, committedThrough: '42' } } });
});

test('deleteTask rejects extra fields, stale versions and malformed returned rows', async () => {
  let calls = 0;
  const client = { query: async () => { calls += 1; return { rows: [] }; } };
  await assert.rejects(applyDeleteTask(client, { actorId: OWNER, operation: 'deleteTask', resourceId: TASK, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 3, title: 'no' } }), /VALIDATION_FAILED/);
  await assert.rejects(applyDeleteTask(client, { actorId: OWNER, operation: 'deleteTask', resourceId: TASK, mutationId: MUTATION, requestSha256: HASH, body: { expectedVersion: 3 } }), /VERSION_CONFLICT/);
  assert.equal(calls, 1);
});
