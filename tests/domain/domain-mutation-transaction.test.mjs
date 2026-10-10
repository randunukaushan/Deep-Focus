import assert from 'node:assert/strict';
import test from 'node:test';

const { executeDomainMutation } = await import('../../supabase/functions/_shared/domain-mutation-transaction.ts');

const actorA = '11111111-1111-4111-8111-111111111111';
const mutationId = '22222222-2222-4222-8222-222222222222';
const hashA = 'a'.repeat(64);
const hashB = 'b'.repeat(64);
const body = { id: '33333333-3333-4333-8333-333333333333', title: 'Read' };

function harness(receipt = null) {
  const order = [];
  let applied = 0;
  let appliedInput = null;
  let stored = receipt;
  return {
    order,
    get applied() { return applied; },
    get stored() { return stored; },
    store: { withTransaction: async (operation) => operation({
      lockOwnerHead: async () => { order.push('lock'); },
      readReceipt: async () => { order.push('read'); return stored; },
      apply: async (input) => { order.push('apply'); applied += 1; appliedInput = input; return { responseBody: { ok: true }, responseStatus: 201 }; },
      writeReceipt: async (value) => { order.push('write'); stored = value; },
    }) },
    get appliedInput() { return appliedInput; },
  };
}

test('domain mutation locks, checks receipt, applies and writes receipt in order', async () => {
  const h = harness();
  const result = await executeDomainMutation({ actorId: actorA, operation: 'task.create', mutationId, requestSha256: hashA, body, store: h.store });
  assert.equal(result.action, 'applied');
  assert.deepEqual(h.order, ['lock', 'read', 'apply', 'write']);
  assert.equal(h.applied, 1);
  assert.deepEqual(h.appliedInput, { actorId: actorA, operation: 'task.create', mutationId, requestSha256: hashA, body });
});

test('identical receipt replay does not apply or write a second mutation', async () => {
  const first = harness();
  const applied = await executeDomainMutation({ actorId: actorA, operation: 'task.create', mutationId, requestSha256: hashA, body, store: first.store });
  const replay = harness(applied.receipt);
  const result = await executeDomainMutation({ actorId: actorA, operation: 'task.create', mutationId, requestSha256: hashA, body, store: replay.store });
  assert.equal(result.action, 'replayed');
  assert.deepEqual(replay.order, ['lock', 'read']);
  assert.equal(replay.applied, 0);
});

test('changed replay is rejected before domain apply', async () => {
  const existing = { ownerId: actorA, operation: 'task.create', mutationId, requestSha256: hashA, responseBody: { ok: true }, responseStatus: 201 };
  const h = harness(existing);
  await assert.rejects(executeDomainMutation({ actorId: actorA, operation: 'task.create', mutationId, requestSha256: hashB, body, store: h.store }), /IDEMPOTENCY_CONFLICT/);
  assert.deepEqual(h.order, ['lock', 'read']);
  assert.equal(h.applied, 0);
});

test('apply failure aborts before receipt write and propagates the failure', async () => {
  const order = [];
  const store = { withTransaction: async (operation) => operation({
    lockOwnerHead: async () => order.push('lock'), readReceipt: async () => { order.push('read'); return null; },
    apply: async () => { order.push('apply'); throw new Error('db failure'); },
    writeReceipt: async () => order.push('write'),
  }) };
  await assert.rejects(executeDomainMutation({ actorId: actorA, operation: 'task.create', mutationId, requestSha256: hashA, body, store }), /db failure/);
  assert.deepEqual(order, ['lock', 'read', 'apply']);
});

test('invalid mutation identity is rejected before opening a transaction', async () => {
  let opened = false;
  await assert.rejects(executeDomainMutation({ actorId: actorA, operation: 'bad operation', mutationId, requestSha256: hashA, body, store: { withTransaction: async () => { opened = true; return null; } } }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('malformed mutation bodies are rejected before opening a transaction', async () => {
  let opened = false;
  await assert.rejects(executeDomainMutation({ actorId: actorA, operation: 'task.create', mutationId, requestSha256: hashA, body: [], store: { withTransaction: async () => { opened = true; return null; } } }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('malformed session identity is rejected before opening a transaction', async () => {
  let opened = false;
  await assert.rejects(executeDomainMutation({ actorId: actorA, sessionId: 'not-a-uuid', operation: 'task.create', mutationId, requestSha256: hashA, body, store: { withTransaction: async () => { opened = true; return null; } } }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('session-bound mutation fails closed when the store cannot recheck the session', async () => {
  let locked = false;
  const store = {
    withTransaction: async (operation) => operation({
      lockOwnerHead: async () => { locked = true; },
      readReceipt: async () => null,
      apply: async () => ({ responseBody: {}, responseStatus: 201 }),
      writeReceipt: async () => {},
    }),
  };
  await assert.rejects(executeDomainMutation({ actorId: actorA, sessionId: '66666666-6666-4666-8666-666666666666', operation: 'task.create', mutationId, requestSha256: hashA, body, store }), /DEPENDENCY_UNAVAILABLE/);
  assert.equal(locked, false);
});
