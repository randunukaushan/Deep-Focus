import assert from 'node:assert/strict';
import test from 'node:test';

const { planSessionRevocation, revokeAccountSessionsTransactionally } = await import('../../supabase/functions/_shared/app-session-revocation-plan.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '22222222-2222-4222-8222-222222222222';
const CURRENT = '33333333-3333-4333-8333-333333333333';
const OTHER = '44444444-4444-4444-8444-444444444444';
const EXPIRED = '55555555-5555-4555-8555-555555555555';
const MUTATION = '66666666-6666-4666-8666-666666666666';
const HASH = 'a'.repeat(64);
const NOW = '2026-10-11T01:00:00.000Z';

function session(sessionId, ownerId = OWNER, overrides = {}) {
  return { ownerId, sessionId, issuedAt: '2026-10-10T00:00:00.000Z', status: 'active', expiresAt: '2026-10-12T00:00:00.000Z', revokedAt: null, ...overrides };
}

test('revocation plan selects one, others and all only within the verified owner', () => {
  const records = [session(CURRENT), session(OTHER), session(EXPIRED, OWNER, { expiresAt: '2026-10-10T12:00:00.000Z' })];
  assert.deepEqual(planSessionRevocation({ verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'others' }, records, now: NOW, recentAuthVerified: true }), { ownerId: OWNER, sessionIds: [OTHER], currentSessionRevoked: false });
  assert.deepEqual(planSessionRevocation({ verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, records, now: NOW, recentAuthVerified: true }), { ownerId: OWNER, sessionIds: [CURRENT, OTHER], currentSessionRevoked: true });
  assert.deepEqual(planSessionRevocation({ verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'one', sessionId: OTHER }, records, now: NOW, recentAuthVerified: true }), { ownerId: OWNER, sessionIds: [OTHER], currentSessionRevoked: false });
});

test('missing, revoked and expired targets are safe no-ops; foreign-shaped rows fail closed', () => {
  const records = [session(CURRENT), session(OTHER, OWNER, { status: 'revoked', revokedAt: NOW })];
  assert.deepEqual(planSessionRevocation({ verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'one', sessionId: OTHER }, records, now: NOW, recentAuthVerified: true }), { ownerId: OWNER, sessionIds: [], currentSessionRevoked: false });
  assert.throws(() => planSessionRevocation({ verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, records: [session(OTHER, FOREIGN)], now: NOW, recentAuthVerified: true }), /DEPENDENCY_UNAVAILABLE/);
  assert.throws(() => planSessionRevocation({ verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, records, now: NOW, recentAuthVerified: false }), /VALIDATION_FAILED/);
});

test('duplicate session rows fail closed before a target plan is produced', () => {
  assert.throws(() => planSessionRevocation({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' },
    records: [session(CURRENT), session(CURRENT)], now: NOW, recentAuthVerified: true,
  }), /DEPENDENCY_UNAVAILABLE/);
});

test('revocation planning rejects sparse session records and receipt targets', async () => {
  const sparseRecords = [];
  sparseRecords.length = 1;
  assert.throws(() => planSessionRevocation({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' },
    records: sparseRecords, now: NOW, recentAuthVerified: true,
  }), /DEPENDENCY_UNAVAILABLE/);

  const sparseTargets = [];
  sparseTargets.length = 1;
  await assert.rejects(() => revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, now: NOW,
    recentAuthVerified: true, mutationId: MUTATION, requestSha256: HASH, revocationIdFor: () => MUTATION,
    store: { withTransaction: async (run) => run({
      loadReceipt: async () => ({ ownerId: OWNER, mutationId: MUTATION, requestSha256: HASH, sessionIds: sparseTargets, currentSessionRevoked: false, providerRevocationStatus: 'pending' }),
      listSessions: async () => [], saveReceipt: async () => {}, enqueueProviderRevocation: async () => 'created', revokeSession: async () => {},
    }) },
  }), /DEPENDENCY_UNAVAILABLE/);
});

test('transactional revocation enqueues every selected provider job before changing registry rows', async () => {
  const calls = [];
  const result = await revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, now: NOW, recentAuthVerified: true,
    mutationId: MUTATION, requestSha256: HASH,
    revocationIdFor: (sessionId) => sessionId === CURRENT ? '66666666-6666-4666-8666-666666666666' : '77777777-7777-4777-8777-777777777777',
    store: { withTransaction: async (run) => run({
      listSessions: async () => [session(CURRENT), session(OTHER)],
      loadReceipt: async () => null,
      saveReceipt: async () => {},
      enqueueProviderRevocation: async (input) => { calls.push(['enqueue', input.sessionId]); return 'created'; },
      revokeSession: async (input) => { calls.push(['revoke', input.sessionId]); },
    }) },
  });
  assert.deepEqual(result.sessionIds, [CURRENT, OTHER]);
  assert.equal(result.currentSessionRevoked, true);
  assert.deepEqual(calls, [['enqueue', CURRENT], ['enqueue', OTHER], ['revoke', CURRENT], ['revoke', OTHER]]);
});

test('transactional revocation propagates outbox failure and never reports a partial success', async () => {
  let revoked = false;
  await assert.rejects(() => revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, now: NOW, recentAuthVerified: true,
    mutationId: MUTATION, requestSha256: HASH,
    revocationIdFor: () => '66666666-6666-4666-8666-666666666666',
    store: { withTransaction: async (run) => run({
      listSessions: async () => [session(CURRENT)],
      loadReceipt: async () => null,
      saveReceipt: async () => {},
      enqueueProviderRevocation: async () => { throw new Error('outbox unavailable'); },
      revokeSession: async () => { revoked = true; },
    }) },
  }), /outbox unavailable/);
  assert.equal(revoked, false);
});

test('same revocation request replays its frozen target set without rereading sessions', async () => {
  let listCalls = 0;
  const receipt = {
    ownerId: OWNER, mutationId: MUTATION, requestSha256: HASH,
    sessionIds: [OTHER], currentSessionRevoked: false, providerRevocationStatus: 'pending',
  };
  const result = await revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, now: NOW,
    recentAuthVerified: true, mutationId: MUTATION, requestSha256: HASH, revocationIdFor: () => '77777777-7777-4777-8777-777777777777',
    store: { withTransaction: async (run) => run({
      loadReceipt: async () => receipt,
      saveReceipt: async () => assert.fail('replay must not write a second receipt'),
      listSessions: async () => { listCalls += 1; return [session(CURRENT)]; },
      enqueueProviderRevocation: async () => assert.fail('replay must not enqueue'),
      revokeSession: async () => assert.fail('replay must not revoke'),
    }) },
  });
  assert.deepEqual(result, { ownerId: OWNER, sessionIds: [OTHER], currentSessionRevoked: false, providerRevocationStatus: 'pending' });
  assert.equal(listCalls, 0);
});

test('changed revocation intent is rejected before session selection', async () => {
  let listCalls = 0;
  await assert.rejects(() => revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, now: NOW,
    recentAuthVerified: true, mutationId: MUTATION, requestSha256: 'b'.repeat(64), revocationIdFor: () => MUTATION,
    store: { withTransaction: async (run) => run({
      loadReceipt: async () => ({ ownerId: OWNER, mutationId: MUTATION, requestSha256: HASH, sessionIds: [OTHER], currentSessionRevoked: false, providerRevocationStatus: 'pending' }),
      saveReceipt: async () => {},
      listSessions: async () => { listCalls += 1; return []; },
      enqueueProviderRevocation: async () => 'created',
      revokeSession: async () => {},
    }) },
  }), /IDEMPOTENCY_CONFLICT/);
  assert.equal(listCalls, 0);
});

test('receipt write failure is propagated after revocation work and cannot report success', async () => {
  const calls = [];
  await assert.rejects(() => revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: { scope: 'all' }, now: NOW,
    recentAuthVerified: true, mutationId: MUTATION, requestSha256: HASH, revocationIdFor: () => MUTATION,
    store: { withTransaction: async (run) => run({
      loadReceipt: async () => null,
      listSessions: async () => [session(CURRENT)],
      enqueueProviderRevocation: async () => { calls.push('enqueue'); return 'created'; },
      revokeSession: async () => { calls.push('revoke'); },
      saveReceipt: async () => { calls.push('receipt'); throw new Error('receipt unavailable'); },
    }) },
  }), /receipt unavailable/);
  assert.deepEqual(calls, ['enqueue', 'revoke', 'receipt']);
});

test('revocation plan rejects malformed runtime scope and identity before storage', async () => {
  await assert.rejects(() => revokeAccountSessionsTransactionally({
    verifiedOwnerId: OWNER, currentSessionId: CURRENT, scope: null, now: NOW, recentAuthVerified: true,
    mutationId: MUTATION, requestSha256: HASH, revocationIdFor: () => MUTATION,
    store: { withTransaction: async () => { throw new Error('must not open transaction'); } },
  }), /VALIDATION_FAILED/);
  assert.throws(() => planSessionRevocation({ verifiedOwnerId: Symbol('owner'), currentSessionId: CURRENT, scope: { scope: 'all' }, records: [], now: NOW, recentAuthVerified: true }), /VALIDATION_FAILED/);
});
