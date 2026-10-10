import assert from 'node:assert/strict';
import test from 'node:test';

const { decideCapabilityAccess, createSandboxEntitlementProvider } = await import('../../src/features/monetization/entitlement-policy.ts');

const OWNER = 'owner-a';
const NOW = '2026-10-09T05:00:00.000Z';

function entitlement(overrides = {}) {
  return { ownerId: OWNER, capability: 'ai', status: 'active', verifiedBy: 'server', policyVersion: 'sandbox-test', expiresAt: '2026-10-10T05:00:00.000Z', offerId: 'offer-test', ...overrides };
}

test('core focus remains available without a premium entitlement', () => {
  assert.deepEqual(decideCapabilityAccess('core_focus', OWNER, null, NOW), { allowed: true, reason: 'core_capability' });
});

test('only a matching server-verified active entitlement allows premium access', () => {
  assert.deepEqual(decideCapabilityAccess('ai', OWNER, entitlement(), NOW), { allowed: true, reason: 'server_verified' });
  assert.equal(decideCapabilityAccess('ai', OWNER, entitlement({ verifiedBy: 'none' }), NOW).allowed, false);
  assert.equal(decideCapabilityAccess('ai', OWNER, entitlement({ status: 'pending' }), NOW).allowed, false);
});

test('foreign, missing and expired entitlements fail closed', () => {
  assert.equal(decideCapabilityAccess('cloud_resources', OWNER, null, NOW).reason, 'missing_entitlement');
  assert.equal(decideCapabilityAccess('ai', OWNER, entitlement({ ownerId: 'owner-b' }), NOW).reason, 'owner_mismatch');
  assert.equal(decideCapabilityAccess('ai', OWNER, entitlement({ expiresAt: NOW }), NOW).reason, 'expired');
});

test('invalid local clock cannot grant premium access', () => {
  assert.deepEqual(decideCapabilityAccess('ai', OWNER, entitlement(), 'not-a-date'), { allowed: false, reason: 'invalid_clock' });
});

test('sandbox provider cannot create or restore a live entitlement', async () => {
  const provider = createSandboxEntitlementProvider();
  assert.equal((await provider.load(OWNER, 'cloud_resources')).status, 'none');
  await assert.rejects(provider.startPurchase(), /BILLING_NOT_CONFIGURED/);
  await assert.rejects(provider.restore(), /BILLING_NOT_CONFIGURED/);
});
