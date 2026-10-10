import type { FocusSession } from '@/features/focus/session-types';
import { getGoalProgress } from '@/features/goals/goal-progress';
import { getGoalPeriodRange } from '@/features/goals/goal-period';
import type { Goal, GoalPeriod } from '@/features/goals/goal-types';
import type { Task } from '@/features/tasks/task-types';

export type ProgressWindow = 'week' | 'month' | 'all';

export type ProgressSummary = {
  focusedSeconds: number;
  completedSessions: number;
  averageCompletedFocusSeconds: number;
  completedTasks: number;
  activityDays: { date: string; day: string; focusedSeconds: number }[];
  goals: { id: string; title: string; type: Goal['type']; status: Goal['status']; currentValue: number; targetValue: number; progress: number }[];
};

function eventTimestamp(session: FocusSession): string | null {
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

function dateParts(timestamp: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function dateKey(year: number, month: number, day: number) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function windowStart(window: ProgressWindow, now: number, timeZone: string): number | null {
  if (window === 'all') return null;
  const period: GoalPeriod = window === 'week' ? 'weekly' : 'monthly';
  return Date.parse(getGoalPeriodRange(period, now, timeZone).startsAt);
}

/** Aggregates only durable source records; no client-provided reward/streak values are accepted. */
export function summarizeProgress(
  sessions: FocusSession[],
  tasks: Task[],
  goals: Goal[],
  options: { window: ProgressWindow; now: number; timeZone: string },
): ProgressSummary {
  const { window, now, timeZone } = options;
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) throw new RangeError('INVALID_TIME: expected a valid summary instant');
  // Reject conflicting snapshots instead of silently inflating a personal metric.
  const uniqueSessions = new Map<string, FocusSession>();
  for (const session of sessions) {
    if (session.status === 'completed' || session.status === 'cancelled') {
      const terminalAt = eventTimestamp(session);
      if (!terminalAt || !Number.isFinite(Date.parse(terminalAt))) {
        throw new RangeError('INVALID_SESSION: terminal event has no valid timestamp');
      }
    }
    const previous = uniqueSessions.get(session.id);
    if (previous && canonicalJson(previous) !== canonicalJson(session)) {
      throw new RangeError('CONFLICTING_SESSION_ID: progress has conflicting duplicate records');
    }
    uniqueSessions.set(session.id, session);
    if (!Number.isSafeInteger(session.focusedDurationSeconds) || session.focusedDurationSeconds < 0) {
      throw new RangeError('INVALID_SESSION: focused duration must be a nonnegative integer in seconds');
    }
  }
  const uniqueTasks = new Map<string, Task>();
  for (const task of tasks) {
    const previous = uniqueTasks.get(task.id);
    if (previous && canonicalJson(previous) !== canonicalJson(task)) {
      throw new RangeError('CONFLICTING_TASK_ID: progress has conflicting duplicate records');
    }
    uniqueTasks.set(task.id, task);
  }
  const sourceSessions = [...uniqueSessions.values()];
  for (const goal of goals) {
    if (!Number.isSafeInteger(goal.targetValue) || goal.targetValue <= 0) {
      throw new RangeError('INVALID_GOAL: target must be a positive integer');
    }
  }
  const start = windowStart(window, now, timeZone);
  const selectedSessions = sourceSessions.filter((session) => {
    const timestamp = eventTimestamp(session);
    if (!timestamp) return false;
    const instant = Date.parse(timestamp);
    return Number.isFinite(instant) && instant <= now && (start === null || instant >= start);
  });
  const completed = selectedSessions.filter((session) => session.status === 'completed');
  const completedTasks = [...uniqueTasks.values()].filter((task) => {
    if (task.status !== 'completed' || !task.completedAt) return false;
    const instant = Date.parse(task.completedAt);
    if (!Number.isFinite(instant)) throw new RangeError('INVALID_TASK: completion has no valid timestamp');
    return instant <= now && (start === null || instant >= start);
  }).length;
  const goalSessions = sourceSessions.filter((session) => Date.parse(eventTimestamp(session) ?? '') <= now);

  const week = getGoalPeriodRange('weekly', now, timeZone);
  const weekStart = Date.parse(week.startsAt);
  const firstDay = dateParts(week.startsAt, timeZone);
  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(firstDay.year, firstDay.month - 1, firstDay.day + index));
    const key = dateKey(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    const day = weekdayNames[date.getUTCDay()];
    return { date: key, day, focusedSeconds: 0 };
  });
  const byDate = new Map(buckets.map((item) => [item.date, item]));
  for (const session of sourceSessions) {
    const timestamp = eventTimestamp(session);
    if (!timestamp) continue;
    const instant = Date.parse(timestamp);
    if (!Number.isFinite(instant) || instant < weekStart || instant >= Date.parse(week.endsAt) || instant > now) continue;
    const keyParts = dateParts(timestamp, timeZone);
    const bucket = byDate.get(dateKey(keyParts.year, keyParts.month, keyParts.day));
    if (bucket) bucket.focusedSeconds += session.focusedDurationSeconds;
  }

  const safeSum = (items: FocusSession[]) => items.reduce((total, session) => {
    const next = total + session.focusedDurationSeconds;
    if (!Number.isSafeInteger(next)) throw new RangeError('INVALID_TOTAL: focused seconds exceed safe integer range');
    return next;
  }, 0);
  return {
    focusedSeconds: safeSum(selectedSessions),
    completedSessions: completed.length,
    averageCompletedFocusSeconds: completed.length ? Math.round(safeSum(completed) / completed.length) : 0,
    completedTasks,
    activityDays: buckets,
    goals: goals.map((goal) => {
      const { currentValue, progress } = getGoalProgress(goal, goalSessions);
      return { id: goal.id, title: goal.title, type: goal.type, status: goal.status, currentValue, targetValue: goal.targetValue, progress };
    }),
  };
}
