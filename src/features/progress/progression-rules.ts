import type { FocusSession } from '@/features/focus/session-types';

export const XP_RULES_V1 = {
  version: 'v1',
  xpPerWholeFocusedMinute: 1,
  xpPerTaskCompletion: 0,
  xpPerGoalCompletion: 0,
  xpPerStreakMilestone: 0,
  xpPerAchievementUnlock: 0,
  xpPerLevel: 500,
  dailyProductCap: null,
} as const;

export const ACHIEVEMENT_IDS = [
  'first_focus_session',
  'focus_sessions_5',
  'focus_minutes_60',
  'focus_sessions_25',
  'focus_minutes_600',
  'streak_3_days',
  'streak_7_days',
  'first_goal_completed',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export type LevelProgress = {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
};

export type ProgressionFacts = {
  completedSessionCount: number;
  completedFocusSeconds: number;
  longestStreakDays: number;
  completedGoalCount: number;
};

export function calculateSessionXp(session: FocusSession): number {
  if (!session || session.status !== 'completed') return 0;
  if (!Number.isInteger(session.focusedDurationSeconds) || session.focusedDurationSeconds < 0) {
    throw new RangeError('INVALID_SESSION: focused duration must be a non-negative integer');
  }
  return Math.floor(session.focusedDurationSeconds / 60) * XP_RULES_V1.xpPerWholeFocusedMinute;
}

export function calculateLevelProgress(totalXp: number): LevelProgress {
  if (!Number.isSafeInteger(totalXp) || totalXp < 0) throw new RangeError('INVALID_XP_TOTAL');
  const xpIntoLevel = totalXp % XP_RULES_V1.xpPerLevel;
  return {
    totalXp,
    level: 1 + Math.floor(totalXp / XP_RULES_V1.xpPerLevel),
    xpIntoLevel,
    xpToNextLevel: XP_RULES_V1.xpPerLevel - xpIntoLevel,
  };
}

export function deriveProgressionFacts(sessions: FocusSession[], input: Pick<ProgressionFacts, 'longestStreakDays' | 'completedGoalCount'>): ProgressionFacts {
  if (!Number.isSafeInteger(input.longestStreakDays) || input.longestStreakDays < 0
    || !Number.isSafeInteger(input.completedGoalCount) || input.completedGoalCount < 0) {
    throw new RangeError('INVALID_PROGRESSION_FACTS');
  }
  const unique = new Map<string, FocusSession>();
  for (const session of sessions) {
    if (!session?.id) throw new RangeError('INVALID_SESSION: id required');
    const existing = unique.get(session.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(session)) throw new RangeError('CONFLICTING_SESSION_ID');
    unique.set(session.id, session);
  }
  let completedSessionCount = 0;
  let completedFocusSeconds = 0;
  for (const session of unique.values()) {
    if (session.status !== 'completed') continue;
    if (!Number.isInteger(session.focusedDurationSeconds) || session.focusedDurationSeconds < 0) throw new RangeError('INVALID_SESSION: focused duration must be a non-negative integer');
    completedSessionCount += 1;
    completedFocusSeconds += session.focusedDurationSeconds;
  }
  return { completedSessionCount, completedFocusSeconds, ...input };
}

export function qualifyingAchievementIds(facts: ProgressionFacts): AchievementId[] {
  const { completedSessionCount, completedFocusSeconds, longestStreakDays, completedGoalCount } = facts;
  if (![completedSessionCount, completedFocusSeconds, longestStreakDays, completedGoalCount].every((value) => Number.isSafeInteger(value) && value >= 0)) {
    throw new RangeError('INVALID_PROGRESSION_FACTS');
  }
  return ACHIEVEMENT_IDS.filter((id) => {
    switch (id) {
      case 'first_focus_session': return completedSessionCount >= 1;
      case 'focus_sessions_5': return completedSessionCount >= 5;
      case 'focus_minutes_60': return completedFocusSeconds >= 3_600;
      case 'focus_sessions_25': return completedSessionCount >= 25;
      case 'focus_minutes_600': return completedFocusSeconds >= 36_000;
      case 'streak_3_days': return longestStreakDays >= 3;
      case 'streak_7_days': return longestStreakDays >= 7;
      case 'first_goal_completed': return completedGoalCount >= 1;
    }
  });
}
