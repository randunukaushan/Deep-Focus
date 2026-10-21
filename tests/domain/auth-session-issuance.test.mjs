import assert from 'node:assert/strict';
import test from 'node:test';

const { issueAppSessionFromVerifiedClaims } = await import('../../supabase/functions/_shared/auth-session-issuance.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-11T02:00:00.000Z';
const ISSUER = 'https://deep-focus-dev.supabase.co/auth/v1';
const AUDIENCE = 'authenticated';
const CLAIMS = { sub: OWNER, sessionId: SESSION, exp: 1791766800, iss: ISSUER, aud: AUDIENCE };

function store() {
  const calls = [];
  return {
    calls,
    store: { withTransaction: async (operation) => operation({
      loadSession: async () => null,
      insertSession: async (record) => { calls.push(record); },
    }) },
  };
}

test('verified provider claims issue one owner-bound app session transactionally', async () => {
  const h = store();
  const result = await issueAppSessionFromVerifiedClaims({ claims: CLAIMS, expectedIssuer: ISSUER, expectedAudience: AUDIENCE, now: NOW, store: h.store });
  assert.equal(result.ok, true);
  assert.equal(h.calls.length, 1);
  assert.deepEqual(h.calls[0], { ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, status: 'active', expiresAt: '2026-10-12T01:00:00.000Z', revokedAt: null });
});

test('issuer, audience, owner, session and expiry mismatches fail before persistence', async () => {
  for (const claims of [
    { ...CLAIMS, iss: 'https://wrong.example' },
    { ...CLAIMS, aud: 'wrong' },
    { ...CLAIMS, sub: 'not-an-owner' },
    { ...CLAIMS, sessionId: 'not-a-session' },
    { ...CLAIMS, exp: 1791680400 },
  ]) {
    const h = store();
    const result = await issueAppSessionFromVerifiedClaims({ claims, expectedIssuer: ISSUER, expectedAudience: AUDIENCE, now: NOW, store: h.store });
    assert.deepEqual(result, { ok: false, reason: 'invalid_input' });
    assert.equal(h.calls.length, 0);
  }
});

test('malformed claims and raw-token-shaped input never create a session', async () => {
  const h = store();
  const result = await issueAppSessionFromVerifiedClaims({ claims: { access_token: 'secret', sub: OWNER }, expectedIssuer: ISSUER, expectedAudience: AUDIENCE, now: NOW, store: h.store });
  assert.deepEqual(result, { ok: false, reason: 'invalid_input' });
  assert.equal(h.calls.length, 0);
});

test('malformed issue input is rejected before property access or persistence', async () => {
  for (const input of [null, []]) {
    const result = await issueAppSessionFromVerifiedClaims(input);
    assert.deepEqual(result, { ok: false, reason: 'invalid_input' });
  }
});

test('database insertion failure remains visible to the caller', async () => {
  await assert.rejects(
    issueAppSessionFromVerifiedClaims({
      claims: CLAIMS,
      expectedIssuer: ISSUER,
      expectedAudience: AUDIENCE,
      now: NOW,
      store: { withTransaction: async (operation) => operation({
        loadSession: async () => null,
        insertSession: async () => { throw new Error('DB_WRITE_FAILED'); },
      }) },
    }),
    /DB_WRITE_FAILED/,
  );
});
