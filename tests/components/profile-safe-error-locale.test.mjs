import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('profile route uses localized labels and never renders raw apply errors', () => {
  const source = fs.readFileSync('src/features/onboarding/setup-screens.tsx', 'utf8');
  const ui = fs.readFileSync('src/features/onboarding/setup-ui.tsx', 'utf8');
  const flow = fs.readFileSync('src/features/onboarding/setup-flow.ts', 'utf8');

  assert.match(ui, /accessibilityLabel=\{copy\.back\}/);
  assert.match(source, /copy\.reviewTitle/);
  assert.match(source, /copy\.reviewDetail/);
  assert.match(ui, /flow\.error === 'conflict' \? copy\.conflict : copy\.failed/);
  assert.match(source, /copy\.navError/);
  assert.match(flow, /error: conflict \? 'conflict' : 'apply'/);
  assert.equal(source.includes('{error.message}'), false);
  assert.equal(source.includes("'ASSESSMENT_APPLY_FAILED'"), false);
  assert.equal(source.includes('Back to assessment'), false);
});
