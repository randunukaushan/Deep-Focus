import assert from 'node:assert/strict';
import test from 'node:test';

const { completeAiGeneration } = await import('../../supabase/functions/_shared/ai-generation-completion.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const WORKER = '33333333-3333-4333-8333-333333333333';
const PROPOSAL = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-10-11T00:00:00.000Z';
const LEASE = '2026-10-11T00:01:00.000Z';
function request(overrides = {}) { return { ownerId: OWNER, requestId: REQUEST, status: 'pending', version: 1, deadlineAt: '2026-10-11T01:00:00.000Z', completedAt: null, failureCode: null, reservedActions: 1, consumedActions: 0, proposalId: null, proposalContractVersion: null, ...overrides }; }
function job(overrides = {}) { return { ownerId: OWNER, requestId: REQUEST, state: 'running', leaseId: WORKER, leaseUntil: LEASE, fence: 2, ...overrides }; }
function complete(outcome, overrides = {}) { return completeAiGeneration({ request: request(overrides.request), job: job(overrides.job), workerId: WORKER, fence: 2, now: NOW, outcome }); }

test('valid result consumes exactly one reserved action and publishes only a v2 proposal reference', () => {
  const result = complete({ kind: 'success', proposalId: PROPOSAL });
  assert.equal(result.kind, 'completed'); assert.equal(result.settlement, 'consume');
  assert.deepEqual(result.request, { ...request(), status: 'completed', version: 2, completedAt: NOW, reservedActions: 0, consumedActions: 1, proposalId: PROPOSAL, proposalContractVersion: 2 });
  assert.equal(result.job.leaseId, null);
});

test('provider or validation failure releases the hold and never publishes a proposal', () => {
  const result = complete({ kind: 'failure', failureCode: 'INVALID_OUTPUT' });
  assert.equal(result.kind, 'failed'); assert.equal(result.settlement, 'release');
  assert.equal(result.request.proposalId, null); assert.equal(result.request.consumedActions, 0); assert.equal(result.request.failureCode, 'INVALID_OUTPUT');
});

test('expired lease and stale fence cannot publish or settle', () => {
  assert.throws(() => complete({ kind: 'success', proposalId: PROPOSAL }, { job: { leaseId: '55555555-5555-4555-8555-555555555555' } }), /INVALID_TRANSITION/);
  assert.throws(() => complete({ kind: 'success', proposalId: PROPOSAL }, { job: { leaseUntil: '2026-10-10T23:59:00.000Z' } }), /INVALID_TRANSITION/);
});

test('terminal request cannot be completed again', () => {
  assert.throws(() => complete({ kind: 'success', proposalId: PROPOSAL }, { request: { status: 'cancelled', reservedActions: 0 } }), /INVALID_TRANSITION/);
});

test('unknown failure code and malformed result are rejected before a transition', () => {
  assert.throws(() => complete({ kind: 'failure', failureCode: 'RAW_PROVIDER_ERROR' }), /VALIDATION_FAILED/);
  assert.throws(() => complete({ kind: 'success', proposalId: 'not-a-uuid' }), /VALIDATION_FAILED/);
});

test('deadline is server-authoritative and cannot be extended by completion', () => {
  assert.throws(() => complete({ kind: 'success', proposalId: PROPOSAL }, { request: { deadlineAt: '2026-10-11T00:00:00.000Z' } }), /INVALID_TRANSITION/);
});

test('owner and request identity must match the job before any outcome is accepted', () => {
  assert.throws(() => complete({ kind: 'success', proposalId: PROPOSAL }, { job: { ownerId: '55555555-5555-4555-8555-555555555555' } }), /VALIDATION_FAILED/);
});

test('completion rejects runtime type confusion before settlement', () => {
  assert.throws(() => complete({ kind: 'success', proposalId: Symbol('proposal') }), /VALIDATION_FAILED/);
  assert.throws(() => complete({ kind: 'success', proposalId: PROPOSAL }, { request: { proposalId: Symbol('proposal') } }), /VALIDATION_FAILED/);
  assert.throws(() => complete({ kind: 'success', proposalId: PROPOSAL }, { job: { leaseId: Symbol('lease') } }), /VALIDATION_FAILED/);
  assert.throws(() => completeAiGeneration({ request: request(), job: job(), workerId: Symbol('worker'), fence: 2, now: NOW, outcome: { kind: 'success', proposalId: PROPOSAL } }), /VALIDATION_FAILED/);
});
