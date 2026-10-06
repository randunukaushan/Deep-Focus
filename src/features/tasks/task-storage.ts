import { Platform } from 'react-native';

import type { Task } from './task-types';
import { loadTasks as loadLocalTasks, saveTasks as saveLocalTasks } from '@/features/storage/local-database';

export async function loadTasks(): Promise<Task[]> {
  if (Platform.OS === 'web') return [];
  return loadLocalTasks();
}

export async function saveTasks(tasks: Task[]) {
  if (Platform.OS === 'web') return;
  await saveLocalTasks(tasks);
}
