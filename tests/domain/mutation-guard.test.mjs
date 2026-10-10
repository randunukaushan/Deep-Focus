import assert from 'node:assert/strict';
import test from 'node:test';

const { decideOwnedMutation } = await import('../../supabase/functions/_shared/mutation-guard.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const MUTATION = '22222222-2222-4222-8222-222222222222';
const SHA = 'a'.repeat(64);
const base = { actorId: OWNER, resourceOwnerId: OWNER, operation: 'task.create', mutationId: MUTATION, requestSha256: SHA, existingReceipt: null };

test('mutation guard admits an owned new mutation', () => {
  assert.deepEqual(decideOwnedMutation(base), { action: 'execute', ownerId: OWNER, operation: 'task.create', mutationId: MUTATION });
});

test('mutation guard hides foreign ownership behind not-found', () => {
  assert.deepEqual(decideOwnedMutation({ ...base, resourceOwnerId: '33333333-3333-4333-8333-333333333333' }), { action: 'reject', reason: 'not_found' });
  assert.deepEqual(decideOwnedMutation({ ...base, resourceOwnerId: null }), { action: 'reject', reason: 'not_found' });
});

test('mutation guard replays the exact receipt but conflicts on changed intent', () => {
  const receipt = { ownerId: OWNER, operation: 'task.create', mutationId: MUTATION, requestSha256: SHA, responseBody: { data: { id: 'task-1' } }, responseStatus: 201 };
  assert.deepEqual(decideOwnedMutation({ ...base, existingReceipt: receipt }), { action: 'replay', responseBody: receipt.responseBody, responseStatus: 201 });
  assert.deepEqual(decideOwnedMutation({ ...base, requestSha256: 'b'.repeat(64), existingReceipt: receipt }), { action: 'reject', reason: 'idempotency_conflict' });
});

test('mutation guard rejects malformed actor, mutation and operation values', () => {
  assert.equal(decideOwnedMutation({ ...base, actorId: 'client-owner' }).reason, 'invalid_actor');
  assert.equal(decideOwnedMutation({ ...base, mutationId: 'not-a-uuid' }).reason, 'invalid_mutation');
  assert.equal(decideOwnedMutation({ ...base, operation: 'Task/Create' }).reason, 'invalid_mutation');
  assert.equal(decideOwnedMutation({ ...base, requestSha256: 'short' }).reason, 'invalid_mutation');
});
