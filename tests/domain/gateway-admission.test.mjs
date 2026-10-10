import assert from 'node:assert/strict';
import test from 'node:test';

const { admitGatewayRequest } = await import('../../supabase/functions/_shared/gateway-admission.ts');

const actorId = '11111111-1111-4111-8111-111111111111';
const mutationId = '22222222-2222-4222-8222-222222222222';
const base = { method: 'POST', path: '/v1/tasks', actorId, headers: { 'Content-Type': 'application/json', 'Idempotency-Key': mutationId } };

test('gateway admission binds writes to a UUID actor and idempotency key', () => {
  assert.deepEqual(admitGatewayRequest({ ...base, bodyText: '{"title":"Read"}', allowedBodyKeys: ['title'] }), {
    method: 'POST', path: '/v1/tasks', actorId, idempotencyKey: mutationId, body: { title: 'Read' },
  });
});

test('gateway admission rejects missing or malformed write identity', () => {
  assert.throws(() => admitGatewayRequest({ ...base, headers: { 'Content-Type': 'application/json' }, bodyText: '{}' }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayRequest({ ...base, actorId: 'foreign', bodyText: '{}' }), /AUTH_REQUIRED/);
  assert.throws(() => admitGatewayRequest({ ...base, headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'not-a-uuid' }, bodyText: '{}' }), /VALIDATION_FAILED/);
});

test('gateway admission parses only bounded JSON objects and rejects unknown fields', () => {
  assert.deepEqual(admitGatewayRequest({ ...base, bodyText: '{\n  "title": "Read"\n}', allowedBodyKeys: ['title'] }).body, { title: 'Read' });
  assert.throws(() => admitGatewayRequest({ ...base, bodyText: '[]' }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayRequest({ ...base, bodyText: '{"title":"Read","ownerId":"foreign"}', allowedBodyKeys: ['title'] }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayRequest({ ...base, bodyText: '{"title":' }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayRequest({ ...base, bodyText: '{"title":"Read"}', headers: { ...base.headers, 'Content-Type': 'text/plain' } }), /VALIDATION_FAILED/);
});

test('gateway admission enforces body and path limits before domain handling', () => {
  assert.throws(() => admitGatewayRequest({ ...base, path: `/v1/${'x'.repeat(500)}`, bodyText: '{}' }), /NOT_FOUND/);
  assert.throws(() => admitGatewayRequest({ ...base, bodyText: `{"title":"${'x'.repeat(64 * 1024)}"}` }), /VALIDATION_FAILED/);
});

test('read requests may omit a body but cannot smuggle write metadata', () => {
  assert.deepEqual(admitGatewayRequest({ method: 'GET', path: '/v1/tasks', actorId, headers: {} }), {
    method: 'GET', path: '/v1/tasks', actorId, body: null,
  });
  assert.throws(() => admitGatewayRequest({ method: 'GET', path: '/v1/tasks', actorId, headers: { 'Idempotency-Key': mutationId } }), /VALIDATION_FAILED/);
  assert.throws(() => admitGatewayRequest({ method: 'GET', path: '/v1/tasks', actorId, headers: {}, bodyText: '{}' }), /VALIDATION_FAILED/);
});
