import assert from 'node:assert/strict';
import test from 'node:test';

const { executeV2PushWithBatchReceipt, validateV2BatchReceiptReplay } = await import('../../supabase/functions/_shared/sync-v2-batch-receipt.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const BATCH = '22222222-2222-4222-8222-222222222222';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';

function harness(existing = null) {
  let receipt = existing; let executions = 0; let writes = 0;
  return {
    get executions() { return executions; }, get writes() { return writes; },
    execute: async () => { executions += 1; return { responseBody: { data: { ok: true } }, responseStatus: 200 }; },
    store: { withTransaction: async (operation) => operation({
      readReceipt: async (ownerId, batchId) => receipt && receipt.ownerId === ownerId && receipt.batchId === batchId ? receipt : null,
      writeReceipt: async (value) => { writes += 1; receipt = value; },
    }) },
    receipt: () => receipt,
  };
}

const input = (store, overrides = {}) => ({ ownerId: OWNER, batchId: BATCH, requestSha256: HASH, createdAt: NOW, store, execute: async () => ({ responseBody: { data: { ok: true } }, responseStatus: 200 }), ...overrides });

test('batch receipt executes once and exact retry replays without executing again', async () => {
  const h = harness();
  assert.equal((await executeV2PushWithBatchReceipt(input(h.store, { execute: h.execute }))).action, 'applied');
  const replay = await executeV2PushWithBatchReceipt(input(h.store, { execute: h.execute }));
  assert.equal(replay.action, 'replayed');
  assert.equal(h.executions, 1);
  assert.equal(h.writes, 1);
});

test('changed batch intent conflicts before execution', async () => {
  const h = harness();
  await executeV2PushWithBatchReceipt(input(h.store, { execute: h.execute }));
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(h.store, { requestSha256: 'b'.repeat(64) })), /IDEMPOTENCY_CONFLICT/);
  assert.equal(h.executions, 1);
});

test('receipt write failure is surfaced and a later retry can execute again', async () => {
  let fail = true; let executions = 0; let writes = 0;
  const store = { withTransaction: async (operation) => operation({
    readReceipt: async () => null,
    writeReceipt: async () => { writes += 1; if (fail) throw new Error('receipt storage failed'); },
  }) };
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(store, { execute: async () => { executions += 1; return { responseBody: { data: { ok: true } }, responseStatus: 200 }; } })), /receipt storage failed/);
  fail = false;
  assert.equal((await executeV2PushWithBatchReceipt(input(store, { execute: async () => { executions += 1; return { responseBody: { data: { ok: true } }, responseStatus: 200 }; } }))).action, 'applied');
  assert.equal(executions, 2);
  assert.equal(writes, 2);
});

test('foreign or malformed replay receipts fail closed', () => {
  const receipt = { ownerId: OWNER, batchId: BATCH, requestSha256: HASH, responseBody: { data: {} }, responseStatus: 200, createdAt: NOW };
  assert.throws(() => validateV2BatchReceiptReplay({ ...receipt, ownerId: '33333333-3333-4333-8333-333333333333' }, { ownerId: OWNER, batchId: BATCH, requestSha256: HASH }), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => validateV2BatchReceiptReplay({ ...receipt, responseBody: null }, { ownerId: OWNER, batchId: BATCH, requestSha256: HASH }), /DEPENDENCY_UNAVAILABLE/);
});

test('unsafe receipt request identity fails before opening storage', async () => {
  let opened = false;
  const store = { withTransaction: async () => { opened = true; return null; } };
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(store, { ownerId: 'not-an-owner' })), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('oversized batch response fails before receipt write', async () => {
  let writes = 0;
  const store = { withTransaction: async (operation) => operation({ readReceipt: async () => null, writeReceipt: async () => { writes += 1; } }) };
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(store, { execute: async () => ({ responseBody: { data: 'x'.repeat(262144) }, responseStatus: 200 }) })), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(writes, 0);
});

test('non-finite batch response values fail before receipt write', async () => {
  let writes = 0;
  const store = { withTransaction: async (operation) => operation({ readReceipt: async () => null, writeReceipt: async () => { writes += 1; } }) };
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(store, { execute: async () => ({ responseBody: { data: { score: Number.POSITIVE_INFINITY } }, responseStatus: 200 }) })), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(writes, 0);
});

test('coercion-prone batch response values fail before receipt write', async () => {
  let writes = 0;
  const store = { withTransaction: async (operation) => operation({ readReceipt: async () => null, writeReceipt: async () => { writes += 1; } }) };
  class CustomValue { constructor() { this.ok = true; } }
  const sparse = [];
  sparse.length = 1;
  for (const responseBody of [{ data: { at: new Date('2026-10-10T00:00:00.000Z') } }, { data: { missing: undefined } }, { data: { value: new CustomValue() } }, { data: { values: sparse } }]) {
    await assert.rejects(() => executeV2PushWithBatchReceipt(input(store, { execute: async () => ({ responseBody, responseStatus: 200 }) })), /DEPENDENCY_UNAVAILABLE/);
  }
  assert.equal(writes, 0);
});
