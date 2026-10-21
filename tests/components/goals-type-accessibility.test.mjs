import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('goal target types expose localized radio labels as a group', () => {
  const source = readFileSync('src/app/goals/index.tsx', 'utf8');

  assert.match(source, /<View accessibilityRole="radiogroup" style=\{styles\.typeRow\}>/);
  assert.match(source, /accessibilityLabel=\{value === 'session_count' \? text\.sessions : text\.focusMinutes\} accessibilityRole="radio"/);
});
