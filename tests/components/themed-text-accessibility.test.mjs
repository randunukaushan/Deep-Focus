import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('alert text defaults to an assertive live region while preserving explicit settings', () => {
  const source = readFileSync('src/components/themed-text.tsx', 'utf8');

  assert.match(source, /accessibilityLiveRegion=\{accessibilityLiveRegion \?\? \(accessibilityRole === 'alert' \? 'assertive' : undefined\)\}/);
  assert.match(source, /accessibilityRole=\{accessibilityRole\}/);
});

test('themed text can wrap long localized labels inside rows', () => {
  const source = readFileSync('src/components/themed-text.tsx', 'utf8');

  assert.match(source, /flexShrink: 1/);
  assert.match(source, /minWidth: 0/);
});

test('alert containers default to an assertive live region', () => {
  const source = readFileSync('src/components/themed-view.tsx', 'utf8');

  assert.match(source, /accessibilityLiveRegion=\{accessibilityLiveRegion \?\? \(accessibilityRole === 'alert' \? 'assertive' : undefined\)\}/);
});
