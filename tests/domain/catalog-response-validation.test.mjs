import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCatalogResponse, validateCatalogSurface, unavailableCatalog } from '../../supabase/functions/_shared/catalog-response-validation.ts';

const offer = {
  id: '11111111-1111-4111-8111-111111111111',
  version: 'catalog-v1',
  capabilities: ['advanced_planning'],
  scopeType: 'personal',
  billingPeriod: 'month',
  purchaseType: 'recurring',
  providerSource: 'google_play',
  storeProductId: 'deep-focus-advanced-monthly',
  supportedTerritories: ['LK'],
  disclosure: 'Example reviewed disclosure',
  price: { minorUnits: '1200', currency: 'LKR', fractionDigits: 2, providerSource: 'google_play', checkedAt: '2026-10-11T00:00:00.000Z' },
};

test('catalog response accepts a bounded server-shaped current projection', () => {
  const response = validateCatalogResponse({ data: { status: 'current', checkedAt: '2026-10-11T00:00:00.000Z', catalogVersion: 'v1', offers: [offer] }, meta: { nextCursor: null } });
  assert.equal(response.data.offers?.[0].id, offer.id);
  assert.equal(validateCatalogSurface('android'), 'android');
});

test('unconfigured and unavailable catalogs contain no price or offer claims', () => {
  assert.deepEqual(validateCatalogResponse(unavailableCatalog('unconfigured')), unavailableCatalog('unconfigured'));
  assert.throws(() => validateCatalogResponse({ data: { status: 'unavailable', checkedAt: null, catalogVersion: null, offers: [] }, meta: { nextCursor: null } }), /INVALID_CATALOG/);
});

test('catalog response rejects duplicate offers, unsupported surfaces and malformed price metadata', () => {
  const duplicate = { data: { status: 'current', checkedAt: '2026-10-11T00:00:00.000Z', catalogVersion: 'v1', offers: [offer, offer] }, meta: { nextCursor: null } };
  assert.throws(() => validateCatalogResponse(duplicate), /offer IDs must be unique/);
  assert.throws(() => validateCatalogSurface('lk'), /surface must be ios, android or web/);
  assert.throws(() => validateCatalogResponse({ data: { status: 'current', checkedAt: '2026-10-11T00:00:00.000Z', catalogVersion: 'v1', offers: [{ ...offer, price: { ...offer.price, minorUnits: '-1' } }] }, meta: { nextCursor: null } }), /minorUnits/);
});

test('catalog response rejects sparse offers and offer metadata arrays', () => {
  const sparse = [];
  sparse.length = 1;
  assert.throws(() => validateCatalogResponse({ data: { status: 'current', checkedAt: '2026-10-11T00:00:00.000Z', catalogVersion: 'v1', offers: sparse }, meta: { nextCursor: null } }), /offers/);
  assert.throws(() => validateCatalogResponse({ data: { status: 'current', checkedAt: '2026-10-11T00:00:00.000Z', catalogVersion: 'v1', offers: [{ ...offer, capabilities: sparse }] }, meta: { nextCursor: null } }), /offers/);
  assert.throws(() => validateCatalogResponse({ data: { status: 'current', checkedAt: '2026-10-11T00:00:00.000Z', catalogVersion: 'v1', offers: [{ ...offer, supportedTerritories: sparse }] }, meta: { nextCursor: null } }), /offers/);
});
