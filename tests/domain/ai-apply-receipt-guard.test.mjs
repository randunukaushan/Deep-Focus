import assert from 'node:assert/strict';
import test from 'node:test';

const { applyAiProposalWithReceipt, decideAiProposalApply } = await import('../../supabase/functions/_shared/ai-apply-receipt-guard.ts');

const intent = { ownerId: '11111111-1111-4111-8111-111111111111', proposalId: '22222222-2222-4222-8222-222222222222', proposalVersion: 2, reviewDigest: 'a'.repeat(64), mutationId: '33333333-3333-4333-8333-333333333333', requestSha256: 'b'.repeat(64) };
const receipt = { ...intent, responseBody: { data: { applied: true } }, responseStatus: 200, committedThrough: '42', appliedAt: '2026-10-11T00:00:00.000Z' };

test('AI apply guard executes only when neither durable receipt exists', () => {
  assert.deepEqual(decideAiProposalApply({ intent, receiptByMutation: null, receiptByProposal: null }), { action: 'execute', intent });
});

test('AI apply guard replays an identical mutation receipt', () => {
  assert.deepEqual(decideAiProposalApply({ intent, receiptByMutation: receipt, receiptByProposal: receipt }), { action: 'replay', receipt });
});

test('AI apply guard rejects changed intent and a different key after proposal consumption', () => {
  assert.deepEqual(decideAiProposalApply({ intent: { ...intent, requestSha256: 'c'.repeat(64) }, receiptByMutation: receipt, receiptByProposal: null }), { action: 'reject', reason: 'IDEMPOTENCY_CONFLICT' });
  assert.deepEqual(decideAiProposalApply({ intent: { ...intent, mutationId: '44444444-4444-4444-8444-444444444444' }, receiptByMutation: null, receiptByProposal: receipt }), { action: 'reject', reason: 'AI_PROPOSAL_ALREADY_APPLIED' });
});

test('AI apply guard rejects malformed intent and malformed stored receipt', () => {
  assert.deepEqual(decideAiProposalApply({ intent: { ...intent, reviewDigest: 'short' }, receiptByMutation: null, receiptByProposal: null }), { action: 'reject', reason: 'VALIDATION_FAILED' });
  assert.deepEqual(decideAiProposalApply({ intent, receiptByMutation: { ...receipt, committedThrough: '01' }, receiptByProposal: null }), { action: 'reject', reason: 'IDEMPOTENCY_CONFLICT' });
});

test('AI apply guard rejects receipt bodies that JSON.stringify would coerce or omit', async () => {
  class CustomValue { constructor() { this.ok = true; } }
  const sparse = [];
  sparse.length = 1;
  for (const responseBody of [{ at: new Date('2026-10-10T00:00:00.000Z') }, { missing: undefined }, { value: new CustomValue() }, { values: sparse }]) {
    await assert.rejects(() => applyAiProposalWithReceipt({
      intent, store: { withOwnerTransaction: async (_ownerId, work) => work({ readByMutation: async () => null, readByProposal: async () => null }) },
      apply: async () => ({ ...receipt, responseBody }),
    }), /DEPENDENCY_UNAVAILABLE/);
  }
});

test('AI apply guard rejects runtime type confusion without invoking storage', async () => {
  assert.deepEqual(decideAiProposalApply({ intent: { ...intent, ownerId: Symbol('owner') }, receiptByMutation: null, receiptByProposal: null }), { action: 'reject', reason: 'VALIDATION_FAILED' });
  assert.deepEqual(decideAiProposalApply({ intent, receiptByMutation: { ...receipt, committedThrough: Symbol('sequence') }, receiptByProposal: null }), { action: 'reject', reason: 'IDEMPOTENCY_CONFLICT' });
  let opened = false;
  await assert.rejects(applyAiProposalWithReceipt({
    intent: { ...intent, proposalId: Symbol('proposal') },
    store: { withOwnerTransaction: async () => { opened = true; throw new Error('must not open'); } },
    apply: async () => receipt,
  }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('AI apply transaction wrapper calls domain work only after the receipt checks', async () => {
  let applied = 0;
  const store = { withOwnerTransaction: async (_ownerId, work) => work({ readByMutation: async () => null, readByProposal: async () => null }) };
  const result = await applyAiProposalWithReceipt({ intent, store, apply: async () => { applied += 1; return receipt; } });
  assert.deepEqual(result, { action: 'applied', receipt });
  assert.equal(applied, 1);
  const replay = await applyAiProposalWithReceipt({ intent, store: { withOwnerTransaction: async (_ownerId, work) => work({ readByMutation: async () => receipt, readByProposal: async () => receipt }) }, apply: async () => { applied += 1; return receipt; } });
  assert.deepEqual(replay, { action: 'replayed', receipt });
  assert.equal(applied, 1);
});
