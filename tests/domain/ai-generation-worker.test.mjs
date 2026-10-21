import assert from 'node:assert/strict';
import test from 'node:test';

const { claimAiGenerationJob, enterAiGenerationReconciliation, renewAiGenerationJob } = await import('../../supabase/functions/_shared/ai-generation-worker.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const REQUEST = '22222222-2222-4222-8222-222222222222';
const DISPATCH = '33333333-3333-4333-8333-333333333333';
const WORKER_A = '44444444-4444-4444-8444-444444444444';
const WORKER_B = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-10-11T00:00:00.000Z';
const LEASE = '2026-10-11T00:01:00.000Z';

function job(overrides = {}) { return { ownerId: OWNER, requestId: REQUEST, state: 'queued', dispatchKey: DISPATCH, attemptCount: 0, fence: 1, leaseId: null, leaseUntil: null, lastErrorCode: null, ...overrides }; }

test('queued claim increments attempt and fence and binds the lease', () => {
  const claimed = claimAiGenerationJob({ job: job(), workerId: WORKER_A, now: NOW, leaseUntil: LEASE, maxAttempts: 3 });
  assert.deepEqual({ state: claimed.state, attemptCount: claimed.attemptCount, fence: claimed.fence, leaseId: claimed.leaseId, leaseUntil: claimed.leaseUntil }, { state: 'running', attemptCount: 1, fence: 2, leaseId: WORKER_A, leaseUntil: LEASE });
});

test('expired running lease can be reclaimed, but a live lease cannot', () => {
  const expired = job({ state: 'running', attemptCount: 1, fence: 2, leaseId: WORKER_A, leaseUntil: '2026-10-10T23:59:00.000Z' });
  assert.equal(claimAiGenerationJob({ job: expired, workerId: WORKER_B, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }).leaseId, WORKER_B);
  const live = job({ state: 'running', attemptCount: 1, fence: 2, leaseId: WORKER_A, leaseUntil: LEASE });
  assert.equal(claimAiGenerationJob({ job: live, workerId: WORKER_B, now: NOW, leaseUntil: '2026-10-11T00:02:00.000Z', maxAttempts: 3 }), null);
});

test('reconciliation clears the lease and records only an allowlisted error', () => {
  const running = job({ state: 'running', attemptCount: 1, fence: 2, leaseId: WORKER_A, leaseUntil: LEASE });
  const next = enterAiGenerationReconciliation({ job: running, workerId: WORKER_A, now: NOW, fence: 2, errorCode: 'PROVIDER_UNAVAILABLE' });
  assert.deepEqual({ state: next.state, leaseId: next.leaseId, leaseUntil: next.leaseUntil, lastErrorCode: next.lastErrorCode }, { state: 'reconciling', leaseId: null, leaseUntil: null, lastErrorCode: 'PROVIDER_UNAVAILABLE' });
});

test('stale workers cannot renew or reconcile a newer fence', () => {
  const running = job({ state: 'running', attemptCount: 2, fence: 3, leaseId: WORKER_B, leaseUntil: LEASE });
  assert.throws(() => renewAiGenerationJob({ job: running, workerId: WORKER_A, now: NOW, leaseUntil: '2026-10-11T00:02:00.000Z', fence: 2 }), /VALIDATION_FAILED/);
  assert.throws(() => enterAiGenerationReconciliation({ job: running, workerId: WORKER_A, now: NOW, fence: 2 }), /VALIDATION_FAILED/);
});

test('reconciliation can be reclaimed without a second reservation decision', () => {
  const reconciling = job({ state: 'reconciling', attemptCount: 1, fence: 2, lastErrorCode: 'PROVIDER_UNAVAILABLE' });
  const claimed = claimAiGenerationJob({ job: reconciling, workerId: WORKER_B, now: NOW, leaseUntil: LEASE, maxAttempts: 3 });
  assert.deepEqual({ state: claimed.state, attemptCount: claimed.attemptCount, fence: claimed.fence, leaseId: claimed.leaseId }, { state: 'running', attemptCount: 2, fence: 3, leaseId: WORKER_B });
});

test('exhausted attempts and malformed lease states fail closed without terminal fabrication', () => {
  assert.equal(claimAiGenerationJob({ job: job({ attemptCount: 3 }), workerId: WORKER_A, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), null);
  assert.throws(() => claimAiGenerationJob({ job: job({ state: 'running', leaseId: WORKER_A, leaseUntil: null }), workerId: WORKER_A, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => enterAiGenerationReconciliation({ job: job({ state: 'running', leaseId: WORKER_A, leaseUntil: LEASE }), workerId: WORKER_A, now: NOW, fence: 1, errorCode: 'raw provider message' }), /VALIDATION_FAILED/);
});

test('worker boundaries reject runtime type confusion before lease transitions', () => {
  assert.throws(() => claimAiGenerationJob({ job: job({ ownerId: Symbol('owner') }), workerId: WORKER_A, now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => claimAiGenerationJob({ job: job(), workerId: Symbol('worker'), now: NOW, leaseUntil: LEASE, maxAttempts: 3 }), /VALIDATION_FAILED/);
  assert.throws(() => renewAiGenerationJob({ job: job({ state: 'running', leaseId: WORKER_A, leaseUntil: LEASE }), workerId: WORKER_A, now: NOW, leaseUntil: LEASE, fence: Symbol('fence') }), /VALIDATION_FAILED/);
});
