import type { FocusSession } from '@/features/focus/session-types';

import type { Goal } from './goal-types';

function terminalTimestamp(session: FocusSession): string | null {
  if (session.status === 'completed') return session.completedAt ?? null;
  if (session.status === 'cancelled') return session.cancelledAt ?? null;
  return null;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function assertGoalInterval(goal: Goal) {
  if (typeof goal.startsAt !== 'string' || !Number.isFinite(Date.parse(goal.startsAt))) {
    throw new RangeError('INVALID_GOAL: missing or invalid inclusive start instant');
  }
  if (goal.legacyOpenPeriod) {
    if (goal.endsAt !== null || goal.periodTimeZone !== null) {
      throw new RangeError('INVALID_GOAL: malformed preserved legacy interval');
    }
    return;
  }
  if (typeof goal.endsAt !== 'string' || !Number.isFinite(Date.parse(goal.endsAt))
    || Date.parse(goal.startsAt) >= Date.parse(goal.endsAt)
    || typeof goal.periodTimeZone !== 'string' || !goal.periodTimeZone) {
    throw new RangeError('INVALID_GOAL: expected a bounded timezone-aware interval');
  }
}

export function getGoalProgress(goal: Goal, sessions: FocusSession[]) {
  assertGoalInterval(goal);
  const unique = new Map<string, FocusSession>();
  for (const session of sessions) {
    const previous = unique.get(session.id);
    if (previous && canonicalJson(previous) !== canonicalJson(session)) {
      throw new RangeError('CONFLICTING_SESSION_ID: goal activity has conflicting duplicate records');
    }
    if (!previous) unique.set(session.id, session);
  }

  const startsAt = Date.parse(goal.startsAt);
  const endsAt = goal.legacyOpenPeriod ? Number.POSITIVE_INFINITY : Date.parse(goal.endsAt!);
  const eligible = [...unique.values()].filter((session) => {
    const eventAt = terminalTimestamp(session);
    if (!eventAt) return false;
    const instant = Date.parse(eventAt);
    if (!Number.isFinite(instant)) throw new RangeError('INVALID_SESSION: terminal event has no valid timestamp');
    return instant >= startsAt && instant < endsAt;
  });

  let currentValue: number;
  if (goal.type === 'session_count') currentValue = eligible.filter((session) => session.status === 'completed').length;
  else currentValue = eligible.reduce((total, session) => {
    if (!Number.isSafeInteger(session.focusedDurationSeconds) || session.focusedDurationSeconds < 0) {
      throw new RangeError('INVALID_SESSION: focused duration must be a nonnegative integer in seconds');
    }
    return total + session.focusedDurationSeconds;
  }, 0);

  return { currentValue, progress: Math.min(1, currentValue / goal.targetValue) };
}

export function formatGoalValue(goal: Goal, value: number) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('INVALID_GOAL_VALUE: expected nonnegative finite progress');
  if (goal.type === 'session_count') return `${Math.floor(value)} ${Math.floor(value) === 1 ? 'session' : 'sessions'}`;
  const minutes = Math.floor(value / 60);
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
