import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('teacher assignment saving state uses locale copy', () => {
  const source = fs.readFileSync('src/app/education/teacher-assignment.tsx', 'utf8');
  const copy = fs.readFileSync('src/features/localization/teacher-assignment-copy.ts', 'utf8');

  assert.match(copy, /saving: 'Saving…'/);
  assert.match(copy, /saving: 'சேமிக்கப்படுகிறது…'/);
  assert.match(copy, /saving: 'සුරකිමින්…'/);
  assert.match(source, /getTeacherAssignmentCopy\(locale\)/);
  assert.match(source, /loading=\{saving\} loadingAccessibilityLabel=\{text\.saving\}/);
  assert.match(source, /name="arrow-back"/);
  assert.match(source, /accessibilityRole="alert" themeColor="textPrimary"/);
  assert.match(source, /<SectionHeading eyebrow=\{text.eyebrow\}/);
  assert.equal(source.includes("saving ? '…' : text.save"), false);
});
