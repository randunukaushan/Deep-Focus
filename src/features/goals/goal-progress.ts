import { getSessionTimestamp } from '@/features/focus/session-history';
import type { FocusSession } from '@/features/focus/session-types';

import type { Goal } from './goal-types';

export function getGoalProgress(goal: Goal, sessions: FocusSession[]) {
  const eligible = sessions.filter((session) => session.status === 'completed' && getSessionTimestamp(session) >= goal.createdAt);
  const currentValue = goal.type === 'session_count'
    ? eligible.length
    : eligible.reduce((total, session) => total + session.focusedDurationSeconds, 0) / 60;
  return { currentValue, progress: Math.min(1, currentValue / goal.targetValue) };
}

export function formatGoalValue(goal: Goal, value: number) {
  if (goal.type === 'session_count') return `${Math.floor(value)} ${Math.floor(value) === 1 ? 'session' : 'sessions'}`;
  const minutes = Math.floor(value);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
