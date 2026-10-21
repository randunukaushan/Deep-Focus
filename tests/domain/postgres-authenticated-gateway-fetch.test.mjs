import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAuthenticatedGatewayFetchHandler } = await import('../../supabase/functions/_shared/postgres-authenticated-gateway-fetch.ts');

const runtime = (calls, response = { status: 200, body: { data: { ok: true } } }) => ({
  handle: async (request) => {
    calls.push(request);
    return response;
  },
});

test('maps Request path/query/headers/body and emits a non-cacheable JSON response', async () => {
  const calls = [];
  const handle = createPostgresAuthenticatedGatewayFetchHandler(runtime(calls));
  const response = await handle(new Request('https://api.example.test/v1/tasks?limit=10', {
    method: 'POST',
    headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Focus' }),
  }));

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
  assert.deepEqual(JSON.parse(await response.text()), { data: { ok: true } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, '/v1/tasks?limit=10');
  assert.equal(calls[0].headers.authorization, 'Bearer token');
  assert.deepEqual(JSON.parse(calls[0].bodyText), { title: 'Focus' });
});

test('does not consume a GET body and preserves query in the runtime path', async () => {
  const calls = [];
  const handle = createPostgresAuthenticatedGatewayFetchHandler(runtime(calls));
  await handle(new Request('https://api.example.test/v1/me?x=1', { method: 'GET' }));
  assert.deepEqual(calls[0], { method: 'GET', path: '/v1/me?x=1', headers: {} });
});

test('rejects an oversized request body before invoking the runtime', async () => {
  const calls = [];
  const handle = createPostgresAuthenticatedGatewayFetchHandler(runtime(calls));
  const response = await handle(new Request('https://api.example.test/v1/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'x'.repeat(64 * 1024 + 1),
  }));
  assert.equal(response.status, 400);
  assert.deepEqual(JSON.parse(await response.text()), { error: { code: 'VALIDATION_FAILED', retryable: false } });
  assert.equal(calls.length, 0);
});

test('maps runtime safe errors without exposing unexpected error details', async () => {
  const handle = createPostgresAuthenticatedGatewayFetchHandler({
    handle: async () => { throw new Error('secret database detail'); },
  });
  const response = await handle(new Request('https://api.example.test/v1/me', { method: 'GET' }));
  assert.equal(response.status, 503);
  const text = await response.text();
  assert.equal(text.includes('secret database detail'), false);
  assert.deepEqual(JSON.parse(text), { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } });
});
