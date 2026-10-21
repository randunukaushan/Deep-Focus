import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../src/features/home/home-screen.tsx', import.meta.url), 'utf8');

test('home focus hero accessibility label uses localized copy', () => {
  assert.equal(source.includes('accessibilityLabel="Start a new focus session"'), false);
  assert.match(source, /accessibilityLabel=\{copy\.home\.startFocusAccessibility\}/);
});
