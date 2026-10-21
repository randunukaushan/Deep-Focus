import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('password recovery errors are announced as alerts', () => {
  const source = readFileSync('src/app/auth/reset-password.tsx', 'utf8');

  assert.match(source, /mismatch \? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert"/);
  assert.match(source, /message \? <ThemedText accessibilityLiveRegion="assertive" accessibilityRole="alert"/);
});
