import assert from 'node:assert/strict';
import test from 'node:test';

const { decideSyncPullRecovery, recoverSyncPullFailure } = await import('../../src/features/sync/sync-pull-recovery.ts');

test('stale sync cursor starts a snapshot while preserving local work', async () => {
  let resets = 0;
  const result = await recoverSyncPullFailure({ errorCode: 'SYNC_RESET_REQUIRED', resetCursor: async () => { resets += 1; } });
  assert.deepEqual(result, { action: 'start_snapshot', reason: 'SYNC_RESET_REQUIRED', preserveOutbox: true, preserveLocalOverlay: true });
  assert.equal(resets, 1);
});

test('auth, access and transient failures have distinct recovery actions', () => {
  assert.deepEqual(decideSyncPullRecovery('AUTH_REQUIRED'), { action: 'reauthenticate', reason: 'AUTH_REQUIRED' });
  assert.deepEqual(decideSyncPullRecovery('ACCESS_DENIED'), { action: 'stop', reason: 'ACCESS_DENIED' });
  assert.deepEqual(decideSyncPullRecovery('DEPENDENCY_UNAVAILABLE'), { action: 'retry', reason: 'DEPENDENCY_UNAVAILABLE' });
  assert.deepEqual(decideSyncPullRecovery('RATE_LIMITED'), { action: 'retry', reason: 'RATE_LIMITED' });
});

test('non-reset failures never clear the sync cursor', async () => {
  let reset = false;
  const result = await recoverSyncPullFailure({ errorCode: 'DEPENDENCY_UNAVAILABLE', resetCursor: async () => { reset = true; } });
  assert.deepEqual(result, { action: 'retry', reason: 'DEPENDENCY_UNAVAILABLE' });
  assert.equal(reset, false);
  await assert.rejects(() => recoverSyncPullFailure({ errorCode: 'CURSOR_EXPIRED', resetCursor: async () => { reset = true; } }), /SYNC_PULL_RECOVERY_UNKNOWN/);
  assert.equal(reset, false);
});
