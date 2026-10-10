import assert from 'node:assert/strict';
import test from 'node:test';

const { createPersonalApiGateway } = await import('../../src/features/sync/personal-api-gateway.ts');

const TOKEN = 'verified-user-jwt';
const USER = { userId: '10000000-0000-4000-8000-000000000001' };
const KEY = '20000000-0000-4000-8000-000000000002';

function gateway(overrides = {}) {
  const calls = [];
  const handle = createPersonalApiGateway({
    resolveUser: async (token) => token === TOKEN ? USER : null,
    dispatch: async (input) => { calls.push(input); return { status: 200, body: { data: { ok: true } } }; },
    ...overrides,
  });
  return { handle, calls };
}

test('gateway requires a real bearer token and rejects publishable keys as identity', async () => {
  const { handle } = gateway();
  assert.equal((await handle({ method: 'GET', path: '/v1/me', headers: {} })).status, 401);
  assert.equal((await handle({ method: 'GET', path: '/v1/me', headers: { Authorization: 'Bearer sb_publishable_x' } })).status, 401);
  assert.equal((await handle({ method: 'GET', path: '/v1/me', headers: { Authorization: `Bearer ${TOKEN}` } })).status, 200);
});

test('gateway derives the actor before dispatch and requires UUID idempotency for mutations', async () => {
  const { handle, calls } = gateway();
  assert.equal((await handle({ method: 'POST', path: '/v1/tasks', headers: { Authorization: `Bearer ${TOKEN}` }, body: { id: 'task' } })).status, 400);
  assert.equal((await handle({ method: 'POST', path: '/v1/tasks', headers: { Authorization: `Bearer ${TOKEN}`, 'Idempotency-Key': KEY }, body: { id: 'task' } })).status, 200);
  assert.deepEqual(calls[0].actor, USER);
  assert.equal(calls[0].operation, 'createTask');
  assert.deepEqual(calls[0].body, { id: 'task' });
  assert.equal(calls[0].idempotencyKey, KEY);
  assert.match(calls[0].requestSha256, /^[a-f0-9]{64}$/);
});

test('gateway rejects client ownership fields and unknown routes before dispatch', async () => {
  const { handle, calls } = gateway();
  const headers = { Authorization: `Bearer ${TOKEN}`, 'Idempotency-Key': KEY };
  assert.equal((await handle({ method: 'POST', path: '/v1/tasks', headers, body: { ownerId: 'foreign' } })).status, 400);
  assert.equal((await handle({ method: 'POST', path: '/v1/unknown', headers, body: {} })).status, 404);
  assert.equal(calls.length, 0);
});

test('gateway maps owned resource routes and does not expose dispatcher errors', async () => {
  const calls = [];
  const { handle } = gateway({ dispatch: async (input) => { calls.push(input); throw new Error('database detail'); } });
  const result = await handle({ method: 'POST', path: '/v1/focus-sessions/30000000-0000-4000-8000-000000000003/events', headers: { Authorization: `Bearer ${TOKEN}`, 'Idempotency-Key': KEY }, body: { type: 'complete' } });
  assert.deepEqual(result, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', messageKey: 'errors.dependency_unavailable', retryable: true } } });
  assert.equal(calls[0].operation, 'applySessionEvent');
  assert.equal(calls[0].actor.userId, USER.userId);
});

test('gateway measures request body size in UTF-8 bytes and contains resolver failures', async () => {
  let resolved = false;
  const { handle } = gateway({ resolveUser: async () => { resolved = true; throw new Error('auth provider detail'); } });
  const tooLarge = 'අ'.repeat(40_000);
  const large = await handle({ method: 'POST', path: '/v1/tasks', headers: { Authorization: `Bearer ${TOKEN}`, 'Idempotency-Key': KEY }, body: { title: tooLarge } });
  assert.equal(large.status, 400);
  assert.equal(resolved, false);
  const failed = await handle({ method: 'GET', path: '/v1/me', headers: { Authorization: `Bearer ${TOKEN}` } });
  assert.equal(failed.status, 503);
});

test('gateway rejects an expired or revoked token before dispatch', async () => {
  let dispatched = false;
  const { handle } = gateway({
    resolveUser: async () => null,
    dispatch: async () => { dispatched = true; return { status: 200, body: { data: {} } }; },
  });
  const result = await handle({ method: 'GET', path: '/v1/me', headers: { Authorization: `Bearer ${TOKEN}` } });
  assert.equal(result.status, 401);
  assert.equal(dispatched, false);
});

test('gateway rejects a resolver actor that is not a canonical auth UUID', async () => {
  let dispatched = false;
  const { handle } = gateway({
    resolveUser: async () => ({ userId: 'foreign-owner' }),
    dispatch: async () => { dispatched = true; return { status: 200, body: { data: {} } }; },
  });
  const result = await handle({ method: 'GET', path: '/v1/me', headers: { Authorization: `Bearer ${TOKEN}` } });
  assert.equal(result.status, 401);
  assert.equal(dispatched, false);
});

test('gateway forwards the same mutation key unchanged for server-side replay handling', async () => {
  const { handle, calls } = gateway();
  const headers = { Authorization: `Bearer ${TOKEN}`, 'Idempotency-Key': KEY };
  const request = { method: 'POST', path: '/v1/tasks', headers, body: { title: 'same mutation' } };
  assert.equal((await handle(request)).status, 200);
  assert.equal((await handle(request)).status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].idempotencyKey, KEY);
  assert.equal(calls[1].idempotencyKey, KEY);
  assert.equal(calls[0].actor.userId, USER.userId);
  assert.equal(calls[1].actor.userId, USER.userId);
  assert.equal(calls[0].requestSha256, calls[1].requestSha256);
});

test('gateway hashes equivalent object key order identically for replay comparison', async () => {
  const { handle, calls } = gateway();
  const headers = { Authorization: `Bearer ${TOKEN}`, 'Idempotency-Key': KEY };
  assert.equal((await handle({ method: 'POST', path: '/v1/tasks', headers, body: { title: 'same', id: 'task' } })).status, 200);
  assert.equal((await handle({ method: 'POST', path: '/v1/tasks', headers, body: { id: 'task', title: 'same' } })).status, 200);
  assert.equal(calls[0].requestSha256, calls[1].requestSha256);
});

test('gateway exposes bounded sync pull and push routes with actor-bound query data', async () => {
  const { handle, calls } = gateway();
  const auth = { Authorization: `Bearer ${TOKEN}` };
  assert.equal((await handle({ method: 'GET', path: '/v1/sync?cursor=abc&limit=25', headers: auth })).status, 200);
  assert.equal(calls[0].operation, 'pullSync');
  assert.deepEqual(calls[0].query, { cursor: 'abc', limit: 25 });
  assert.equal((await handle({ method: 'POST', path: '/v1/sync/mutations', headers: { ...auth, 'Idempotency-Key': KEY }, body: { mutations: [] } })).status, 200);
  assert.equal(calls[1].operation, 'pushSync');
  assert.deepEqual(calls[1].body, { mutations: [] });
});

test('gateway rejects malformed sync cursors, limits and oversized mutation batches', async () => {
  const { handle, calls } = gateway();
  const auth = { Authorization: `Bearer ${TOKEN}` };
  assert.equal((await handle({ method: 'GET', path: '/v1/sync?limit=101', headers: auth })).status, 400);
  assert.equal((await handle({ method: 'GET', path: `/v1/sync?cursor=${'x'.repeat(2049)}`, headers: auth })).status, 400);
  assert.equal((await handle({ method: 'GET', path: '/v1/sync?unknown=x', headers: auth })).status, 400);
  assert.equal((await handle({ method: 'POST', path: '/v1/sync/mutations', headers: { ...auth, 'Idempotency-Key': KEY }, body: { mutations: Array.from({ length: 26 }, () => ({})) } })).status, 400);
  assert.equal(calls.length, 0);
});

test('gateway validates every sync mutation before dispatch and rejects ownership injection', async () => {
  const { handle, calls } = gateway();
  const auth = { Authorization: `Bearer ${TOKEN}`, 'Idempotency-Key': KEY };
  const valid = { mutationId: '30000000-0000-4000-8000-000000000003', command: 'task.create', targetId: '40000000-0000-4000-8000-000000000004', body: { title: 'Study' } };
  assert.equal((await handle({ method: 'POST', path: '/v1/sync/mutations', headers: auth, body: { mutations: [valid] } })).status, 200);
  assert.equal((await handle({ method: 'POST', path: '/v1/sync/mutations', headers: auth, body: { mutations: [{ ...valid, targetId: 'not-a-uuid' }] } })).status, 400);
  assert.equal((await handle({ method: 'POST', path: '/v1/sync/mutations', headers: auth, body: { mutations: [{ ...valid, body: { ownerId: 'foreign' } }] } })).status, 400);
  assert.equal(calls.length, 1);
});
