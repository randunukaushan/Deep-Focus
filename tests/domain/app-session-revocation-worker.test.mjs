import assert from 'node:assert/strict';
import test from 'node:test';

const { claimRevocationOutbox, completeRevocationOutbox, failRevocationOutbox } = await import('../../supabase/functions/_shared/app-session-revocation-worker.ts');

const workerId = '11111111-1111-4111-8111-111111111111';
const leaseId = '22222222-2222-4222-8222-222222222222';
const revocationId = '33333333-3333-4333-8333-333333333333';
const times = { now: '2026-10-10T00:00:00.000Z', leaseUntil: '2026-10-10T00:01:00.000Z' };

test('worker claims one due item with a bounded lease and fencing ID', async () => {
  let request;
  const result = await claimRevocationOutbox({ workerId, leaseId, ...times, store: { claimDue: async (value) => { request = value; return { revocationId, ownerId: workerId, sessionId: leaseId, state: 'processing', leaseId, leaseUntil: times.leaseUntil }; }, markSucceeded: async () => true, markFailed: async () => true } });
  assert.equal(result.leaseId, leaseId);
  assert.deepEqual(request, { workerId, leaseId, ...times });
});

test('stale worker completion is reported as false instead of overwriting a newer lease', async () => {
  const result = await completeRevocationOutbox({ revocationId, leaseId, store: { claimDue: async () => null, markSucceeded: async () => false, markFailed: async () => false } });
  assert.equal(result, false);
});

test('failed provider attempt can be scheduled without exposing raw provider error text', async () => {
  let request;
  const result = await failRevocationOutbox({ revocationId, leaseId, errorCode: 'PROVIDER_UNAVAILABLE', nextAttemptAt: times.leaseUntil, store: { claimDue: async () => null, markSucceeded: async () => false, markFailed: async (value) => { request = value; return true; } } });
  assert.equal(result, true);
  assert.deepEqual(request, { revocationId, leaseId, errorCode: 'PROVIDER_UNAVAILABLE', nextAttemptAt: times.leaseUntil });
});

test('invalid lease and failure inputs are rejected before storage calls', async () => {
  let called = false;
  await assert.rejects(claimRevocationOutbox({ workerId: 'bad', leaseId, ...times, store: { claimDue: async () => { called = true; return null; }, markSucceeded: async () => false, markFailed: async () => false } }), /REVOCATION_LEASE_INVALID/);
  await assert.rejects(failRevocationOutbox({ revocationId, leaseId, errorCode: 'raw provider error', nextAttemptAt: times.leaseUntil, store: { claimDue: async () => null, markSucceeded: async () => false, markFailed: async () => false } }), /REVOCATION_FAILURE_INVALID/);
  assert.equal(called, false);
});

test('worker rejects a malformed or differently fenced claim before provider work', async () => {
  const invalid = { revocationId, ownerId: workerId, sessionId: leaseId, state: 'processing', leaseId: '44444444-4444-4444-8444-444444444444', leaseUntil: times.leaseUntil };
  await assert.rejects(claimRevocationOutbox({ workerId, leaseId, ...times, store: { claimDue: async () => invalid, markSucceeded: async () => false, markFailed: async () => false } }), /REVOCATION_CLAIM_INVALID/);
});
