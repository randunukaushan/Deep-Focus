import type { FocusSession, SessionProjection } from './session-types';
// @ts-expect-error The bundled domain test runtime imports TypeScript modules directly.
import { createStableId } from '../identity/stable-ids.ts';

const SECOND_MS = 1000;

export function createFocusSession(durationMinutes: number, taskName?: string, now = Date.now()): FocusSession {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || !Number.isSafeInteger(durationMinutes * 60)) {
    throw new RangeError('INVALID_INPUT: duration must represent positive whole seconds');
  }
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) {
    throw new RangeError('INVALID_INPUT: invalid current time');
  }
  const timestamp = new Date(now).toISOString();
  return {
    id: createStableId(),
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
  validateFocusSession(session);
  if (session.status === 'completed' || session.status === 'cancelled') {
    const focusedSeconds = session.focusedDurationSeconds;
    const pausedSeconds = session.pausedDurationSeconds;
    return {
      focusedSeconds,
      pausedSeconds,
      remainingSeconds: Math.max(0, session.plannedDurationSeconds - focusedSeconds),
      progress: session.plannedDurationSeconds === 0 ? 0 : focusedSeconds / session.plannedDurationSeconds,
    };
  }

  const startedAt = Date.parse(session.startedAt);
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) {
    throw new RangeError('INVALID_INPUT: invalid current time');
  }
  const pausedAt = session.lastPausedAt ? Date.parse(session.lastPausedAt) : undefined;
  const latestEvent = Math.max(startedAt, pausedAt ?? startedAt, session.lastResumedAt ? Date.parse(session.lastResumedAt) : startedAt);
  if (now < latestEvent) throw new RangeError('CLOCK_UNCERTAIN: time precedes the latest session event');
  const currentPauseSeconds = session.status === 'paused' && pausedAt !== undefined ? elapsedSeconds(pausedAt, now) : 0;
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
  if (session.status !== 'paused') return session;
  const projection = projectFocusSession(session, now);
  return {
    ...session,
    status: 'active',
    pausedDurationSeconds: projection.pausedSeconds,
    lastPausedAt: undefined,
    lastResumedAt: new Date(now).toISOString(),
  };
}

export function completeFocusSession(session: FocusSession, now = Date.now()): FocusSession {
  if (session.status === 'completed' || session.status === 'cancelled') return session;
  const projection = projectFocusSession(session, now);
  if (projection.remainingSeconds > 0) return session;
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

/** Validate legacy seconds records without mutating or migrating them. */
export function validateFocusSession(value: unknown): asserts value is FocusSession {
  if (!value || typeof value !== 'object') throw new RangeError('INVALID_RECORD: missing session');
  const session = value as FocusSession;
  const timestampValid = (timestamp: unknown) => typeof timestamp === 'string' && Number.isFinite(Date.parse(timestamp));
  if (typeof session.id !== 'string' || !session.id
    || !['active', 'paused', 'completed', 'cancelled'].includes(session.status)
    || !Number.isSafeInteger(session.plannedDurationSeconds) || session.plannedDurationSeconds <= 0
    || !Number.isSafeInteger(session.focusedDurationSeconds) || session.focusedDurationSeconds < 0
    || session.focusedDurationSeconds > session.plannedDurationSeconds
    || !Number.isSafeInteger(session.pausedDurationSeconds) || session.pausedDurationSeconds < 0
    || !timestampValid(session.createdAt) || !timestampValid(session.startedAt)
    || (session.taskName !== undefined && typeof session.taskName !== 'string')
    || (session.status === 'paused' && !timestampValid(session.lastPausedAt))
    || [session.lastPausedAt, session.lastResumedAt, session.completedAt, session.cancelledAt]
      .some((timestamp) => timestamp !== undefined && (!timestampValid(timestamp) || Date.parse(timestamp) < Date.parse(session.startedAt)))) {
    throw new RangeError('INVALID_RECORD: invalid session fields');
  }
}
