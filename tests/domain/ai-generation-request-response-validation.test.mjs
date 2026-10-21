import test from 'node:test';
import assert from 'node:assert/strict';

const { validateAiGenerationRequestStatus } = await import('../../supabase/functions/_shared/ai-generation-request-response-validation.ts');

const ID = '11111111-1111-4111-8111-111111111111';
const PROPOSAL = '22222222-2222-4222-8222-222222222222';
const BASE = { requestId: ID, actionType: 'plan_my_day', version: 1, createdAt: '2026-10-11T08:00:00.000Z', updatedAt: '2026-10-11T08:00:00.000Z', deadlineAt: '2026-10-11T09:00:00.000Z', status: 'pending', completedAt: null, result: null, failureCode: null, reservedActions: 1, consumedActions: 0 };

test('accepts the pending response shape and strips no fields because it is already exact', () => {
  assert.deepEqual(validateAiGenerationRequestStatus(BASE), BASE);
});

test('accepts a completed response with only a proposal reference', () => {
  const result = validateAiGenerationRequestStatus({ ...BASE, updatedAt: '2026-10-11T08:10:00.000Z', status: 'completed', completedAt: '2026-10-11T08:10:00.000Z', result: { proposalId: PROPOSAL, contractVersion: 2 }, reservedActions: 0, consumedActions: 1 });
  assert.equal(result.result?.proposalId, PROPOSAL);
});

test('accepts failed and cancelled terminal responses with no result', () => {
  assert.equal(validateAiGenerationRequestStatus({ ...BASE, updatedAt: '2026-10-11T08:10:00.000Z', status: 'failed', completedAt: '2026-10-11T08:10:00.000Z', failureCode: 'PROVIDER_UNAVAILABLE', reservedActions: 0 }).status, 'failed');
  assert.equal(validateAiGenerationRequestStatus({ ...BASE, updatedAt: '2026-10-11T08:10:00.000Z', status: 'cancelled', completedAt: '2026-10-11T08:10:00.000Z', reservedActions: 0 }).status, 'cancelled');
});

for (const [name, change] of [
  ['rejects raw provider metadata', (v) => ({ ...v, providerStatus: 'done' })],
  ['rejects a pending response with consumed allowance', (v) => ({ ...v, consumedActions: 1 })],
  ['rejects a completed response without the exact v2 reference', (v) => ({ ...v, status: 'completed', completedAt: v.updatedAt, result: { proposalId: PROPOSAL, contractVersion: 1 }, reservedActions: 0, consumedActions: 1 })],
  ['rejects an unknown failure code', (v) => ({ ...v, status: 'failed', completedAt: v.updatedAt, failureCode: 'RAW_PROVIDER_ERROR', reservedActions: 0 })],
  ['rejects terminal responses that expose a result', (v) => ({ ...v, status: 'cancelled', completedAt: v.updatedAt, result: { proposalId: PROPOSAL, contractVersion: 2 }, reservedActions: 0 })],
  ['rejects a deadline before creation', (v) => ({ ...v, deadlineAt: v.createdAt })],
]) {
  test(name, () => assert.throws(() => validateAiGenerationRequestStatus(change(BASE)), /DEPENDENCY_UNAVAILABLE/));
}
