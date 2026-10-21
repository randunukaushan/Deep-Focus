import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAiProposalStore } = await import('../../supabase/functions/_shared/postgres-ai-proposal-adapter.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const PROPOSAL = '22222222-2222-4222-8222-222222222222';
const REQUEST = '33333333-3333-4333-8333-333333333333';
const OPERATION = '44444444-4444-4444-8444-444444444444';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';
const row = { owner_id: OWNER, id: PROPOSAL, contract_version: 1, version: 2, generation_request_id: REQUEST, action_type: 'break_down_task', expires_at: '2026-10-12T00:00:00.000Z', review_digest: HASH, state: 'ready', input_versions: [], operations: [{ id: OPERATION }], selected_operation_ids: null, applied_at: null };

function harness({ rows = [row], updateRows = [{ ...row, state: 'applied', selected_operation_ids: [OPERATION], applied_at: NOW }] } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.trimStart().startsWith('select')) return { rows };
    if (sql.trimStart().startsWith('update')) return { rows: updateRows };
    return { rows: [] };
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('proposal adapter loads an owner-bound ready proposal under a row lock', async () => {
  const h = harness();
  const result = await h.runner.withTransaction((client) => createPostgresAiProposalStore({ runner: { withTransaction: async (run) => run(client) } }).withOwnerTransaction(OWNER, (transaction) => transaction.load(OWNER, PROPOSAL)));
  assert.equal(result?.ownerId, OWNER);
  assert.equal(result?.state, 'ready');
  assert.equal(h.calls[0].sql.includes('for update'), true);
});

test('proposal adapter marks only the matching live version and digest applied', async () => {
  const h = harness();
  const store = createPostgresAiProposalStore({ runner: h.runner });
  const result = await store.withOwnerTransaction(OWNER, (transaction) => transaction.markApplied({ ownerId: OWNER, proposalId: PROPOSAL, expectedVersion: 2, reviewDigest: HASH, selectedOperationIds: [OPERATION], appliedAt: NOW, now: NOW }));
  assert.equal(result.state, 'applied');
  assert.match(h.calls[0].sql, /state = 'ready'/);
  assert.deepEqual(h.calls[0].params.slice(0, 5), [OWNER, PROPOSAL, 2, HASH, NOW]);
});

test('proposal adapter rejects malformed stored proposal data fail-closed', async () => {
  const h = harness({ rows: [{ ...row, operations: 'not-array' }] });
  const store = createPostgresAiProposalStore({ runner: h.runner });
  await assert.rejects(() => store.withOwnerTransaction(OWNER, (transaction) => transaction.load(OWNER, PROPOSAL)), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
  const nonFinite = harness({ rows: [{ ...row, operations: [{ id: OPERATION, value: Number.NaN }] }] });
  const nonFiniteStore = createPostgresAiProposalStore({ runner: nonFinite.runner });
  await assert.rejects(() => nonFiniteStore.withOwnerTransaction(OWNER, (transaction) => transaction.load(OWNER, PROPOSAL)), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
});

test('proposal adapter rejects JSON-coercible operation payload shapes', async () => {
  const sparse = []; sparse[1] = 'gap';
  const symbolBearing = []; symbolBearing.push('value'); symbolBearing[Symbol('metadata')] = 'hidden';
  class CustomOperation { constructor() { this.value = 'hidden-shape'; } }
  for (const operation of [{ values: sparse }, { values: symbolBearing }, new CustomOperation()]) {
    const h = harness({ rows: [{ ...row, operations: [operation] }] });
    const store = createPostgresAiProposalStore({ runner: h.runner });
    await assert.rejects(() => store.withOwnerTransaction(OWNER, (transaction) => transaction.load(OWNER, PROPOSAL)), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
  }
});

test('proposal adapter rejects sparse selected operation IDs before replay or SQL', async () => {
  const sparse = [];
  sparse.length = 1;
  const input = { ownerId: OWNER, proposalId: PROPOSAL, expectedVersion: 2, reviewDigest: HASH, selectedOperationIds: sparse, appliedAt: NOW, now: NOW };
  const write = harness();
  const store = createPostgresAiProposalStore({ runner: write.runner });
  await assert.rejects(() => store.withOwnerTransaction(OWNER, (transaction) => transaction.markApplied(input)), (error) => error?.code === 'VALIDATION_FAILED');
  assert.equal(write.calls.length, 0);

  const stored = { ...row, state: 'applied', selected_operation_ids: sparse, applied_at: NOW };
  const read = harness({ rows: [stored] });
  await assert.rejects(() => createPostgresAiProposalStore({ runner: read.runner }).withOwnerTransaction(OWNER, (transaction) => transaction.load(OWNER, PROPOSAL)), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
});

test('proposal adapter rejects an expired or stale apply without pretending success', async () => {
  const h = harness({ updateRows: [] });
  const store = createPostgresAiProposalStore({ runner: h.runner });
  await assert.rejects(() => store.withOwnerTransaction(OWNER, (transaction) => transaction.markApplied({ ownerId: OWNER, proposalId: PROPOSAL, expectedVersion: 1, reviewDigest: HASH, selectedOperationIds: [OPERATION], appliedAt: NOW, now: NOW })), (error) => error?.code === 'AI_PROPOSAL_MISMATCH');
});

test('proposal adapter refuses foreign owner access before opening a transaction', async () => {
  let opened = false;
  const store = createPostgresAiProposalStore({ runner: { withTransaction: async () => { opened = true; throw new Error('must not open'); } } });
  assert.throws(() => store.withOwnerTransaction('bad', async () => null), (error) => error?.code === 'VALIDATION_FAILED');
  assert.equal(opened, false);
});

test('proposal adapter rejects runtime type confusion before SQL', async () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  assert.throws(() => createPostgresAiProposalStore({ runner }).withOwnerTransaction(Symbol('owner'), async () => null), /VALIDATION_FAILED/);
  const h = harness();
  const store = createPostgresAiProposalStore({ runner: h.runner });
  await assert.rejects(() => store.withOwnerTransaction(OWNER, (transaction) => transaction.markApplied({
    ownerId: OWNER, proposalId: PROPOSAL, expectedVersion: 2, reviewDigest: Symbol('hash'),
    selectedOperationIds: [OPERATION], appliedAt: NOW, now: NOW,
  })), /VALIDATION_FAILED/);
  const malformed = harness({ rows: [null] });
  await assert.rejects(() => createPostgresAiProposalStore({ runner: malformed.runner }).withOwnerTransaction(OWNER, (transaction) => transaction.load(OWNER, PROPOSAL)), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(opened, false);
});

test('proposal adapter fails closed on sparse result rows before proposal state access', async () => {
  const sparse = [];
  sparse[1] = row;
  let reads = 0;
  const client = { query: async () => {
    reads += 1;
    return { rows: sparse };
  } };
  const store = createPostgresAiProposalStore({ runner: { withTransaction: async (run) => run(client) } });
  await assert.rejects(() => store.withOwnerTransaction(OWNER, (transaction) => transaction.load(OWNER, PROPOSAL)), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(reads, 1);
});
