import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const localizationDirectory = path.resolve('src/features/localization');
const localizationSources = [
  'app-locale.ts',
  'auth-callback-copy.ts',
  'auth-service-copy.ts',
  'auth-runtime-copy.ts',
  'break-copy.ts',
  'goal-detail-copy.ts',
  'progress-copy.ts',
  'rewards-copy.ts',
  'session-copy.ts',
  'session-recovery-copy.ts',
  'task-detail-runtime-copy.ts',
  'profile-education-copy.ts',
  'resource-runtime-copy.ts',
  'teacher-assignment-copy.ts',
];

function source(name) {
  return fs.readFileSync(path.join(localizationDirectory, name), 'utf8');
}

test('localization getters have a deterministic English fallback', () => {
  for (const name of localizationSources) {
    assert.match(source(name), /COPY\[locale\]\s*\?\?\s*COPY\.en/, `${name} is missing the English fallback`);
  }
});

test('Sinhala and Tamil copy do not regress to known mixed-language terms', () => {
  const localeSource = source('app-locale.ts');
  assert.match(localeSource, /polishSinhalaTerms/);
  assert.match(localeSource, /polishTamilTerms/);
  assert.match(localeSource, /replaceAll\('අවධානම්', 'අවධානයේ'\)/);
  assert.match(localeSource, /replaceAll\('draft-உம்', 'வரைவும்'\)/);

  const localizedValues = [...localeSource
    .split('\n')
    .filter((line) => !line.includes('replaceAll'))
    .join('\n')
    .matchAll(/'([^']*)'/g)]
    .map((match) => match[1])
    .filter((value) => /[\u0D80-\u0DFF\u0B80-\u0BFF]/u.test(value))
    .join('\n');
  for (const term of ['local', 'offline', 'onboarding', 'draft']) {
    assert.doesNotMatch(localizedValues, new RegExp(`\\b${term}\\b`, 'i'), `${term} leaked into localized copy`);
  }
});

test('persisted goal status identifiers have localized display labels', () => {
  const goalCopy = source('goal-detail-copy.ts');
  assert.match(goalCopy, /GOAL_STATUS_LABELS/);
  assert.match(goalCopy, /si: \{ completed: 'සම්පූර්ණයි', cancelled: 'අවලංගු කර ඇත', expired: 'කල් ඉකුත් වී ඇත' \}/);
  assert.match(goalCopy, /ta: \{ completed: 'முடிந்தது', cancelled: 'ரத்து செய்யப்பட்டது', expired: 'காலாவதியானது' \}/);
  assert.match(fs.readFileSync(path.resolve('src/app/goals/[goalId].tsx'), 'utf8'), /getGoalStatusLabel\(locale, goal\.status\)/);
  assert.match(fs.readFileSync(path.resolve('src/app/tasks/[taskId].tsx'), 'utf8'), /getGoalStatusLabel\(locale, goal\.status\)/);
});
