import assert from 'node:assert/strict';
import test from 'node:test';

const { applyAiProposalAtomically } = await import('../../supabase/functions/_shared/ai-proposal-apply-transaction.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const PROPOSAL = '22222222-2222-4222-8222-222222222222';
const MUTATION = '33333333-3333-4333-8333-333333333333';
const FIRST = '44444444-4444-4444-8444-444444444444';
const SECOND = '55555555-5555-4555-8555-555555555555';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T00:00:00.000Z';
const intent = { ownerId: OWNER, proposalId: PROPOSAL, proposalVersion: 2, reviewDigest: HASH, mutationId: MUTATION, requestSha256: HASH };
const proposal = { ownerId: OWNER, id: PROPOSAL, contractVersion: 1, version: 2, generationRequestId: '66666666-6666-4666-8666-666666666666', actionType: 'break_down_task', expiresAt: '2026-10-12T00:00:00.000Z', reviewDigest: HASH, state: 'ready', inputVersions: [], operations: [{ id: FIRST, dependsOn: [] }, { id: SECOND, dependsOn: [FIRST] }], selectedOperationIds: null, appliedAt: null };

function store({ mutationReceipt = null, proposalReceipt = null, currentProposal = proposal } = {}) {
  const events = [];
  return { events, withOwnerTransaction: async (ownerId, work) => work({
    readReceiptByMutation: async () => mutationReceipt,
    readReceiptByProposal: async () => proposalReceipt,
    loadProposal: async () => currentProposal,
    markProposalApplied: async (input) => { events.push(['mark', input]); return { ...currentProposal, state: 'applied', selectedOperationIds: input.selectedOperationIds, appliedAt: input.appliedAt }; },
    writeReceipt: async (receipt) => { events.push(['receipt', receipt]); },
  }) };
}

test('atomic proposal apply normalizes selection, applies dependencies and writes mark then receipt', async () => {
  const h = store();
  const result = await applyAiProposalAtomically({ intent, selectedOperationIds: [SECOND, FIRST], now: NOW, store: h, applySelectedOperations: async (_transaction, _proposal, selected) => { h.events.push(['domain', selected]); return { responseBody: { ok: true }, responseStatus: 200, committedThrough: '9' }; } });
  assert.deepEqual(result.selectedOperationIds, [FIRST, SECOND]);
  assert.deepEqual(h.events.map(([kind]) => kind), ['domain', 'mark', 'receipt']);
});

test('atomic proposal apply rejects a selection with an unselected dependency before domain writes', async () => {
  const h = store();
  await assert.rejects(() => applyAiProposalAtomically({ intent, selectedOperationIds: [SECOND], now: NOW, store: h, applySelectedOperations: async () => { throw new Error('must not run'); } }), /AI_PROPOSAL_MISMATCH/);
  assert.deepEqual(h.events, []);
});

test('atomic proposal apply replays an existing receipt without loading or writing proposal state', async () => {
  const receipt = { ...intent, responseBody: { ok: true }, responseStatus: 200, committedThrough: '4', appliedAt: NOW };
  const h = store({ mutationReceipt: receipt });
  const result = await applyAiProposalAtomically({ intent, selectedOperationIds: [FIRST], now: NOW, store: h, applySelectedOperations: async () => { throw new Error('must not run'); } });
  assert.equal(result.action, 'replayed');
  assert.deepEqual(h.events, []);
});

test('atomic proposal apply rejects stale or expired proposal before domain writes', async () => {
  const h = store({ currentProposal: { ...proposal, version: 1 } });
  await assert.rejects(() => applyAiProposalAtomically({ intent, selectedOperationIds: [FIRST], now: NOW, store: h, applySelectedOperations: async () => { throw new Error('must not run'); } }), /AI_PROPOSAL_MISMATCH/);
  assert.deepEqual(h.events, []);
});

test('atomic proposal apply rejects an expired matching proposal before domain writes', async () => {
  const h = store({ currentProposal: { ...proposal, expiresAt: NOW } });
  await assert.rejects(() => applyAiProposalAtomically({ intent, selectedOperationIds: [FIRST], now: NOW, store: h, applySelectedOperations: async () => { throw new Error('must not run'); } }), /AI_PROPOSAL_MISMATCH/);
  assert.deepEqual(h.events, []);
});

test('atomic proposal apply surfaces domain failure and does not report a receipt', async () => {
  const h = store();
  await assert.rejects(() => applyAiProposalAtomically({ intent, selectedOperationIds: [FIRST], now: NOW, store: h, applySelectedOperations: async () => { throw new Error('DOMAIN_FAILURE'); } }), /DOMAIN_FAILURE/);
  assert.deepEqual(h.events, []);
});
