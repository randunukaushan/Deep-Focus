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

test('mutation guard refuses malformed stored receipt status or payload', () => {
  for (const receipt of [
    { ownerId: OWNER, operation: 'task.create', mutationId: MUTATION, requestSha256: SHA, responseBody: { ok: true }, responseStatus: 500 },
    { ownerId: OWNER, operation: 'task.create', mutationId: MUTATION, requestSha256: SHA, responseBody: ['not-an-object'], responseStatus: 201 },
  ]) assert.deepEqual(decideOwnedMutation({ ...base, existingReceipt: receipt }), { action: 'reject', reason: 'idempotency_conflict' });
});

test('mutation guard refuses oversized stored receipt payloads', () => {
  const receipt = { ownerId: OWNER, operation: 'task.create', mutationId: MUTATION, requestSha256: SHA, responseBody: { payload: 'x'.repeat(262145) }, responseStatus: 201 };
  assert.deepEqual(decideOwnedMutation({ ...base, existingReceipt: receipt }), { action: 'reject', reason: 'idempotency_conflict' });
});

test('mutation guard refuses coercion-prone stored receipt payloads', () => {
  class CustomValue { constructor() { this.ok = true; } }
  for (const responseBody of [{ at: new Date('2026-10-10T00:00:00.000Z') }, { missing: undefined }, { value: new CustomValue() }]) {
    assert.deepEqual(decideOwnedMutation({ ...base, existingReceipt: { ownerId: OWNER, operation: 'task.create', mutationId: MUTATION, requestSha256: SHA, responseBody, responseStatus: 201 } }), { action: 'reject', reason: 'idempotency_conflict' });
  }
});

test('mutation guard rejects unsafe runtime identity values without regex exceptions', () => {
  assert.deepEqual(decideOwnedMutation({ ...base, actorId: Symbol('actor') }), { action: 'reject', reason: 'invalid_actor' });
  assert.deepEqual(decideOwnedMutation({ ...base, mutationId: Symbol('mutation') }), { action: 'reject', reason: 'invalid_mutation' });
  assert.deepEqual(decideOwnedMutation({ ...base, operation: Symbol('operation') }), { action: 'reject', reason: 'invalid_mutation' });
  assert.deepEqual(decideOwnedMutation({ ...base, requestSha256: Symbol('hash') }), { action: 'reject', reason: 'invalid_mutation' });
  assert.deepEqual(decideOwnedMutation({ ...base, existingReceipt: { ...base, requestSha256: Symbol('hash') } }), { action: 'reject', reason: 'idempotency_conflict' });
});
