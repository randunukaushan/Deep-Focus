export type BreakTimer = {
  startedAt: string;
  deadlineAt: string;
  plannedDurationSeconds: number;
};

export type BreakProjection = {
  elapsedSeconds: number;
  remainingSeconds: number;
  progress: number;
};

const SECOND_MS = 1000;

export function createBreakTimer(durationMinutes: number, now = Date.now()): BreakTimer {
  if (!Number.isSafeInteger(durationMinutes) || durationMinutes <= 0 || !Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) {
    throw new RangeError('INVALID_INPUT: break duration and time are required');
  }
  const plannedDurationSeconds = durationMinutes * 60;
  const deadline = now + plannedDurationSeconds * SECOND_MS;
  if (!Number.isSafeInteger(plannedDurationSeconds) || !Number.isFinite(new Date(deadline).getTime())) {
    throw new RangeError('INVALID_INPUT: break deadline is invalid');
  }
  return {
    startedAt: new Date(now).toISOString(),
    deadlineAt: new Date(deadline).toISOString(),
    plannedDurationSeconds,
  };
}

export function projectBreakTimer(timer: BreakTimer, now = Date.now()): BreakProjection {
  validateBreakTimer(timer);
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) throw new RangeError('INVALID_INPUT: invalid current time');
  const startedAt = Date.parse(timer.startedAt);
  if (now < startedAt) throw new RangeError('CLOCK_UNCERTAIN: current time precedes break start');
  const elapsedSeconds = Math.max(0, Math.min(timer.plannedDurationSeconds, Math.floor((now - startedAt) / SECOND_MS)));
  const remainingSeconds = timer.plannedDurationSeconds - elapsedSeconds;
  return {
    elapsedSeconds,
    remainingSeconds,
    progress: timer.plannedDurationSeconds === 0 ? 0 : elapsedSeconds / timer.plannedDurationSeconds,
  };
}

export function validateBreakTimer(value: unknown): asserts value is BreakTimer {
  if (!value || typeof value !== 'object') throw new RangeError('INVALID_RECORD: missing break timer');
  const timer = value as BreakTimer;
  const startedAt = typeof timer.startedAt === 'string' ? Date.parse(timer.startedAt) : NaN;
  const deadlineAt = typeof timer.deadlineAt === 'string' ? Date.parse(timer.deadlineAt) : NaN;
  if (!Number.isFinite(startedAt) || !Number.isFinite(deadlineAt)
    || !Number.isSafeInteger(timer.plannedDurationSeconds) || timer.plannedDurationSeconds <= 0
    || deadlineAt < startedAt
    || Math.floor((deadlineAt - startedAt) / SECOND_MS) !== timer.plannedDurationSeconds) {
    throw new RangeError('INVALID_RECORD: invalid break timer');
  }
}
