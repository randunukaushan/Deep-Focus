import assert from 'node:assert/strict';
import test from 'node:test';

const { admitServerCapability } = await import('../../supabase/functions/_shared/entitlement-boundary.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const NOW = '2026-10-10T00:00:00.000Z';
const entitlement = { ownerId: OWNER, capability: 'ai', status: 'active', verifiedBy: 'server', policyVersion: 'v1', expiresAt: '2026-10-11T00:00:00.000Z', offerId: null };

test('server capability admission accepts only a matching active server record', () => {
  assert.deepEqual(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement, now: NOW }), { allowed: true, ownerId: OWNER, capability: 'ai', policyVersion: 'v1' });
});

test('server capability admission rejects missing, foreign, wrong-capability and non-active records', () => {
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement: null, now: NOW }).reason, 'missing_entitlement');
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement: { ...entitlement, ownerId: '22222222-2222-4222-8222-222222222222' }, now: NOW }).reason, 'owner_mismatch');
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'cloud_resources', entitlement, now: NOW }).reason, 'owner_mismatch');
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement: { ...entitlement, status: 'revoked' }, now: NOW }).reason, 'not_active');
});

test('server capability admission rejects expired and invalid-clock records', () => {
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement: { ...entitlement, expiresAt: NOW }, now: NOW }).reason, 'expired');
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement, now: 'invalid' }).reason, 'invalid_clock');
  assert.equal(admitServerCapability({ verifiedActorId: 'client-owner', capability: 'ai', entitlement, now: NOW }).reason, 'invalid_actor');
});

test('server capability admission rejects malformed server metadata', () => {
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement: { ...entitlement, verifiedBy: 'client' }, now: NOW }).reason, 'not_active');
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement: { ...entitlement, policyVersion: '' }, now: NOW }).reason, 'not_active');
  assert.equal(admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement: { ...entitlement, policyVersion: 'x'.repeat(65) }, now: NOW }).reason, 'not_active');
});

test('server capability admission returns no price, provider or client grant fields', () => {
  const result = admitServerCapability({ verifiedActorId: OWNER, capability: 'ai', entitlement, now: NOW });
  assert.deepEqual(Object.keys(result).sort(), ['allowed', 'capability', 'ownerId', 'policyVersion']);
});
