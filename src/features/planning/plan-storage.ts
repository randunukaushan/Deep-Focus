import { Platform } from 'react-native';

import {
  cancelActivePlan as cancelLocalActivePlan,
  loadActivePlan as loadLocalActivePlan,
  saveConfirmedPlan as saveLocalConfirmedPlan,
} from '@/features/storage/local-database';
import type { SavedPlan } from './plan-types';

export async function loadActivePlan(): Promise<SavedPlan | null> {
  if (Platform.OS === 'web') return null;
  return loadLocalActivePlan();
}

export async function saveConfirmedPlan(plan: SavedPlan): Promise<void> {
  if (Platform.OS === 'web') throw new Error('PLAN_STORAGE_UNAVAILABLE: local SQLite plans are not available on web');
  await saveLocalConfirmedPlan(plan);
}

export async function cancelActivePlan(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return cancelLocalActivePlan();
}
