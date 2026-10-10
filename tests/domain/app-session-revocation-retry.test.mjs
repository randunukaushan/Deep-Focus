import assert from 'node:assert/strict';
import test from 'node:test';

const { nextRevocationRetry } = await import('../../supabase/functions/_shared/app-session-revocation-retry.ts');

test('retry schedule grows exponentially and remains bounded', () => {
  const now = '2026-10-10T00:00:00.000Z';
  assert.deepEqual(nextRevocationRetry({ attemptCount: 0, now, errorCode: 'PROVIDER_UNAVAILABLE', baseDelayMs: 1000, maxDelayMs: 5000 }), { nextAttemptAt: '2026-10-10T00:00:01.000Z', errorCode: 'PROVIDER_UNAVAILABLE' });
  assert.deepEqual(nextRevocationRetry({ attemptCount: 4, now, errorCode: 'PROVIDER_UNAVAILABLE', baseDelayMs: 1000, maxDelayMs: 5000 }).nextAttemptAt, '2026-10-10T00:00:05.000Z');
});

test('retry schedule preserves only an allowlisted error code', () => {
  assert.throws(() => nextRevocationRetry({ attemptCount: 1, now: '2026-10-10T00:00:00.000Z', errorCode: 'provider details' }), /REVOCATION_RETRY_INVALID/);
});

test('retry schedule rejects unsafe attempts, times and delay policy', () => {
  for (const input of [
    { attemptCount: -1, now: '2026-10-10T00:00:00.000Z', errorCode: 'TEMPORARY' },
    { attemptCount: 1, now: 'invalid', errorCode: 'TEMPORARY' },
    { attemptCount: 1, now: '2026-10-10T00:00:00.000Z', errorCode: 'TEMPORARY', baseDelayMs: 100, maxDelayMs: 1000 },
  ]) assert.throws(() => nextRevocationRetry(input), /REVOCATION_RETRY_INVALID/);
});
