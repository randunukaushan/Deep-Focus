import type { FocusSession } from '@/features/focus/session-types';
import type { Goal } from './goal-types';

export type GoalReadState =
  | { status: 'ready'; goals: Goal[]; sessions: FocusSession[] }
  | { status: 'error' };

/** Keeps local read failures distinct from an empty set of goals or sessions. */
export async function readGoalData(
  readGoals: () => Promise<Goal[]>,
  readSessions: () => Promise<FocusSession[]>,
): Promise<GoalReadState> {
  try {
    const [goals, sessions] = await Promise.all([readGoals(), readSessions()]);
    return { status: 'ready', goals, sessions };
  } catch {
    return { status: 'error' };
  }
}
