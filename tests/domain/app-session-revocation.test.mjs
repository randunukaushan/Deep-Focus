import assert from 'node:assert/strict';
import test from 'node:test';

const { revokeAndQueueProviderRevocation } = await import('../../supabase/functions/_shared/app-session-revocation.ts');

const ownerId = '11111111-1111-4111-8111-111111111111';
const sessionId = '22222222-2222-4222-8222-222222222222';
const revocationId = '33333333-3333-4333-8333-333333333333';
const active = { ownerId, sessionId, issuedAt: '2026-10-10T00:00:00.000Z', status: 'active', expiresAt: '2026-12-01T00:00:00.000Z', revokedAt: null };

test('session revoke and provider outbox enqueue share one transaction', async () => {
  const order = [];
  const result = await revokeAndQueueProviderRevocation({ verifiedOwnerId: ownerId, sessionId, revocationId, now: '2026-10-10T00:00:00.000Z', store: {
    withTransaction: async (operation) => operation({
      loadSession: async () => { order.push('load'); return active; },
      enqueueProviderRevocation: async () => { order.push('enqueue'); return 'created'; },
      revokeSession: async () => { order.push('revoke'); },
    }),
  } });
  assert.equal(result.ok, true);
  assert.equal(result.outbox, 'created');
  assert.deepEqual(order, ['load', 'enqueue', 'revoke']);
});

test('repeated revoke is safe and does not enqueue after already revoked state', async () => {
  let enqueued = false;
  const result = await revokeAndQueueProviderRevocation({ verifiedOwnerId: ownerId, sessionId, revocationId, now: '2026-10-10T00:00:00.000Z', store: {
    withTransaction: async (operation) => operation({
      loadSession: async () => ({ ...active, issuedAt: '2026-10-08T00:00:00.000Z', status: 'revoked', revokedAt: '2026-10-09T00:00:00.000Z' }),
      enqueueProviderRevocation: async () => { enqueued = true; return 'existing'; }, revokeSession: async () => {},
    }),
  } });
  assert.deepEqual(result, { ok: false, reason: 'already_revoked', outbox: 'not_queued' });
  assert.equal(enqueued, false);
});

test('foreign session cannot be revoked or queued', async () => {
  let enqueued = false;
  const result = await revokeAndQueueProviderRevocation({ verifiedOwnerId: ownerId, sessionId, revocationId, now: '2026-10-10T00:00:00.000Z', store: {
    withTransaction: async (operation) => operation({
      loadSession: async () => ({ ...active, ownerId: '44444444-4444-4444-8444-444444444444' }),
      enqueueProviderRevocation: async () => { enqueued = true; return 'created'; }, revokeSession: async () => {},
    }),
  } });
  assert.deepEqual(result, { ok: false, reason: 'owner_mismatch', outbox: 'not_queued' });
  assert.equal(enqueued, false);
});

test('outbox failure prevents reporting a committed revocation', async () => {
  let revoked = false;
  await assert.rejects(revokeAndQueueProviderRevocation({ verifiedOwnerId: ownerId, sessionId, revocationId, now: '2026-10-10T00:00:00.000Z', store: {
    withTransaction: async (operation) => operation({ loadSession: async () => active, enqueueProviderRevocation: async () => { throw new Error('outbox unavailable'); }, revokeSession: async () => { revoked = true; } }),
  } }), /outbox unavailable/);
  assert.equal(revoked, false);
});
