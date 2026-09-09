import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import type { FocusSession } from './session-types';

const ACTIVE_FILE = 'deep-focus-active-session.json';
const HISTORY_FILE = 'deep-focus-session-history.json';

function pathFor(fileName: string) {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${fileName}` : null;
}

export async function saveActiveSession(session: FocusSession) {
  if (Platform.OS === 'web') return;
  const path = pathFor(ACTIVE_FILE);
  if (!path) return;
  await safely(() => FileSystem.writeAsStringAsync(path, JSON.stringify(session)));
}

export async function loadActiveSession(): Promise<FocusSession | null> {
  if (Platform.OS === 'web') return null;
  const path = pathFor(ACTIVE_FILE);
  if (!path) return null;
  return (await safely(async () => {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(path);
    return parseSession(raw);
  }, null)) ?? null;
}

export async function clearActiveSession() {
  if (Platform.OS === 'web') return;
  const path = pathFor(ACTIVE_FILE);
  if (!path) return;
  await safely(async () => {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) await FileSystem.deleteAsync(path, { idempotent: true });
  });
}

export async function appendSessionHistory(session: FocusSession) {
  if (Platform.OS === 'web') return;
  const path = pathFor(HISTORY_FILE);
  if (!path) return;
  await safely(async () => {
    const existing = await readHistory(path);
    if (existing.some((item) => item.id === session.id)) return;
    await FileSystem.writeAsStringAsync(path, JSON.stringify([...existing, session]));
  });
}

export async function loadSessionHistory(): Promise<FocusSession[]> {
  if (Platform.OS === 'web') return [];
  const path = pathFor(HISTORY_FILE);
  if (!path) return [];
  return safely(() => readHistory(path), []);
}

async function readHistory(path: string) {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return [];
  const raw = await FileSystem.readAsStringAsync(path);
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed.filter(isFocusSession) : [];
}

function parseSession(raw: string): FocusSession | null {
  const parsed: unknown = JSON.parse(raw);
  return isFocusSession(parsed) && (parsed.status === 'active' || parsed.status === 'paused') ? parsed : null;
}

function isFocusSession(value: unknown): value is FocusSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<FocusSession>;
  return typeof session.id === 'string'
    && (session.status === 'active' || session.status === 'paused' || session.status === 'completed' || session.status === 'cancelled')
    && typeof session.plannedDurationSeconds === 'number'
    && typeof session.focusedDurationSeconds === 'number'
    && typeof session.pausedDurationSeconds === 'number'
    && typeof session.createdAt === 'string'
    && typeof session.startedAt === 'string';
}

async function safely<T>(operation: () => Promise<T>): Promise<T | undefined>;
async function safely<T>(operation: () => Promise<T>, fallback: T): Promise<T>;
async function safely<T>(operation: () => Promise<T>, fallback?: T): Promise<T | undefined> {
  try {
    return await operation();
  } catch {
    return fallback;
  }
}
