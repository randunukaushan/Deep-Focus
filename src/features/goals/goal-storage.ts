import { Platform } from 'react-native';
import { loadGoals as loadLocalGoals, saveGoals as saveLocalGoals } from '@/features/storage/local-database';

import type { Goal } from './goal-types';

export async function loadGoals(): Promise<Goal[]> {
  if (Platform.OS === 'web') return [];
  return loadLocalGoals();
}

export async function saveGoals(goals: Goal[]) {
  if (Platform.OS === 'web') return;
  await saveLocalGoals(goals);
}
