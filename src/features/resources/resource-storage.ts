import { Platform } from 'react-native';

import {
  linkResourceToTask as linkLocalResourceToTask,
  loadResources as loadLocalResources,
  loadTaskResourceLinks as loadLocalTaskResourceLinks,
  markResourceMissing as markLocalResourceMissing,
  saveResource as saveLocalResource,
  unlinkResourceFromTask as unlinkLocalResourceFromTask,
} from '@/features/storage/local-database';
import type { LocalResource, TaskResourceLink } from './resource-types';

export async function loadResources(): Promise<LocalResource[]> {
  if (Platform.OS === 'web') return [];
  return loadLocalResources();
}

export async function saveResource(resource: LocalResource): Promise<void> {
  if (Platform.OS === 'web') throw new Error('RESOURCE_STORAGE_UNAVAILABLE: local SQLite resources are not available on web');
  await saveLocalResource(resource);
}

export async function markResourceMissing(resourceId: string, expectedUpdatedAt: string): Promise<boolean> {
  if (Platform.OS === 'web') throw new Error('RESOURCE_STORAGE_UNAVAILABLE: local SQLite resources are not available on web');
  return markLocalResourceMissing(resourceId, expectedUpdatedAt);
}

export async function loadTaskResourceLinks(taskId: string): Promise<TaskResourceLink[]> {
  if (Platform.OS === 'web') return [];
  return loadLocalTaskResourceLinks(taskId);
}

export async function linkResourceToTask(taskId: string, resourceId: string, resourceRevision: number, workSlice?: string, position?: number): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return linkLocalResourceToTask(taskId, resourceId, resourceRevision, workSlice, position);
}

export async function unlinkResourceFromTask(taskId: string, resourceId: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return unlinkLocalResourceFromTask(taskId, resourceId);
}
