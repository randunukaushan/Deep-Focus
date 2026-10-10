import assert from 'node:assert/strict';
import test from 'node:test';

import { getGoalCompletionAt, getGoalProgress } from '../../src/features/goals/goal-progress.ts';

const goal = (type) => ({
  id: `goal-${type}`, title: 'Synthetic goal', type, period: 'weekly', status: 'active',
  targetValue: type === 'focus_time' ? 180 : 2,
  startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z',
  periodTimeZone: 'Asia/Colombo', createdAt: '2026-10-05T00:00:00.000Z', updatedAt: '2026-10-05T00:00:00.000Z',
});

const completed = {
  id: 'completed-1', status: 'completed', plannedDurationSeconds: 300, focusedDurationSeconds: 60,
  pausedDurationSeconds: 0, createdAt: '2026-10-06T00:00:00.000Z', startedAt: '2026-10-06T00:00:00.000Z',
  completedAt: '2026-10-06T00:01:00.000Z',
};
const cancelled = {
  id: 'cancelled-1', status: 'cancelled', plannedDurationSeconds: 300, focusedDurationSeconds: 120,
  pausedDurationSeconds: 0, createdAt: '2026-10-06T00:02:00.000Z', startedAt: '2026-10-06T00:02:00.000Z',
  cancelledAt: '2026-10-06T00:04:00.000Z',
};

test('time goals count focused seconds from completed and cancelled sessions', () => {
  assert.deepEqual(getGoalProgress(goal('focus_time'), [completed, cancelled]), { currentValue: 180, progress: 1 });
});

test('session-count goals count completed sessions only', () => {
  assert.deepEqual(getGoalProgress(goal('session_count'), [completed, cancelled]), { currentValue: 1, progress: 0.5 });
});

test('goal completion time is the first terminal event that reaches the target', () => {
  assert.equal(getGoalCompletionAt({ ...goal('focus_time'), targetValue: 60 }, [cancelled, completed]), completed.completedAt);
  assert.equal(getGoalCompletionAt({ ...goal('focus_time'), targetValue: 180 }, [completed, cancelled]), cancelled.cancelledAt);
  assert.equal(getGoalCompletionAt({ ...goal('session_count'), targetValue: 1 }, [cancelled, completed]), completed.completedAt);
  assert.equal(getGoalCompletionAt({ ...goal('session_count'), targetValue: 2 }, [completed, cancelled]), null);
});

test('goal completion respects the half-open interval and rejects conflicting duplicate sessions', () => {
  const endsAt = { ...goal('session_count'), targetValue: 1, endsAt: completed.completedAt };
  assert.equal(getGoalCompletionAt(endsAt, [completed]), null);
  assert.throws(() => getGoalCompletionAt(goal('focus_time'), [completed, { ...completed, focusedDurationSeconds: 90 }]), /CONFLICTING_SESSION_ID/);
});
