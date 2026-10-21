import assert from 'node:assert/strict';
import test from 'node:test';

const { unavailableEntitlements, validateEntitlementsResponse } = await import('../../supabase/functions/_shared/entitlement-response-validation.ts');

const item = { grantId: '11111111-1111-4111-8111-111111111111', licenseId: null, capability: 'ai', scopeType: 'personal', scopeId: '11111111-1111-4111-8111-111111111111', state: 'active', validUntil: null, source: 'promotion', checkedAt: '2026-10-11T00:00:00.000Z', catalogVersion: 'catalog-v1' };

test('entitlement response accepts a server-shaped current projection', () => {
  const response = validateEntitlementsResponse({ data: { status: 'current', checkedAt: item.checkedAt, catalogVersion: 'catalog-v1', entitlements: [item] }, meta: { nextCursor: null } });
  assert.deepEqual(response.data.entitlements, [item]);
});

test('unavailable entitlements contain no stale or fabricated rights', () => {
  assert.deepEqual(validateEntitlementsResponse(unavailableEntitlements()), unavailableEntitlements());
  assert.throws(() => validateEntitlementsResponse({ data: { status: 'unavailable', checkedAt: null, catalogVersion: null, entitlements: [] }, meta: { nextCursor: null } }), /INVALID_ENTITLEMENTS_RESPONSE/);
});

test('entitlement response rejects malformed identity, source, state and time fields', () => {
  assert.throws(() => validateEntitlementsResponse({ data: { status: 'current', checkedAt: item.checkedAt, catalogVersion: 'v1', entitlements: [{ ...item, grantId: 'bad' }] }, meta: { nextCursor: null } }), /grantId/);
  assert.throws(() => validateEntitlementsResponse({ data: { status: 'current', checkedAt: item.checkedAt, catalogVersion: 'v1', entitlements: [{ ...item, source: 'client' }] }, meta: { nextCursor: null } }), /enum/);
  assert.throws(() => validateEntitlementsResponse({ data: { status: 'current', checkedAt: 'bad', catalogVersion: 'v1', entitlements: [] }, meta: { nextCursor: null } }), /checkedAt/);
});

test('entitlement response rejects sparse rights arrays', () => {
  const sparse = [];
  sparse.length = 1;
  assert.throws(() => validateEntitlementsResponse({ data: { status: 'current', checkedAt: item.checkedAt, catalogVersion: 'v1', entitlements: sparse }, meta: { nextCursor: null } }), /current response/);
});
