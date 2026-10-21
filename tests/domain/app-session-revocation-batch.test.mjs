import assert from 'node:assert/strict';
import test from 'node:test';

const { processDueRevocationBatch } = await import('../../supabase/functions/_shared/app-session-revocation-batch.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const REVOCATION = '33333333-3333-4333-8333-333333333333';
const LEASE = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-10-11T01:00:00.000Z';

function job() {
  return { revocationId: REVOCATION, ownerId: OWNER, sessionId: SESSION, state: 'pending', attemptCount: 0, nextAttemptAt: '2026-10-11T00:00:00.000Z', leaseId: null, leaseUntil: null, providerErrorCode: null };
}

function store() {
  return { listDue: async () => [job()], claim: async () => ({ ...job(), state: 'processing', attemptCount: 1, leaseId: LEASE, leaseUntil: '2026-10-11T01:05:00.000Z' }), complete: async () => ({ ...job(), state: 'succeeded' }), fail: async () => ({ ...job(), state: 'failed', providerErrorCode: 'TIMEOUT' }) };
}

test('batch processes the bounded due snapshot through the fenced runner', async () => {
  const result = await processDueRevocationBatch({ now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, limit: 10, store: store(), provider: async () => ({ status: 'revoked' }), workerLeaseIdFor: () => LEASE });
  assert.equal(result.length, 1);
  assert.equal(result[0].state, 'succeeded');
});

test('batch rejects an adapter that returns more rows than requested', async () => {
  await assert.rejects(() => processDueRevocationBatch({ now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, limit: 1, store: { ...store(), listDue: async () => [job(), job()] }, provider: async () => ({ status: 'revoked' }), workerLeaseIdFor: () => LEASE }), /DEPENDENCY_UNAVAILABLE/);
});

test('batch rejects an unsafe lease identity before processing', async () => {
  await assert.rejects(() => processDueRevocationBatch({ now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, limit: 10, store: store(), provider: async () => ({ status: 'revoked' }), workerLeaseIdFor: () => 'not-a-uuid' }), /VALIDATION_FAILED/);
});

test('batch does not turn a store transition failure into a false success', async () => {
  const failingStore = { ...store(), complete: async () => { throw new Error('transition failed'); } };
  await assert.rejects(() => processDueRevocationBatch({ now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, limit: 10, store: failingStore, provider: async () => ({ status: 'revoked' }), workerLeaseIdFor: () => LEASE }), /transition failed/);
});

test('batch rejects runtime type confusion before reading due work', async () => {
  let reads = 0;
  const guardedStore = { ...store(), listDue: async () => { reads += 1; return []; } };
  await assert.rejects(() => processDueRevocationBatch({ now: Symbol('clock'), leaseUntil: NOW, maxAttempts: 3, limit: 10, store: guardedStore, provider: async () => ({ status: 'revoked' }), workerLeaseIdFor: () => LEASE }), /VALIDATION_FAILED/);
  await assert.rejects(() => processDueRevocationBatch({ now: NOW, leaseUntil: Symbol('lease'), maxAttempts: 3, limit: 10, store: guardedStore, provider: async () => ({ status: 'revoked' }), workerLeaseIdFor: () => LEASE }), /VALIDATION_FAILED/);
  assert.equal(reads, 0);
});
