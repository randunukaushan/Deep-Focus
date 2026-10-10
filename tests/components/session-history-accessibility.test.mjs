import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../src/app/(tabs)/progress/history.tsx', import.meta.url), 'utf8');

test('session history accessibility summaries use localized history copy', () => {
  assert.match(source, /\$\{formatSessionDuration\(totalFocusedSeconds\)\} \$\{text\.focusTime\}/);
  assert.match(source, /accessibilityLabel=\{text\.noMatchingTitle\}/);
  assert.match(source, /\$\{filteredSessions\.length\} \$\{text\.focusSession\}/);
  assert.doesNotMatch(source, /focused across/);
});
