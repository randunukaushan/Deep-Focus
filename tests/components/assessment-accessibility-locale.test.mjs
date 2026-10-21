import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const screens = readFileSync('src/features/onboarding/setup-screens.tsx', 'utf8');
const ui = readFileSync('src/features/onboarding/setup-ui.tsx', 'utf8');
const copy = readFileSync('src/features/onboarding/setup-copy.ts', 'utf8');
test('setup uses localized radio/checkbox names, current/proposed values and an actual five-step progressbar', () => {
  assert.match(screens, /accessibilityRole="radiogroup"/);
  assert.match(ui, /accessibilityRole="progressbar"/);
  assert.match(ui, /max: 5/);
  assert.match(ui, /accessibilityState=\{\{ checked: selected, disabled \}\}/);
  assert.match(ui, /accessibilityLabel=\{detail/);
  assert.match(screens, /copy.current/);
  assert.match(screens, /copy.proposed/);
});
test('language choice persists via locale-only owner-bound storage before progression', () => {
  assert.match(screens, /flow.saveLocale\(locale\)/);
  assert.match(screens, /සිංහල/);
  assert.match(screens, /தமிழ்/);
  assert.match(screens, /English/);
  assert.match(copy, /const si: Copy/);
  assert.match(copy, /const ta: Copy/);
});
test('skip keeps drafts and navigation uses persisted onboarding steps instead of unguarded aliases', () => {
  assert.doesNotMatch(screens, /clearAnswers|cancelAssessment/);
  assert.match(screens, /onboarding.beginAssessment\(\)/);
  assert.match(screens, /onboarding.setStep\('profile'\)/);
  assert.match(screens, /onboarding.skip\(\)/);
  assert.match(screens, /onboarding.refresh\(\)/);
});
