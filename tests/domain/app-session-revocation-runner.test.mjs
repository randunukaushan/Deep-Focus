import assert from 'node:assert/strict';
import test from 'node:test';

const { runRevocationJob } = await import('../../supabase/functions/_shared/app-session-revocation-runner.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const REVOCATION = '33333333-3333-4333-8333-333333333333';
const LEASE = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-10-11T01:00:00.000Z';

function job(overrides = {}) {
  return { revocationId: REVOCATION, ownerId: OWNER, sessionId: SESSION, state: 'processing', attemptCount: 1, nextAttemptAt: NOW, leaseId: LEASE, leaseUntil: '2026-10-11T01:05:00.000Z', providerErrorCode: null, ...overrides };
}

function store(overrides = {}) {
  return { claim: async () => job(), complete: async () => job({ state: 'succeeded', leaseId: null, leaseUntil: null }), fail: async (input) => job({ state: 'pending', leaseId: null, leaseUntil: null, providerErrorCode: input.providerErrorCode }), ...overrides };
}

test('runner claims, passes only opaque identity and completes provider success', async () => {
  let providerInput;
  const result = await runRevocationJob({ revocationId: REVOCATION, workerLeaseId: LEASE, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, store: store(), provider: async (input) => { providerInput = input; return { status: 'already_revoked' }; } });
  assert.equal(result.state, 'succeeded');
  assert.deepEqual(providerInput, { revocationId: REVOCATION, ownerId: OWNER, sessionId: SESSION });
});

test('runner maps provider failure to safe retry state without storing raw error text', async () => {
  let failed;
  const result = await runRevocationJob({ revocationId: REVOCATION, workerLeaseId: LEASE, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, store: store({ fail: async (input) => { failed = input; return job({ state: 'pending', leaseId: null, leaseUntil: null, providerErrorCode: input.providerErrorCode }); } }), provider: async () => { throw { code: 'TIMEOUT', message: 'secret=must-not-persist' }; } });
  assert.equal(result.providerErrorCode, 'TIMEOUT');
  assert.equal(failed.providerErrorCode, 'TIMEOUT');
  assert.equal(failed.retryAt, '2026-10-11T01:01:00.000Z');
});

test('runner replaces unsafe provider codes with a generic allowlisted code', async () => {
  let failed;
  await runRevocationJob({ revocationId: REVOCATION, workerLeaseId: LEASE, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, store: store({ fail: async (input) => { failed = input; return job({ state: 'pending', leaseId: null, leaseUntil: null, providerErrorCode: input.providerErrorCode }); } }), provider: async () => { throw { code: 'raw secret' }; } });
  assert.equal(failed.providerErrorCode, 'PROVIDER_UNAVAILABLE');
});

test('runner does not call provider when claim says no work', async () => {
  let called = false;
  const result = await runRevocationJob({ revocationId: REVOCATION, workerLeaseId: LEASE, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, store: store({ claim: async () => null }), provider: async () => { called = true; return { status: 'revoked' }; } });
  assert.equal(result, null);
  assert.equal(called, false);
});

test('runner rejects runtime type confusion before claiming or calling provider', async () => {
  let claims = 0;
  const guardedStore = store({ claim: async () => { claims += 1; return job(); } });
  await assert.rejects(() => runRevocationJob({ revocationId: Symbol('revocation'), workerLeaseId: LEASE, now: NOW, leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, store: guardedStore, provider: async () => ({ status: 'revoked' }) }), /VALIDATION_FAILED/);
  await assert.rejects(() => runRevocationJob({ revocationId: REVOCATION, workerLeaseId: LEASE, now: Symbol('clock'), leaseUntil: '2026-10-11T01:05:00.000Z', maxAttempts: 3, store: guardedStore, provider: async () => ({ status: 'revoked' }) }), /VALIDATION_FAILED/);
  assert.equal(claims, 0);
});
