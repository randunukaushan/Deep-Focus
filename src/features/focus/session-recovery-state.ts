import type { FocusSession } from './session-types';

export type SessionRecoveryState = 'found' | 'empty' | 'error';

/** Keep storage failures distinct from an empty recovery record. */
export async function checkSessionRecovery(
  load: () => Promise<FocusSession | null>,
): Promise<{ state: SessionRecoveryState; session: FocusSession | null }> {
  try {
    const session = await load();
    return { state: session ? 'found' : 'empty', session };
  } catch {
    return { state: 'error', session: null };
  }
}
