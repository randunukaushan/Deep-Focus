/** Server-shaped EX-29 catalog response validation; it does not select a provider or price. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const SURFACES = new Set(['ios', 'android', 'web']);
const SCOPE_TYPES = new Set(['personal', 'workspace']);
const BILLING_PERIODS = new Set(['one_time', 'month', 'year']);
const PURCHASE_TYPES = new Set(['one_time', 'recurring']);
const PROVIDERS = new Set(['apple_app_store', 'google_play', 'web_provider', 'organization', 'promotion']);
const CURRENCIES = /^[A-Z]{3}$/;

export type CatalogSurface = 'ios' | 'android' | 'web';
export type CatalogPrice = {
  minorUnits: string;
  currency: string;
  fractionDigits: number;
  providerSource: string;
  checkedAt: string;
};
export type CatalogOffer = {
  id: string;
  version: string;
  capabilities: string[];
  scopeType: 'personal' | 'workspace';
  billingPeriod: 'one_time' | 'month' | 'year';
  purchaseType: 'one_time' | 'recurring';
  providerSource: string;
  storeProductId: string | null;
  supportedTerritories: string[];
  disclosure: string;
  price: CatalogPrice | null;
};
export type CatalogResponse = {
  data: {
    status: 'current' | 'unconfigured' | 'unavailable';
    checkedAt: string | null;
    catalogVersion: string | null;
    offers: CatalogOffer[] | null;
  };
  meta: { nextCursor: string | null };
};

function invalid(message: string): never { throw new RangeError(`INVALID_CATALOG: ${message}`); }
function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max || !/\S/.test(value)) invalid(`${field} is invalid`);
  return value;
}
function instant(value: unknown, field: string): string {
  const result = text(value, field, 100);
  if (!Number.isFinite(Date.parse(result))) invalid(`${field} must be a valid instant`);
  return result;
}
function uuid(value: unknown, field: string): string {
  const result = text(value, field, 60);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result)) invalid(`${field} must be a UUID`);
  return result;
}
function nonnegativeDecimal(value: unknown, field: string): string {
  const result = text(value, field, 40);
  if (!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(result)) invalid(`${field} must be a canonical nonnegative decimal`);
  return result;
}
function arrayOfText(value: unknown, field: string, maxItems: number, itemMax: number): string[] {
  if (!Array.isArray(value) || !isPlainJsonValueForBoundary(value) || value.length > maxItems || new Set(value).size !== value.length) invalid(`${field} is invalid`);
  return value.map((item) => text(item, field, itemMax));
}

export function validateCatalogSurface(value: unknown): CatalogSurface {
  if (typeof value !== 'string' || !SURFACES.has(value)) invalid('surface must be ios, android or web');
  return value as CatalogSurface;
}

export function unavailableCatalog(status: 'unconfigured' | 'unavailable' = 'unavailable'): CatalogResponse {
  return { data: { status, checkedAt: null, catalogVersion: null, offers: null }, meta: { nextCursor: null } };
}

function validatePrice(value: unknown): CatalogPrice | null {
  if (value === null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('price is invalid');
  const price = value as Record<string, unknown>;
  const currency = text(price.currency, 'currency', 3);
  if (!CURRENCIES.test(currency)) invalid('currency must be an uppercase ISO-like code');
  if (!Number.isSafeInteger(price.fractionDigits) || (price.fractionDigits as number) < 0 || (price.fractionDigits as number) > 9) invalid('fractionDigits is invalid');
  const providerSource = text(price.providerSource, 'providerSource', 40);
  if (!PROVIDERS.has(providerSource)) invalid('price providerSource is unsupported');
  return { minorUnits: nonnegativeDecimal(price.minorUnits, 'minorUnits'), currency, fractionDigits: price.fractionDigits as number, providerSource, checkedAt: instant(price.checkedAt, 'price.checkedAt') };
}

function validateOffer(value: unknown): CatalogOffer {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('offer is invalid');
  const offer = value as Record<string, unknown>;
  const providerSource = text(offer.providerSource, 'providerSource', 40);
  if (!PROVIDERS.has(providerSource)) invalid('providerSource is unsupported');
  const scopeType = offer.scopeType;
  if (typeof scopeType !== 'string' || !SCOPE_TYPES.has(scopeType)) invalid('scopeType is invalid');
  const billingPeriod = offer.billingPeriod;
  if (typeof billingPeriod !== 'string' || !BILLING_PERIODS.has(billingPeriod)) invalid('billingPeriod is invalid');
  const purchaseType = offer.purchaseType;
  if (typeof purchaseType !== 'string' || !PURCHASE_TYPES.has(purchaseType)) invalid('purchaseType is invalid');
  const storeProductId = offer.storeProductId === null ? null : text(offer.storeProductId, 'storeProductId', 200);
  const supportedTerritories = arrayOfText(offer.supportedTerritories, 'supportedTerritories', 100, 12);
  if (supportedTerritories.some((territory) => !/^[A-Z]{2,3}$/.test(territory))) invalid('supportedTerritories contains an invalid code');
  return {
    id: uuid(offer.id, 'offer.id'),
    version: text(offer.version, 'offer.version', 100),
    capabilities: arrayOfText(offer.capabilities, 'capabilities', 50, 100),
    scopeType: scopeType as CatalogOffer['scopeType'],
    billingPeriod: billingPeriod as CatalogOffer['billingPeriod'],
    purchaseType: purchaseType as CatalogOffer['purchaseType'],
    providerSource,
    storeProductId,
    supportedTerritories,
    disclosure: text(offer.disclosure, 'disclosure', 4000),
    price: validatePrice(offer.price),
  };
}

export function validateCatalogResponse(value: unknown): CatalogResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('response must be an object');
  const response = value as Record<string, unknown>;
  if (!response.data || typeof response.data !== 'object' || Array.isArray(response.data)) invalid('data is invalid');
  if (!response.meta || typeof response.meta !== 'object' || Array.isArray(response.meta)) invalid('meta is invalid');
  const data = response.data as Record<string, unknown>;
  const meta = response.meta as Record<string, unknown>;
  if (data.status === 'unconfigured' || data.status === 'unavailable') {
    const expected = unavailableCatalog(data.status);
    if (JSON.stringify(response) !== JSON.stringify(expected)) invalid('unavailable catalog must not contain offers or freshness claims');
    return expected;
  }
  if (data.status !== 'current') invalid('status is invalid');
  const catalogVersion = text(data.catalogVersion, 'catalogVersion', 100);
  const checkedAt = instant(data.checkedAt, 'checkedAt');
  if (!Array.isArray(data.offers) || !isPlainJsonValueForBoundary(data.offers) || data.offers.length > 100) invalid('offers are invalid');
  const offers = data.offers.map(validateOffer);
  if (new Set(offers.map((offer) => offer.id)).size !== offers.length) invalid('offer IDs must be unique');
  const nextCursor = meta.nextCursor === null ? null : text(meta.nextCursor, 'nextCursor', 2000);
  return { data: { status: 'current', checkedAt, catalogVersion, offers }, meta: { nextCursor } };
}
