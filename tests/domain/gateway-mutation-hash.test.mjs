import assert from 'node:assert/strict';
import test from 'node:test';

const { hashGatewayMutation } = await import('../../supabase/functions/_shared/gateway-mutation-hash.ts');

test('canonical mutation hash is stable across object key order', async () => {
  const first = await hashGatewayMutation({ operation: 'task.create', path: '/v1/tasks', body: { title: 'Read', fields: { priority: 'high', id: '1' } } });
  const second = await hashGatewayMutation({ operation: 'task.create', path: '/v1/tasks', body: { fields: { id: '1', priority: 'high' }, title: 'Read' } });
  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test('canonical mutation hash changes when the intent changes', async () => {
  const first = await hashGatewayMutation({ operation: 'task.create', path: '/v1/tasks', body: { title: 'Read' } });
  const second = await hashGatewayMutation({ operation: 'task.create', path: '/v1/tasks', body: { title: 'Write' } });
  assert.notEqual(first, second);
});

test('hash input rejects unsafe operation/path and cannot serialize unsupported values', async () => {
  await assert.rejects(hashGatewayMutation({ operation: 'bad operation', path: '/v1/tasks', body: {} }), /MUTATION_INPUT_INVALID/);
  await assert.rejects(hashGatewayMutation({ operation: 'task.create', path: '/private', body: {} }), /MUTATION_INPUT_INVALID/);
  await assert.rejects(hashGatewayMutation({ operation: 'task.create', path: '/v1/tasks', body: { value: BigInt(1) } }), /MUTATION_UNHASHABLE/);
});
