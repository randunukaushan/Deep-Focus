import assert from 'node:assert/strict';
import test from 'node:test';

const { validateSyncV2PushInput } = await import('../../supabase/functions/_shared/sync-v2-push-validation.ts');

const TASK = '11111111-1111-4111-8111-111111111111';
const GOAL = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const SESSION = '44444444-4444-4444-8444-444444444444';
const REMINDER = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-10-11T00:00:00.000Z';

const item = (command, targetId, body, mutationId = '66666666-6666-4666-8666-666666666666') => ({ mutationId, command, targetId, body });
const validBodies = [
  item('task.create', TASK, { id: TASK, workspaceId: WORKSPACE, title: 'Read', description: '', priority: 'medium', goalId: null, due: { kind: 'none' } }),
  item('task.patch', TASK, { expectedVersion: 1, title: 'Read more' }),
  item('task.action', TASK, { id: TASK, expectedVersion: 1, action: 'complete', occurredAt: NOW }),
  item('task.delete', TASK, { expectedVersion: 1 }),
  item('goal.create', GOAL, { id: GOAL, workspaceId: WORKSPACE, title: 'Goal', type: 'focus_time', period: 'daily', startsAt: NOW, endsAt: '2026-10-12T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 60000, targetUnit: 'ms' }),
  item('goal.patch', GOAL, { expectedVersion: 1, title: 'Goal updated' }),
  item('goal.delete', GOAL, { expectedVersion: 1 }),
  item('session.start', SESSION, { id: SESSION, workspaceId: WORKSPACE, taskId: TASK, plannedMs: 60000, startedAt: NOW }),
  item('session.event', SESSION, { id: SESSION, expectedVersion: 1, type: 'pause', occurredAt: NOW, clientSequence: 1 }),
  item('break.record', REMINDER, { id: REMINDER, focusSessionId: SESSION, startedAt: NOW, endedAt: '2026-10-11T00:01:00.000Z', plannedMs: 60000, outcome: 'completed' }),
  item('settings.patch', WORKSPACE, { expectedVersion: 1, theme: 'dark' }),
  item('reminder.create', REMINDER, { id: REMINDER, taskId: TASK, scheduledFor: NOW, timeZone: 'Asia/Colombo', delivery: 'local_device' }),
  item('reminder.patch', REMINDER, { expectedVersion: 1, enabled: false }),
  item('reminder.delete', REMINDER, { expectedVersion: 1 }),
];

test('V2 push admits every existing V1 command through its existing DTO validator', () => {
  for (const [index, candidate] of validBodies.entries()) {
    const accepted = validateSyncV2PushInput({ contractVersion: 2, privacyEpoch: '1', items: [{ ...candidate, mutationId: `66666666-6666-4666-8666-${String(index + 1).padStart(12, '0')}` }] });
    assert.equal(accepted.items[0].command, candidate.command);
  }
});

test('V2 push rejects stale envelope shape, duplicate IDs, wrong targets and oversized bodies before execution', () => {
  assert.throws(() => validateSyncV2PushInput({ contractVersion: 2, privacyEpoch: '0', items: [validBodies[0]] }), /VALIDATION_FAILED/);
  assert.throws(() => validateSyncV2PushInput({ contractVersion: 2, privacyEpoch: '1', items: [validBodies[0], validBodies[0]] }), /VALIDATION_FAILED/);
  assert.throws(() => validateSyncV2PushInput({ contractVersion: 2, privacyEpoch: '1', items: [{ ...validBodies[0], targetId: GOAL }] }), /VALIDATION_FAILED/);
  assert.throws(() => validateSyncV2PushInput({ contractVersion: 2, privacyEpoch: '1', items: [{ ...validBodies[0], body: { ...validBodies[0].body, description: 'x'.repeat(70000) } }] }), /VALIDATION_FAILED/);
  assert.throws(() => validateSyncV2PushInput({ contractVersion: 2, privacyEpoch: '1', items: [{ ...validBodies[0], command: 'plan.create' }] }), /VALIDATION_FAILED/);
});
