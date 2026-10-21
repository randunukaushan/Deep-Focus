// @ts-expect-error The bundled domain test runtime imports TypeScript modules directly.
import { validateFocusSession } from './session-engine.ts';
import type { FocusSession } from './session-types.ts';

export type FinalizedSessionProcessing = {
  idempotencyKey: string;
  sessionId: string;
  status: 'completed' | 'cancelled';
  occurredAt: string;
};

/**
 * The one durable admission identity for every terminal-session consumer.
 * Consumers may derive different projections, but must persist this key before
 * applying any non-derived analytics, goal, streak, or reward side effect.
 */
export function createFinalizedSessionProcessing(session: FocusSession): FinalizedSessionProcessing {
  validateFocusSession(session);
  if (session.status !== 'completed' && session.status !== 'cancelled') {
    throw new RangeError('SESSION_NOT_FINALIZED: terminal processing requires a completed or cancelled session');
  }
  const occurredAt = session.status === 'completed' ? session.completedAt : session.cancelledAt;
  if (!occurredAt) throw new RangeError('SESSION_NOT_FINALIZED: terminal timestamp is required');
  return {
    // Keep the established outbox identity for backward-compatible retries.
    idempotencyKey: `terminal:${session.id}`,
    sessionId: session.id,
    status: session.status,
    occurredAt,
  };
}
