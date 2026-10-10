import { Platform } from 'react-native';

import {
  cancelAssessment as cancelLocalAssessment,
  loadAssessment as loadLocalAssessment,
  saveAssessmentDraft as saveLocalAssessmentDraft,
} from '@/features/storage/local-database';
import type { AssessmentAnswerValue, AssessmentAttempt } from '@/features/storage/local-database';

export type { AssessmentAnswerValue, AssessmentAttempt };

export async function loadAssessment(assessmentId: string): Promise<AssessmentAttempt | null> {
  if (Platform.OS === 'web') throw new Error('ASSESSMENT_STORAGE_UNAVAILABLE: local SQLite assessment data is unavailable on web');
  return loadLocalAssessment(assessmentId);
}

export async function saveAssessmentDraft(
  draft: { id: string; version: string; startedAt: string; answers: Record<string, AssessmentAnswerValue> },
  expectedUpdatedAt: string | null,
): Promise<string | null> {
  if (Platform.OS === 'web') throw new Error('ASSESSMENT_STORAGE_UNAVAILABLE: local SQLite assessment data is unavailable on web');
  return saveLocalAssessmentDraft(draft, expectedUpdatedAt);
}

export async function cancelAssessment(assessmentId: string, expectedUpdatedAt: string | null): Promise<boolean> {
  if (Platform.OS === 'web') throw new Error('ASSESSMENT_STORAGE_UNAVAILABLE: local SQLite assessment data is unavailable on web');
  return cancelLocalAssessment(assessmentId, expectedUpdatedAt);
}
