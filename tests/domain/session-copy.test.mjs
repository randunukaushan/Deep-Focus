import assert from 'node:assert/strict';
import test from 'node:test';
import { getSessionCopy } from '../../src/features/localization/session-copy.ts';

test('session copy has all core states in every approved locale', () => {
  for (const locale of ['en', 'si', 'ta']) {
    const copy = getSessionCopy(locale);
    for (const key of ['eyebrow', 'title', 'paused', 'complete', 'ended', 'inFocus', 'saving', 'retrySave', 'returnHome', 'resume', 'pause', 'break', 'completeSession', 'endSession', 'terminalSaveFailure', 'remaining']) assert.ok(copy[key]);
  }
});
