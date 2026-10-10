/** Server-only bounded retry schedule for the revocation worker. */

const ERROR_CODE = /^[A-Z][A-Z0-9_]{0,79}$/;

export function nextRevocationRetry(input: {
  attemptCount: number;
  now: string;
  errorCode: string;
  baseDelayMs?: number;
  maxDelayMs?: number;
}): { nextAttemptAt: string; errorCode: string } {
  const base = input.baseDelayMs ?? 30_000;
  const max = input.maxDelayMs ?? 3_600_000;
  if (!Number.isSafeInteger(input.attemptCount) || input.attemptCount < 0 || input.attemptCount > 31
    || !Number.isSafeInteger(base) || base < 1000 || !Number.isSafeInteger(max) || max < base
    || !Number.isFinite(Date.parse(input.now)) || !ERROR_CODE.test(input.errorCode)) throw new Error('REVOCATION_RETRY_INVALID');
  const delay = Math.min(max, base * (2 ** input.attemptCount));
  return { nextAttemptAt: new Date(Date.parse(input.now) + delay).toISOString(), errorCode: input.errorCode };
}
