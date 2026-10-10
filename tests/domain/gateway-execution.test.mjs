import assert from 'node:assert/strict';
import test from 'node:test';

const { admitGatewayOperation } = await import('../../supabase/functions/_shared/gateway-operation.ts');
const { executeGatewayOperation } = await import('../../supabase/functions/_shared/gateway-execution.ts');
const { hashGatewayMutation } = await import('../../supabase/functions/_shared/gateway-mutation-hash.ts');

const actorId = '11111111-1111-4111-8111-111111111111';
const mutationId = '22222222-2222-4222-8222-222222222222';
const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': mutationId, 'X-Request-Id': 'req_1' };
const admitted = admitGatewayOperation({ method: 'POST', path: '/v1/tasks', actorId, headers, bodyText: '{"id":"33333333-3333-4333-8333-333333333333","workspaceId":"44444444-4444-4444-8444-444444444444","title":"Read"}' });

test('execution calls only the admitted operation and passes server-derived context', async () => {
  let received;
  const result = await executeGatewayOperation({ admitted, authorize: async () => {}, handlers: {
    createTask: async (context) => { received = context; return { status: 201, body: { id: 'task' } }; },
  } });
  assert.deepEqual(result, { status: 201, body: { id: 'task' } });
  assert.equal(received.actorId, actorId);
  assert.equal(received.operation, 'createTask');
  assert.equal(received.idempotencyKey, mutationId);
  assert.equal(received.requestSha256, await hashGatewayMutation({ operation: 'createTask', path: '/v1/tasks', body: admitted.request.body }));
  assert.equal(received.body.title, 'Read');
});

test('missing handler is an explicit dependency failure, never a fake success', async () => {
  assert.deepEqual(await executeGatewayOperation({ admitted, authorize: async () => {}, handlers: {} }), {
    status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } },
  });
});

test('safe domain errors preserve allowlisted status and code', async () => {
  const result = await executeGatewayOperation({ admitted, authorize: async () => {}, handlers: {
    createTask: async () => { throw new Error('sql password secret'); },
  } });
  assert.deepEqual(result, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
});

test('unexpected handler fields cannot escape through the response envelope', async () => {
  const result = await executeGatewayOperation({ admitted, authorize: async () => {}, handlers: {
    createTask: async () => { throw { code: 'SQLSTATE_23505', stack: 'private', message: 'private' }; },
  } });
  assert.equal(JSON.stringify(result).includes('private'), false);
  assert.equal(JSON.stringify(result).includes('SQLSTATE'), false);
});

test('authorization failure prevents the domain handler from running', async () => {
  let called = false;
  const result = await executeGatewayOperation({ admitted, authorize: async () => { throw new Error('foreign record'); }, handlers: {
    createTask: async () => { called = true; return { status: 201, body: {} }; },
  } });
  assert.equal(called, false);
  assert.deepEqual(result, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
});

test('execution rejects wrong success status, arrays and undefined response fields', async () => {
  for (const body of [[], { value: undefined }]) {
    const result = await executeGatewayOperation({ admitted, authorize: async () => {}, handlers: {
      createTask: async () => ({ status: 201, body }),
    } });
    assert.deepEqual(result, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
  }
  const wrongStatus = await executeGatewayOperation({ admitted, authorize: async () => {}, handlers: {
    createTask: async () => ({ status: 200, body: {} }),
  } });
  assert.deepEqual(wrongStatus, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
});

test('execution rejects an oversized success body before it leaves the boundary', async () => {
  const result = await executeGatewayOperation({ admitted, authorize: async () => {}, handlers: {
    createTask: async () => ({ status: 201, body: { value: 'x'.repeat(256 * 1024) } }),
  } });
  assert.deepEqual(result, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
});
