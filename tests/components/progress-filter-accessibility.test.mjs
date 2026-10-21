import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('progress time filters expose their localized labels', () => {
  const source = readFileSync('src/app/(tabs)/progress/index.tsx', 'utf8');

  assert.match(source, /accessibilityLabel=\{option === 'today' \? text\.today : option === 'week' \? text\.week : option === 'month' \? text\.month : text\.allTime\}/);
});
