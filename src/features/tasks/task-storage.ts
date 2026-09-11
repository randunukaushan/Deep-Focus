import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

import type { Task } from './task-types';

const TASKS_FILE = 'deep-focus-tasks.json';

function pathForTasks() {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${TASKS_FILE}` : null;
}

export async function loadTasks(): Promise<Task[]> {
  if (Platform.OS === 'web') return [];
  const path = pathForTasks();
  if (!path) return [];
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return [];
    const parsed: unknown = JSON.parse(await FileSystem.readAsStringAsync(path));
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: Task[]) {
  if (Platform.OS === 'web') return;
  const path = pathForTasks();
  if (!path) return;
  try { await FileSystem.writeAsStringAsync(path, JSON.stringify(tasks)); } catch { /* local persistence is best effort */ }
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const task = value as Partial<Task>;
  return typeof task.id === 'string' && typeof task.title === 'string' && task.title.trim().length > 0
    && (task.status === 'pending' || task.status === 'in_progress' || task.status === 'completed' || task.status === 'cancelled')
    && typeof task.createdAt === 'string' && typeof task.updatedAt === 'string';
}
