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

test('auth forms show the safe service error instead of replacing it with generic copy', () => {
  for (const path of ['src/app/auth/sign-in.tsx', 'src/app/auth/sign-up.tsx']) {
    const source = readFileSync(path, 'utf8');
    assert.match(source, /result\.status === 'error'\) setMessage\(result\.message\)/);
    assert.doesNotMatch(source, /runtimeCopy\.genericError/);
  }
});

test('auth entry validates email shape before attempting the provider', () => {
  const signIn = readFileSync('src/app/auth/sign-in.tsx', 'utf8');
  const signUp = readFileSync('src/app/auth/sign-up.tsx', 'utf8');
  assert.match(signIn, /isValidEmail\(email\)/);
  assert.match(signUp, /isValidEmail\(email\)/);
  assert.match(signIn, /getAuthServiceCopy\(locale\)\.invalidCredentials/);
  assert.match(signIn, /router\.push\('\/auth\/sign-up'\)/);
});

test('verification resend preserves safe errors and does not promise recipient delivery', () => {
  const source = readFileSync('src/app/auth/verify-email.tsx', 'utf8');
  assert.match(source, /result\.status === 'error' \? result\.message : copy\.recovery\.verificationSent/);
  assert.doesNotMatch(source, /runtimeCopy\.genericError/);
  assert.match(source, /accessibilityLiveRegion=\{messageIsError \? 'assertive' : 'polite'\}/);
});
