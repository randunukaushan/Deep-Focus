import test from 'node:test';
import assert from 'node:assert/strict';

import { createBreakTimer, projectBreakTimer } from '../../src/features/focus/break-engine.ts';

test('break timer uses a deadline and projects elapsed time after background gaps', () => {
  const timer = createBreakTimer(5, 0);
  assert.equal(timer.deadlineAt, '1970-01-01T00:05:00.000Z');
  assert.deepEqual(projectBreakTimer(timer, 60_000), { elapsedSeconds: 60, remainingSeconds: 240, progress: 0.2 });
  assert.deepEqual(projectBreakTimer(timer, 240_000), { elapsedSeconds: 240, remainingSeconds: 60, progress: 0.8 });
  assert.deepEqual(projectBreakTimer(timer, 600_000), { elapsedSeconds: 300, remainingSeconds: 0, progress: 1 });
});

test('break timer rejects invalid records and clocks without fabricating progress', () => {
  const timer = createBreakTimer(5, 0);
  assert.throws(() => projectBreakTimer({ ...timer, deadlineAt: 'bad' }, 1_000), /INVALID_RECORD/);
  assert.throws(() => projectBreakTimer(timer, Number.NaN), /INVALID_INPUT/);
  assert.throws(() => projectBreakTimer(timer, -1), /CLOCK_UNCERTAIN/);
  assert.throws(() => createBreakTimer(0, 0), /INVALID_INPUT/);
});
