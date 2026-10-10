import assert from 'node:assert/strict';
import test from 'node:test';

import { buildGoalCreateMutation, buildGoalCreatePayload, buildTaskCreateMutation, buildTaskCreatePayload } from '../../src/features/sync/sync-mutation-builders.ts';

const ID = '10000000-0000-4000-8000-000000000001';
const WORKSPACE = '20000000-0000-4000-8000-000000000001';

test('task create payload requires verified UUID context and preserves explicit fields', () => {
  const payload = buildTaskCreatePayload({ id: ID, title: '  Read  ', description: ' note ', priority: 'high', goalId: '30000000-0000-4000-8000-000000000001', dueAt: '2026-10-10T00:00:00.000Z', status: 'pending', createdAt: '2026-10-09T00:00:00.000Z', updatedAt: '2026-10-09T00:00:00.000Z' }, WORKSPACE);
  assert.deepEqual(payload, { id: ID, workspaceId: WORKSPACE, title: 'Read', description: 'note', priority: 'high', goalId: '30000000-0000-4000-8000-000000000001', due: { kind: 'date', date: '2026-10-10' } });
});

test('task and goal builders reject legacy IDs or missing workspace ownership', () => {
  assert.throws(() => buildTaskCreatePayload({ id: 'legacy-task', title: 'Read', status: 'pending', createdAt: '2026-10-09T00:00:00.000Z', updatedAt: '2026-10-09T00:00:00.000Z' }, WORKSPACE), /SYNC_TASK_ID_INVALID/);
  assert.throws(() => buildTaskCreatePayload({ id: ID, title: 'Read', status: 'pending', createdAt: '2026-10-09T00:00:00.000Z', updatedAt: '2026-10-09T00:00:00.000Z' }, 'legacy-workspace'), /SYNC_WORKSPACE_ID_INVALID/);
  assert.throws(() => buildGoalCreatePayload({ id: 'legacy-goal', title: 'Goal', type: 'focus_time', period: 'weekly', status: 'active', targetValue: 60, startsAt: '2026-10-06T00:00:00.000Z', endsAt: '2026-10-13T00:00:00.000Z', periodTimeZone: 'UTC', createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' }, WORKSPACE), /SYNC_GOAL_ID_INVALID/);
});

test('focus-time goal conversion is explicit and remains safe for seconds-based local storage', () => {
  const payload = buildGoalCreatePayload({ id: ID, title: 'Focus', type: 'focus_time', period: 'weekly', status: 'active', targetValue: 3600, startsAt: '2026-10-06T00:00:00.000Z', endsAt: '2026-10-13T00:00:00.000Z', periodTimeZone: 'Asia/Colombo', createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' }, WORKSPACE);
  assert.equal(payload.targetValue, 3_600_000);
  assert.equal(payload.targetUnit, 'ms');
});

test('mutation drafts bind actor/workspace and carry a caller-supplied idempotency key', () => {
  const actor = '40000000-0000-4000-8000-000000000001';
  const mutationId = '50000000-0000-4000-8000-000000000001';
  const task = { id: ID, title: 'Read', status: 'pending', createdAt: '2026-10-09T00:00:00.000Z', updatedAt: '2026-10-09T00:00:00.000Z' };
  assert.deepEqual(buildTaskCreateMutation(task, WORKSPACE, actor, mutationId), {
    mutationId, actorUserId: actor, workspaceId: WORKSPACE, operation: 'task.create',
    payload: { id: ID, workspaceId: WORKSPACE, title: 'Read', due: { kind: 'none' } },
  });
});

test('mutation drafts fail closed for an invalid actor or idempotency key', () => {
  const goal = { id: ID, title: 'Focus', type: 'focus_time', period: 'weekly', status: 'active', targetValue: 60, startsAt: '2026-10-06T00:00:00.000Z', endsAt: '2026-10-13T00:00:00.000Z', periodTimeZone: 'UTC', createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' };
  assert.throws(() => buildGoalCreateMutation(goal, WORKSPACE, 'not-an-actor'), /SYNC_ACTOR_ID_INVALID/);
  assert.throws(() => buildGoalCreateMutation(goal, WORKSPACE, '40000000-0000-4000-8000-000000000001', 'not-a-mutation'), /SYNC_MUTATION_ID_INVALID/);
});
