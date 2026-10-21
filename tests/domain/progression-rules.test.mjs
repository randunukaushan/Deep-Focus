import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateLevelProgress,
  calculateSessionXp,
  deriveProgressionFacts,
  qualifyingAchievementIds,
} from '../../src/features/progress/progression-rules.ts';

function completed(id, focusedDurationSeconds) {
  return {
    id,
    status: 'completed',
    plannedDurationSeconds: Math.max(1, focusedDurationSeconds),
    focusedDurationSeconds,
    pausedDurationSeconds: 0,
    createdAt: '2026-10-15T00:00:00.000Z',
    startedAt: '2026-10-15T00:00:00.000Z',
    completedAt: '2026-10-15T01:00:00.000Z',
  };
}

test('XP uses only whole completed focus minutes and cancellation awards zero', () => {
  assert.equal(calculateSessionXp(completed('a', 1_500)), 25);
  assert.equal(calculateSessionXp(completed('b', 1_499)), 24);
  assert.equal(calculateSessionXp(completed('c', 59)), 0);
  assert.equal(calculateSessionXp({ ...completed('d', 1_500), status: 'cancelled' }), 0);
  assert.throws(() => calculateSessionXp({ ...completed('e', 10), focusedDurationSeconds: -1 }), /INVALID_SESSION/);
});

test('levels are derived centrally from non-negative persisted XP', () => {
  assert.deepEqual(calculateLevelProgress(0), { totalXp: 0, level: 1, xpIntoLevel: 0, xpToNextLevel: 500 });
  assert.equal(calculateLevelProgress(499).level, 1);
  assert.deepEqual(calculateLevelProgress(500), { totalXp: 500, level: 2, xpIntoLevel: 0, xpToNextLevel: 500 });
  assert.equal(calculateLevelProgress(999).level, 2);
  assert.equal(calculateLevelProgress(1_000).level, 3);
  assert.throws(() => calculateLevelProgress(-1), /INVALID_XP_TOTAL/);
});

test('achievement facts count completed sessions independently from zero XP and sum seconds before minute thresholds', () => {
  const sessions = [completed('zero', 59), completed('one', 1_830), completed('two', 1_830)];
  const facts = deriveProgressionFacts(sessions, { longestStreakDays: 3, completedGoalCount: 1 });
  assert.deepEqual(facts, { completedSessionCount: 3, completedFocusSeconds: 3_719, longestStreakDays: 3, completedGoalCount: 1 });
  assert.deepEqual(qualifyingAchievementIds(facts), [
    'first_focus_session',
    'focus_minutes_60',
    'streak_3_days',
    'first_goal_completed',
  ]);
});

test('duplicate terminal record IDs do not inflate progression facts', () => {
  const once = completed('same', 60);
  assert.deepEqual(deriveProgressionFacts([once, structuredClone(once)], { longestStreakDays: 0, completedGoalCount: 0 }), {
    completedSessionCount: 1,
    completedFocusSeconds: 60,
    longestStreakDays: 0,
    completedGoalCount: 0,
  });
  assert.throws(() => deriveProgressionFacts([once, { ...once, focusedDurationSeconds: 120 }], { longestStreakDays: 0, completedGoalCount: 0 }), /CONFLICTING_SESSION_ID/);
});

test('all approved achievement thresholds are deterministic', () => {
  assert.deepEqual(qualifyingAchievementIds({ completedSessionCount: 25, completedFocusSeconds: 36_000, longestStreakDays: 7, completedGoalCount: 1 }), [
    'first_focus_session', 'focus_sessions_5', 'focus_minutes_60', 'focus_sessions_25',
    'focus_minutes_600', 'streak_3_days', 'streak_7_days', 'first_goal_completed',
  ]);
  assert.deepEqual(qualifyingAchievementIds({ completedSessionCount: 24, completedFocusSeconds: 35_999, longestStreakDays: 2, completedGoalCount: 0 }), [
    'first_focus_session', 'focus_sessions_5', 'focus_minutes_60',
  ]);
});
