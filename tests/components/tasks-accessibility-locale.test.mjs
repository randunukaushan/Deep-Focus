import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../src/app/tasks/index.tsx', import.meta.url), 'utf8');

test('tasks save failure uses localized task copy', () => {
  assert.match(source, /setSaveError\(text\.saveError\)/);
  assert.doesNotMatch(source, /Your changes could not be saved/);
});
