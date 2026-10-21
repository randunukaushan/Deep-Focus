/** EX-25 deletion confirmation request validation; transaction/auth logic stays server-side. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type DeletionConfirmationRequest = { challengeId: string; acknowledgedConsequencesVersion: string };

function invalid(message: string): never { throw new RangeError(`INVALID_DELETION_CONFIRMATION: ${message}`); }
function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max || !/\S/.test(value)) invalid(`${field} is invalid`);
  return value;
}

export function validateDeletionConfirmationRequest(value: unknown): DeletionConfirmationRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('request must be an object');
  const request = value as Record<string, unknown>;
  if (Object.keys(request).sort().join(',') !== 'acknowledgedConsequencesVersion,challengeId') invalid('request contains unsupported fields');
  const challengeId = text(request.challengeId, 'challengeId', 60);
  if (!UUID.test(challengeId)) invalid('challengeId must be a UUID');
  return { challengeId, acknowledgedConsequencesVersion: text(request.acknowledgedConsequencesVersion, 'acknowledgedConsequencesVersion', 64) };
}
