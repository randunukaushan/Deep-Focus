/** Server-only orchestration boundary for the durable provider-revocation worker. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { nextRevocationRetry } from './app-session-revocation-retry.ts';
import type { RevocationOutboxJob } from './app-session-revocation-worker.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_]{0,79}$/;

function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isTimestamp(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

export type RevocationWorkerStore = {
  claim: (input: { revocationId: string; workerLeaseId: string; now: string; leaseUntil: string; maxAttempts: number }) => Promise<RevocationOutboxJob | null>;
  complete: (input: { revocationId: string; workerLeaseId: string; now: string }) => Promise<RevocationOutboxJob>;
  fail: (input: { revocationId: string; workerLeaseId: string; now: string; retryAt: string; providerErrorCode: string; maxAttempts: number }) => Promise<RevocationOutboxJob>;
};

export type ProviderRevoker = (input: { revocationId: string; ownerId: string; sessionId: string }) => Promise<{ status: 'revoked' | 'already_revoked' }>;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

function validate(input: { revocationId: string; workerLeaseId: string; now: string; leaseUntil: string; maxAttempts: number }): void {
  if (!isUuid(input.revocationId) || !isUuid(input.workerLeaseId) || !isTimestamp(input.now)
    || !isTimestamp(input.leaseUntil) || Date.parse(input.leaseUntil) <= Date.parse(input.now)
    || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1) invalid();
}

function safeProviderError(error: unknown): string {
  const code = error && typeof error === 'object' && typeof (error as { code?: unknown }).code === 'string'
    ? (error as { code: string }).code : 'PROVIDER_UNAVAILABLE';
  return SAFE_ERROR.test(code) ? code : 'PROVIDER_UNAVAILABLE';
}

/** Claims once, calls the provider without exposing credentials, then fences completion or retry. */
export async function runRevocationJob(input: {
  revocationId: string;
  workerLeaseId: string;
  now: string;
  leaseUntil: string;
  maxAttempts: number;
  store: RevocationWorkerStore;
  provider: ProviderRevoker;
}): Promise<RevocationOutboxJob | null> {
  validate(input);
  const claimed = await input.store.claim({ revocationId: input.revocationId, workerLeaseId: input.workerLeaseId, now: input.now, leaseUntil: input.leaseUntil, maxAttempts: input.maxAttempts });
  if (!claimed) return null;
  let providerErrorCode: string | null = null;
  try {
    const result = await input.provider({ revocationId: claimed.revocationId, ownerId: claimed.ownerId, sessionId: claimed.sessionId });
    if (!result || !['revoked', 'already_revoked'].includes(result.status)) invalid();
  } catch (error) {
    providerErrorCode = safeProviderError(error);
  }
  if (providerErrorCode === null) {
    return await input.store.complete({ revocationId: claimed.revocationId, workerLeaseId: input.workerLeaseId, now: input.now });
  }
  {
    const retry = nextRevocationRetry({ attemptCount: claimed.attemptCount, now: input.now, errorCode: providerErrorCode });
    return input.store.fail({ revocationId: claimed.revocationId, workerLeaseId: input.workerLeaseId, now: input.now, retryAt: retry.nextAttemptAt, providerErrorCode: retry.errorCode, maxAttempts: input.maxAttempts });
  }
}
