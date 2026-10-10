import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('teacher assignment saving state uses locale copy', () => {
  const source = fs.readFileSync('src/app/education/teacher-assignment.tsx', 'utf8');

  assert.match(source, /saving: 'Saving…'/);
  assert.match(source, /saving: 'சேமிக்கப்படுகிறது…'/);
  assert.match(source, /saving: 'සුරකිමින්…'/);
  assert.match(source, /saving \? text\.saving : text\.save/);
  assert.equal(source.includes("saving ? '…' : text.save"), false);
});
