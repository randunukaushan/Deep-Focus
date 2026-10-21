/** EX-24 deletion-challenge response validation; it does not create credentials or freeze accounts. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SECRET = /^[A-Za-z0-9_-]{43,256}$/;

export type DeletionChallengeResponse = {
  data: {
    challengeId: string;
    jobId: string;
    consequencesVersion: string;
    expiresAt: string;
    statusReceipt: { credential: string; expiresAt: string };
  };
};

function invalid(message: string): never { throw new RangeError(`INVALID_DELETION_CHALLENGE: ${message}`); }
function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max || !/\S/.test(value)) invalid(`${field} is invalid`);
  return value;
}
function id(value: unknown, field: string): string {
  const result = text(value, field, 60);
  if (!UUID.test(result)) invalid(`${field} must be a UUID`);
  return result;
}
function instant(value: unknown, field: string): string {
  const result = text(value, field, 100);
  if (!Number.isFinite(Date.parse(result))) invalid(`${field} must be a valid instant`);
  return result;
}

export function validateEmptyDeletionChallengeRequest(value: unknown): Record<string, never> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 0) invalid('challenge request must be empty');
  return {};
}

export function validateDeletionChallengeResponse(value: unknown, now: string): DeletionChallengeResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('response must be an object');
  const response = value as Record<string, unknown>;
  if (Object.keys(response).length !== 1 || !response.data || typeof response.data !== 'object' || Array.isArray(response.data)) invalid('response envelope is invalid');
  const data = response.data as Record<string, unknown>;
  if (Object.keys(data).sort().join(',') !== 'challengeId,consequencesVersion,expiresAt,jobId,statusReceipt') invalid('response data contains unsupported fields');
  if (!Number.isFinite(Date.parse(now))) invalid('now must be a valid instant');
  const expiresAt = instant(data.expiresAt, 'expiresAt');
  if (Date.parse(expiresAt) <= Date.parse(now)) invalid('challenge is expired');
  if (!data.statusReceipt || typeof data.statusReceipt !== 'object' || Array.isArray(data.statusReceipt)) invalid('statusReceipt is invalid');
  const receipt = data.statusReceipt as Record<string, unknown>;
  if (Object.keys(receipt).sort().join(',') !== 'credential,expiresAt') invalid('statusReceipt contains unsupported fields');
  const credential = text(receipt.credential, 'credential', 256);
  if (!SECRET.test(credential)) invalid('credential must be a bounded server secret');
  const receiptExpiresAt = instant(receipt.expiresAt, 'statusReceipt.expiresAt');
  if (Date.parse(receiptExpiresAt) <= Date.parse(now) || Date.parse(receiptExpiresAt) > Date.parse(expiresAt)) invalid('status receipt expiry is unsafe');
  return { data: { challengeId: id(data.challengeId, 'challengeId'), jobId: id(data.jobId, 'jobId'), consequencesVersion: text(data.consequencesVersion, 'consequencesVersion', 64), expiresAt, statusReceipt: { credential, expiresAt: receiptExpiresAt } } };
}
