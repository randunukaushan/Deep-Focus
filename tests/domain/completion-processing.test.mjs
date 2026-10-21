import test from 'node:test';
import assert from 'node:assert/strict';

import { createFocusSession, completeFocusSession, cancelFocusSession } from '../../src/features/focus/session-engine.ts';
import { createFinalizedSessionProcessing } from '../../src/features/focus/completion-processing.ts';

test('finalized-session processing has one stable terminal identity across retries', () => {
  const completed = completeFocusSession(createFocusSession(25, 'Read', 0), 1_500_000);
  const first = createFinalizedSessionProcessing(completed);
  const retry = createFinalizedSessionProcessing({ ...completed });
  assert.deepEqual(retry, first);
  assert.equal(first.idempotencyKey, `terminal:${completed.id}`);
  assert.equal(first.status, 'completed');
});

test('cancelled sessions remain terminal events, while open sessions cannot be processed', () => {
  const active = createFocusSession(25, 'Read', 0);
  const cancelled = cancelFocusSession(active, 60_000);
  assert.equal(createFinalizedSessionProcessing(cancelled).status, 'cancelled');
  assert.throws(() => createFinalizedSessionProcessing(active), /SESSION_NOT_FINALIZED/);
});
