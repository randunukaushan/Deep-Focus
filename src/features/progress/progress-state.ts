import type { FocusSession } from '@/features/focus/session-types';

export type ProgressHistoryState =
  | { status: 'ready'; sessions: FocusSession[] }
  | { status: 'error' };

/** Keeps storage failures distinct from a genuinely empty history. */
export async function readProgressHistory(
  readHistory: () => Promise<FocusSession[]>,
): Promise<ProgressHistoryState> {
  try {
    return { status: 'ready', sessions: await readHistory() };
  } catch {
    return { status: 'error' };
  }
}
