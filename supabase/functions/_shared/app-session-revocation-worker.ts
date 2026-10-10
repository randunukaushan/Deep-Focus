/** Server-only revocation outbox claim/fencing contract. Provider I/O stays outside DB transactions. */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ERROR_CODE = /^[A-Z][A-Z0-9_]{0,79}$/;

export type RevocationOutboxItem = {
  revocationId: string;
  ownerId: string;
  sessionId: string;
  state: 'pending' | 'processing' | 'succeeded' | 'failed';
  leaseId: string | null;
  leaseUntil: string | null;
};

export type RevocationWorkerStore = {
  claimDue: (input: { workerId: string; leaseId: string; now: string; leaseUntil: string }) => Promise<RevocationOutboxItem | null>;
  markSucceeded: (input: { revocationId: string; leaseId: string }) => Promise<boolean>;
  markFailed: (input: { revocationId: string; leaseId: string; errorCode: string; nextAttemptAt: string }) => Promise<boolean>;
};

function validTime(value: string): boolean { return Number.isFinite(Date.parse(value)); }
function validateClaim(input: { workerId: string; leaseId: string; now: string; leaseUntil: string }): void {
  if (!UUID.test(input.workerId) || !UUID.test(input.leaseId) || !validTime(input.now) || !validTime(input.leaseUntil) || Date.parse(input.leaseUntil) <= Date.parse(input.now)) throw new Error('REVOCATION_LEASE_INVALID');
}

function validateClaimedItem(item: RevocationOutboxItem, input: { leaseId: string; now: string; leaseUntil: string }): void {
  if (!UUID.test(item.revocationId) || !UUID.test(item.ownerId) || !UUID.test(item.sessionId)
    || item.state !== 'processing' || item.leaseId !== input.leaseId || typeof item.leaseUntil !== 'string'
    || !validTime(item.leaseUntil) || Date.parse(item.leaseUntil) !== Date.parse(input.leaseUntil)
    || Date.parse(item.leaseUntil) <= Date.parse(input.now)) throw new Error('REVOCATION_CLAIM_INVALID');
}

export async function claimRevocationOutbox(input: {
  workerId: string;
  leaseId: string;
  now: string;
  leaseUntil: string;
  store: RevocationWorkerStore;
}): Promise<RevocationOutboxItem | null> {
  validateClaim(input);
  const item = await input.store.claimDue({ workerId: input.workerId, leaseId: input.leaseId, now: input.now, leaseUntil: input.leaseUntil });
  if (item) validateClaimedItem(item, input);
  return item;
}

export async function completeRevocationOutbox(input: { revocationId: string; leaseId: string; store: RevocationWorkerStore }): Promise<boolean> {
  if (!UUID.test(input.revocationId) || !UUID.test(input.leaseId)) throw new Error('REVOCATION_LEASE_INVALID');
  return input.store.markSucceeded({ revocationId: input.revocationId, leaseId: input.leaseId });
}

export async function failRevocationOutbox(input: { revocationId: string; leaseId: string; errorCode: string; nextAttemptAt: string; store: RevocationWorkerStore }): Promise<boolean> {
  if (!UUID.test(input.revocationId) || !UUID.test(input.leaseId) || !ERROR_CODE.test(input.errorCode) || !validTime(input.nextAttemptAt)) throw new Error('REVOCATION_FAILURE_INVALID');
  return input.store.markFailed({ revocationId: input.revocationId, leaseId: input.leaseId, errorCode: input.errorCode, nextAttemptAt: input.nextAttemptAt });
}
