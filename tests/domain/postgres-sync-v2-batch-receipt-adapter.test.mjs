import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresV2BatchReceiptStore } = await import('../../supabase/functions/_shared/postgres-sync-v2-batch-receipt-adapter.ts');
const { executeV2PushWithBatchReceipt } = await import('../../supabase/functions/_shared/sync-v2-batch-receipt.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const BATCH = '22222222-2222-4222-8222-222222222222';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';

const insertedRow = { owner_id: OWNER, batch_id: BATCH, request_sha256: HASH, response_body: { data: { ok: true } }, response_status: 200, created_at: NOW };

function harness({ rows = [], inserts = [insertedRow] } = {}) {
  const calls = [];
  const client = { async query(sql, params) { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params: [...params] }); if (sql.includes('select owner_id, batch_id')) return { rows }; if (sql.trimStart().startsWith('insert into df_private.sync_v2_batch_receipts')) return { rows: inserts }; throw new Error('unexpected query'); } };
  const runner = { withTransaction: async (run) => run(client) };
  return { store: createPostgresV2BatchReceiptStore({ runner }), calls };
}

const input = (store, overrides = {}) => ({ ownerId: OWNER, batchId: BATCH, requestSha256: HASH, createdAt: NOW, store, execute: async () => ({ responseBody: { data: { ok: true } }, responseStatus: 200 }), ...overrides });

test('PostgreSQL batch receipt adapter locks the owner row and writes returned identity', async () => {
  const h = harness();
  const result = await executeV2PushWithBatchReceipt(input(h.store));
  assert.equal(result.action, 'applied');
  assert.match(h.calls[0].sql, /where owner_id = \$1 and batch_id = \$2 for update/i);
  const insert = h.calls.find((call) => call.sql.startsWith('insert into df_private.sync_v2_batch_receipts'));
  assert.deepEqual(insert.params.slice(0, 3), [OWNER, BATCH, HASH]);
  assert.deepEqual(JSON.parse(insert.params[3]), { data: { ok: true } });
});

test('PostgreSQL batch receipt adapter replays an exact stored response without executing', async () => {
  let executions = 0;
  const h = harness({ rows: [{ owner_id: OWNER, batch_id: BATCH, request_sha256: HASH, response_body: { data: { replay: true } }, response_status: 200, created_at: NOW }] });
  const result = await executeV2PushWithBatchReceipt(input(h.store, { execute: async () => { executions += 1; return { responseBody: {}, responseStatus: 200 }; } }));
  assert.equal(result.action, 'replayed');
  assert.deepEqual(result.responseBody, { data: { replay: true } });
  assert.equal(executions, 0);
  assert.equal(h.calls.some((call) => call.sql.startsWith('insert into df_private.sync_v2_batch_receipts')), false);
});

test('PostgreSQL batch receipt adapter fails closed for foreign or malformed rows', async () => {
  for (const row of [
    { owner_id: '33333333-3333-4333-8333-333333333333', batch_id: BATCH, request_sha256: HASH, response_body: {}, response_status: 200, created_at: NOW },
    { owner_id: OWNER, batch_id: BATCH, request_sha256: HASH, response_body: [], response_status: 200, created_at: NOW },
    { owner_id: OWNER, batch_id: BATCH, request_sha256: 'bad', response_body: {}, response_status: 200, created_at: NOW },
  ]) {
    const h = harness({ rows: [row] });
    await assert.rejects(() => executeV2PushWithBatchReceipt(input(h.store)), /DEPENDENCY_UNAVAILABLE/);
  }
});

test('PostgreSQL batch receipt adapter fails closed for an oversized stored response', async () => {
  const h = harness({ rows: [{ owner_id: OWNER, batch_id: BATCH, request_sha256: HASH, response_body: { data: 'x'.repeat(262144) }, response_status: 200, created_at: NOW }] });
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(h.store)), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL batch receipt adapter rejects a foreign returned insert row', async () => {
  const h = harness({ inserts: [{ ...insertedRow, owner_id: '33333333-3333-4333-8333-333333333333' }] });
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(h.store)), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL batch receipt adapter rejects altered returned receipt fields', async () => {
  const h = harness({ inserts: [{ ...insertedRow, request_sha256: 'b'.repeat(64), response_status: 200, response_body: { data: { altered: true } } }] });
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(h.store)), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL batch receipt adapter validates identity before querying', async () => {
  const h = harness();
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(h.store, { ownerId: 'bad' })), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('PostgreSQL batch receipt adapter fails closed for malformed results and runner configuration', async () => {
  const malformedRead = createPostgresV2BatchReceiptStore({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows: null }) }) } });
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(malformedRead)), /DEPENDENCY_UNAVAILABLE/);

  const duplicateRead = createPostgresV2BatchReceiptStore({ runner: { withTransaction: async (run) => run({ query: async () => ({ rows: [{}, {}] }) }) } });
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(duplicateRead)), /DEPENDENCY_UNAVAILABLE/);

  assert.throws(() => createPostgresV2BatchReceiptStore({ runner: {} }), /VALIDATION_FAILED/);
});

test('PostgreSQL batch receipt adapter fails closed on sparse result rows', async () => {
  const sparse = [];
  sparse[1] = insertedRow;
  const store = createPostgresV2BatchReceiptStore({ runner: {
    withTransaction: async (run) => run({ query: async () => ({ rows: sparse }) }),
  } });
  await assert.rejects(() => executeV2PushWithBatchReceipt(input(store)), /DEPENDENCY_UNAVAILABLE/);
});

test('PostgreSQL batch receipt adapter rejects runtime-confused receipt fields', async () => {
  const h = harness();
  await assert.rejects(() => h.store.withTransaction(async (transaction) => transaction.readReceipt(Symbol('owner'), BATCH)), /VALIDATION_FAILED/);
  await assert.rejects(() => h.store.withTransaction(async (transaction) => transaction.readReceipt(OWNER, Symbol('batch'))), /VALIDATION_FAILED/);
  await assert.rejects(() => h.store.withTransaction(async (transaction) => transaction.writeReceipt({ ownerId: OWNER, batchId: BATCH, requestSha256: Symbol('hash'), responseBody: {}, responseStatus: 200, createdAt: NOW })), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('PostgreSQL batch receipt adapter rejects coercion-prone response bodies before SQL', async () => {
  const h = harness();
  await assert.rejects(() => h.store.withTransaction(async (transaction) => transaction.writeReceipt({
    ownerId: OWNER, batchId: BATCH, requestSha256: HASH, responseBody: { missing: undefined }, responseStatus: 200, createdAt: NOW,
  })), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});
