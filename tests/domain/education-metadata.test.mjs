import assert from 'node:assert/strict';
import test from 'node:test';

const { validateEducationMetadata } = await import('../../src/features/education/education-metadata.ts');

test('Sri Lankan education metadata accepts bounded optional study context', () => {
  assert.deepEqual(validateEducationMetadata({ country: 'LK', stage: 'ol', subject: 'Mathematics', topic: 'Algebra' }), {
    valid: true,
    value: { country: 'LK', stage: 'ol', subject: 'Mathematics', topic: 'Algebra' },
  });
});

test('education metadata rejects non-Sri Lankan or unsupported stages', () => {
  assert.equal(validateEducationMetadata({ country: 'US', stage: 'ol' }).reason, 'unsupported_country');
  assert.equal(validateEducationMetadata({ country: 'LK', stage: 'grade-8' }).reason, 'unsupported_stage');
});

test('education metadata rejects supplied material-like unbounded or control text', () => {
  assert.equal(validateEducationMetadata({ country: 'LK', stage: 'al', subject: '' }).reason, 'invalid_data');
  assert.equal(validateEducationMetadata({ country: 'LK', stage: 'higher', topic: 'x'.repeat(121) }).reason, 'invalid_data');
  assert.equal(validateEducationMetadata({ country: 'LK', stage: 'higher', examContext: 'A\nL' }).reason, 'invalid_data');
});
