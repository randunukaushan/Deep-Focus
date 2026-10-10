import assert from 'node:assert/strict';
import test from 'node:test';

import { createStableId } from '../../src/features/identity/stable-ids.ts';
import { createFocusSession } from '../../src/features/focus/session-engine.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('new stable IDs are UUID-shaped and unique', () => {
  const first = createStableId();
  const second = createStableId();
  assert.match(first, UUID);
  assert.match(second, UUID);
  assert.notEqual(first, second);
});

test('new focus sessions use stable IDs while preserving seconds-based timer fields', () => {
  const session = createFocusSession(25, 'Focus', 0);
  assert.match(session.id, UUID);
  assert.equal(session.plannedDurationSeconds, 1500);
  assert.equal(session.focusedDurationSeconds, 0);
});
