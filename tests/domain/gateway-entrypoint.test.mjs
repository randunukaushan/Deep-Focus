import assert from 'node:assert/strict';
import test from 'node:test';

const { handleGatewayRequest, handleAuthenticatedGatewayRequest } = await import('../../supabase/functions/_shared/gateway-entrypoint.ts');

const actorA = '11111111-1111-4111-8111-111111111111';
const actorB = '22222222-2222-4222-8222-222222222222';
const taskId = '33333333-3333-4333-8333-333333333333';
const workspaceId = '44444444-4444-4444-8444-444444444444';
const mutationId = '55555555-5555-4555-8555-555555555555';
const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': mutationId };
const ISSUER = 'https://project.supabase.co/auth/v1';
const AUDIENCE = 'authenticated';
const NOW = '2026-10-10T00:00:00.000Z';
const appSession = { ownerId: actorA, sessionId: '66666666-6666-4666-8666-666666666666', issuedAt: NOW, status: 'active', expiresAt: '2026-10-10T01:00:00.000Z', revokedAt: null };
const rateLimit = { nowMs: Date.parse(NOW), windowMs: 60_000, limit: 60, counter: { consume: async () => ({ allowed: true, retryAfterSeconds: 0 }) } };

const store = (records) => ({ loadOwnerId: async (kind, id) => records[`${kind}:${id}`] ?? null });

test('gateway entrypoint composes admission, ownership and handler execution', async () => {
  let called = 0;
  const result = await handleGatewayRequest({ method: 'POST', path: '/v1/tasks', actorId: actorA, headers,
    bodyText: JSON.stringify({ id: taskId, workspaceId, title: 'Read' }),
    ownerStore: store({ [`workspace:${workspaceId}`]: actorA }),
    handlers: { createTask: async (context) => { called += 1; return { status: 201, body: { owner: context.actorId } }; } },
  });
  assert.deepEqual(result, { status: 201, body: { owner: actorA } });
  assert.equal(called, 1);
});

test('gateway entrypoint denies a foreign resource before calling its handler', async () => {
  let called = false;
  const result = await handleGatewayRequest({ method: 'GET', path: `/v1/tasks/${taskId}`, actorId: actorA, headers: {},
    ownerStore: store({ [`task:${taskId}`]: actorB }),
    handlers: { getTask: async () => { called = true; return { status: 200, body: {} }; } },
  });
  assert.deepEqual(result, { status: 404, body: { error: { code: 'NOT_FOUND', retryable: false } } });
  assert.equal(called, false);
});

test('gateway entrypoint maps malformed requests without touching owner storage', async () => {
  let loaded = false;
  const result = await handleGatewayRequest({ method: 'POST', path: '/v1/tasks', actorId: actorA, headers: {}, bodyText: '{}',
    ownerStore: { loadOwnerId: async () => { loaded = true; return actorA; } }, handlers: {},
  });
  assert.deepEqual(result, { status: 400, body: { error: { code: 'VALIDATION_FAILED', retryable: false } } });
  assert.equal(loaded, false);
});

test('gateway entrypoint never exposes a handler failure detail', async () => {
  const result = await handleGatewayRequest({ method: 'POST', path: '/v1/tasks', actorId: actorA, headers,
    bodyText: JSON.stringify({ id: taskId, workspaceId, title: 'Read' }), ownerStore: store({ [`workspace:${workspaceId}`]: actorA }),
    handlers: { createTask: async () => { throw new Error('private sql detail'); } },
  });
  assert.deepEqual(result, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
});

test('authenticated gateway binds the handler actor to verified provider and app-session claims', async () => {
  let seenActor;
  let seenSession;
  const result = await handleAuthenticatedGatewayRequest({ method: 'POST', path: '/v1/tasks', headers: { ...headers, Authorization: 'Bearer provider-token' }, bodyText: JSON.stringify({ id: taskId, workspaceId, title: 'Read' }),
    verifyProviderToken: async (token) => { assert.equal(token, 'provider-token'); return { sub: actorA, sessionId: appSession.sessionId, exp: 1791590700, iss: ISSUER, aud: AUDIENCE }; }, expectedIssuer: ISSUER, expectedAudience: AUDIENCE, now: NOW,
    loadSession: async () => appSession, ownerStore: store({ [`workspace:${workspaceId}`]: actorA }), rateLimit, handlers: { createTask: async (context) => { seenActor = context.actorId; seenSession = context.sessionId; return { status: 201, body: { ok: true } }; } },
  });
  assert.deepEqual(result, { status: 201, body: { ok: true } });
  assert.equal(seenActor, actorA);
  assert.equal(seenSession, appSession.sessionId);
});

test('two authenticated synthetic accounts remain isolated across gateway reads', async () => {
  const accountB = { ownerId: actorB, sessionId: '77777777-7777-4777-8777-777777777777' };
  const seen = [];
  const requestFor = async (account, token) => handleAuthenticatedGatewayRequest({
    method: 'GET', path: `/v1/tasks/${taskId}`, headers: { Authorization: `Bearer ${token}` },
    expectedIssuer: ISSUER, expectedAudience: AUDIENCE, now: NOW,
    verifyProviderToken: async (received) => {
      assert.equal(received, token);
      return { sub: account.ownerId, sessionId: account.sessionId, exp: 1791590700, iss: ISSUER, aud: AUDIENCE };
    },
    loadSession: async (ownerId, sessionId) => ownerId === account.ownerId && sessionId === account.sessionId
      ? { ...appSession, ownerId: account.ownerId, sessionId: account.sessionId }
      : null,
    ownerStore: store({ [`task:${taskId}`]: account.ownerId }),
    rateLimit,
    handlers: { getTask: async (context) => { seen.push(context.actorId); return { status: 200, body: { ownerId: context.actorId } }; } },
  });
  const resultA = await requestFor({ ownerId: actorA, sessionId: appSession.sessionId }, 'account-a-token');
  const resultB = await requestFor(accountB, 'account-b-token');
  assert.deepEqual(resultA, { status: 200, body: { ownerId: actorA } });
  assert.deepEqual(resultB, { status: 200, body: { ownerId: actorB } });
  assert.deepEqual(seen, [actorA, actorB]);
});

test('authenticated gateway rejects missing, invalid or revoked sessions before owner lookup', async () => {
  let ownerReads = 0;
  const common = { method: 'GET', path: '/v1/me', headers: {}, expectedIssuer: ISSUER, expectedAudience: AUDIENCE, now: NOW, verifyProviderToken: async () => { throw new Error('must not verify'); }, loadSession: async () => appSession, ownerStore: { loadOwnerId: async () => { ownerReads += 1; return actorA; } }, rateLimit, handlers: { getMe: async () => ({ status: 200, body: {} }) } };
  const missing = await handleAuthenticatedGatewayRequest(common);
  assert.deepEqual(missing, { status: 401, body: { error: { code: 'AUTH_REQUIRED', retryable: false } } });
  const invalid = await handleAuthenticatedGatewayRequest({ ...common, headers: { Authorization: 'Bearer token' }, verifyProviderToken: async () => { throw new Error('invalid'); } });
  assert.deepEqual(invalid, { status: 401, body: { error: { code: 'AUTH_REQUIRED', retryable: false } } });
  const revoked = await handleAuthenticatedGatewayRequest({ ...common, headers: { Authorization: 'Bearer token' }, verifyProviderToken: async () => ({ sub: actorA, sessionId: appSession.sessionId, exp: 1791590700, iss: ISSUER, aud: AUDIENCE }), loadSession: async () => ({ ...appSession, status: 'revoked', revokedAt: NOW }) });
  assert.deepEqual(revoked, { status: 401, body: { error: { code: 'AUTH_REQUIRED', retryable: false } } });
  assert.equal(ownerReads, 0);
});

test('authenticated gateway maps an atomic rate-limit denial without calling the handler', async () => {
  let called = false;
  const result = await handleAuthenticatedGatewayRequest({
    method: 'GET', path: '/v1/me', headers: { Authorization: 'Bearer token' }, expectedIssuer: ISSUER, expectedAudience: AUDIENCE, now: NOW,
    verifyProviderToken: async () => ({ sub: actorA, sessionId: appSession.sessionId, exp: 1791590700, iss: ISSUER, aud: AUDIENCE }),
    loadSession: async () => appSession, ownerStore: store({}), rateLimit: { ...rateLimit, counter: { consume: async () => ({ allowed: false, retryAfterSeconds: 12 }) } },
    handlers: { getMe: async () => { called = true; return { status: 200, body: {} }; } },
  });
  assert.deepEqual(result, { status: 429, headers: { 'Retry-After': '12' }, body: { error: { code: 'RATE_LIMITED', retryable: false } } });
  assert.equal(called, false);
});

test('gateway diagnostics are allowlisted and never expose private error details', async () => {
  const records = [];
  const result = await handleGatewayRequest({
    method: 'POST', path: '/v1/tasks', actorId: actorA, headers: { ...headers, 'X-Request-Id': 'req_123' },
    bodyText: JSON.stringify({ id: taskId, workspaceId, title: 'Read' }), ownerStore: store({ [`workspace:${workspaceId}`]: actorA }),
    logger: (record) => records.push(record), handlers: { createTask: async () => { throw new Error('private sql detail'); } },
  });
  assert.equal(result.status, 503);
  assert.deepEqual(records, [{ event: 'gateway.request_failed', status: 503, code: 'DEPENDENCY_UNAVAILABLE', retryable: true, requestId: 'req_123' }]);
  assert.equal(JSON.stringify(records).includes('private sql detail'), false);
});

test('diagnostic logger failures and invalid request IDs cannot escape the public boundary', async () => {
  const result = await handleGatewayRequest({
    method: 'POST', path: '/v1/tasks', actorId: actorA, headers: { ...headers, 'X-Request-Id': 'req_123' },
    bodyText: JSON.stringify({ id: taskId, workspaceId, title: 'Read' }), ownerStore: store({ [`workspace:${workspaceId}`]: actorA }),
    logger: () => { throw new Error('logger failed'); }, handlers: { createTask: async () => { throw new Error('private sql detail'); } },
  });
  assert.deepEqual(result, { status: 503, body: { error: { code: 'DEPENDENCY_UNAVAILABLE', retryable: true } } });
});
