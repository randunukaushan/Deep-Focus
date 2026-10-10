import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('sign-in validation uses the selected locale copy', () => {
  const source = readFileSync(new URL('../../src/app/auth/sign-in.tsx', import.meta.url), 'utf8');
  assert.match(source, /copy\.signIn\.passwordError/);
  assert.match(source, /copy\.signIn\.emailError/);
  assert.doesNotMatch(source, />Enter your email address\.<\/ThemedText>/);
  assert.doesNotMatch(source, />Enter your password\.<\/ThemedText>/);
});
