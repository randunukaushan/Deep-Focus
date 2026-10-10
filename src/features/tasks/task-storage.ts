import { Platform } from 'react-native';

import type { Task } from './task-types';
import { deleteTask as deleteLocalTask, loadTasks as loadLocalTasks, saveTasks as saveLocalTasks, updateTaskArchive as updateLocalTaskArchive, updateTaskDetails as updateLocalTaskDetails, updateTaskTitle as updateLocalTaskTitle } from '@/features/storage/local-database';

export async function loadTasks(): Promise<Task[]> {
  if (Platform.OS === 'web') return [];
  return loadLocalTasks();
}

export async function saveTasks(tasks: Task[]) {
  if (Platform.OS === 'web') return;
  await saveLocalTasks(tasks);
}

export async function updateTaskTitle(taskId: string, expectedUpdatedAt: string, title: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  return updateLocalTaskTitle(taskId, expectedUpdatedAt, title);
}

export async function updateTaskDetails(taskId: string, expectedUpdatedAt: string, title: string, description: string, priority: Task['priority'], goalId?: string | null, dueAt?: string | null): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  return updateLocalTaskDetails(taskId, expectedUpdatedAt, title, description, priority, goalId, dueAt);
}

export async function updateTaskArchive(taskId: string, expectedUpdatedAt: string, archivedAt: string | null): Promise<string | null> {
  if (Platform.OS === 'web') throw new Error('TASK_STORAGE_UNAVAILABLE: local SQLite tasks are not available on web');
  return updateLocalTaskArchive(taskId, expectedUpdatedAt, archivedAt);
}

export async function deleteTask(taskId: string, expectedUpdatedAt: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return deleteLocalTask(taskId, expectedUpdatedAt);
}
