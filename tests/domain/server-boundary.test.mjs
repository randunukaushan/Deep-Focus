import assert from 'node:assert/strict';
import test from 'node:test';

const { SafeBoundaryError, publicBoundaryError, safeBoundaryLog, requireHttpsConfig, requireServerSecret } = await import('../../supabase/functions/_shared/server-boundary.ts');

test('server secret helper accepts only private sufficiently long values', () => {
  const env = { DEEP_FOCUS_CURSOR_SIGNING_KEY: 'a'.repeat(32) };
  assert.equal(requireServerSecret(env, 'DEEP_FOCUS_CURSOR_SIGNING_KEY'), env.DEEP_FOCUS_CURSOR_SIGNING_KEY);
  assert.throws(() => requireServerSecret({ EXPO_PUBLIC_SECRET: 'a'.repeat(40) }, 'EXPO_PUBLIC_SECRET'), /SERVER_SECRET_NAME_INVALID/);
  assert.throws(() => requireServerSecret({ DEEP_FOCUS_CURSOR_SIGNING_KEY: 'short' }, 'DEEP_FOCUS_CURSOR_SIGNING_KEY'), /SERVER_SECRET_INVALID/);
  assert.throws(() => requireServerSecret({ DEEP_FOCUS_CURSOR_SIGNING_KEY: `a${String.fromCharCode(10)}b` }, 'DEEP_FOCUS_CURSOR_SIGNING_KEY'), /SERVER_SECRET_INVALID/);
});

test('server URL helper rejects non-HTTPS credentials and query-bearing endpoints', () => {
  assert.equal(requireHttpsConfig({ API_URL: 'https://api.example.test' }, 'API_URL').origin, 'https://api.example.test');
  for (const value of ['http://api.example.test', 'https://user:pass@api.example.test', 'https://api.example.test?secret=x', 'not-a-url']) {
    assert.throws(() => requireHttpsConfig({ API_URL: value }, 'API_URL'), /SERVER_URL_INVALID/);
  }
});

test('public error mapping never exposes provider, SQL or stack details', () => {
  assert.deepEqual(publicBoundaryError(new Error('postgres password: secret')), { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
  assert.deepEqual(publicBoundaryError(new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT')), { status: 409, body: { error: { code: 'IDEMPOTENCY_CONFLICT', retryable: false } } });
  assert.deepEqual(publicBoundaryError(new SafeBoundaryError(503, 'provider detail is not used')), { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
});

test('unknown boundary failures fail closed without raw fields', () => {
  const result = publicBoundaryError({ code: 'SQLSTATE_23505', stack: 'private-stack', message: 'private-message' });
  assert.deepEqual(result, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
  assert.equal(JSON.stringify(result).includes('private'), false);
});

test('safe boundary logs contain only allowlisted diagnostic fields', () => {
  const result = safeBoundaryLog({ event: 'sync.push.failure', requestId: 'req_123', error: new Error('token=private password=secret') });
  assert.deepEqual(result, { event: 'sync.push.failure', status: 503, code: 'DEPENDENCY_UNAVAILABLE', retryable: true, requestId: 'req_123' });
  assert.equal(JSON.stringify(result).includes('password'), false);
  assert.throws(() => safeBoundaryLog({ event: 'Bad Event', error: null }), /LOG_EVENT_INVALID/);
  assert.throws(() => safeBoundaryLog({ event: 'sync.failure', requestId: 'private token', error: null }), /LOG_REQUEST_ID_INVALID/);
});
