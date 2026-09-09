import type { FocusSession, SessionProjection } from './session-types';

const SECOND_MS = 1000;

export function createFocusSession(durationMinutes: number, taskName?: string, now = Date.now()): FocusSession {
  const timestamp = new Date(now).toISOString();
  return {
    id: `focus-${now}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'active',
    taskName: taskName || undefined,
    plannedDurationSeconds: durationMinutes * 60,
    focusedDurationSeconds: 0,
    pausedDurationSeconds: 0,
    createdAt: timestamp,
    startedAt: timestamp,
  };
}

export function projectFocusSession(session: FocusSession, now = Date.now()): SessionProjection {
  const startedAt = Date.parse(session.startedAt);
  const pausedAt = session.lastPausedAt ? Date.parse(session.lastPausedAt) : undefined;
  const currentPauseSeconds = session.status === 'paused' && pausedAt ? elapsedSeconds(pausedAt, now) : 0;
  const pausedSeconds = Math.max(0, session.pausedDurationSeconds + currentPauseSeconds);
  const focusedSeconds = Math.max(0, Math.min(session.plannedDurationSeconds, elapsedSeconds(startedAt, now) - pausedSeconds));
  return {
    focusedSeconds,
    pausedSeconds,
    remainingSeconds: Math.max(0, session.plannedDurationSeconds - focusedSeconds),
    progress: session.plannedDurationSeconds === 0 ? 0 : focusedSeconds / session.plannedDurationSeconds,
  };
}

export function pauseFocusSession(session: FocusSession, now = Date.now()): FocusSession {
  if (session.status !== 'active') return session;
  const projection = projectFocusSession(session, now);
  return { ...session, status: 'paused', focusedDurationSeconds: projection.focusedSeconds, lastPausedAt: new Date(now).toISOString() };
}

export function resumeFocusSession(session: FocusSession, now = Date.now()): FocusSession {
  if (session.status !== 'paused' || !session.lastPausedAt) return session;
  return {
    ...session,
    status: 'active',
    pausedDurationSeconds: session.pausedDurationSeconds + elapsedSeconds(Date.parse(session.lastPausedAt), now),
    lastPausedAt: undefined,
    lastResumedAt: new Date(now).toISOString(),
  };
}

export function completeFocusSession(session: FocusSession, now = Date.now()): FocusSession {
  if (session.status === 'completed' || session.status === 'cancelled') return session;
  const projection = projectFocusSession(session, now);
  return { ...session, status: 'completed', focusedDurationSeconds: projection.focusedSeconds, pausedDurationSeconds: projection.pausedSeconds, lastPausedAt: undefined, completedAt: new Date(now).toISOString() };
}

export function cancelFocusSession(session: FocusSession, now = Date.now()): FocusSession {
  if (session.status === 'completed' || session.status === 'cancelled') return session;
  const projection = projectFocusSession(session, now);
  return { ...session, status: 'cancelled', focusedDurationSeconds: projection.focusedSeconds, pausedDurationSeconds: projection.pausedSeconds, lastPausedAt: undefined, cancelledAt: new Date(now).toISOString() };
}

function elapsedSeconds(from: number, to: number) {
  return Math.max(0, Math.floor((to - from) / SECOND_MS));
}
