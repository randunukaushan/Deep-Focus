import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('auth service uses locale copy for user-facing outcomes', () => {
  const service = fs.readFileSync('src/features/auth/auth-service.ts', 'utf8');
  const copy = fs.readFileSync('src/features/localization/auth-service-copy.ts', 'utf8');

  assert.match(service, /getAuthServiceCopy\(dependencies\.locale \?\? 'en'\)/);
  assert.match(service, /copy\.invalidCredentials/);
  assert.match(service, /copy\.googleNotConfigured/);
  assert.match(service, /copy\.appleUnavailable/);
  assert.doesNotMatch(service, /message: '(?:Enter|Choose|Please wait|We could not|Google sign-in|Apple sign-in)/);
  assert.match(copy, /si: \{/);
  assert.match(copy, /ta: \{/);
  assert.match(copy, /return COPY\[locale\] \?\? COPY\.en/);
});
