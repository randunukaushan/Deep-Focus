import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('plan navigation cards expose their localized title and detail', () => {
  const source = readFileSync('src/app/(tabs)/plan.tsx', 'utf8');

  assert.match(source, /accessibilityLabel=\{`\$\{title\}\. \$\{detail\}`\}/);
});
