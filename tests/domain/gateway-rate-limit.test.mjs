import assert from 'node:assert/strict';
import test from 'node:test';

const { enforceGatewayRateLimit } = await import('../../supabase/functions/_shared/gateway-rate-limit.ts');

const actorId = '11111111-1111-4111-8111-111111111111';
const base = { actorId, operation: 'createTask', nowMs: 1_700_000_000_000, windowMs: 60_000, limit: 2 };

test('rate-limit admission uses an actor and operation scoped counter key', async () => {
  let received;
  await assert.doesNotReject(enforceGatewayRateLimit({ ...base, counter: { consume: async (...args) => { received = args; return { allowed: true, retryAfterSeconds: 0 }; } } }));
  assert.deepEqual(received, [`actor:${actorId}:createTask`, 60_000, 2, base.nowMs]);
});

test('rate-limit denial is a bounded 429 and never silently retried', async () => {
  await assert.rejects(enforceGatewayRateLimit({ ...base, counter: { consume: async () => ({ allowed: false, retryAfterSeconds: 12 }) } }), /RATE_LIMITED/);
});

test('invalid counter decisions fail closed without becoming an allow', async () => {
  for (const result of [{ allowed: 'yes', retryAfterSeconds: 0 }, { allowed: true, retryAfterSeconds: -1 }, null]) {
    await assert.rejects(enforceGatewayRateLimit({ ...base, counter: { consume: async () => result } }), /DEPENDENCY_UNAVAILABLE/);
  }
});

test('unsafe policy input is rejected before the shared counter is called', async () => {
  let called = false;
  await assert.rejects(enforceGatewayRateLimit({ ...base, actorId: 'foreign', counter: { consume: async () => { called = true; return { allowed: true, retryAfterSeconds: 0 }; } } }), /VALIDATION_FAILED/);
  assert.equal(called, false);
});

test('negative clock values are rejected before the shared counter is called', async () => {
  let called = false;
  await assert.rejects(enforceGatewayRateLimit({ ...base, nowMs: -1, counter: { consume: async () => { called = true; return { allowed: true, retryAfterSeconds: 0 }; } } }), /VALIDATION_FAILED/);
  assert.equal(called, false);
});

test('rate-limit admission rejects unsafe actor and operation runtime types before counter access', async () => {
  let called = false;
  const counter = { consume: async () => { called = true; return { allowed: true, retryAfterSeconds: 0 }; } };
  await assert.rejects(enforceGatewayRateLimit({ ...base, actorId: Symbol('actor'), counter }), /VALIDATION_FAILED/);
  await assert.rejects(enforceGatewayRateLimit({ ...base, operation: Symbol('operation'), counter }), /VALIDATION_FAILED/);
  assert.equal(called, false);
});

test('rate-limit admission rejects malformed composition before counter access', async () => {
  await assert.rejects(enforceGatewayRateLimit(null), /VALIDATION_FAILED/);
  await assert.rejects(enforceGatewayRateLimit([]), /VALIDATION_FAILED/);
  await assert.rejects(enforceGatewayRateLimit({ ...base, counter: null }), /VALIDATION_FAILED/);
  await assert.rejects(enforceGatewayRateLimit({ ...base, counter: { consume: 'not-a-function' } }), /VALIDATION_FAILED/);
});
