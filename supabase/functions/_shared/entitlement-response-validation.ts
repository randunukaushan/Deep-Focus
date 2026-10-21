/** Validates the EX-28 wire response without inventing billing mappings. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SOURCES = new Set(['apple_app_store', 'google_play', 'web_provider', 'organization', 'promotion']);
const STATES = new Set(['pending', 'active', 'grace', 'expired', 'revoked']);

export type BillingEntitlement = {
  grantId: string;
  licenseId: string | null;
  capability: string;
  scopeType: 'personal' | 'workspace';
  scopeId: string;
  state: 'pending' | 'active' | 'grace' | 'expired' | 'revoked';
  validUntil: string | null;
  source: 'apple_app_store' | 'google_play' | 'web_provider' | 'organization' | 'promotion';
  checkedAt: string;
  catalogVersion: string;
};

export type EntitlementsResponse = {
  data: { status: 'current' | 'unavailable'; checkedAt: string | null; catalogVersion: string | null; entitlements: BillingEntitlement[] | null };
  meta: { nextCursor: string | null };
};

function invalid(message: string): never { throw new RangeError(`INVALID_ENTITLEMENTS_RESPONSE: ${message}`); }
function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > max || !/\S/.test(value)) invalid(`${field} is invalid`);
  return value;
}
function instant(value: unknown, field: string): string {
  const result = text(value, field, 100);
  if (!Number.isFinite(Date.parse(result))) invalid(`${field} is not an instant`);
  return result;
}
function uuid(value: unknown, field: string): string {
  const result = text(value, field, 36);
  if (!UUID.test(result)) invalid(`${field} is not an id`);
  return result;
}

function entitlement(value: unknown): BillingEntitlement {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('entitlement must be an object');
  const row = value as Record<string, unknown>;
  if (!['personal', 'workspace'].includes(String(row.scopeType)) || !STATES.has(String(row.state)) || !SOURCES.has(String(row.source))) invalid('entitlement enum is invalid');
  return {
    grantId: uuid(row.grantId, 'grantId'), licenseId: row.licenseId === null ? null : uuid(row.licenseId, 'licenseId'),
    capability: text(row.capability, 'capability', 100), scopeType: row.scopeType as BillingEntitlement['scopeType'], scopeId: uuid(row.scopeId, 'scopeId'),
    state: row.state as BillingEntitlement['state'], validUntil: row.validUntil === null ? null : instant(row.validUntil, 'validUntil'),
    source: row.source as BillingEntitlement['source'], checkedAt: instant(row.checkedAt, 'checkedAt'), catalogVersion: text(row.catalogVersion, 'catalogVersion', 100),
  };
}

export function unavailableEntitlements(): EntitlementsResponse {
  return { data: { status: 'unavailable', checkedAt: null, catalogVersion: null, entitlements: null }, meta: { nextCursor: null } };
}

export function validateEntitlementsResponse(value: unknown): EntitlementsResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('response must be an object');
  const response = value as Record<string, unknown>; const data = response.data; const meta = response.meta;
  if (!data || typeof data !== 'object' || Array.isArray(data) || !meta || typeof meta !== 'object' || Array.isArray(meta)) invalid('response envelope is invalid');
  const body = data as Record<string, unknown>; const page = meta as Record<string, unknown>;
  if (body.status === 'unavailable') {
    if (body.checkedAt !== null || body.catalogVersion !== null || body.entitlements !== null || page.nextCursor !== null) invalid('unavailable response must not claim entitlements');
    return unavailableEntitlements();
  }
  if (body.status !== 'current' || !Array.isArray(body.entitlements) || !isPlainJsonValueForBoundary(body.entitlements) || body.entitlements.length > 100 || (page.nextCursor !== null && typeof page.nextCursor !== 'string')) invalid('current response is invalid');
  return { data: { status: 'current', checkedAt: instant(body.checkedAt, 'checkedAt'), catalogVersion: text(body.catalogVersion, 'catalogVersion', 100), entitlements: body.entitlements.map(entitlement) }, meta: { nextCursor: page.nextCursor as string | null } };
}
