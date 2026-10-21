import assert from 'node:assert/strict';
import test from 'node:test';

const { handleSyncV2PushRequest } = await import('../../supabase/functions/_shared/sync-v2-push-handler.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const TASK = '22222222-2222-4222-8222-222222222222';
const MUTATION = '33333333-3333-4333-8333-333333333333';
const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': '44444444-4444-4444-8444-444444444444' };
const body = JSON.stringify({ contractVersion: 2, privacyEpoch: '4', items: [{ mutationId: MUTATION, command: 'task.delete', targetId: TASK, body: { expectedVersion: 1 } }] });
function store() { let receipt = null; return { withTransaction: async (operation) => operation({ readReceipt: async () => receipt, writeReceipt: async (value) => { receipt = value; } }) }; }
function common() { return { now: '2026-10-11T00:00:00.000Z', batchReceiptStore: store() }; }

test('V2 push handler returns the versioned response and passes only the verified owner downstream', async () => {
  let received;
  const result = await handleSyncV2PushRequest({ ...common(), ownerId: OWNER, headers, bodyText: body, readCurrentEpoch: async (ownerId) => { received = { ownerId }; return '4'; }, executeItem: async ({ ownerId, item }) => { received = { ...received, ownerId, mutationId: item.mutationId }; return { ...item, status: 'applied', receiptId: MUTATION, entityVersion: 2, committedThrough: '9' }; } });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.contractVersion, 2);
  assert.deepEqual(received, { ownerId: OWNER, mutationId: MUTATION });
});

test('V2 push handler replays an exact retry without executing the batch twice', async () => {
  const batchReceiptStore = store();
  let executions = 0;
  const input = { now: '2026-10-11T00:00:00.000Z', batchReceiptStore, ownerId: OWNER, headers, bodyText: body,
    readCurrentEpoch: async () => '4', executeItem: async ({ item }) => { executions += 1; return { ...item, status: 'applied', receiptId: MUTATION, entityVersion: 2, committedThrough: '9' }; } };
  const first = await handleSyncV2PushRequest(input);
  const retry = await handleSyncV2PushRequest(input);
  assert.equal(first.status, 200);
  assert.deepEqual(retry, first);
  assert.equal(executions, 1);
});

test('V2 push handler rejects a changed body reusing a batch idempotency key', async () => {
  const batchReceiptStore = store();
  let executions = 0;
  const first = await handleSyncV2PushRequest({ now: '2026-10-11T00:00:00.000Z', batchReceiptStore, ownerId: OWNER, headers, bodyText: body,
    readCurrentEpoch: async () => '4', executeItem: async ({ item }) => { executions += 1; return { ...item, status: 'applied', receiptId: MUTATION, entityVersion: 2, committedThrough: '9' }; } });
  const changedBody = JSON.stringify({ contractVersion: 2, privacyEpoch: '4', items: [{ mutationId: MUTATION, command: 'task.delete', targetId: TASK, body: { expectedVersion: 2 } }] });
  const conflict = await handleSyncV2PushRequest({ now: '2026-10-11T00:00:00.000Z', batchReceiptStore, ownerId: OWNER, headers, bodyText: changedBody,
    readCurrentEpoch: async () => '4', executeItem: async () => { executions += 1; return {}; } });
  assert.equal(first.status, 200);
  assert.deepEqual(conflict, { status: 409, body: { error: { code: 'IDEMPOTENCY_CONFLICT', retryable: false } } });
  assert.equal(executions, 1);
});

test('V2 push handler rejects missing batch idempotency, content type and body before execution', async () => {
  for (const variant of [
    { headers: { 'Content-Type': 'application/json' }, bodyText: body },
    { headers: { 'Idempotency-Key': headers['Idempotency-Key'] }, bodyText: body },
    { headers, bodyText: undefined },
  ]) {
    let executed = false;
    const result = await handleSyncV2PushRequest({ ...common(), ...variant, ownerId: OWNER, readCurrentEpoch: async () => '4', executeItem: async () => { executed = true; return {}; } });
    assert.equal(result.status, 400);
    assert.equal(executed, false);
  }
});

test('V2 push handler maps malformed JSON and stale epoch to safe public errors', async () => {
  const malformed = await handleSyncV2PushRequest({ ...common(), ownerId: OWNER, headers, bodyText: '{', readCurrentEpoch: async () => '4', executeItem: async () => ({}) });
  assert.deepEqual(malformed, { status: 400, body: { error: { code: 'VALIDATION_FAILED', retryable: false } } });
  const stale = await handleSyncV2PushRequest({ ...common(), ownerId: OWNER, headers, bodyText: body, readCurrentEpoch: async () => '5', executeItem: async () => ({}) });
  assert.deepEqual(stale, { status: 410, body: { error: { code: 'SYNC_RESET_REQUIRED', retryable: false } } });
});

test('V2 push handler keeps item-level retry outcomes in a successful batch response', async () => {
  const result = await handleSyncV2PushRequest({ ...common(), ownerId: OWNER, headers, bodyText: body, readCurrentEpoch: async () => '4', executeItem: async () => { throw new Error('hidden storage detail'); } });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body.data.outcomes[0], { mutationId: MUTATION, command: 'task.delete', targetId: TASK, status: 'retryable', code: 'DEPENDENCY_UNAVAILABLE' });
});
