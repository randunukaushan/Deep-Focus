import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import type { Goal } from './goal-types';

const GOALS_FILE = 'deep-focus-goals.json';

function goalsPath() {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${GOALS_FILE}` : null;
}

export async function loadGoals(): Promise<Goal[]> {
  if (Platform.OS === 'web') return [];
  const path = goalsPath();
  if (!path) return [];
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return [];
    const parsed: unknown = JSON.parse(await FileSystem.readAsStringAsync(path));
    return Array.isArray(parsed) ? parsed.filter(isGoal) : [];
  } catch {
    return [];
  }
}

export async function saveGoals(goals: Goal[]) {
  if (Platform.OS === 'web') return;
  const path = goalsPath();
  if (!path) return;
  try { await FileSystem.writeAsStringAsync(path, JSON.stringify(goals)); } catch { /* local persistence is best effort */ }
}

function isGoal(value: unknown): value is Goal {
  if (!value || typeof value !== 'object') return false;
  const goal = value as Partial<Goal>;
  return typeof goal.id === 'string' && typeof goal.title === 'string' && goal.title.trim().length > 0
    && (goal.type === 'focus_time' || goal.type === 'session_count')
    && (goal.period === 'weekly' || goal.period === 'monthly')
    && (goal.status === 'active' || goal.status === 'completed' || goal.status === 'cancelled' || goal.status === 'expired')
    && typeof goal.targetValue === 'number' && goal.targetValue > 0
    && typeof goal.createdAt === 'string' && typeof goal.updatedAt === 'string';
}
