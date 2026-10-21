import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SETUP_VERSION, SETUP_STEPS, SETUP_QUESTIONS, validSetupAnswers,
  validSetupPatch, validSetupPreferences, setupProposal, setupReview,
  selectedSetupPatch, setupPatchConflicts,
} from '../../src/features/onboarding/setup-definition.ts';

const current = { defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 10, appearance: 'system', reduceMotion: false };
const answers = { focus_duration: '25', break_duration: '15', appearance: 'dark', motion: 'reduced' };

test('setup has exactly five steps: language first plus four real preferences', () => {
  assert.equal(SETUP_VERSION, '2.0.0');
  assert.deepEqual(SETUP_STEPS, ['language', 'focus_duration', 'break_duration', 'appearance', 'motion']);
  assert.deepEqual(SETUP_QUESTIONS.map(q => q.id), SETUP_STEPS.slice(1));
});

test('only supported optional answers are accepted; v1 answers are not reinterpreted', () => {
  assert.equal(validSetupAnswers({}), true);
  assert.equal(validSetupAnswers(answers), true);
  for (const invalid of [null, [], 'dark', { focus_pace: 'short' }, { language: 'si' }, { focus_duration: 25 }, { focus_duration: '90' }, { motion: true }, { appearance: '__proto__' }, Object.create({ appearance: 'dark' })]) {
    assert.equal(validSetupAnswers(invalid), false);
    assert.throws(() => setupProposal(invalid), /INVALID_SETUP_ANSWERS/);
  }
});

test('skipped and keep-current answers produce no replacement', () => {
  assert.deepEqual(setupProposal({}), {});
  assert.deepEqual(setupProposal({ focus_duration: 'keep', break_duration: 'keep', appearance: 'keep', motion: 'keep' }), {});
  assert.deepEqual(setupReview({}, current), []);
});

test('all duration choices use exact supported minutes and motion is explicit', () => {
  for (const focus of [25, 45, 60]) for (const pause of [5, 10, 15]) {
    assert.deepEqual(setupProposal({ focus_duration: String(focus), break_duration: String(pause) }), { defaultFocusDurationMinutes: focus, defaultBreakDurationMinutes: pause });
  }
  assert.deepEqual(setupProposal({ motion: 'system' }), { reduceMotion: false });
  assert.deepEqual(setupProposal({ motion: 'reduced' }), { reduceMotion: true });
  assert.deepEqual(setupProposal(answers), { defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 15, appearance: 'dark', reduceMotion: true });
});

test('review contains only changed old/new pairs and Apply includes only selected rows', () => {
  assert.deepEqual(setupReview(answers, current), [
    { field: 'defaultFocusDurationMinutes', before: 45, after: 25 },
    { field: 'defaultBreakDurationMinutes', before: 10, after: 15 },
    { field: 'appearance', before: 'system', after: 'dark' },
    { field: 'reduceMotion', before: false, after: true },
  ]);
  assert.deepEqual(selectedSetupPatch(answers, current, []), {});
  assert.deepEqual(selectedSetupPatch(answers, current, ['appearance', 'reduceMotion']), { appearance: 'dark', reduceMotion: true });
  assert.deepEqual(setupReview({ appearance: 'system' }, current), []);
  assert.throws(() => selectedSetupPatch(answers, current, ['appearance', 'appearance']), /INVALID_SETUP_SELECTION/);
  assert.throws(() => selectedSetupPatch({}, current, ['appearance']), /INVALID_SETUP_SELECTION/);
  assert.throws(() => selectedSetupPatch(answers, current, ['uiLocale']), /INVALID_SETUP_SELECTION/);
});

test('settings boundary rejects malformed objects, string numbers and extra fields', () => {
  assert.equal(validSetupPreferences(current), true);
  assert.equal(validSetupPatch({}), true);
  for (const invalid of [null, [], { defaultFocusDurationMinutes: '25' }, { defaultBreakDurationMinutes: 0 }, { appearance: 'auto' }, { reduceMotion: 'true' }, { uiLocale: 'si' }, { owner_id: 'other' }, { personalPhrase: 'not part of this command' }]) {
    assert.equal(validSetupPatch(invalid), false);
  }
  assert.equal(validSetupPreferences({ appearance: 'dark' }), false);
});

test('concurrent selected-field edits conflict; unrelated edits and committed retries do not', () => {
  assert.equal(setupPatchConflicts({ ...current, defaultFocusDurationMinutes: 60 }, current, { defaultFocusDurationMinutes: 25 }), true);
  assert.equal(setupPatchConflicts({ ...current, appearance: 'light' }, current, { defaultFocusDurationMinutes: 25 }), false);
  assert.equal(setupPatchConflicts({ ...current, defaultFocusDurationMinutes: 25 }, current, { defaultFocusDurationMinutes: 25 }), false);
  assert.equal(setupPatchConflicts(current, current, {}), false);
});
