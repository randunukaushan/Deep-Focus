import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAiProposalApplyStore } = await import('../../supabase/functions/_shared/postgres-ai-proposal-apply-adapter.ts');
const { applyAiProposalAtomically } = await import('../../supabase/functions/_shared/ai-proposal-apply-transaction.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const PROPOSAL = '22222222-2222-4222-8222-222222222222';
const MUTATION = '33333333-3333-4333-8333-333333333333';
const OPERATION = '44444444-4444-4444-8444-444444444444';
const REQUEST = '55555555-5555-4555-8555-555555555555';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';
const intent = { ownerId: OWNER, proposalId: PROPOSAL, proposalVersion: 1, reviewDigest: HASH, mutationId: MUTATION, requestSha256: HASH };
const proposalRow = { owner_id: OWNER, id: PROPOSAL, contract_version: 1, version: 1, generation_request_id: REQUEST, action_type: 'break_down_task', expires_at: '2026-10-12T00:00:00.000Z', review_digest: HASH, state: 'ready', input_versions: [], operations: [{ id: OPERATION, dependsOn: [] }], selected_operation_ids: null, applied_at: null };
const appliedProposalRow = { ...proposalRow, state: 'applied', selected_operation_ids: [OPERATION], applied_at: NOW };
const receiptRow = { owner_id: OWNER, proposal_id: PROPOSAL, proposal_version: 1, review_digest: HASH, mutation_id: MUTATION, request_sha256: HASH, response_body: { ok: true }, response_status: 200, committed_through: '8', applied_at: NOW };

function harness({ replay = false, malformedProposal = false } = {}) {
  const calls = [];
  const client = { query: async (sql, params) => {
    calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params });
    if (sql.trimStart().startsWith('select') && sql.includes('ai_apply_receipts')) return { rows: replay ? [receiptRow] : [] };
    if (sql.trimStart().startsWith('select') && sql.includes('ai_proposals')) return { rows: malformedProposal ? [{ ...proposalRow, operations: 'bad' }] : [proposalRow] };
    if (sql.trimStart().startsWith('update') && sql.includes('ai_proposals')) return { rows: [appliedProposalRow] };
    if (sql.trimStart().startsWith('insert') && sql.includes('ai_apply_receipts')) return { rows: [receiptRow] };
    throw new Error(`unexpected query: ${sql}`);
  } };
  return { calls, runner: { withTransaction: async (run) => run(client) } };
}

test('unified PostgreSQL adapter uses one client transaction for proposal, domain, mark and receipt', async () => {
  const h = harness();
  const store = createPostgresAiProposalApplyStore({ runner: h.runner });
  const result = await applyAiProposalAtomically({ intent, selectedOperationIds: [OPERATION], now: NOW, store, applySelectedOperations: async () => ({ responseBody: { ok: true }, responseStatus: 200, committedThrough: '8' }) });
  assert.equal(result.action, 'applied');
  assert.equal(h.calls.filter((call) => call.sql.includes('for update')).length, 3);
  assert.equal(h.calls.some((call) => call.sql.includes('update df_private.ai_proposals')), true);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into df_private.ai_apply_receipts')), true);
});

test('unified PostgreSQL adapter replays before proposal/domain writes', async () => {
  const h = harness({ replay: true });
  const store = createPostgresAiProposalApplyStore({ runner: h.runner });
  const result = await applyAiProposalAtomically({ intent, selectedOperationIds: [OPERATION], now: NOW, store, applySelectedOperations: async () => { throw new Error('must not run'); } });
  assert.equal(result.action, 'replayed');
  assert.equal(h.calls.some((call) => call.sql.includes('ai_proposals')), false);
  assert.equal(h.calls.some((call) => call.sql.includes('insert into')), false);
});

test('unified PostgreSQL adapter fails closed on malformed proposal rows', async () => {
  const h = harness({ malformedProposal: true });
  const store = createPostgresAiProposalApplyStore({ runner: h.runner });
  await assert.rejects(() => applyAiProposalAtomically({ intent, selectedOperationIds: [OPERATION], now: NOW, store, applySelectedOperations: async () => ({ responseBody: {}, responseStatus: 200, committedThrough: '1' }) }), (error) => error?.code === 'DEPENDENCY_UNAVAILABLE');
});

test('unified PostgreSQL adapter rejects non-string owner identities before opening a transaction', async () => {
  let opened = false;
  const runner = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  const store = createPostgresAiProposalApplyStore({ runner });
  assert.throws(() => store.withOwnerTransaction(Symbol('owner'), async () => null), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('unified PostgreSQL adapter rejects malformed runner and operation dependencies before apply', () => {
  assert.throws(() => createPostgresAiProposalApplyStore(null), /VALIDATION_FAILED/);
  assert.throws(() => createPostgresAiProposalApplyStore({ runner: { withTransaction: 'not-a-function' } }), /VALIDATION_FAILED/);
  const store = createPostgresAiProposalApplyStore({ runner: { withTransaction: async () => { throw new Error('must not open'); } } });
  assert.throws(() => store.withOwnerTransaction(OWNER, null), /VALIDATION_FAILED/);
});
