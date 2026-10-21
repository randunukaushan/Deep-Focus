import assert from 'node:assert/strict';
import test from 'node:test';

const { createPostgresAuthenticatedGatewayRuntime } = await import('../../supabase/functions/_shared/postgres-authenticated-gateway-runtime.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-11T02:00:00.000Z';
const ISSUER = 'https://deep-focus-dev.supabase.co/auth/v1';
const AUDIENCE = 'authenticated';

function harness(session = { owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: '2026-10-11T01:00:00.000Z', expires_at: '2026-10-12T01:00:00.000Z', revoked_at: null }) {
  const calls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => { calls.push({ sql, params }); return sql.includes('app_sessions') ? { rows: [session] } : { rows: [] }; } }) };
  const seen = [];
  const runtime = createPostgresAuthenticatedGatewayRuntime({
    providerClient: { auth: { getClaims: async (jwt) => { seen.push(jwt); return { data: { claims: { sub: OWNER, session_id: SESSION, exp: 1791766800, iss: ISSUER, aud: AUDIENCE } }, error: null }; } } },
    expectedIssuer: ISSUER,
    expectedAudience: AUDIENCE,
    runner,
    handlers: { getMe: async (context) => ({ status: 200, body: { data: { actor: context.actorId, session: context.sessionId } } }) },
    rateLimit: { counter: { consume: async () => ({ allowed: true, retryAfterSeconds: 0 }) }, windowMs: 60_000, limit: 10 },
    now: () => NOW,
    nowMs: () => 1_000,
  });
  return { calls, seen, runtime };
}

test('runtime composes provider verification, app-session lookup and handler actor binding', async () => {
  const h = harness();
  const response = await h.runtime.handle({ method: 'GET', path: '/v1/me', headers: { Authorization: 'Bearer provider-token' } });
  assert.deepEqual(response, { status: 200, body: { data: { actor: OWNER, session: SESSION } } });
  assert.deepEqual(h.seen, ['provider-token']);
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0].params, [OWNER, SESSION]);
});

test('runtime fails before session storage and handlers when provider verification fails', async () => {
  let sessionReads = 0;
  let handlerCalls = 0;
  const runtime = createPostgresAuthenticatedGatewayRuntime({
    providerClient: { auth: { getClaims: async () => { throw new Error('provider failure'); } } },
    expectedIssuer: ISSUER,
    expectedAudience: AUDIENCE,
    runner: { withTransaction: async (run) => run({ query: async () => { sessionReads += 1; return { rows: [] }; } }) },
    handlers: { getMe: async () => { handlerCalls += 1; return { status: 200, body: {} }; } },
    rateLimit: { counter: { consume: async () => ({ allowed: true, retryAfterSeconds: 0 }) }, windowMs: 60_000, limit: 10 },
    now: () => NOW,
    nowMs: () => 1_000,
  });
  const response = await runtime.handle({ method: 'GET', path: '/v1/me', headers: { Authorization: 'Bearer bad-token' } });
  assert.deepEqual(response, { status: 401, body: { error: { code: 'AUTH_REQUIRED', retryable: false } } });
  assert.equal(sessionReads, 0);
  assert.equal(handlerCalls, 0);
});

test('runtime rejects a revoked app session before invoking protected handlers', async () => {
  const h = harness({ owner_id: OWNER, session_id: SESSION, status: 'revoked', issued_at: '2026-10-11T01:00:00.000Z', expires_at: '2026-10-12T01:00:00.000Z', revoked_at: NOW });
  const response = await h.runtime.handle({ method: 'GET', path: '/v1/me', headers: { Authorization: 'Bearer provider-token' } });
  assert.deepEqual(response, { status: 401, body: { error: { code: 'AUTH_REQUIRED', retryable: false } } });
});

test('runtime samples authentication and rate-limit clocks for every request', async () => {
  let now = NOW;
  let nowMs = 1_000;
  const rateLimitCalls = [];
  const runner = { withTransaction: async (run) => run({ query: async (sql, params) => sql.includes('app_sessions')
    ? { rows: [{ owner_id: OWNER, session_id: SESSION, status: 'active', issued_at: NOW, expires_at: '2026-10-12T01:00:00.000Z', revoked_at: null }] }
    : { rows: [] } }) };
  const runtime = createPostgresAuthenticatedGatewayRuntime({
    providerClient: { auth: { getClaims: async () => ({ data: { claims: { sub: OWNER, session_id: SESSION, exp: 1791766800, iss: ISSUER, aud: AUDIENCE } }, error: null }) } },
    expectedIssuer: ISSUER, expectedAudience: AUDIENCE, runner,
    handlers: { getMe: async (context) => ({ status: 200, body: { data: { actor: context.actorId } } }) },
    rateLimit: { counter: { consume: async (...args) => { rateLimitCalls.push(args); return { allowed: true, retryAfterSeconds: 0 }; } }, windowMs: 60_000, limit: 10 },
    now: () => now, nowMs: () => nowMs,
  });
  const request = { method: 'GET', path: '/v1/me', headers: { Authorization: 'Bearer provider-token' } };
  assert.equal((await runtime.handle(request)).status, 200);
  now = '2026-10-11T03:00:00.000Z'; nowMs = 61_000;
  assert.equal((await runtime.handle(request)).status, 200);
  assert.deepEqual(rateLimitCalls.map((call) => call[3]), [1_000, 61_000]);
});

test('runtime rejects malformed auth, transaction and rate-limit configuration at composition time', async () => {
  assert.throws(() => createPostgresAuthenticatedGatewayRuntime(null), /GATEWAY_RUNTIME_INVALID/);
  assert.throws(() => createPostgresAuthenticatedGatewayRuntime({
    providerClient: { auth: { getClaims: async () => ({ data: null, error: null }) } },
    expectedIssuer: '', expectedAudience: AUDIENCE, runner: {}, handlers: {},
    rateLimit: { counter: { consume: async () => ({ allowed: true, retryAfterSeconds: 0 }) }, windowMs: 60_000, limit: 10 },
  }), /GATEWAY_RUNTIME_INVALID/);
  assert.throws(() => createPostgresAuthenticatedGatewayRuntime({
    providerClient: { auth: { getClaims: async () => ({ data: null, error: null }) } },
    expectedIssuer: ISSUER, expectedAudience: AUDIENCE,
    runner: { withTransaction: async () => null }, handlers: {},
    rateLimit: { counter: {}, windowMs: 0, limit: 10 },
  }), /GATEWAY_RUNTIME_INVALID/);
});
