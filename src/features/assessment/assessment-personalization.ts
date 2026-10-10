import { isCompleteAssessmentAnswers, type AssessmentAnswers } from './assessment-definition';

export type AssessmentSettingsSuggestion = {
  defaultFocusDurationMinutes: 25 | 45 | 60;
  defaultBreakDurationMinutes: 5 | 10 | 15;
};

export type AssessmentSettingsPersistence = {
  loadSettings(): Promise<AssessmentSettingsSuggestion>;
  saveSettings(settings: AssessmentSettingsSuggestion): Promise<void>;
};


/**
 * Converts explicit assessment choices into bounded starting values only.
 * It never changes tasks, goals, rewards, account data or a running session.
 */
export function buildAssessmentSettingsSuggestion(answers: AssessmentAnswers): AssessmentSettingsSuggestion | null {
  if (!isCompleteAssessmentAnswers(answers)) return null;
  const focusDuration = answers.focus_pace === 'short' ? 25 : answers.focus_pace === 'long' ? 60 : 45;
  const breakDuration = answers.break_style === 'brief' ? 5 : answers.break_style === 'unhurried' ? 15 : 10;
  return { defaultFocusDurationMinutes: focusDuration, defaultBreakDurationMinutes: breakDuration };
}

/** Applies only after the caller has shown the suggestion and received confirmation. */
export async function applyAssessmentSettingsWithAdapter(
  answers: AssessmentAnswers,
  persistence: AssessmentSettingsPersistence,
): Promise<AssessmentSettingsSuggestion> {
  const suggestion = buildAssessmentSettingsSuggestion(answers);
  if (!suggestion) throw new Error('ASSESSMENT_INCOMPLETE: complete the assessment before applying settings');
  const current = await persistence.loadSettings();
  const next = { ...current, ...suggestion };
  await persistence.saveSettings(next);
  return next;
}
