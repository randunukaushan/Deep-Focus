import type { FocusSession } from './session-types';

export async function loadPersistedFinalizedSession(
  sessionId: string | undefined,
  load: (id: string) => Promise<FocusSession | null>,
): Promise<FocusSession> {
  if (!sessionId?.trim()) throw new Error('SUMMARY_SESSION_ID_REQUIRED');
  const session = await load(sessionId);
  if (!session || (session.status !== 'completed' && session.status !== 'cancelled')) {
    throw new Error('SUMMARY_SESSION_UNAVAILABLE');
  }
  return session;
}
