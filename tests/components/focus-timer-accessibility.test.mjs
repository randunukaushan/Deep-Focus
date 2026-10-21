import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('focus session timer exposes its countdown semantics', () => {
  const source = readFileSync('src/app/focus/session.tsx', 'utf8');

  assert.match(source, /accessibilityLabel=\{`\$\{formatTime\(projection\.remainingSeconds\)\} \$\{text\.remaining\}, \$\{sessionStatusLabel\},/);
  assert.match(source, /accessibilityRole="timer" style=\{\[styles\.timerCard/);
});
