import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export type FocusBreakState = {
  sessionId: string;
  plannedDurationSeconds: number;
  startedAt: string;
};

const ACTIVE_BREAK_FILE = 'deep-focus-active-break.json';

function breakPath() {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${ACTIVE_BREAK_FILE}` : null;
}

export async function saveActiveBreak(state: FocusBreakState) {
  if (Platform.OS === 'web') return;
  const path = breakPath();
  if (!path) return;
  await safely(() => FileSystem.writeAsStringAsync(path, JSON.stringify(state)));
}

export async function loadActiveBreak(): Promise<FocusBreakState | null> {
  if (Platform.OS === 'web') return null;
  const path = breakPath();
  if (!path) return null;

  return (await safely(async () => {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(path);
    const parsed: unknown = JSON.parse(raw);
    return isFocusBreakState(parsed) ? parsed : null;
  }, null)) ?? null;
}

export async function clearActiveBreak() {
  if (Platform.OS === 'web') return;
  const path = breakPath();
  if (!path) return;

  await safely(async () => {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) await FileSystem.deleteAsync(path, { idempotent: true });
  });
}

function isFocusBreakState(value: unknown): value is FocusBreakState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Partial<FocusBreakState>;
  return typeof state.sessionId === 'string'
    && state.sessionId.length > 0
    && typeof state.plannedDurationSeconds === 'number'
    && Number.isFinite(state.plannedDurationSeconds)
    && state.plannedDurationSeconds > 0
    && typeof state.startedAt === 'string'
    && Number.isFinite(Date.parse(state.startedAt));
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
