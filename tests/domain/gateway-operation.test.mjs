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
