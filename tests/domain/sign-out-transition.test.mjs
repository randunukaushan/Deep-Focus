import assert from 'node:assert/strict';
import test from 'node:test';

const { applySuccessfulLocalSignOut } = await import('../../src/features/auth/sign-out-transition.ts');

test('successful sign-out immediately leaves the account namespace', () => {
  const calls = [];
  const changed = applySuccessfulLocalSignOut({ status: 'sent' }, {
    invalidatePendingAuthWork: () => calls.push('invalidate'),
    activateDeviceLocalStore: () => calls.push('device'),
    markSignedOut: () => calls.push('signed_out'),
  });
  assert.equal(changed, true);
  assert.deepEqual(calls, ['invalidate', 'device', 'signed_out']);
});

test('failed or cancelled sign-out does not switch the local namespace', () => {
  for (const result of [
    { status: 'cancelled' },
    { status: 'error', message: 'safe error' },
  ]) {
    const calls = [];
    assert.equal(applySuccessfulLocalSignOut(result, {
      invalidatePendingAuthWork: () => calls.push('invalidate'),
      activateDeviceLocalStore: () => calls.push('device'),
      markSignedOut: () => calls.push('signed_out'),
    }), false);
    assert.deepEqual(calls, []);
  }
});
