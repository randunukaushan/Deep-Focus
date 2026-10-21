import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../src/app/auth/callback.tsx', import.meta.url), 'utf8');

test('auth callback loading indicator uses localized callback copy', () => {
  assert.equal(source.includes('Completing secure sign-in'), false);
  assert.match(source, /accessibilityLabel=\{copy\.loadingTitle\}/);
});
