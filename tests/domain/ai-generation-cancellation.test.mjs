import assert from 'node:assert/strict';
import test from 'node:test';

const { cancelAiGenerationRequest } = await import('../../supabase/functions/_shared/ai-generation-cancellation.ts');

const REQUEST = '22222222-2222-4222-8222-222222222222';
const RESERVATION = '33333333-3333-4333-8333-333333333333';
const PROPOSAL = '44444444-4444-4444-8444-444444444444';
const CREATED = '2026-10-11T00:00:00.000Z';
const NOW = '2026-10-11T00:01:00.000Z';
const DEADLINE = '2026-10-11T00:05:00.000Z';

function request(overrides = {}) { return { requestId: REQUEST, actionType: 'plan_my_day', version: 1, createdAt: CREATED, updatedAt: CREATED, deadlineAt: DEADLINE, status: 'pending', completedAt: null, result: null, failureCode: null, reservedActions: 1, consumedActions: 0, ...overrides }; }

test('pending cancellation releases exactly the reserved action and advances the version', () => {
  const result = cancelAiGenerationRequest({ request: request(), reservationId: RESERVATION, now: NOW });
  assert.equal(result.outcome, 'cancelled');
  assert.equal(result.releaseReservation, true);
  assert.equal(result.request.status, 'cancelled');
  assert.equal(result.request.version, 2);
  assert.equal(result.request.reservedActions, 0);
  assert.equal(result.request.consumedActions, 0);
});

test('already-cancelled replay does not release or advance again', () => {
  const cancelled = request({ status: 'cancelled', version: 2, updatedAt: NOW, completedAt: NOW, reservedActions: 0 });
  const result = cancelAiGenerationRequest({ request: cancelled, reservationId: RESERVATION, now: '2026-10-11T00:02:00.000Z' });
  assert.equal(result.outcome, 'already_cancelled');
  assert.equal(result.releaseReservation, false);
  assert.equal(result.request.version, 2);
});

test('completed and failed requests remain terminal without an implicit refund', () => {
  const completed = request({ status: 'completed', version: 2, updatedAt: NOW, completedAt: NOW, result: { proposalId: PROPOSAL, contractVersion: 2 }, reservedActions: 0, consumedActions: 1 });
  const failed = request({ status: 'failed', version: 2, updatedAt: NOW, completedAt: NOW, failureCode: 'PROVIDER_UNAVAILABLE', reservedActions: 0 });
  assert.equal(cancelAiGenerationRequest({ request: completed, reservationId: RESERVATION, now: NOW }).outcome, 'already_terminal');
  assert.equal(cancelAiGenerationRequest({ request: failed, reservationId: RESERVATION, now: NOW }).outcome, 'already_terminal');
  assert.equal(cancelAiGenerationRequest({ request: completed, reservationId: RESERVATION, now: NOW }).releaseReservation, false);
});

test('cancel rejects time travel and malformed reservation before a transition', () => {
  assert.throws(() => cancelAiGenerationRequest({ request: request(), reservationId: RESERVATION, now: '2026-10-10T23:59:00.000Z' }), /VALIDATION_FAILED/);
  assert.throws(() => cancelAiGenerationRequest({ request: request(), reservationId: 'bad', now: NOW }), /VALIDATION_FAILED/);
});

test('cancellation rejects runtime type confusion before status transition', () => {
  assert.throws(() => cancelAiGenerationRequest({ request: request(), reservationId: Symbol('reservation'), now: NOW }), /VALIDATION_FAILED/);
  assert.throws(() => cancelAiGenerationRequest({ request: request(), reservationId: RESERVATION, now: Symbol('clock') }), /VALIDATION_FAILED/);
  assert.throws(() => cancelAiGenerationRequest({ request: Symbol('request'), reservationId: RESERVATION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('malformed stored request fails closed instead of fabricating cancellation', () => {
  assert.throws(() => cancelAiGenerationRequest({ request: request({ reservedActions: 0 }), reservationId: RESERVATION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => cancelAiGenerationRequest({ request: request({ status: 'failed', completedAt: null, failureCode: null, reservedActions: 0 }), reservationId: RESERVATION, now: NOW }), /DEPENDENCY_UNAVAILABLE/);
});

test('cancellation keeps the original request deadline and identity', () => {
  const result = cancelAiGenerationRequest({ request: request(), reservationId: RESERVATION, now: NOW });
  assert.equal(result.request.requestId, REQUEST);
  assert.equal(result.request.deadlineAt, DEADLINE);
  assert.equal(result.reservationId, RESERVATION);
});
