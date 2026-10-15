import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../../src/app/focus/summary.tsx', import.meta.url), 'utf8');

test('session summary accepts only a session ID and loads its persisted terminal record', () => {
  assert.match(source, /useLocalSearchParams<\{ sessionId\?: string \}>\(\)/);
  assert.match(source, /loadPersistedFinalizedSession\(sessionId, loadFinalizedSession\)/);
  assert.doesNotMatch(source, /focusedSeconds|plannedSeconds|plannedMinutes|status\?: string|taskName\?: string/);
  assert.match(source, /loadTasks\(\)/);
  assert.match(source, /completeTask\(linkedTask\.id, linkedTask\.updatedAt\)/);
  assert.match(source, /linkedTask\.status !== 'completed'/);
  assert.match(source, /session\.taskName/);
});
