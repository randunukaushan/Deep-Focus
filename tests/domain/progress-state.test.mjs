import assert from 'node:assert/strict';
import test from 'node:test';

import { readProgressHistory } from '../../src/features/progress/progress-state.ts';

test('progress history distinguishes a successful empty result from read failure', async () => {
  assert.deepEqual(await readProgressHistory(async () => []), { status: 'ready', sessions: [] });
  assert.deepEqual(await readProgressHistory(async () => { throw new Error('private storage detail'); }), { status: 'error' });
});

test('progress history can be retried after a transient read failure', async () => {
  let attempts = 0;
  const read = async () => {
    attempts += 1;
    if (attempts === 1) throw new Error('temporary read failure');
    return [{ id: 'session-1', status: 'completed' }];
  };

  assert.deepEqual(await readProgressHistory(read), { status: 'error' });
  assert.deepEqual(await readProgressHistory(read), { status: 'ready', sessions: [{ id: 'session-1', status: 'completed' }] });
  assert.equal(attempts, 2);
});
