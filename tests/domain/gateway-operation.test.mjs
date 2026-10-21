import assert from 'node:assert/strict';
import test from 'node:test';

const { admitGatewayOperation } = await import('../../supabase/functions/_shared/gateway-operation.ts');

const actorId = '11111111-1111-4111-8111-111111111111';
const taskId = '22222222-2222-4222-8222-222222222222';
const mutationId = '33333333-3333-4333-8333-333333333333';
const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': mutationId };

test('operation admission applies the route-specific DTO key contract', () => {
  const result = admitGatewayOperation({ method: 'POST', path: '/v1/tasks', actorId, headers, bodyText: '{"id":"22222222-2222-4222-8222-222222222222","workspaceId":"44444444-4444-4444-8444-444444444444","title":"Read"}' });
  assert.equal(result.route.operation, 'createTask');
  assert.equal(result.request.body?.title, 'Read');
});

test('Plan My Day reads require the exact versioned contract header', () => {
  assert.equal(admitGatewayOperation({ method: 'GET', path: `/v1/plans/${taskId}`, actorId, headers: { 'Plan-Contract-Version': '2' } }).route.operation, 'getPlan');
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: `/v1/plans/${taskId}`, actorId, headers: {} }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: `/v1/plans/${taskId}`, actorId, headers: { 'Plan-Contract-Version': '1' } }), /VALIDATION_FAILED/);
});

test('plan lifecycle action admission requires an exact versioned command', () => {
  const planId = taskId;
  const body = JSON.stringify({ action: 'archive', expectedVersion: 2, reminderVersions: [] });
  const result = admitGatewayOperation({ method: 'POST', path: `/v1/plans/${planId}/actions`, actorId, headers, bodyText: body });
  assert.equal(result.route.operation, 'applyPlanAction');
  assert.equal(result.route.resourceId, planId);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: `/v1/plans/${planId}/actions`, actorId, headers, bodyText: JSON.stringify({ action: 'restore', expectedVersion: 2, reminderVersions: [{ id: planId, expectedVersion: 1 }] }) }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: `/v1/plans/${planId}/actions`, actorId, headers, bodyText: JSON.stringify({ action: 'archive', expectedVersion: 2, reminderVersions: [], ownerId: actorId }) }), /VALIDATION_FAILED/);
});

test('plan edit admission binds the editable plan identity to the route', () => {
  const plan = { id: taskId, workspaceId: '44444444-4444-4444-8444-444444444444', localDate: '2026-10-11', timeZone: 'Asia/Colombo', availableStart: '2026-10-11T08:00:00.000Z', availableEnd: '2026-10-11T10:00:00.000Z', explanation: null, blocks: [{ id: '55555555-5555-4555-8555-555555555555', kind: 'focus', taskId: '66666666-6666-4666-8666-666666666666', startsAt: '2026-10-11T08:00:00.000Z', endsAt: '2026-10-11T08:25:00.000Z', reminderId: null }] };
  const body = { expectedVersion: 1, plan, taskVersions: [{ id: plan.blocks[0].taskId, expectedVersion: 1 }], reminderActions: [] };
  assert.equal(admitGatewayOperation({ method: 'PATCH', path: `/v1/plans/${taskId}`, actorId, headers, bodyText: JSON.stringify(body) }).route.operation, 'patchPlan');
  assert.throws(() => admitGatewayOperation({ method: 'PATCH', path: `/v1/plans/${taskId}`, actorId, headers, bodyText: JSON.stringify({ ...body, plan: { ...plan, id: '77777777-7777-4777-8777-777777777777' } }) }), /VALIDATION_FAILED/);
});

test('operation admission validates the owner-scoped goal patch contract', () => {
  const result = admitGatewayOperation({ method: 'PATCH', path: `/v1/goals/${taskId}`, actorId, headers, bodyText: '{"expectedVersion":2,"title":"Weekly goal"}' });
  assert.equal(result.route.operation, 'patchGoal');
  assert.throws(() => admitGatewayOperation({ method: 'PATCH', path: `/v1/goals/${taskId}`, actorId, headers, bodyText: '{"expectedVersion":2}' }), /VALIDATION_FAILED/);
});

test('operation admission validates the owner-scoped goal delete contract', () => {
  const result = admitGatewayOperation({ method: 'DELETE', path: `/v1/goals/${taskId}`, actorId, headers, bodyText: '{"expectedVersion":2}' });
  assert.equal(result.route.operation, 'deleteGoal');
  assert.throws(() => admitGatewayOperation({ method: 'DELETE', path: `/v1/goals/${taskId}`, actorId, headers, bodyText: '{"expectedVersion":2,"title":"extra"}' }), /VALIDATION_FAILED/);
});

test('operation admission validates the owner-scoped task delete contract', () => {
  const result = admitGatewayOperation({ method: 'DELETE', path: `/v1/tasks/${taskId}`, actorId, headers, bodyText: '{"expectedVersion":2}' });
  assert.equal(result.route.operation, 'deleteTask');
  assert.throws(() => admitGatewayOperation({ method: 'DELETE', path: `/v1/tasks/${taskId}`, actorId, headers, bodyText: '{"expectedVersion":2,"title":"extra"}' }), /VALIDATION_FAILED/);
});

test('operation admission accepts only the exact reviewed AI proposal confirmation', () => {
  const proposalId = taskId;
  const body = JSON.stringify({ expectedProposalVersion: 2, reviewDigest: 'a'.repeat(64), selectedOperationIds: [taskId] });
  const result = admitGatewayOperation({ method: 'POST', path: `/v1/ai/proposals/${proposalId}/apply`, actorId, headers, bodyText: body });
  assert.equal(result.route.operation, 'applyAiProposal');
  assert.equal(result.route.resourceId, proposalId);
  for (const invalid of [
    { expectedProposalVersion: 2, reviewDigest: 'a'.repeat(64), selectedOperationIds: [] },
    { expectedProposalVersion: 2, reviewDigest: 'short', selectedOperationIds: [taskId] },
    { expectedProposalVersion: 2, reviewDigest: 'a'.repeat(64), selectedOperationIds: [taskId, taskId] },
    { expectedProposalVersion: 2, reviewDigest: 'a'.repeat(64), selectedOperationIds: [taskId], ownerId: actorId },
  ]) assert.throws(() => admitGatewayOperation({ method: 'POST', path: `/v1/ai/proposals/${proposalId}/apply`, actorId, headers, bodyText: JSON.stringify(invalid) }), /VALIDATION_FAILED/);
});

test('operation admission validates the exact Plan My Day generation input', () => {
  const body = JSON.stringify({ requestId: taskId, taskIds: [taskId], availableStart: '2026-10-11T08:00:00.000Z', availableEnd: '2026-10-11T12:00:00.000Z', timeZone: 'Asia/Colombo', preferences: { defaultFocusMinutes: 25, defaultBreakMinutes: 5, reminderLeadMinutes: null } });
  assert.equal(admitGatewayOperation({ method: 'POST', path: '/v1/ai/plan-my-day', actorId, headers, bodyText: body }).route.operation, 'createAiGeneration');
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/ai/plan-my-day', actorId, headers, bodyText: body.replace('"taskIds":["22222222-2222-4222-8222-222222222222"]', '"taskIds":[]') }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/ai/plan-my-day', actorId, headers, bodyText: body.replace('"preferences":{', '"ownerId":"foreign","preferences":{') }), /VALIDATION_FAILED/);
});

test('operation admission accepts only the three exact account-session revoke scopes', () => {
  assert.equal(admitGatewayOperation({ method: 'POST', path: '/v1/account/sessions/revoke', actorId, headers, bodyText: '{"scope":"all"}' }).route.operation, 'revokeAccountSessions');
  assert.doesNotThrow(() => admitGatewayOperation({ method: 'POST', path: '/v1/account/sessions/revoke', actorId, headers, bodyText: '{"scope":"others"}' }));
  assert.doesNotThrow(() => admitGatewayOperation({ method: 'POST', path: '/v1/account/sessions/revoke', actorId, headers, bodyText: '{"scope":"one","sessionId":"22222222-2222-4222-8222-222222222222"}' }));
  for (const body of ['{"scope":"one"}', '{"scope":"all","sessionId":"22222222-2222-4222-8222-222222222222"}', '{"scope":"unknown"}']) {
    assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/account/sessions/revoke', actorId, headers, bodyText: body }), /VALIDATION_FAILED/);
  }
});

test('operation admission requires an exact empty sign-out body', () => {
  assert.equal(admitGatewayOperation({ method: 'POST', path: '/v1/auth/sign-out', actorId, headers, bodyText: '{}' }).route.operation, 'signOut');
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/auth/sign-out', actorId, headers, bodyText: '{"scope":"all"}' }), /VALIDATION_FAILED/);
});

test('operation admission requires an exact empty AI cancellation body', () => {
  assert.equal(admitGatewayOperation({ method: 'POST', path: `/v1/ai/requests/${taskId}/cancel`, actorId, headers, bodyText: '{}' }).route.operation, 'cancelAiGeneration');
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: `/v1/ai/requests/${taskId}/cancel`, actorId, headers, bodyText: '{"ownerId":"foreign"}' }), /VALIDATION_FAILED/);
});

test('operation admission validates the versioned settings patch contract', () => {
  const result = admitGatewayOperation({ method: 'PATCH', path: '/v1/settings', actorId, headers, bodyText: '{"expectedVersion":1,"theme":"dark"}' });
  assert.equal(result.route.operation, 'patchSettings');
  assert.throws(() => admitGatewayOperation({ method: 'PATCH', path: '/v1/settings', actorId, headers, bodyText: '{"expectedVersion":1}' }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'PATCH', path: '/v1/settings', actorId, headers, bodyText: '{"expectedVersion":1,"theme":"neon"}' }), /VALIDATION_FAILED/);
});

test('operation admission validates the owned break record contract', () => {
  const body = JSON.stringify({ id: taskId, focusSessionId: '44444444-4444-4444-8444-444444444444', startedAt: '2026-10-10T01:25:00.000Z', endedAt: '2026-10-10T01:30:00.000Z', plannedMs: 300000, outcome: 'completed' });
  assert.equal(admitGatewayOperation({ method: 'POST', path: '/v1/breaks', actorId, headers, bodyText: body }).route.operation, 'recordBreak');
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/breaks', actorId, headers, bodyText: body.replace('300000', '0') }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/breaks', actorId, headers, bodyText: body.replace('"completed"', '"unknown"') }), /VALIDATION_FAILED/);
});

test('operation admission validates reminder intent and versioned mutations', () => {
  const create = JSON.stringify({ id: taskId, taskId, scheduledFor: '2026-10-12T01:00:00.000Z', timeZone: 'Asia/Colombo', delivery: 'local_device' });
  assert.equal(admitGatewayOperation({ method: 'POST', path: '/v1/task-reminders', actorId, headers, bodyText: create }).route.operation, 'createReminder');
  assert.equal(admitGatewayOperation({ method: 'PATCH', path: `/v1/task-reminders/${taskId}`, actorId, headers, bodyText: '{"expectedVersion":1,"enabled":false}' }).route.operation, 'patchReminder');
  assert.equal(admitGatewayOperation({ method: 'DELETE', path: `/v1/task-reminders/${taskId}`, actorId, headers, bodyText: '{"expectedVersion":1}' }).route.operation, 'deleteReminder');
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/task-reminders', actorId, headers, bodyText: create.replace('local_device', 'push') }), /VALIDATION_FAILED/);
});

test('operation admission accepts only the exact own-account export request', () => {
  const result = admitGatewayOperation({ method: 'POST', path: '/v1/privacy/exports', actorId, headers, bodyText: '{"format":"json","scope":"own_account_data"}' });
  assert.equal(result.route.operation, 'createPrivacyExport');
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/privacy/exports', actorId, headers, bodyText: '{"format":"json","scope":"all_data"}' }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/privacy/exports', actorId, headers, bodyText: '{"format":"json","scope":"own_account_data","ownerId":"foreign"}' }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/privacy/exports', actorId, headers: { 'Content-Type': 'application/json' }, bodyText: '{"format":"json","scope":"own_account_data"}' }), /VALIDATION_FAILED/);
});

test('operation admission validates bounded sync push changes and pull cursors', () => {
  const body = JSON.stringify({ cursorLastSequence: '0', nextCursor: 'opaque.cursor', changes: [{ sequence: '1', entityKind: 'task', entityId: taskId, operation: 'upsert', payload: { id: taskId, title: 'Read' } }] });
  assert.equal(admitGatewayOperation({ method: 'POST', path: '/v1/sync/push', actorId, headers, bodyText: body }).route.operation, 'pushSync');
  assert.deepEqual(admitGatewayOperation({ method: 'GET', path: '/v1/sync/pull?limit=25&cursor=opaque.cursor', actorId, headers: {} }).request.query, { cursor: 'opaque.cursor', limit: 25 });
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/sync/push', actorId, headers, bodyText: body.replace('"operation":"upsert"', '"operation":"delete"') }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/sync/push', actorId, headers, bodyText: body.replace('"cursorLastSequence":"0"', '"cursorLastSequence":"01"') }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/sync/pull?unknown=x', actorId, headers: {} }), /VALIDATION_FAILED/);
  assert.deepEqual(admitGatewayOperation({ method: 'GET', path: `/v1/sync/snapshots/${taskId}/pages?cursor=opaque.cursor`, actorId, headers: {} }).request.query, { cursor: 'opaque.cursor' });
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: `/v1/sync/snapshots/${taskId}/pages`, actorId, headers: {} }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: `/v1/sync/snapshots/${taskId}/pages?cursor=x&limit=10`, actorId, headers: {} }), /VALIDATION_FAILED/);
  assert.equal(admitGatewayOperation({ method: 'POST', path: '/v1/sync/snapshots', actorId, headers, bodyText: '{}' }).route.operation, 'createSyncSnapshot');
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/sync/snapshots', actorId, headers, bodyText: '{"contractVersion":1}' }), /VALIDATION_FAILED/);
});

test('operation admission requires the contract fields and rejects owner injection', () => {
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/tasks', actorId, headers, bodyText: '{"title":"Read"}' }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: '/v1/tasks', actorId, headers, bodyText: '{"id":"22222222-2222-4222-8222-222222222222","workspaceId":"44444444-4444-4444-8444-444444444444","title":"Read","ownerId":"foreign"}' }), /VALIDATION_FAILED/);
});

test('operation admission binds task actions to the route resource', () => {
  const body = JSON.stringify({ id: taskId, expectedVersion: 1, action: 'begin', occurredAt: '2026-10-10T00:00:00.000Z' });
  assert.equal(admitGatewayOperation({ method: 'POST', path: `/v1/tasks/${taskId}/actions`, actorId, headers, bodyText: body }).route.resourceId, taskId);
  assert.throws(() => admitGatewayOperation({ method: 'POST', path: `/v1/tasks/${taskId}/actions`, actorId, headers, bodyText: body.replace(taskId, '55555555-5555-4555-8555-555555555555') }), /VALIDATION_FAILED/);
});

test('read operations remain bodyless and still require an authenticated actor', () => {
  assert.equal(admitGatewayOperation({ method: 'GET', path: '/v1/goals', actorId, headers: {} }).request.body, null);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/goals', actorId, headers: {}, bodyText: '{}' }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/goals', actorId: 'not-an-actor', headers: {} }), /AUTH_REQUIRED/);
});

test('list query admission accepts only bounded cursor and limit parameters', () => {
  const listed = admitGatewayOperation({ method: 'GET', path: '/v1/task-reminders?limit=25&cursor=opaque', actorId, headers: {} });
  assert.deepEqual(listed.request.query, { cursor: 'opaque', limit: 25 });
  const sessions = admitGatewayOperation({ method: 'GET', path: '/v1/focus-sessions?limit=10&cursor=opaque', actorId, headers: {} });
  assert.deepEqual(sessions.request.query, { cursor: 'opaque', limit: 10 });
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/task-reminders?limit=0', actorId, headers: {} }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/task-reminders?limit=25&limit=50', actorId, headers: {} }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/tasks?cursor=x', actorId, headers: {} }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/task-reminders?cursor=x&unknown=y', actorId, headers: {} }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/me?limit=25', actorId, headers: {} }), /VALIDATION_FAILED/);
});

test('analytics summary admission accepts only the reviewed period query', () => {
  const result = admitGatewayOperation({ method: 'GET', path: '/v1/analytics/summary?start=2026-10-10T00%3A00%3A00.000Z&end=2026-10-11T00%3A00%3A00.000Z&timeZone=Asia%2FColombo', actorId, headers: {} });
  assert.deepEqual(result.request.query, { start: '2026-10-10T00:00:00.000Z', end: '2026-10-11T00:00:00.000Z', timeZone: 'Asia/Colombo' });
  assert.throws(() => admitGatewayOperation({ method: 'GET', path: '/v1/analytics/summary?start=2026-10-10T00%3A00%3A00.000Z&end=2026-10-11T00%3A00%3A00.000Z&timeZone=Asia%2FColombo&limit=10', actorId, headers: {} }), /VALIDATION_FAILED/);
});
