/** EX-21/22 privacy request and coarse job-response validation. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_]{0,79}$/;
const JOB_KINDS = new Set(['export', 'deletion']);
const JOB_STATES = new Set(['queued', 'running', 'succeeded', 'failed', 'expired']);

export type ExportRequest = { format: 'json'; scope: 'own_account_data' };
export type PrivacyJob = { id: string; kind: 'export' | 'deletion'; state: 'queued' | 'running' | 'succeeded' | 'failed' | 'expired'; updatedAt: string; safeErrorCode: string | null };
export type PrivacyJobResponse = { data: PrivacyJob };

function invalid(message: string): never { throw new RangeError(`INVALID_PRIVACY_JOB: ${message}`); }
function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max || !/\S/.test(value)) invalid(`${field} is invalid`);
  return value;
}
function id(value: unknown): string {
  const result = text(value, 'id', 60);
  if (!UUID.test(result)) invalid('id must be a UUID');
  return result;
}
function instant(value: unknown): string {
  const result = text(value, 'updatedAt', 100);
  if (!Number.isFinite(Date.parse(result))) invalid('updatedAt must be a valid instant');
  return result;
}

export function validateExportRequest(value: unknown): ExportRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('export request must be an object');
  const request = value as Record<string, unknown>;
  const keys = Object.keys(request).sort();
  if (keys.join(',') !== 'format,scope' || request.format !== 'json' || request.scope !== 'own_account_data') invalid('export request must be the exact approved scope');
  return { format: 'json', scope: 'own_account_data' };
}

export function validatePrivacyJob(value: unknown): PrivacyJob {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('job must be an object');
  const job = value as Record<string, unknown>;
  const keys = Object.keys(job).sort();
  if (keys.join(',') !== 'id,kind,safeErrorCode,state,updatedAt' && keys.join(',') !== 'id,kind,state,updatedAt') invalid('job contains unsupported fields');
  const kind = job.kind;
  const state = job.state;
  if (typeof kind !== 'string' || !JOB_KINDS.has(kind)) invalid('job kind is invalid');
  if (typeof state !== 'string' || !JOB_STATES.has(state)) invalid('job state is invalid');
  const safeErrorCode = job.safeErrorCode === undefined || job.safeErrorCode === null ? null : text(job.safeErrorCode, 'safeErrorCode', 80);
  if (safeErrorCode !== null && !SAFE_ERROR.test(safeErrorCode)) invalid('safeErrorCode is not allowlisted');
  if (state !== 'failed' && safeErrorCode !== null) invalid('non-failed jobs cannot expose an error code');
  return { id: id(job.id), kind: kind as PrivacyJob['kind'], state: state as PrivacyJob['state'], updatedAt: instant(job.updatedAt), safeErrorCode };
}

export function validatePrivacyJobResponse(value: unknown): PrivacyJobResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('response must be an object');
  const response = value as Record<string, unknown>;
  if (Object.keys(response).length !== 1 || !response.data) invalid('response envelope is invalid');
  return { data: validatePrivacyJob(response.data) };
}
