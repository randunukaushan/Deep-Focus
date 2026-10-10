import assert from 'node:assert/strict';
import test from 'node:test';

const { authorizeRequestSession } = await import('../../supabase/functions/_shared/request-session.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-10T00:00:00.000Z';
const ISSUER = 'https://project.supabase.co/auth/v1';
const AUDIENCE = 'authenticated';
const claims = { sub: OWNER, sessionId: SESSION, exp: Math.floor(Date.parse(NOW) / 1000) + 300, iss: ISSUER, aud: AUDIENCE };
const record = { ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, status: 'active', expiresAt: '2026-10-10T01:00:00.000Z', revokedAt: null };

function input(overrides = {}) {
  return {
    headers: { Authorization: 'Bearer provider-token' },
    verifyProviderToken: async (token) => { assert.equal(token, 'provider-token'); return claims; },
    expectedIssuer: ISSUER, expectedAudience: AUDIENCE, now: NOW,
    loadSession: async () => record,
    ...overrides,
  };
}

test('request session requires provider verification and active app-session registry row', async () => {
  assert.deepEqual(await authorizeRequestSession(input()), { allowed: true, ownerId: OWNER, sessionId: SESSION });
  assert.equal((await authorizeRequestSession(input({ loadSession: async () => null }))).reason, 'session_not_found');
  assert.equal((await authorizeRequestSession(input({ loadSession: async () => ({ ...record, status: 'revoked', revokedAt: NOW }) }))).reason, 'revoked');
});

test('missing, guest-shaped and malformed authorization never reach the provider verifier', async () => {
  let calls = 0;
  const verify = async () => { calls += 1; return claims; };
  for (const headers of [{}, { Authorization: 'Basic token' }, { Authorization: 'Bearer guest token' }, { Authorization: `Bearer ${'x'.repeat(8193)}` }, { Authorization: 'Bearer token with spaces' }]) {
    const result = await authorizeRequestSession(input({ headers, verifyProviderToken: verify }));
    assert.equal(result.allowed, false);
    assert.equal(result.reason, 'missing_token');
  }
  assert.equal(calls, 0);
});

test('provider verification failure is safe and does not consult the registry', async () => {
  let reads = 0;
  const result = await authorizeRequestSession(input({ verifyProviderToken: async () => { throw new Error('raw provider secret detail'); }, loadSession: async () => { reads += 1; return record; } }));
  assert.deepEqual(result, { allowed: false, reason: 'invalid_token' });
  assert.equal(reads, 0);
});

test('untrusted provider claims cannot use a valid registry row as offline proof', async () => {
  let reads = 0;
  const result = await authorizeRequestSession(input({ verifyProviderToken: async () => ({ ...claims, exp: 1 }), loadSession: async () => { reads += 1; return record; } }));
  assert.deepEqual(result, { allowed: false, reason: 'invalid_claims' });
  assert.equal(reads, 0);
});

test('provider verifier receives only the bearer token, never an owner or secret field', async () => {
  let received;
  await authorizeRequestSession(input({ verifyProviderToken: async (token) => { received = token; return claims; } }));
  assert.equal(received, 'provider-token');
});
