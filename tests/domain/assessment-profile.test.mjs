import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_VERSION,
  buildAssessmentProfile,
  isCompleteAssessmentAnswers,
} from '../../src/features/assessment/assessment-definition.ts';

const completeAnswers = Object.fromEntries(ASSESSMENT_QUESTIONS.map((question) => [question.id, question.options[0].id]));

test('versioned V1 assessment has seven stable single-choice prompts with unique option IDs', () => {
  assert.equal(ASSESSMENT_VERSION, '1.0.0');
  assert.equal(ASSESSMENT_QUESTIONS.length, 7);
  assert.equal(new Set(ASSESSMENT_QUESTIONS.map((question) => question.id)).size, 7);
  for (const question of ASSESSMENT_QUESTIONS) {
    assert.ok(question.prompt.length > 0);
    assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);
    assert.ok(question.options.every((option) => option.label.length > 0));
  }
});

test('assessment requires one supported answer for every stable question ID', () => {
  assert.equal(isCompleteAssessmentAnswers(completeAnswers), true);
  assert.equal(isCompleteAssessmentAnswers({ ...completeAnswers, focus_time: undefined }), false);
  assert.equal(isCompleteAssessmentAnswers({ ...completeAnswers, focus_time: 'unsupported' }), false);
  assert.equal(isCompleteAssessmentAnswers({ ...completeAnswers, privateField: 'unexpected' }), false);
  assert.equal(buildAssessmentProfile({}), null);
});

test('profile separates exact user choices from optional deterministic suggestions', () => {
  const answers = { ...completeAnswers, focus_time: 'evening', focus_pace: 'short', break_style: 'flexible', current_focus: 'learning' };
  const profile = buildAssessmentProfile(answers);
  assert.equal(profile.version, ASSESSMENT_VERSION);
  assert.equal(profile.sharedPreferences.length, ASSESSMENT_QUESTIONS.length);
  assert.equal(profile.sharedPreferences.find((item) => item.questionId === 'focus_time').value, 'In the evening');
  assert.ok(profile.suggestions.some((item) => item.text.includes('in the evening')));
  assert.ok(profile.suggestions.some((item) => item.text.includes('learning or study')));
  assert.match(profile.note, /not a diagnosis|not.*proven pattern/i);
  assert.match(profile.note, /nothing has been changed in your settings/i);
});
