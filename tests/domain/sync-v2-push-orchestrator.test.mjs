import assert from 'node:assert/strict';
import test from 'node:test';

const { executeSyncV2Push } = await import('../../supabase/functions/_shared/sync-v2-push-orchestrator.ts');
const { SafeBoundaryError } = await import('../../supabase/functions/_shared/server-boundary.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const MUTATION_A = '33333333-3333-4333-8333-333333333333';
const MUTATION_B = '44444444-4444-4444-8444-444444444444';
const receipt = (item) => ({ mutationId: item.mutationId, command: item.command, targetId: item.targetId, status: 'applied', receiptId: item.mutationId, entityVersion: 2, committedThrough: '9' });
const push = () => ({ contractVersion: 2, privacyEpoch: '4', items: [
  { mutationId: MUTATION_A, command: 'task.delete', targetId: TASK, body: { expectedVersion: 1 } },
  { mutationId: MUTATION_B, command: 'task.delete', targetId: TASK, body: { expectedVersion: 2 } },
] });

test('V2 push rejects an epoch mismatch before executing any item', async () => {
  let executions = 0;
  await assert.rejects(() => executeSyncV2Push({ ownerId: OWNER, value: push(), readCurrentEpoch: async () => '5', executeItem: async () => { executions += 1; return {}; } }), /SYNC_RESET_REQUIRED/);
  assert.equal(executions, 0);
});

test('V2 push distinguishes an unavailable epoch reader from a real reset', async () => {
  await assert.rejects(() => executeSyncV2Push({ ownerId: OWNER, value: push(), readCurrentEpoch: async () => 'not-a-valid-epoch', executeItem: async () => receipt(push().items[0]) }), /DEPENDENCY_UNAVAILABLE/);
  await assert.rejects(() => executeSyncV2Push({ ownerId: OWNER, value: push(), readCurrentEpoch: async () => '5', executeItem: async () => receipt(push().items[0]) }), /SYNC_RESET_REQUIRED/);
  await assert.rejects(() => executeSyncV2Push({ ownerId: OWNER, value: push(), readCurrentEpoch: null, executeItem: async () => receipt(push().items[0]) }), /DEPENDENCY_UNAVAILABLE/);
});

test('V2 push executes in input order and binds every call to the server owner', async () => {
  const calls = [];
  const result = await executeSyncV2Push({ ownerId: OWNER, value: push(), readCurrentEpoch: async (ownerId) => { calls.push(['epoch', ownerId]); return '4'; }, executeItem: async ({ ownerId, item }) => { calls.push(['execute', ownerId, item.mutationId]); return receipt(item); } });
  assert.deepEqual(result.data.outcomes.map((outcome) => outcome.mutationId), [MUTATION_A, MUTATION_B]);
  assert.deepEqual(calls.filter(([kind]) => kind === 'execute'), [['execute', OWNER, MUTATION_A], ['execute', OWNER, MUTATION_B]]);
});

test('epoch change after a committed item stops later execution and returns retryable reset outcomes', async () => {
  let reads = 0; const executed = [];
  const result = await executeSyncV2Push({ ownerId: OWNER, value: push(), readCurrentEpoch: async () => (++reads < 3 ? '4' : '5'), executeItem: async ({ item }) => { executed.push(item.mutationId); return receipt(item); } });
  assert.deepEqual(executed, [MUTATION_A]);
  assert.equal(result.data.privacyEpoch, '5');
  assert.deepEqual(result.data.outcomes, [receipt(push().items[0]), { mutationId: MUTATION_B, command: 'task.delete', targetId: TASK, status: 'retryable', code: 'SYNC_RESET_REQUIRED' }]);
});

test('malformed executor results become safe retry outcomes and do not fabricate receipts', async () => {
  const result = await executeSyncV2Push({ ownerId: OWNER, value: { ...push(), items: [push().items[0]] }, readCurrentEpoch: async () => '4', executeItem: async () => { throw new Error('private database detail'); } });
  assert.deepEqual(result.data.outcomes, [{ mutationId: MUTATION_A, command: 'task.delete', targetId: TASK, status: 'retryable', code: 'DEPENDENCY_UNAVAILABLE' }]);
  assert.equal('receiptId' in result.data.outcomes[0], false);
});

test('safe domain errors remain per-item outcomes', async () => {
  const result = await executeSyncV2Push({ ownerId: OWNER, value: { ...push(), items: [push().items[0]] }, readCurrentEpoch: async () => '4', executeItem: async () => { throw new SafeBoundaryError(409, 'VERSION_CONFLICT'); } });
  assert.deepEqual(result.data.outcomes[0], { mutationId: MUTATION_A, command: 'task.delete', targetId: TASK, status: 'rejected', code: 'VERSION_CONFLICT' });
});
