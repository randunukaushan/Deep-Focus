import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const forgot = readFileSync(new URL('../../src/app/auth/forgot-password.tsx', import.meta.url), 'utf8');
const reset = readFileSync(new URL('../../src/app/auth/reset-password.tsx', import.meta.url), 'utf8');

test('password recovery routes use locale copy for provider outcomes', () => {
  assert.match(forgot, /copy\.recovery\.resetSent/);
  assert.match(forgot, /copy\.recovery\.recoveryError/);
  assert.doesNotMatch(forgot, /If an account uses this address/);
  assert.match(reset, /copy\.recovery\.recoveryError/);
  assert.doesNotMatch(reset, /setMessage\(result\.message\)/);
});
