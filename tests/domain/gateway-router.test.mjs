import assert from 'node:assert/strict';
import test from 'node:test';

const { routeGatewayRequest } = await import('../../supabase/functions/_shared/gateway-router.ts');

const taskId = '11111111-1111-4111-8111-111111111111';

test('gateway router maps every approved personal-core route to one operation', () => {
  const cases = [
    ['GET', '/v1/me', 'getMe'], ['PATCH', '/v1/me', 'patchMe'],
    ['GET', '/v1/tasks', 'listTasks'], ['POST', '/v1/tasks', 'createTask'],
    ['GET', `/v1/tasks/${taskId}`, 'getTask'], ['PATCH', `/v1/tasks/${taskId}`, 'patchTask'], ['DELETE', `/v1/tasks/${taskId}`, 'deleteTask'],
    ['PATCH', `/v1/goals/${taskId}`, 'patchGoal'],
    ['DELETE', `/v1/goals/${taskId}`, 'deleteGoal'],
    ['GET', '/v1/settings', 'getSettings'],
    ['PATCH', '/v1/settings', 'patchSettings'],
    ['POST', `/v1/tasks/${taskId}/actions`, 'applyTaskAction'],
    ['GET', '/v1/goals', 'listGoals'], ['POST', '/v1/goals', 'createGoal'],
    ['GET', `/v1/goals/${taskId}`, 'getGoal'], ['GET', '/v1/focus-sessions', 'listSessions'],
    ['POST', '/v1/focus-sessions', 'startSession'],
    ['GET', `/v1/focus-sessions/${taskId}`, 'getSession'],
    ['POST', `/v1/focus-sessions/${taskId}/events`, 'applySessionEvent'],
    ['POST', '/v1/breaks', 'recordBreak'],
  ];
  for (const [method, path, operation] of cases) assert.equal(routeGatewayRequest({ method, path }).operation, operation);
});

test('gateway router returns the owned resource ID without trusting a body field', () => {
  assert.deepEqual(routeGatewayRequest({ method: 'PATCH', path: `/v1/tasks/${taskId}` }), { operation: 'patchTask', resourceId: taskId });
  assert.deepEqual(routeGatewayRequest({ method: 'DELETE', path: `/v1/tasks/${taskId}` }), { operation: 'deleteTask', resourceId: taskId });
  assert.deepEqual(routeGatewayRequest({ method: 'PATCH', path: `/v1/goals/${taskId}` }), { operation: 'patchGoal', resourceId: taskId });
  assert.deepEqual(routeGatewayRequest({ method: 'DELETE', path: `/v1/goals/${taskId}` }), { operation: 'deleteGoal', resourceId: taskId });
  assert.deepEqual(routeGatewayRequest({ method: 'POST', path: `/v1/tasks/${taskId}/actions` }), { operation: 'applyTaskAction', resourceId: taskId });
});

test('gateway router rejects unknown routes, wrong methods and malformed IDs', () => {
  for (const input of [
    { method: 'GET', path: '/v1/admin/users' },
    { method: 'DELETE', path: '/v1/tasks' },
    { method: 'GET', path: '/v1/tasks/not-a-uuid' },
    { method: 'POST', path: `/v1/focus-sessions/${taskId}/unknown` },
  ]) assert.throws(() => routeGatewayRequest(input), /NOT_FOUND/);
});
