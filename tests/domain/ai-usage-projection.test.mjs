import assert from 'node:assert/strict';
import test from 'node:test';

const { projectAiUsage, unavailableAiUsage, validateAiUsage } = await import('../../supabase/functions/_shared/ai-usage-projection.ts');

test('AI usage projection aggregates only server-provided buckets', () => {
  const result = projectAiUsage({ policyVersion: 'ai-policy-v1', checkedAt: '2026-10-11T00:00:00.000Z', buckets: [{ source: 'free', availableActions: 2, reservedActions: 1 }, { source: 'paid', availableActions: 3, reservedActions: 0 }], enabledActions: ['plan_my_day', 'review_my_day_lite'], nextRefreshAt: null });
  assert.equal(result.availableActions, 5);
  assert.equal(result.reservedActions, 1);
  assert.deepEqual(result.enabledActions, ['plan_my_day', 'review_my_day_lite']);
});

test('AI usage projection rejects sparse bucket and action arrays', () => {
  const base = { policyVersion: 'v1', checkedAt: '2026-10-11T00:00:00.000Z', buckets: [{ source: 'free', availableActions: 1, reservedActions: 0 }], enabledActions: ['plan_my_day'], nextRefreshAt: null };
  const sparseBuckets = [];
  sparseBuckets.length = 1;
  const sparseActions = [];
  sparseActions.length = 1;
  assert.throws(() => projectAiUsage({ ...base, buckets: sparseBuckets }), /buckets/);
  assert.throws(() => projectAiUsage({ ...base, enabledActions: sparseActions }), /enabledActions/);
});

test('unconfigured or unavailable usage carries no grant, price or provider claims', () => {
  const unknown = unavailableAiUsage('unconfigured');
  assert.deepEqual(validateAiUsage(unknown), unknown);
  assert.throws(() => validateAiUsage({ ...unknown, availableActions: 0 }), /INVALID_AI_USAGE/);
});

test('AI usage rejects duplicate sources, duplicate actions, overflow and invalid timestamps', () => {
  const base = { policyVersion: 'v1', checkedAt: '2026-10-11T00:00:00.000Z', buckets: [{ source: 'free', availableActions: 1, reservedActions: 0 }], enabledActions: ['plan_my_day'], nextRefreshAt: null };
  assert.throws(() => projectAiUsage({ ...base, buckets: [...base.buckets, { source: 'free', availableActions: 1, reservedActions: 0 }] }), /bucket sources/);
  assert.throws(() => projectAiUsage({ ...base, enabledActions: ['plan_my_day', 'plan_my_day'] }), /enabledActions/);
  assert.throws(() => projectAiUsage({ ...base, buckets: [{ source: 'free', availableActions: Number.MAX_SAFE_INTEGER, reservedActions: 0 }, { source: 'paid', availableActions: 1, reservedActions: 0 }] }), /availableActions/);
  assert.throws(() => projectAiUsage({ ...base, checkedAt: 'bad' }), /checkedAt/);
});
