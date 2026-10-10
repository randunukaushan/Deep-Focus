import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('profile route uses localized labels and never renders raw apply errors', () => {
  const source = fs.readFileSync('src/app/onboarding/productivity-profile.tsx', 'utf8');

  assert.match(source, /accessibilityLabel=\{profileCopy\.back\}/);
  assert.match(source, /accessibilityLabel=\{profileCopy\.noAnswers\}/);
  assert.match(source, /accessibilityLabel=\{profileCopy\.review\}/);
  assert.match(source, /catch\(\(\) => \{ setApplyState\('error'\); setApplyError\(true\); \}\)/);
  assert.match(source, /applyError \? <ThemedText[^>]*>\{profileCopy\.applyError\}/);
  assert.equal(source.includes('{error.message}'), false);
  assert.equal(source.includes("'ASSESSMENT_APPLY_FAILED'"), false);
  assert.equal(source.includes('Back to assessment'), false);
});
