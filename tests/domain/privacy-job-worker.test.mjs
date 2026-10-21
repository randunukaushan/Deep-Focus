import test from 'node:test';
import assert from 'node:assert/strict';
import { claimPrivacyJob, completePrivacyJob, failPrivacyJob } from '../../supabase/functions/_shared/privacy-job-worker.ts';

const base = { jobId: '88888888-8888-4888-8888-888888888888', ownerId: '99999999-9999-4999-8999-999999999999', operationId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', kind: 'export', state: 'queued', leaseOwner: null, fencingVersion: 0, leaseExpiresAt: null, attemptCount: 0, nextAttemptAt: '2026-10-11T00:00:00.000Z', safeErrorCode: null, artifactLocator: null, artifactExpiresAt: null };
const worker = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const otherWorker = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const now = '2026-10-11T00:01:00.000Z';

test('privacy worker claims due work and increments the fencing version', () => {
  const claimed = claimPrivacyJob({ job: base, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  assert.equal(claimed?.state, 'running');
  assert.equal(claimed?.fencingVersion, 1);
  assert.equal(claimed?.leaseOwner, worker);
});

test('stale or expired workers cannot complete a privacy job', () => {
  const claimed = claimPrivacyJob({ job: base, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  assert.throws(() => completePrivacyJob({ job: claimed, workerId: otherWorker, now, artifactLocator: 'private/key', artifactExpiresAt: '2026-10-11T00:10:00.000Z' }), /VALIDATION_FAILED/);
  assert.throws(() => completePrivacyJob({ job: { ...claimed, leaseExpiresAt: now }, workerId: worker, now, artifactLocator: 'private/key', artifactExpiresAt: '2026-10-11T00:10:00.000Z' }), /VALIDATION_FAILED/);
});

test('successful export completion keeps artifact metadata private and terminal', () => {
  const claimed = claimPrivacyJob({ job: base, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  const completed = completePrivacyJob({ job: claimed, workerId: worker, now, artifactLocator: 'private/key', artifactExpiresAt: '2026-10-11T00:10:00.000Z' });
  assert.deepEqual({ state: completed.state, leaseOwner: completed.leaseOwner, artifactLocator: completed.artifactLocator }, { state: 'succeeded', leaseOwner: null, artifactLocator: 'private/key' });
});

test('provider failure schedules a retry and never stores raw error text', () => {
  const claimed = claimPrivacyJob({ job: base, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 });
  const failed = failPrivacyJob({ job: claimed, workerId: worker, now, retryAt: '2026-10-11T00:03:00.000Z', safeErrorCode: 'DEPENDENCY_UNAVAILABLE', maxAttempts: 3 });
  assert.equal(failed.state, 'queued');
  assert.equal(failed.safeErrorCode, 'DEPENDENCY_UNAVAILABLE');
  assert.throws(() => failPrivacyJob({ job: claimed, workerId: worker, now, retryAt: '2026-10-11T00:03:00.000Z', safeErrorCode: 'raw provider secret', maxAttempts: 3 }), /VALIDATION_FAILED/);
});

test('exhausted attempts become terminal failed without a false success', () => {
  const claimed = claimPrivacyJob({ job: { ...base, attemptCount: 2 }, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 2 });
  assert.equal(claimed.state, 'failed');
  assert.equal(claimed.safeErrorCode, 'ATTEMPTS_EXHAUSTED');
});

test('privacy worker rejects a partial lease pair as corrupted state', () => {
  assert.throws(() => claimPrivacyJob({ job: { ...base, leaseOwner: worker }, workerId: worker, now, leaseExpiresAt: '2026-10-11T00:06:00.000Z', maxAttempts: 3 }), /DEPENDENCY_UNAVAILABLE/);
});
