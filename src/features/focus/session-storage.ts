import { Platform } from 'react-native';
import {
  appendSessionHistory as appendLocalSessionHistory,
  clearActiveSession as clearLocalActiveSession,
  loadActiveSession as loadLocalActiveSession,
  loadSessionHistory as loadLocalSessionHistory,
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
