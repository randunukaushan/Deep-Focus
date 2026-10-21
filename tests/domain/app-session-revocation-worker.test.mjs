import assert from 'node:assert/strict';
import test from 'node:test';

const { claimRevocationJob, completeRevocationJob, failRevocationJob } = await import('../../supabase/functions/_shared/app-session-revocation-worker.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const REVOCATION = '33333333-3333-4333-8333-333333333333';
const LEASE_A = '44444444-4444-4444-8444-444444444444';
const LEASE_B = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-10-11T01:00:00.000Z';

function job(overrides = {}) {
  return { revocationId: REVOCATION, ownerId: OWNER, sessionId: SESSION, state: 'pending', attemptCount: 0, nextAttemptAt: '2026-10-11T00:00:00.000Z', leaseId: null, leaseUntil: null, providerErrorCode: null, ...overrides };
}

test('claim is due-only, increments the attempt and fences the lease owner', () => {
  const claimed = claimRevocationJob({ job: job(), workerLeaseId: LEASE_A, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3 });
  assert.equal(claimed.state, 'processing');
  assert.equal(claimed.attemptCount, 1);
  assert.equal(claimed.leaseId, LEASE_A);
  assert.equal(claimRevocationJob({ job: job({ nextAttemptAt: '2026-10-11T02:00:00.000Z' }), workerLeaseId: LEASE_A, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3 }), null);
});

test('expired processing leases can be reclaimed, but exhausted jobs become failed', () => {
  const reclaimed = claimRevocationJob({ job: job({ state: 'processing', attemptCount: 1, leaseId: LEASE_A, leaseUntil: '2026-10-11T00:30:00.000Z' }), workerLeaseId: LEASE_B, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3 });
  assert.deepEqual({ state: reclaimed.state, attemptCount: reclaimed.attemptCount, leaseId: reclaimed.leaseId }, { state: 'processing', attemptCount: 2, leaseId: LEASE_B });
  assert.equal(claimRevocationJob({ job: job({ attemptCount: 3 }), workerLeaseId: LEASE_A, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3 }).state, 'failed');
});

test('only the current lease may complete; stale and expired workers fail closed', () => {
  const claimed = job({ state: 'processing', attemptCount: 1, leaseId: LEASE_A, leaseUntil: '2026-10-11T01:05:00.000Z' });
  assert.equal(completeRevocationJob({ job: claimed, workerLeaseId: LEASE_A, now: NOW }).state, 'succeeded');
  assert.throws(() => completeRevocationJob({ job: claimed, workerLeaseId: LEASE_B, now: NOW }), /VALIDATION_FAILED/);
  assert.throws(() => completeRevocationJob({ job: { ...claimed, leaseUntil: '2026-10-11T00:30:00.000Z' }, workerLeaseId: LEASE_A, now: NOW }), /VALIDATION_FAILED/);
});

test('provider failure schedules a retry, while the final attempt is terminal and errors stay allowlisted', () => {
  const claimed = job({ state: 'processing', attemptCount: 1, leaseId: LEASE_A, leaseUntil: '2026-10-11T01:05:00.000Z' });
  const retry = failRevocationJob({ job: claimed, workerLeaseId: LEASE_A, now: NOW, retryAt: '2026-10-11T01:10:00.000Z', providerErrorCode: 'TIMEOUT', maxAttempts: 3 });
  assert.deepEqual({ state: retry.state, leaseId: retry.leaseId, providerErrorCode: retry.providerErrorCode }, { state: 'pending', leaseId: null, providerErrorCode: 'TIMEOUT' });
  const final = failRevocationJob({ job: { ...claimed, attemptCount: 3 }, workerLeaseId: LEASE_A, now: NOW, retryAt: '2026-10-11T01:10:00.000Z', providerErrorCode: 'REJECTED', maxAttempts: 3 });
  assert.equal(final.state, 'failed');
  assert.throws(() => failRevocationJob({ job: claimed, workerLeaseId: LEASE_A, now: NOW, retryAt: '2026-10-11T01:10:00.000Z', providerErrorCode: 'provider secret=abc', maxAttempts: 3 }), /VALIDATION_FAILED/);
});

test('malformed lease state and unsafe limits fail closed', () => {
  assert.throws(() => claimRevocationJob({ job: job({ state: 'processing', leaseId: null, leaseUntil: null }), workerLeaseId: LEASE_A, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => claimRevocationJob({ job: job({ leaseId: LEASE_A, leaseUntil: null }), workerLeaseId: LEASE_A, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => claimRevocationJob({ job: job(), workerLeaseId: LEASE_A, now: NOW, leaseUntil: NOW, maxAttempts: 0 }), /VALIDATION_FAILED/);
});
