import assert from 'node:assert/strict';
import test from 'node:test';

import { readGoalData } from '../../src/features/goals/goal-read-state.ts';

test('goal data distinguishes a genuine empty read from either storage failure', async () => {
  assert.deepEqual(await readGoalData(async () => [], async () => []), { status: 'ready', goals: [], sessions: [] });
  assert.deepEqual(await readGoalData(async () => { throw Error('private goal detail'); }, async () => []), { status: 'error' });
  assert.deepEqual(await readGoalData(async () => [], async () => { throw Error('private history detail'); }), { status: 'error' });
});

test('goal data can be retried after a transient read failure', async () => {
  let attempts = 0;
  const readGoals = async () => { attempts += 1; if (attempts === 1) throw Error('temporary failure'); return [{ id: 'goal-1' }]; };
  const readSessions = async () => [];
  assert.deepEqual(await readGoalData(readGoals, readSessions), { status: 'error' });
  assert.deepEqual(await readGoalData(readGoals, readSessions), { status: 'ready', goals: [{ id: 'goal-1' }], sessions: [] });
});
