import { Platform } from 'react-native';
import { deleteGoal as deleteLocalGoal, loadGoals as loadLocalGoals, saveGoals as saveLocalGoals, updateGoalDefinition as updateLocalGoalDefinition } from '@/features/storage/local-database';

import type { Goal } from './goal-types';

export async function loadGoals(): Promise<Goal[]> {
  if (Platform.OS === 'web') return [];
  return loadLocalGoals();
}

export async function saveGoals(goals: Goal[]) {
  if (Platform.OS === 'web') return;
  await saveLocalGoals(goals);
}

export async function updateGoalDefinition(goalId: string, expectedUpdatedAt: string, title: string, targetValue: number): Promise<Goal | null> {
  if (Platform.OS === 'web') return null;
  return updateLocalGoalDefinition(goalId, expectedUpdatedAt, title, targetValue);
}

export async function deleteGoal(goalId: string, expectedUpdatedAt: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return deleteLocalGoal(goalId, expectedUpdatedAt);
}
