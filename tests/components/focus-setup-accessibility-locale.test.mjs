import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('focus setup preset accessibility labels use localized minute copy', () => {
  const source = fs.readFileSync('src/app/focus/setup.tsx', 'utf8');

  assert.match(source, /accessibilityLabel=\{`\$\{value\} \$\{text\.minutes\}`\}/);
  assert.equal(source.includes('accessibilityLabel={`${value} minutes`}'), false);
  assert.equal(source.includes('{value} {text.minutes}</ThemedText>'), true);
  assert.equal(source.includes('{value} min</ThemedText>'), false);
});
