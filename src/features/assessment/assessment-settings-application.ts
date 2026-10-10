import { loadSettings, saveSettings, type AppSettings } from '@/features/settings/settings-storage';

import { applyAssessmentSettingsWithAdapter } from './assessment-personalization';
import type { AssessmentAnswers } from './assessment-definition';

/** Applies only after the caller has shown the suggestion and received confirmation. */
export async function applyAssessmentSettings(answers: AssessmentAnswers): Promise<AppSettings> {
  const current = await loadSettings();
  const suggestion = await applyAssessmentSettingsWithAdapter(answers, {
    loadSettings: async () => current,
    async saveSettings(next) {
      await saveSettings({ ...current, ...next });
    },
  });
  return { ...current, ...suggestion };
}
