import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../../src/app/resources/index.tsx', import.meta.url), 'utf8');

test('resource mutations use localized safe error copy instead of exposing raw error messages', () => {
  assert.equal(source.includes('error.message'), false);
  assert.equal((source.match(/copy\.resourcesPage\.saveError/g) ?? []).length, 2);
});
