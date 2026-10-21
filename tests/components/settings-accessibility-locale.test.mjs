import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../src/app/profile/settings.tsx', import.meta.url), 'utf8');

test('settings accessibility labels use localized section copy', () => {
  assert.equal(source.includes('minute default focus'), false);
  assert.equal(source.includes('minute default break'), false);
  assert.equal(source.includes('Select ${option.label} interface'), false);
  assert.match(source, /settingsCopy\.focusDuration/);
  assert.match(source, /copy\.settings\.language/);
});
