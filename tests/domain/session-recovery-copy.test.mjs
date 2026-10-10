import assert from 'node:assert/strict';
import test from 'node:test';
import { getSessionRecoveryCopy } from '../../src/features/localization/session-recovery-copy.ts';

test('session recovery copy is complete for every approved locale', () => {
  for (const locale of ['en', 'si', 'ta']) {
    const copy = getSessionRecoveryCopy(locale);
    for (const key of ['checkingTitle', 'checkingDetail', 'errorTitle', 'errorDetail', 'retry', 'backHome', 'readyTitle', 'readyDetail', 'safeTitle', 'safeDetail', 'newSession']) {
      assert.equal(typeof copy[key], 'string');
      assert.ok(copy[key].length > 0);
    }
  }
});

test('unsupported session recovery locale safely falls back to English', () => {
  assert.equal(getSessionRecoveryCopy('invalid').retry, getSessionRecoveryCopy('en').retry);
});
