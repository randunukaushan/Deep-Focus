import { validateBreakTimer, type BreakTimer } from './break-engine';
import type { FocusSession } from './session-types';

export type ActiveBreak = BreakTimer & { sessionId: string; pauseStartedAt: string };
export type FocusRecovery = { session: FocusSession | null; activeBreak: ActiveBreak | null };

/** The pause anchor prevents an old break from attaching to a later pause. */
export function validateActiveBreak(value: unknown): asserts value is ActiveBreak {
  validateBreakTimer(value);
  const record = value as ActiveBreak;
  if (typeof record.sessionId !== 'string' || !record.sessionId.trim()
    || typeof record.pauseStartedAt !== 'string' || !Number.isFinite(Date.parse(record.pauseStartedAt))
    || Date.parse(record.startedAt) < Date.parse(record.pauseStartedAt)
    || Date.parse(record.deadlineAt) - Date.parse(record.startedAt) !== record.plannedDurationSeconds * 1000
    || ![300, 600, 900].includes(record.plannedDurationSeconds)) {
    throw new RangeError('INVALID_RECORD: invalid active break');
  }
}

export function breakBelongsToSession(record: ActiveBreak, session: FocusSession | null): boolean {
  return session?.status === 'paused' && session.id === record.sessionId
    && session.lastPausedAt === record.pauseStartedAt;
}
