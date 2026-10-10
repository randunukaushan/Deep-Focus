import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../src/app/resources/index.tsx', import.meta.url), 'utf8');

test('resources loading state uses resource-specific localized copy', () => {
  assert.match(source, /copy\.resourcesPage\.loading/);
  assert.doesNotMatch(source, /copy\.tasks\.loading/);
});
