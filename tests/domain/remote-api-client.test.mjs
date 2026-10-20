import assert from 'node:assert/strict';
import test from 'node:test';

const { createRemoteApiClient, RemoteApiError } = await import('../../src/features/auth/remote-api-client.ts');

const MUTATION = '11111111-1111-4111-8111-111111111111';

function fakeResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, async json() { return body; } };
}

test('remote API refuses missing identity before making a request', async () => {
  let calls = 0;
  const client = createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => null, fetcher: async () => { calls += 1; return fakeResponse(200, {}); } });
  await assert.rejects(() => client.request('/v1/me'), (error) => error instanceof RemoteApiError && error.code === 'AUTH_REQUIRED');
  assert.equal(calls, 0);
});

test('remote API fails closed for blank or malformed runtime access tokens', async () => {
  let calls = 0;
  for (const token of ['   ', 42, {}, undefined]) {
    const client = createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => token, fetcher: async () => { calls += 1; return fakeResponse(200, {}); } });
    await assert.rejects(() => client.request('/v1/me'), (error) => error instanceof RemoteApiError && error.code === 'AUTH_REQUIRED');
  }
  assert.equal(calls, 0);
});

test('remote API hides access-token provider failures and rejects malformed dependencies', async () => {
  let calls = 0;
  const client = createRemoteApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => { throw new Error('secure storage secret detail'); },
    fetcher: async () => { calls += 1; return fakeResponse(200, {}); },
  });
  await assert.rejects(() => client.request('/v1/me'), (error) => error instanceof RemoteApiError
    && error.status === 401 && error.code === 'AUTH_REQUIRED' && !error.message.includes('secure storage'));
  assert.equal(calls, 0);
  assert.throws(() => createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: null }),
    (error) => error instanceof RemoteApiError && error.code === 'DEPENDENCY_UNAVAILABLE');
});

test('remote API sends only the bearer token and scoped request headers', async () => {
  let request;
  const client = createRemoteApiClient({ baseUrl: 'https://api.example.test/', getAccessToken: async () => 'access-token', fetcher: async (input, init) => { request = { input, init }; return fakeResponse(200, { data: { ok: true } }); } });
  const result = await client.request('/v1/tasks', { method: 'POST', idempotencyKey: MUTATION, body: { title: 'Study' } });
  assert.deepEqual(result, { data: { ok: true } });
  assert.equal(request.input, 'https://api.example.test/v1/tasks');
  assert.equal(request.init.headers.Authorization, 'Bearer access-token');
  assert.equal(request.init.headers['Idempotency-Key'], MUTATION);
  assert.equal(request.init.headers['Content-Type'], 'application/json');
  assert.equal(request.init.headers['service-role'], undefined);
});

test('remote API supports idempotent deletes with a validated expected-version header', async () => {
  let request;
  const client = createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'access-token', fetcher: async (input, init) => { request = { input, init }; return fakeResponse(200, { data: { deleted: true } }); } });
  await client.request('/v1/tasks/00000000-0000-4000-8000-000000000001', { method: 'DELETE', idempotencyKey: MUTATION, expectedVersion: 7 });
  assert.equal(request.init.method, 'DELETE');
  assert.equal(request.init.headers['Expected-Version'], '7');
  assert.equal(request.init.body, undefined);
  await assert.rejects(() => client.request('/v1/tasks/00000000-0000-4000-8000-000000000001', { method: 'DELETE', idempotencyKey: MUTATION, expectedVersion: 0 }), /EXPECTED_VERSION_INVALID/);
});

test('Edge Function mount paths survive GET queries and POST requests', async () => {
  for (const suffix of ['', '/']) {
    const requests = [];
    const client = createRemoteApiClient({
      baseUrl: `https://project.supabase.co/functions/v1/deep-focus-gateway${suffix}`,
      getAccessToken: async () => 'token',
      fetcher: async (url, init) => { requests.push({ url, init }); return fakeResponse(200, { data: {} }); },
    });
    await client.request('/v1/sync/pull?limit=50&cursor=abc.def');
    await client.request('/v1/account/bootstrap', { method: 'POST', idempotencyKey: MUTATION, body: { displayName: 'Test' } });
    assert.equal(requests[0].url, 'https://project.supabase.co/functions/v1/deep-focus-gateway/v1/sync/pull?limit=50&cursor=abc.def');
    assert.equal(requests[1].url, 'https://project.supabase.co/functions/v1/deep-focus-gateway/v1/account/bootstrap');
    assert.equal(requests[1].init.method, 'POST');
  }
});

test('nested mounts reject traversal, encoded separators, fragments and malformed escapes before fetch', async () => {
  let calls = 0;
  const client = createRemoteApiClient({
    baseUrl: 'https://project.supabase.co/functions/v1/deep-focus-gateway',
    getAccessToken: async () => 'token',
    fetcher: async () => { calls += 1; return fakeResponse(200, {}); },
  });
  for (const path of ['/v1/../../other', '/v1/%2e%2e/me', '/v1/tasks%2Fother', '/v1/tasks%5Cother', '/v1/me#fragment', '/v1/%', '//other.example/v1/me']) {
    await assert.rejects(() => client.request(path), (error) => error.code === 'INVALID_API_PATH', path);
  }
  assert.equal(calls, 0);
});

test('remote API rejects unsafe hosts, paths and non-idempotent mutations', async () => {
  const fetcher = async () => fakeResponse(200, {});
  await assert.rejects(() => createRemoteApiClient({ baseUrl: 'http://api.example.test', getAccessToken: async () => 'token', fetcher }).request('/v1/me'), /API_NOT_CONFIGURED/);
  await assert.rejects(() => createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'token', fetcher }).request('/v1/tasks', { method: 'POST', body: {} }), /IDEMPOTENCY_KEY_INVALID/);
  await assert.rejects(() => createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'token', fetcher }).request('/v1/tasks', { method: 'POST', idempotencyKey: 'mutation-1', body: {} }), /IDEMPOTENCY_KEY_INVALID/);
  await assert.rejects(() => createRemoteApiClient({ baseUrl: 'https://api.example.test', getAccessToken: async () => 'token', fetcher }).request('/v1/tasks', { method: 'GET', idempotencyKey: MUTATION }), /IDEMPOTENCY_KEY_INVALID/);
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

test('remote API bounds untrusted server error codes before exposing them', async () => {
  const client = createRemoteApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'token',
    fetcher: async () => ({ ok: false, status: 500, json: async () => ({ code: 'secret\nvalue' }) }),
  });
  await assert.rejects(() => client.request('/v1/tasks', { method: 'GET' }), (error) => error?.code === 'HTTP_500');
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

test('remote API maps transport failures to a stable dependency error without leaking details', async () => {
  const client = createRemoteApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'token',
    fetcher: async () => { throw new Error('private DNS and socket detail'); },
  });
  await assert.rejects(() => client.request('/v1/tasks'), (error) => error instanceof RemoteApiError
    && error.status === 0 && error.code === 'DEPENDENCY_UNAVAILABLE' && !error.message.includes('private'));
});

test('remote API rejects non-serializable request bodies before transport', async () => {
  let calls = 0;
  const client = createRemoteApiClient({
    baseUrl: 'https://api.example.test',
    getAccessToken: async () => 'token',
    fetcher: async () => { calls += 1; return fakeResponse(200, { ok: true }); },
  });
  const circular = {};
  circular.self = circular;
  await assert.rejects(() => client.request('/v1/tasks', { method: 'POST', idempotencyKey: MUTATION, body: circular }), /REQUEST_BODY_INVALID/);
  await assert.rejects(() => client.request('/v1/tasks', { method: 'POST', idempotencyKey: '22222222-2222-4222-8222-222222222222', body: 1n }), /REQUEST_BODY_INVALID/);
  assert.equal(calls, 0);
});
