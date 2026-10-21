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
    ['GET', '/v1/settings', 'getSettings'], ['GET', '/v1/task-reminders', 'listReminders'],
    ['GET', '/v1/account/sessions', 'listAccountSessions'],
    ['GET', '/v1/breaks', 'listBreaks'],
    ['GET', '/v1/analytics/summary', 'getAnalyticsSummary'],
    ['GET', `/v1/ai/proposals/${taskId}`, 'getAiProposal'],
    ['POST', '/v1/ai/plan-my-day', 'createAiGeneration'],
    ['GET', `/v1/ai/requests/${taskId}`, 'getAiGenerationRequest'],
    ['GET', `/v1/plans/${taskId}`, 'getPlan'],
    ['POST', `/v1/ai/requests/${taskId}/cancel`, 'cancelAiGeneration'],
    ['GET', `/v1/privacy/jobs/${taskId}`, 'getPrivacyJob'],
    ['POST', '/v1/privacy/exports', 'createPrivacyExport'],
    ['GET', '/v1/sync/pull', 'pullSync'], ['POST', '/v1/sync/push', 'pushSync'],
    ['GET', `/v1/sync/snapshots/${taskId}`, 'getSyncSnapshot'],
    ['GET', `/v1/sync/snapshots/${taskId}/pages`, 'getSyncSnapshotPage'],
    ['POST', '/v1/sync/snapshots', 'createSyncSnapshot'],
    ['PATCH', '/v1/settings', 'patchSettings'],
    ['POST', `/v1/tasks/${taskId}/actions`, 'applyTaskAction'],
    ['GET', '/v1/goals', 'listGoals'], ['POST', '/v1/goals', 'createGoal'],
    ['GET', `/v1/goals/${taskId}`, 'getGoal'], ['GET', '/v1/focus-sessions', 'listSessions'],
    ['GET', `/v1/goals/${taskId}/progress`, 'getGoalProgress'],
    ['POST', '/v1/focus-sessions', 'startSession'],
    ['GET', `/v1/focus-sessions/${taskId}`, 'getSession'],
    ['POST', `/v1/ai/proposals/${taskId}/apply`, 'applyAiProposal'],
    ['GET', '/v1/ai/usage', 'getAiUsage'],
    ['GET', '/v1/billing/entitlements', 'getBillingEntitlements'],
    ['GET', '/v1/billing/catalog', 'getBillingCatalog'],
    ['POST', '/v1/account/sessions/revoke', 'revokeAccountSessions'],
    ['POST', '/v1/auth/sign-out', 'signOut'],
    ['POST', `/v1/focus-sessions/${taskId}/events`, 'applySessionEvent'],
    ['POST', '/v1/breaks', 'recordBreak'],
    ['POST', '/v1/task-reminders', 'createReminder'], ['PATCH', `/v1/task-reminders/${taskId}`, 'patchReminder'], ['DELETE', `/v1/task-reminders/${taskId}`, 'deleteReminder'],
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

test('gateway router rejects unsafe runtime method and path types safely', () => {
  assert.throws(() => routeGatewayRequest({ method: Symbol('method'), path: '/v1/tasks' }), /NOT_FOUND/);
  assert.throws(() => routeGatewayRequest({ method: 'GET', path: Symbol('path') }), /NOT_FOUND/);
});
