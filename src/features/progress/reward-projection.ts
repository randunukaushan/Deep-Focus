import type { FocusSession } from '@/features/focus/session-types';

export type LocalAchievementProjection = {
  id: 'first_focus_session' | 'five_focus_sessions' | 'one_hour_focus';
  unlocked: boolean;
  unlockedAt: string | null;
};

/**
 * A read-only projection of the three milestones already exposed by the V1
 * Rewards route. It is deliberately not an XP grant or a remote reward ledger.
 */
export function deriveLocalAchievementProjection(sessions: FocusSession[]): LocalAchievementProjection[] {
  const unique = new Map<string, FocusSession>();
  for (const session of sessions) {
    const existing = unique.get(session.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(session)) throw new RangeError('CONFLICTING_SESSION_ID: reward projection conflict');
    unique.set(session.id, session);
  }
  const completed = [...unique.values()]
    .filter((session) => session.status === 'completed' && Boolean(session.completedAt))
    .sort((left, right) => Date.parse(left.completedAt!) - Date.parse(right.completedAt!));
  const first = completed[0]?.completedAt ?? null;
  const fifth = completed[4]?.completedAt ?? null;
  let focused = 0;
  let hourAt: string | null = null;
  for (const session of completed) {
    focused += session.focusedDurationSeconds;
    if (focused >= 3600 && !hourAt) hourAt = session.completedAt!;
  }
  return [
    { id: 'first_focus_session', unlocked: completed.length >= 1, unlockedAt: first },
    { id: 'five_focus_sessions', unlocked: completed.length >= 5, unlockedAt: fifth },
    { id: 'one_hour_focus', unlocked: focused >= 3600, unlockedAt: hourAt },
  ];
}
