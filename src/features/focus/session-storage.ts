import { Platform } from 'react-native';
import {
  appendSessionHistory as appendLocalSessionHistory,
  clearActiveSession as clearLocalActiveSession,
  loadActiveSession as loadLocalActiveSession,
  loadFinalizedSession as loadLocalFinalizedSession,
  loadPendingSummaryHandoff as loadLocalPendingSummaryHandoff,
  clearPendingSummaryHandoff as clearLocalPendingSummaryHandoff,
  claimTerminalAchievementPresentation as claimLocalTerminalAchievementPresentation,
  loadTasks as loadLocalTasks,
  loadSessionHistory as loadLocalSessionHistory,
  loadTerminalProgression as loadLocalTerminalProgression,
  persistTerminalSession as persistLocalTerminalSession,
  saveActiveSession as saveLocalActiveSession,
} from '@/features/storage/local-database';

import type { FocusSession } from './session-types';

export async function saveActiveSession(session: FocusSession) {
  if (Platform.OS === 'web') throw new Error('Active-session storage is unavailable on web');
  await saveLocalActiveSession(session);
}

export async function loadActiveSession(strict = false): Promise<FocusSession | null> {
  if (Platform.OS === 'web') {
    if (strict) throw new Error('Active-session storage is unavailable on web');
    return null;
  }
  return loadLocalActiveSession(strict);
}

export async function loadFocusableTask(taskId: string) {
  if (Platform.OS === 'web') throw new Error('Task-linked focus is unavailable on web');
  if (!taskId.trim()) throw new RangeError('INVALID_TASK_ID');
  const tasks = await loadLocalTasks();
  return tasks.find((task) => task.id === taskId && task.status !== 'completed' && task.status !== 'cancelled') ?? null;
}

/** Reads only a durable terminal session in the current owner namespace. */
export async function loadFinalizedSession(sessionId: string) {
  if (Platform.OS === 'web') throw new Error('Session history storage is unavailable on web');
  if (!sessionId.trim()) throw new RangeError('INVALID_SESSION_ID');
  return loadLocalFinalizedSession(sessionId);
}

/** Reads the owner-scoped terminal session that still needs a Summary handoff. */
export async function loadPendingSummaryHandoff() {
  if (Platform.OS === 'web') throw new Error('Session summary storage is unavailable on web');
  return loadLocalPendingSummaryHandoff();
}

/** Clears only the matching Summary handoff; it never touches progression or history. */
export async function clearPendingSummaryHandoff(sessionId: string) {
  if (Platform.OS === 'web') throw new Error('Session summary storage is unavailable on web');
  if (!sessionId.trim()) throw new RangeError('INVALID_SESSION_ID');
  await clearLocalPendingSummaryHandoff(sessionId);
}

/** Reads only the persisted progression event owned by this terminal session. */
export async function loadTerminalProgression(sessionId: string) {
  if (Platform.OS === 'web') throw new Error('Session progression storage is unavailable on web');
  if (!sessionId.trim()) throw new RangeError('INVALID_SESSION_ID');
  return loadLocalTerminalProgression(sessionId);
}

/** Claims one calm, owner-scoped Summary presentation without replaying progression. */
export async function claimTerminalAchievementPresentation(sessionId: string) {
  if (Platform.OS === 'web') throw new Error('Session progression storage is unavailable on web');
  if (!sessionId.trim()) throw new RangeError('INVALID_SESSION_ID');
  return claimLocalTerminalAchievementPresentation(sessionId);
}

export async function clearActiveSession() {
  if (Platform.OS === 'web') throw new Error('Active-session storage is unavailable on web');
  await clearLocalActiveSession();
}

export async function appendSessionHistory(session: FocusSession) {
  if (Platform.OS === 'web') throw new Error('Session history storage is unavailable on web');
  await appendLocalSessionHistory(session);
}

/** Persist history before removing the active recovery record. Safe to retry. */
export async function persistTerminalSession(session: FocusSession) {
  if (session.status !== 'completed' && session.status !== 'cancelled') {
    throw new RangeError('Only terminal sessions can be finalized');
  }
  if (Platform.OS === 'web') throw new Error('Session storage is unavailable on web');
  await persistLocalTerminalSession(session);
}

export async function loadSessionHistory(): Promise<FocusSession[]> {
  if (Platform.OS === 'web') return [];
  return loadLocalSessionHistory();
}
