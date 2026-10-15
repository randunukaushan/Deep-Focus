/** EX-23 export download-grant validation; authorization and storage remain server-side. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ExportDownloadResponse = { data: { jobId: string; url: string; expiresAt: string } };

function invalid(message: string): never { throw new RangeError(`INVALID_EXPORT_DOWNLOAD: ${message}`); }
function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max || !/\S/.test(value)) invalid(`${field} is invalid`);
  return value;
}
function id(value: unknown): string {
  const result = text(value, 'jobId', 60);
  if (!UUID.test(result)) invalid('jobId must be a UUID');
  return result;
}
function instant(value: unknown): string {
  const result = text(value, 'expiresAt', 100);
  if (!Number.isFinite(Date.parse(result))) invalid('expiresAt must be a valid instant');
  return result;
}
function origins(values: readonly string[]): URL[] {
  if (!Array.isArray(values) || values.length === 0 || values.length > 20) invalid('artifact allowlist is invalid');
  return values.map((value) => {
    let url: URL;
    try { url = new URL(value); } catch { invalid('artifact allowlist contains an invalid URL'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) invalid('artifact allowlist must contain HTTPS origins');
    return url;
  });
}

export function validateEmptyDownloadRequest(value: unknown): Record<string, never> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 0) invalid('download request must be empty');
  return {};
}

export function validateExportDownloadResponse(value: unknown, allowedArtifactOrigins: readonly string[], now: string): ExportDownloadResponse {
  const allowlist = origins(allowedArtifactOrigins);
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('response must be an object');
  const response = value as Record<string, unknown>;
  if (Object.keys(response).length !== 1 || !response.data || typeof response.data !== 'object' || Array.isArray(response.data)) invalid('response envelope is invalid');
  const data = response.data as Record<string, unknown>;
  if (Object.keys(data).sort().join(',') !== 'expiresAt,jobId,url') invalid('response data contains unsupported fields');
  const urlText = text(data.url, 'url', 4096);
  let url: URL;
  try { url = new URL(urlText); } catch { invalid('url must be absolute'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) invalid('url has unsafe scheme, authority, port or fragment');
  if (!allowlist.some((origin) => origin.origin === url.origin)) invalid('url is outside the artifact allowlist');
  const expiresAt = instant(data.expiresAt);
  if (!Number.isFinite(Date.parse(now)) || Date.parse(expiresAt) <= Date.parse(now)) invalid('download grant must not be expired');
  return { data: { jobId: id(data.jobId), url: url.toString(), expiresAt } };
}
