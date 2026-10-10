import assert from 'node:assert/strict';
import test from 'node:test';
import { getBreakCopy } from '../../src/features/localization/break-copy.ts';

test('break accessibility copy exists for every approved locale', () => {
  for (const locale of ['en', 'si', 'ta']) {
    const copy = getBreakCopy(locale);
    assert.ok(copy.remaining);
    assert.ok(copy.minuteUnit);
  }
});
