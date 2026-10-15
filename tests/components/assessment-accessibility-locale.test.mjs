import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../src/app/onboarding/assessment.tsx', import.meta.url), 'utf8');
const entrySource = readFileSync(new URL('../../src/app/onboarding/index.tsx', import.meta.url), 'utf8');

test('assessment accessibility labels use localized copy', () => {
  assert.equal(source.includes('accessibilityLabel="Back to onboarding"'), false);
  assert.equal(source.includes('Assessment progress:'), false);
  assert.match(source, /assessmentCopy\.eyebrow/);
});

test('onboarding entry exposes a persisted app-language choice', () => {
  assert.match(entrySource, /loadSettings/);
  assert.match(entrySource, /saveSettings/);
  assert.match(entrySource, /uiLocale: value/);
  assert.match(entrySource, /accessibilityRole="radiogroup"/);
  assert.match(entrySource, /සිංහල/);
  assert.match(entrySource, /தமிழ்/);
  assert.match(entrySource, /English/);
});
