import assert from 'node:assert/strict';
import test from 'node:test';

const { admitGatewayOperation } = await import('../../supabase/functions/_shared/gateway-operation.ts');
const { authorizeGatewayOperation } = await import('../../supabase/functions/_shared/gateway-authorization.ts');

const actorA = '11111111-1111-4111-8111-111111111111';
const actorB = '22222222-2222-4222-8222-222222222222';
const taskId = '33333333-3333-4333-8333-333333333333';
const workspaceId = '44444444-4444-4444-8444-444444444444';
const mutationId = '55555555-5555-4555-8555-555555555555';
const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': mutationId };

function store(records) {
  return { loadOwnerId: async (kind, id) => records[`${kind}:${id}`] ?? null };
}

test('owner authorization permits an own resource and workspace-linked create', async () => {
  const admitted = admitGatewayOperation({ method: 'POST', path: '/v1/tasks', actorId: actorA, headers, bodyText: JSON.stringify({ id: taskId, workspaceId, title: 'Read' }) });
  await assert.doesNotReject(authorizeGatewayOperation({ admitted, store: store({ [`workspace:${workspaceId}`]: actorA }) }));
});

test('owner authorization hides a foreign resource as not found', async () => {
  const admitted = admitGatewayOperation({ method: 'GET', path: `/v1/tasks/${taskId}`, actorId: actorA, headers: {}, });
  await assert.rejects(authorizeGatewayOperation({ admitted, store: store({ [`task:${taskId}`]: actorB }) }), /NOT_FOUND/);
});

test('linked goal and task ownership are checked for creates', async () => {
  const goalId = '66666666-6666-4666-8666-666666666666';
  const sessionId = '77777777-7777-4777-8777-777777777777';
  const goalCreate = admitGatewayOperation({ method: 'POST', path: '/v1/tasks', actorId: actorA, headers, bodyText: JSON.stringify({ id: taskId, workspaceId, title: 'Read', goalId }) });
  await assert.rejects(authorizeGatewayOperation({ admitted: goalCreate, store: store({ [`workspace:${workspaceId}`]: actorA, [`goal:${goalId}`]: actorB }) }), /NOT_FOUND/);
  const sessionStart = admitGatewayOperation({ method: 'POST', path: '/v1/focus-sessions', actorId: actorA, headers, bodyText: JSON.stringify({ id: sessionId, workspaceId, taskId, plannedMs: 1500, startedAt: '2026-10-10T00:00:00.000Z' }) });
  await assert.rejects(authorizeGatewayOperation({ admitted: sessionStart, store: store({ [`workspace:${workspaceId}`]: actorA, [`task:${taskId}`]: actorB }) }), /NOT_FOUND/);
});

test('missing workspace ownership fails closed before a create handler can run', async () => {
  const admitted = admitGatewayOperation({ method: 'POST', path: '/v1/tasks', actorId: actorA, headers, bodyText: JSON.stringify({ id: taskId, workspaceId, title: 'Read' }) });
  await assert.rejects(authorizeGatewayOperation({ admitted, store: store({}) }), /NOT_FOUND/);
});

test('break recording requires ownership of the linked focus session', async () => {
  const breakBody = { id: '88888888-8888-4888-8888-888888888888', focusSessionId: '77777777-7777-4777-8777-777777777777', startedAt: '2026-10-10T01:25:00.000Z', endedAt: '2026-10-10T01:30:00.000Z', plannedMs: 300000, outcome: 'completed' };
  const admitted = admitGatewayOperation({ method: 'POST', path: '/v1/breaks', actorId: actorA, headers, bodyText: JSON.stringify(breakBody) });
  await assert.doesNotReject(authorizeGatewayOperation({ admitted, store: store({ [`session:${breakBody.focusSessionId}`]: actorA }) }));
  await assert.rejects(authorizeGatewayOperation({ admitted, store: store({ [`session:${breakBody.focusSessionId}`]: actorB }) }), /NOT_FOUND/);
});
