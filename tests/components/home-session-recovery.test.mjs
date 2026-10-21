import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const homeSource = fs.readFileSync(new URL('../../src/features/home/home-screen.tsx', import.meta.url), 'utf8');
const layoutSource = fs.readFileSync(new URL('../../src/app/_layout.tsx', import.meta.url), 'utf8');
const recoverySource = fs.readFileSync(new URL('../../src/app/focus/recovery.tsx', import.meta.url), 'utf8');

test('startup and Home recovery load active and paused sessions fail-closed', () => {
  assert.match(homeSource, /loadActiveSession\(true\)/);
  assert.match(homeSource, /session\?\.status === 'active' \|\| session\?\.status === 'paused'/);
  assert.match(homeSource, /\.\.\.\(recoverableSession\.status === 'paused' \? \{ resume: '1' \} : \{\}\)/);
  assert.match(layoutSource, /store.loadFocusRecovery\(\)/);
  assert.match(recoverySource, /storage.load\(\)/);
  assert.match(layoutSource, /captureFocusRecoveryStore\(\)/);
  assert.match(layoutSource, /activeBreak\) router.replace\('\/focus\/break'\)/);
  assert.match(recoverySource, /result.activeBreak\) router.replace\('\/focus\/break'\)/);
});
