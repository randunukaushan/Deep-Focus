import test from 'node:test';
import assert from 'node:assert/strict';

import { createFocusSession, completeFocusSession } from '../../src/features/focus/session-engine.ts';
import { loadPersistedFinalizedSession } from '../../src/features/focus/session-summary-data.ts';

test('summary reads the persisted terminal record identified by session ID', async () => {
  const terminal = completeFocusSession(createFocusSession(25, 'Persisted title', 0), 1_500_000);
  const loaded = await loadPersistedFinalizedSession(terminal.id, async (id) => id === terminal.id ? terminal : null);
  assert.equal(loaded.taskName, 'Persisted title');
  assert.equal(loaded.focusedDurationSeconds, 1_500);
});

test('summary rejects missing, open, and inaccessible route identities', async () => {
  const active = createFocusSession(25, 'Open', 0);
  await assert.rejects(loadPersistedFinalizedSession(undefined, async () => active), /SUMMARY_SESSION_ID_REQUIRED/);
  await assert.rejects(loadPersistedFinalizedSession(active.id, async () => active), /SUMMARY_SESSION_UNAVAILABLE/);
  await assert.rejects(loadPersistedFinalizedSession('missing', async () => null), /SUMMARY_SESSION_UNAVAILABLE/);
});
