import assert from 'node:assert/strict';
import test from 'node:test';

const { createAccountBootstrapHttpHandler } = await import('../../supabase/functions/_shared/account-bootstrap-http.ts');

const account = { profile: { ownerId: '11111111-1111-4111-8111-111111111111' }, workspace: { workspaceId: '22222222-2222-4222-8222-222222222222' }, syncHead: { lastSequence: '0' } };
function request(overrides = {}) {
  return { method: 'POST', path: '/v1/account/bootstrap', headers: { authorization: 'Bearer provider-token' }, bodyText: JSON.stringify({ displayName: 'Randunu' }), ...overrides };
}

test('bootstrap endpoint passes only bearer token and display name to the provider-verified server flow', async () => {
  let received;
  const handler = createAccountBootstrapHttpHandler({ bootstrap: async (input) => { received = input; return { ok: true, account }; } });
  const result = await handler(request());
  assert.equal(result.status, 200);
  assert.deepEqual(received, { accessToken: 'provider-token', displayName: 'Randunu' });
  assert.deepEqual(result.body, { data: account });
});

test('bootstrap endpoint rejects invalid credentials and malformed or overbroad bodies before bootstrap', async () => {
  let called = false;
  const handler = createAccountBootstrapHttpHandler({ bootstrap: async () => { called = true; return { ok: true, account }; } });
  for (const candidate of [
    request({ headers: {} }),
    request({ bodyText: '{}' }),
    request({ bodyText: JSON.stringify({ displayName: 'Randunu', ownerId: 'forged' }) }),
    request({ bodyText: JSON.stringify({ displayName: '   ' }) }),
    request({ bodyText: JSON.stringify({ displayName: 'x'.repeat(101) }) }),
  ]) {
    const result = await handler(candidate);
    assert.ok([400, 401].includes(result.status));
  }
  assert.equal(called, false);
});

test('bootstrap endpoint does not expose provider failure details', async () => {
  const handler = createAccountBootstrapHttpHandler({ bootstrap: async () => ({ ok: false, reason: 'invalid_provider_session' }) });
  assert.deepEqual(await handler(request()), { status: 401, body: { error: { code: 'AUTH_REQUIRED', retryable: false } } });
});

test('bootstrap endpoint marks unexpected dependency failures retryable', async () => {
  const handler = createAccountBootstrapHttpHandler({ bootstrap: async () => { throw new Error('connection detail'); } });
  assert.deepEqual(await handler(request()), { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
});

test('bootstrap endpoint returns a bounded Retry-After header when the verified owner is rate limited', async () => {
  const handler = createAccountBootstrapHttpHandler({ bootstrap: async () => ({ ok: false, reason: 'rate_limited', retryAfterSeconds: 12 }) });
  assert.deepEqual(await handler(request()), {
    status: 429,
    headers: { 'retry-after': '12' },
    body: { error: { code: 'RATE_LIMITED', retryable: false } },
  });
});
