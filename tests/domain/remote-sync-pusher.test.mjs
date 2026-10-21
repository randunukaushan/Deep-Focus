import assert from 'node:assert/strict';
import test from 'node:test';

const { createRemoteSyncPusher } = await import('../../src/features/sync/remote-sync-pusher.ts');
const { RemoteApiError } = await import('../../src/features/auth/remote-api-client.ts');

const ID = '10000000-0000-4000-8000-000000000001';
const TASK = '20000000-0000-4000-8000-000000000002';

function item(command, overrides = {}) {
  return { mutationId: ID, command, targetId: TASK, body: { id: TASK, workspaceId: '30000000-0000-4000-8000-000000000003', title: 'Study' }, ...overrides };
}

function client(requests, response = {}) {
  return { async request(path, options) { requests.push({ path, options }); return response; } };
}

test('remote sync maps approved mutation commands and uses the mutation UUID as idempotency key', async () => {
  const requests = [];
  const push = createRemoteSyncPusher({ client: client(requests) });
  const result = await push([item('task.create')], 'ignored-batch-key');
  assert.deepEqual(result, { acceptedMutationIds: [ID] });
  assert.deepEqual(requests, [{ path: '/v1/tasks', options: { method: 'POST', body: item('task.create').body, idempotencyKey: ID } }]);
});

test('remote sync maps task actions, patches and session events without changing payloads', async () => {
  const requests = [];
  const push = createRemoteSyncPusher({ client: client(requests) });
  await push([
    item('task.patch', { body: { expectedVersion: 1, title: 'New title' } }),
    item('task.action', { body: { id: TASK, expectedVersion: 1, action: 'complete', occurredAt: '2026-10-09T00:00:00.000Z' } }),
    item('session.event', { body: { event: { id: ID, expectedVersion: 1, type: 'complete', occurredAt: '2026-10-09T00:00:00.000Z', clientSequence: 1 } } }),
  ], 'ignored');
  assert.deepEqual(requests.map(({ path, options }) => ({ path, method: options.method, body: options.body })), [
    { path: `/v1/tasks/${TASK}`, method: 'PATCH', body: { expectedVersion: 1, title: 'New title' } },
    { path: `/v1/tasks/${TASK}/actions`, method: 'POST', body: { id: TASK, expectedVersion: 1, action: 'complete', occurredAt: '2026-10-09T00:00:00.000Z' } },
    { path: `/v1/focus-sessions/${TASK}/events`, method: 'POST', body: { id: ID, expectedVersion: 1, type: 'complete', occurredAt: '2026-10-09T00:00:00.000Z', clientSequence: 1 } },
  ]);
});

test('remote sync maps the remaining approved extension commands and moves delete versions to a header', async () => {
  const requests = [];
  const push = createRemoteSyncPusher({ client: client(requests) });
  await push([
    item('task.delete', { body: { expectedVersion: 2 } }),
    item('goal.patch', { targetId: TASK, body: { expectedVersion: 2, title: 'Goal' } }),
    item('goal.delete', { targetId: TASK, body: { expectedVersion: 3 } }),
    item('break.record', { body: { expectedVersion: 1, sessionId: TASK, plannedMs: 60000, startedAt: '2026-10-09T00:00:00.000Z', endedAt: '2026-10-09T00:01:00.000Z', outcome: 'completed' } }),
    item('settings.patch', { body: { expectedVersion: 1, theme: 'dark' } }),
    item('reminder.create', { body: { expectedVersion: 1, taskId: TASK, scheduledFor: '2026-10-09T01:00:00.000Z', timeZone: 'Asia/Colombo', enabled: true, delivery: 'local' } }),
    item('reminder.patch', { body: { expectedVersion: 1, enabled: false } }),
    item('reminder.delete', { body: { expectedVersion: 1 } }),
  ], 'ignored');
  assert.deepEqual(requests.map(({ path, options }) => ({ path, method: options.method, body: options.body, expectedVersion: options.expectedVersion })), [
    { path: `/v1/tasks/${TASK}`, method: 'DELETE', body: undefined, expectedVersion: 2 },
    { path: `/v1/goals/${TASK}`, method: 'PATCH', body: { expectedVersion: 2, title: 'Goal' }, expectedVersion: undefined },
    { path: `/v1/goals/${TASK}`, method: 'DELETE', body: undefined, expectedVersion: 3 },
    { path: '/v1/breaks', method: 'POST', body: { expectedVersion: 1, sessionId: TASK, plannedMs: 60000, startedAt: '2026-10-09T00:00:00.000Z', endedAt: '2026-10-09T00:01:00.000Z', outcome: 'completed' }, expectedVersion: undefined },
    { path: '/v1/settings', method: 'PATCH', body: { expectedVersion: 1, theme: 'dark' }, expectedVersion: undefined },
    { path: '/v1/task-reminders', method: 'POST', body: { expectedVersion: 1, taskId: TASK, scheduledFor: '2026-10-09T01:00:00.000Z', timeZone: 'Asia/Colombo', enabled: true, delivery: 'local' }, expectedVersion: undefined },
    { path: `/v1/task-reminders/${TASK}`, method: 'PATCH', body: { expectedVersion: 1, enabled: false }, expectedVersion: undefined },
    { path: `/v1/task-reminders/${TASK}`, method: 'DELETE', body: undefined, expectedVersion: 1 },
  ]);
});

test('remote sync rejects client-supplied ownership and legacy terminal snapshots', async () => {
  const requests = [];
  const push = createRemoteSyncPusher({ client: client(requests) });
  assert.deepEqual(await push([item('task.create', { body: { ...item('task.create').body, ownerId: 'foreign' } })], 'ignored'), {
    acceptedMutationIds: [], rejectedMutationIds: [{ mutationId: ID, errorCode: 'SYNC_PAYLOAD_INVALID' }],
  });
  assert.deepEqual(await push([item('session.terminal')], 'ignored'), {
    acceptedMutationIds: [], rejectedMutationIds: [{ mutationId: ID, errorCode: 'SYNC_EVENT_REQUIRED' }],
  });
  assert.deepEqual(requests, []);
});

test('remote sync treats authorized conflicts as item rejections but retries transient failures', async () => {
  const conflictClient = { async request() { throw new RemoteApiError(409, 'VERSION_CONFLICT'); } };
  const conflictPush = createRemoteSyncPusher({ client: conflictClient });
  assert.deepEqual(await conflictPush([item('task.create')], 'ignored'), {
    acceptedMutationIds: [],
    rejectedMutationIds: [{ mutationId: ID, errorCode: 'VERSION_CONFLICT' }],
  });
  const transientPush = createRemoteSyncPusher({ client: { async request() { throw new Error('offline'); } } });
  await assert.rejects(() => transientPush([item('task.create')], 'ignored'), /offline/);
});

test('remote sync preserves gateway authorization codes for outbox quarantine', async () => {
  const push = createRemoteSyncPusher({ client: { async request() { throw new RemoteApiError(403, 'ACCESS_DENIED'); } } });
  assert.deepEqual(await push([item('task.create')], 'ignored'), {
    acceptedMutationIds: [],
    rejectedMutationIds: [{ mutationId: ID, errorCode: 'ACCESS_DENIED' }],
  });
});

test('remote sync never uses non-UUID local IDs as remote idempotency keys', async () => {
  const push = createRemoteSyncPusher({ client: client([]) });
  assert.deepEqual(await push([{ ...item('task.create'), mutationId: 'terminal:session' }], 'ignored'), {
    acceptedMutationIds: [], rejectedMutationIds: [{ mutationId: 'terminal:session', errorCode: 'SYNC_IDEMPOTENCY_INVALID' }],
  });
});
