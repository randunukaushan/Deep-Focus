import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';

register('../helpers/assessment-personalization-loader.mjs', import.meta.url);

import { ASSESSMENT_QUESTIONS } from '../../src/features/assessment/assessment-definition.ts';
const { applyAssessmentSettingsWithAdapter, buildAssessmentSettingsSuggestion } = await import('../../src/features/assessment/assessment-personalization.ts');

const complete = Object.fromEntries(ASSESSMENT_QUESTIONS.map((question) => [question.id, question.options[0].id]));

test('assessment personalization maps explicit choices to bounded local settings', () => {
  assert.deepEqual(buildAssessmentSettingsSuggestion({ ...complete, focus_pace: 'short', break_style: 'brief' }), {
    defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5,
  });
  assert.deepEqual(buildAssessmentSettingsSuggestion({ ...complete, focus_pace: 'long', break_style: 'unhurried' }), {
    defaultFocusDurationMinutes: 60, defaultBreakDurationMinutes: 15,
  });
});

test('incomplete or unsupported answers cannot produce settings writes', () => {
  assert.equal(buildAssessmentSettingsSuggestion({}), null);
  assert.equal(buildAssessmentSettingsSuggestion({ ...complete, focus_pace: 'unsupported' }), null);
});

test('confirmed personalization preserves the other settings and does not hide write failures', async () => {
  let saved = { defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 10 };
  const persistence = {
    async loadSettings() { return saved; },
    async saveSettings(next) { saved = next; },
  };
  const applied = await applyAssessmentSettingsWithAdapter(
    { ...complete, focus_pace: 'short', break_style: 'unhurried' }, persistence,
  );
  assert.deepEqual(applied, { defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 15 });
  assert.deepEqual(saved, applied);

  const failing = { ...persistence, async saveSettings() { throw new Error('SETTINGS_WRITE_FAILED'); } };
  await assert.rejects(
    applyAssessmentSettingsWithAdapter({ ...complete, focus_pace: 'long' }, failing),
    /SETTINGS_WRITE_FAILED/,
  );
  assert.deepEqual(saved, applied, 'failed application does not replace the prior saved settings');
});
