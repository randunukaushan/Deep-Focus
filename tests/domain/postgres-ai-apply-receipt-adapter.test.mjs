import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAiApplyReceiptStore } = await import('../../supabase/functions/_shared/postgres-ai-apply-receipt-adapter.ts');
const { applyAiProposalWithReceipt } = await import('../../supabase/functions/_shared/ai-apply-receipt-guard.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const PROPOSAL = '22222222-2222-4222-8222-222222222222';
const MUTATION = '33333333-3333-4333-8333-333333333333';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';
const receipt = { ownerId: OWNER, proposalId: PROPOSAL, proposalVersion: 1, reviewDigest: HASH, mutationId: MUTATION, requestSha256: HASH, responseBody: { ok: true }, responseStatus: 200, committedThrough: '7', appliedAt: NOW };
const row = { owner_id: OWNER, proposal_id: PROPOSAL, proposal_version: 1, review_digest: HASH, mutation_id: MUTATION, request_sha256: HASH, response_body: { ok: true }, response_status: 200, committed_through: '7', applied_at: NOW };

function harness({ rows = [], insertRows = [row] } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.trimStart().startsWith('select')) return { rows };
    if (sql.trimStart().startsWith('insert')) return { rows: insertRows };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('PostgreSQL AI receipt adapter locks both lookup paths and writes owner-bound receipt', async () => {
  const h = harness();
  let writes = 0;
  const result = await applyAiProposalWithReceipt({ intent: receipt, store: createPostgresAiApplyReceiptStore({ runner: h.runner }), apply: async (transaction) => {
    writes += 1;
    await transaction.writeReceipt(receipt);
    return receipt;
  } });
  assert.deepEqual(result, { action: 'applied', receipt });
  assert.equal(writes, 1);
  assert.equal(h.calls.filter((call) => call.sql.includes('for update')).length, 2);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.ai_apply_receipts')), true);
});

test('PostgreSQL AI receipt adapter replays a matching receipt without writing again', async () => {
  const h = harness({ rows: [row] });
  let writes = 0;
  const result = await applyAiProposalWithReceipt({ intent: receipt, store: createPostgresAiApplyReceiptStore({ runner: h.runner }), apply: async () => { writes += 1; return receipt; } });
  assert.deepEqual(result, { action: 'replayed', receipt });
  assert.equal(writes, 0);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.ai_apply_receipts')), false);
});

test('PostgreSQL AI receipt adapter rejects a malformed stored row fail-closed', async () => {
  const h = harness({ rows: [{ ...row, response_body: 'not-object' }] });
  await assert.rejects(() => applyAiProposalWithReceipt({ intent: receipt, store: createPostgresAiApplyReceiptStore({ runner: h.runner }), apply: async () => receipt }), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
});

test('PostgreSQL AI receipt adapter rejects foreign returned metadata', async () => {
  const h = harness({ insertRows: [{ owner_id: '44444444-4444-4444-8444-444444444444', proposal_id: PROPOSAL, mutation_id: MUTATION }] });
  await assert.rejects(() => applyAiProposalWithReceipt({ intent: receipt, store: createPostgresAiApplyReceiptStore({ runner: h.runner }), apply: async (transaction) => { await transaction.writeReceipt(receipt); return receipt; } }), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
});

test('PostgreSQL AI receipt adapter rejects altered returned receipt fields', async () => {
  const h = harness({ insertRows: [{ ...row, proposal_version: 9, request_sha256: 'b'.repeat(64), response_status: 201 }] });
  await assert.rejects(() => applyAiProposalWithReceipt({ intent: receipt, store: createPostgresAiApplyReceiptStore({ runner: h.runner }), apply: async (transaction) => { await transaction.writeReceipt(receipt); return receipt; } }), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
});

test('PostgreSQL AI receipt adapter rejects invalid owner before opening a transaction', async () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  await assert.rejects(() => applyAiProposalWithReceipt({ intent: { ...receipt, ownerId: 'bad' }, store: createPostgresAiApplyReceiptStore({ runner }), apply: async () => receipt }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('PostgreSQL AI receipt adapter rejects runtime type confusion before SQL', async () => {
  const h = harness();
  const transaction = createPostgresAiApplyReceiptStore({ runner: h.runner });
  assert.throws(() => transaction.withOwnerTransaction(Symbol('owner'), async () => receipt), /VALIDATION_FAILED/);
  await assert.rejects(() => transaction.withOwnerTransaction(OWNER, async (tx) => tx.readByMutation(Symbol('owner'), MUTATION)), /VALIDATION_FAILED/);
  await assert.rejects(() => transaction.withOwnerTransaction(OWNER, async (tx) => tx.writeReceipt({ ...receipt, requestSha256: Symbol('hash') })), /VALIDATION_FAILED/);
  assert.equal(h.calls.length, 0);
});

test('PostgreSQL AI receipt adapter rejects coercion-prone response bodies before SQL', async () => {
  const h = harness();
  await assert.rejects(() => applyAiProposalWithReceipt({
    intent: receipt,
    store: createPostgresAiApplyReceiptStore({ runner: h.runner }),
    apply: async (transaction) => {
      await transaction.writeReceipt({ ...receipt, responseBody: { missing: undefined } });
      return receipt;
    },
  }), /VALIDATION_FAILED/);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.ai_apply_receipts')), false);
});

test('PostgreSQL AI receipt adapter fails closed on sparse lookup rows before apply', async () => {
  const sparse = [];
  sparse[1] = row;
  let applyCalls = 0;
  const h = harness({ rows: sparse });
  await assert.rejects(() => applyAiProposalWithReceipt({
    intent: receipt,
    store: createPostgresAiApplyReceiptStore({ runner: h.runner }),
    apply: async () => { applyCalls += 1; return receipt; },
  }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(applyCalls, 0);
});
