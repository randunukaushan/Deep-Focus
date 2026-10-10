import assert from 'node:assert/strict';
import test from 'node:test';

const { authorizeAppSession, issueAppSession, issueAppSessionAtomically, issueAppSessionTransactionally, revokeAppSession, revokeAppSessionAtomically, revokeAppSessionTransactionally } = await import('../../supabase/functions/_shared/app-session.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-10T00:00:00.000Z';
const claims = { sub: OWNER, sessionId: SESSION, exp: Math.floor(Date.parse(NOW) / 1000) + 300, iss: 'https://project.supabase.co/auth/v1', aud: 'authenticated' };
const record = { ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, status: 'active', expiresAt: '2026-10-10T01:00:00.000Z', revokedAt: null };

function check(overrides = {}, recordOverride = record) {
  return authorizeAppSession({ claims: { ...claims, ...overrides }, expectedIssuer: claims.iss, expectedAudience: claims.aud, now: NOW, loadSession: async () => recordOverride });
}

test('server session admission requires verified claims and an active matching registry row', async () => {
  assert.deepEqual(await check(), { allowed: true, ownerId: OWNER, sessionId: SESSION });
  assert.equal((await check({ iss: 'https://other.example' })).reason, 'invalid_claims');
  assert.equal((await check({ aud: 'public' })).reason, 'invalid_claims');
  assert.equal((await check({ sub: '33333333-3333-4333-8333-333333333333' })).reason, 'owner_mismatch');
});

test('revoked, expired and missing app sessions fail closed', async () => {
  assert.equal((await check({}, null)).reason, 'session_not_found');
  assert.equal((await check({}, { ...record, status: 'revoked', revokedAt: NOW })).reason, 'revoked');
  assert.equal((await check({}, { ...record, issuedAt: '2026-10-09T00:00:00.000Z', expiresAt: '2026-10-09T23:59:59.000Z' })).reason, 'expired');
});

test('malformed or expired provider claims never use the registry as offline proof', async () => {
  let reads = 0;
  const result = await authorizeAppSession({ claims: { ...claims, exp: 1 }, expectedIssuer: claims.iss, expectedAudience: claims.aud, now: NOW, loadSession: async () => { reads += 1; return record; } });
  assert.deepEqual(result, { allowed: false, reason: 'invalid_claims' });
  assert.equal(reads, 0);
});

test('malformed registry rows fail closed instead of authorizing or mutating a session', async () => {
  assert.equal((await check({}, { ...record, expiresAt: 'not-a-time' })).reason, 'session_not_found');
  assert.equal(revokeAppSession({ verifiedOwnerId: OWNER, record: { ...record, revokedAt: NOW }, now: NOW }).reason, 'invalid_input');
});

test('session issue creates only a bounded active owner record', () => {
  assert.deepEqual(issueAppSession({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: '2026-10-10T01:00:00.000Z' }), { ok: true, record });
  assert.equal(issueAppSession({ ownerId: 'not-an-owner', sessionId: SESSION, issuedAt: NOW, expiresAt: '2026-10-10T01:00:00.000Z' }).reason, 'invalid_input');
  assert.equal(issueAppSession({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: NOW }).reason, 'invalid_input');
});

test('session revoke is owner-bound, expiry-aware and idempotency-safe', () => {
  assert.deepEqual(revokeAppSession({ verifiedOwnerId: OWNER, record, now: NOW }), { ok: true, record: { ...record, status: 'revoked', revokedAt: NOW } });
  assert.equal(revokeAppSession({ verifiedOwnerId: '33333333-3333-4333-8333-333333333333', record, now: NOW }).reason, 'owner_mismatch');
  assert.equal(revokeAppSession({ verifiedOwnerId: OWNER, record: { ...record, status: 'revoked', revokedAt: NOW }, now: NOW }).reason, 'already_revoked');
  assert.equal(revokeAppSession({ verifiedOwnerId: OWNER, record: { ...record, issuedAt: '2026-10-09T00:00:00.000Z', expiresAt: '2026-10-09T23:59:59.000Z' }, now: NOW }).reason, 'expired');
});

test('session issue and revoke persistence callbacks run only after validation and propagate write failures', async () => {
  let inserted = null;
  let revoked = null;
  const store = {
    async insertSession(value) { inserted = value; },
    async loadSession() { return record; },
    async revokeSession(value) { revoked = value; },
  };
  assert.deepEqual(await issueAppSessionAtomically({ ownerId: OWNER, sessionId: SESSION, issuedAt: NOW, expiresAt: '2026-10-10T01:00:00.000Z', store }), { ok: true, record });
  assert.deepEqual(inserted, record);
  assert.deepEqual(await revokeAppSessionAtomically({ verifiedOwnerId: OWNER, sessionId: SESSION, now: NOW, store }), { ok: true, record: { ...record, status: 'revoked', revokedAt: NOW } });
  assert.deepEqual(revoked, { ownerId: OWNER, sessionId: SESSION, revokedAt: NOW });
  await assert.rejects(issueAppSessionAtomically({ ownerId: OWNER, sessionId: '33333333-3333-4333-8333-333333333333', issuedAt: NOW, expiresAt: '2026-10-10T01:00:00.000Z', store: { async insertSession() { throw new Error('WRITE_FAILED'); } } }), /WRITE_FAILED/);
});

test('session issue and revoke transaction helpers keep registry read and write in one commit boundary', async () => {
  let transactions = 0;
  let stored = record;
  const store = {
    async withTransaction(operation) {
      transactions += 1;
      return operation({
        async insertSession(value) { stored = value; },
        async loadSession() { return stored; },
        async revokeSession(value) { stored = { ...stored, status: 'revoked', revokedAt: value.revokedAt }; },
      });
    },
  };
  const issued = await issueAppSessionTransactionally({ ownerId: OWNER, sessionId: '33333333-3333-4333-8333-333333333333', issuedAt: NOW, expiresAt: '2026-10-10T01:00:00.000Z', store });
  assert.equal(issued.ok, true);
  const revoked = await revokeAppSessionTransactionally({ verifiedOwnerId: OWNER, sessionId: '33333333-3333-4333-8333-333333333333', now: NOW, store });
  assert.equal(revoked.ok, true);
  assert.equal(transactions, 2);
  assert.equal(stored.status, 'revoked');
});
