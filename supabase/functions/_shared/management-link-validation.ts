/** EX-30 management-link boundary; provider selection and live execution remain pending. */

const PROVIDERS = new Set(['apple_app_store', 'google_play', 'web_provider', 'organization', 'promotion']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ManagementLinkRequest = { licenseId: string };
export type ManagementLink = {
  licenseId: string;
  providerSource: string;
  url: string;
  expiresAt: string;
};

function invalid(message: string): never { throw new RangeError(`INVALID_MANAGEMENT_LINK: ${message}`); }
function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max || !/\S/.test(value)) invalid(`${field} is invalid`);
  return value;
}
function instant(value: unknown, field: string): string {
  const result = text(value, field, 100);
  if (!Number.isFinite(Date.parse(result))) invalid(`${field} must be a valid instant`);
  return result;
}
function licenseId(value: unknown): string {
  const result = text(value, 'licenseId', 60);
  if (!UUID.test(result)) invalid('licenseId must be a UUID');
  return result;
}

export function validateManagementLinkRequest(value: unknown): ManagementLinkRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('request must be an object');
  const request = value as Record<string, unknown>;
  if (Object.keys(request).length !== 1 || !Object.prototype.hasOwnProperty.call(request, 'licenseId')) invalid('request contains unsupported fields');
  return { licenseId: licenseId(request.licenseId) };
}

function normalizedAllowlist(allowedOrigins: readonly string[]): URL[] {
  if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0 || allowedOrigins.length > 20) invalid('provider allowlist is invalid');
  return allowedOrigins.map((value) => {
    let url: URL;
    try { url = new URL(value); } catch { invalid('provider allowlist contains an invalid URL'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) invalid('provider allowlist must contain HTTPS origins without credentials or ports');
    return url;
  });
}

export function validateManagementDestination(value: unknown, allowedOrigins: readonly string[]): string {
  const allowlist = normalizedAllowlist(allowedOrigins);
  const destination = text(value, 'url', 2000);
  let url: URL;
  try { url = new URL(destination); } catch { invalid('url must be an absolute URL'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) invalid('url has unsafe scheme, authority, port or fragment');
  if (!allowlist.some((origin) => url.origin === origin.origin)) invalid('url is outside the provider allowlist');
  return url.toString();
}

export function validateManagementLink(value: unknown, allowedOrigins: readonly string[]): ManagementLink {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('link must be an object');
  const link = value as Record<string, unknown>;
  const keys = Object.keys(link).sort();
  if (keys.join(',') !== 'expiresAt,licenseId,providerSource,url') invalid('link contains unsupported fields');
  const providerSource = text(link.providerSource, 'providerSource', 40);
  if (!PROVIDERS.has(providerSource)) invalid('providerSource is unsupported');
  return {
    licenseId: licenseId(link.licenseId),
    providerSource,
    url: validateManagementDestination(link.url, allowedOrigins),
    expiresAt: instant(link.expiresAt, 'expiresAt'),
  };
}

export function validateNoRedirectChain(value: unknown): void {
  if (value !== undefined && (!Array.isArray(value) || value.length !== 0)) invalid('redirect chains are not accepted');
}
