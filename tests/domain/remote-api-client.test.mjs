import assert from 'node:assert/strict';
import test from 'node:test';

const { createRemoteApiClient, RemoteApiError } = await import('../../src/features/auth/remote-api-client.ts');

function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, async json() { return body; } };
}

test('remote API refuses missing identity before making a request', async () => {
  let calls = 0;
  const client = createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => null, fetcher: async () => { calls += 1; return fakeResponse(200, {}); } });
  await assert.rejects(() => client.request('/v1/me'), (error) => error instanceof RemoteApiError && error.code === 'AUTH_REQUIRED');
  assert.equal(calls, 0);
});

test('remote API sends only the bearer token and scoped request headers', async () => {
  let request;
  const client = createRemoteApiClient({ baseUrl: 'https://api.example.test/', getAccessToken: async () => 'access-token', fetcher: async (input, init) => { request = { input, init }; return fakeResponse(200, { data: { ok: true } }); } });
  const result = await client.request('/v1/tasks', { method: 'POST', idempotencyKey: 'mutation-1', body: { title: 'Study' } });
  assert.deepEqual(result, { data: { ok: true } });
  assert.equal(request.input, 'https://api.example.test/v1/tasks');
  assert.equal(request.init.headers.Authorization, 'Bearer access-token');
  assert.equal(request.init.headers['Idempotency-Key'], 'mutation-1');
  assert.equal(request.init.headers['Content-Type'], 'application/json');
  assert.equal(request.init.headers['service-role'], undefined);
});

test('remote API supports idempotent deletes with a validated expected-version header', async () => {
  let request;
  const client = createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'access-token', fetcher: async (input, init) => { request = { input, init }; return fakeResponse(200, { data: { deleted: true } }); } });
  await client.request('/v1/tasks/00000000-0000-4000-8000-000000000001', { method: 'DELETE', idempotencyKey: 'mutation-1', expectedVersion: 7 });
  assert.equal(request.init.method, 'DELETE');
  assert.equal(request.init.headers['Expected-Version'], '7');
  assert.equal(request.init.body, undefined);
  await assert.rejects(() => client.request('/v1/tasks/00000000-0000-4000-8000-000000000001', { method: 'DELETE', idempotencyKey: 'mutation-1', expectedVersion: 0 }), /EXPECTED_VERSION_INVALID/);
});

test('remote API rejects unsafe hosts, paths and non-idempotent mutations', async () => {
  const fetcher = async () => fakeResponse(200, {});
  await assert.rejects(() => createRemoteApiClient({ baseUrl: 'http://api.example.test', getAccessToken: async () => 'token', fetcher }).request('/v1/me'), /API_NOT_CONFIGURED/);
  await assert.rejects(() => createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'token', fetcher }).request('/v1/tasks', { method: 'POST', body: {} }), /IDEMPOTENCY_KEY_REQUIRED/);
  await assert.rejects(() => createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'token', fetcher }).request('https://other.example/v1/me'), /INVALID_API_PATH/);
});

test('remote API preserves stable server error codes for retry/conflict handling', async () => {
  const client = createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'token', fetcher: async () => fakeResponse(409, { code: 'VERSION_CONFLICT' }) });
  await assert.rejects(() => client.request('/v1/tasks/00000000-0000-4000-8000-000000000001'), (error) => error instanceof RemoteApiError && error.status === 409 && error.code === 'VERSION_CONFLICT');
});

test('remote API reads the gateway error envelope without exposing its message', async () => {
  const client = createRemoteApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'token',
    fetcher: async () => fakeResponse(403, { error: { code: 'ACCESS_DENIED', message: 'private database detail', retryable: false } }),
  });
  await assert.rejects(() => client.request('/v1/tasks/00000000-0000-4000-8000-000000000001'), (error) => error instanceof RemoteApiError && error.status === 403 && error.code === 'ACCESS_DENIED' && !error.message.includes('private'));
});

test('remote API fails closed on a successful response with invalid JSON shape', async () => {
  const client = createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'token', fetcher: async () => fakeResponse(200, ['unexpected-array']) });
  await assert.rejects(() => client.request('/v1/tasks'), (error) => error instanceof RemoteApiError && error.status === 200 && error.code === 'REMOTE_RESPONSE_INVALID');
});

test('remote API fails closed when a successful response cannot be decoded', async () => {
  const client = createRemoteApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'token',
    fetcher: async () => ({ ok: true, status: 204, async json() { throw new SyntaxError('invalid JSON'); } }),
  });
  await assert.rejects(() => client.request('/v1/tasks'), (error) => error instanceof RemoteApiError && error.status === 204 && error.code === 'REMOTE_RESPONSE_INVALID');
});
