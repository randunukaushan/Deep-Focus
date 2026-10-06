import assert from 'node:assert/strict';
import test from 'node:test';

import { checkSessionRecovery } from '../../src/features/focus/session-recovery-state.ts';

const session = {
  id: 'session-1', status: 'active', plannedDurationSeconds: 1500,
  focusedDurationSeconds: 0, pausedDurationSeconds: 0,
  createdAt: '2026-10-06T00:00:00.000Z', startedAt: '2026-10-06T00:00:00.000Z',
};

test('recovery distinguishes a missing active record from a failed read', async () => {
  assert.deepEqual(await checkSessionRecovery(async () => null), { state: 'empty', session: null });
  assert.deepEqual(await checkSessionRecovery(async () => { throw new Error('private sqlite detail'); }), { state: 'error', session: null });
});

test('recovery retry can find the unchanged active session after a transient read failure', async () => {
  let attempts = 0;
  const load = async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('temporary read failure');
    return session;
  };

  assert.deepEqual(await checkSessionRecovery(load), { state: 'error', session: null });
  assert.deepEqual(await checkSessionRecovery(load), { state: 'found', session });
  assert.equal(attempts, 2);
});
