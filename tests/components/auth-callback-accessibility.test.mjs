import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('auth callback failures are announced assertively', () => {
  const source = readFileSync('src/app/auth/callback.tsx', 'utf8');

  assert.match(source, /accessibilityLiveRegion=\{failed \? 'assertive' : 'polite'\}/);
  assert.match(source, /accessibilityRole=\{failed \? 'alert' : undefined\}/);
});
