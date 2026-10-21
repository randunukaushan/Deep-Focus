import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('progress loading states announce updates politely', () => {
  const sources = [
    'src/app/(tabs)/progress/rewards.tsx',
    'src/app/(tabs)/progress/history.tsx',
    'src/app/(tabs)/progress/history/[sessionId].tsx',
  ].map((path) => readFileSync(path, 'utf8'));

  for (const source of sources) {
    assert.match(source, /accessibilityLiveRegion="polite"/);
  }
});
