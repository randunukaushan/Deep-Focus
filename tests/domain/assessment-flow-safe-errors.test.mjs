import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('assessment flow does not copy arbitrary storage error messages into state', () => {
  const source = fs.readFileSync('src/features/assessment/assessment-flow-context.tsx', 'utf8');

  assert.equal(source.includes('error.message :'), false);
  assert.equal(source.includes('ASSESSMENT_SAVE_FAILED'), true);
  assert.equal(source.includes('ASSESSMENT_LOAD_FAILED'), true);
  assert.equal(source.includes('ASSESSMENT_CANCEL_FAILED'), true);
});
