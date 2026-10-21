/** Server-only orchestration boundary for one bounded sync-snapshot job run. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { SyncSnapshotWorkerJob } from './sync-snapshot-worker.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR = /^[A-Z][A-Z0-9_]{0,79}$/;

export type SyncSnapshotWorkerStore = {
  claim: (input: { ownerId: string; jobId: string; workerId: string; now: string; leaseExpiresAt: string; maxAttempts: number }) => Promise<SyncSnapshotWorkerJob | null>;
  complete: (input: { ownerId: string; jobId: string; workerId: string; now: string }) => Promise<SyncSnapshotWorkerJob>;
  fail: (input: { ownerId: string; jobId: string; workerId: string; now: string; retryAt: string; safeErrorCode: string; maxAttempts: number }) => Promise<SyncSnapshotWorkerJob>;
};

export type SnapshotMaterializer = (input: { ownerId: string; jobId: string; snapshotId: string }) => Promise<void>;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function validate(input: { ownerId: string; jobId: string; workerId: string; now: string; leaseExpiresAt: string; maxAttempts: number; retryBaseDelayMs: number; retryMaxDelayMs: number }): void {
  if (![input.ownerId, input.jobId, input.workerId].every((value) => UUID.test(value))
    || !Number.isFinite(Date.parse(input.now)) || !Number.isFinite(Date.parse(input.leaseExpiresAt))
    || Date.parse(input.leaseExpiresAt) <= Date.parse(input.now)
    || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1
    || !Number.isSafeInteger(input.retryBaseDelayMs) || input.retryBaseDelayMs < 1000
    || !Number.isSafeInteger(input.retryMaxDelayMs) || input.retryMaxDelayMs < input.retryBaseDelayMs) invalid();
}

function safeError(error: unknown): string {
  const code = error && typeof error === 'object' && typeof (error as { code?: unknown }).code === 'string' ? (error as { code: string }).code : 'DEPENDENCY_UNAVAILABLE';
  return SAFE_ERROR.test(code) ? code : 'DEPENDENCY_UNAVAILABLE';
}

function retryAt(now: string, attemptCount: number, base: number, max: number): string {
  const delay = Math.min(max, base * (2 ** Math.min(attemptCount, 31)));
  return new Date(Date.parse(now) + delay).toISOString();
}

/** Claims once, invokes only the injected materializer, then fences the result. */
export async function runSyncSnapshotJob(input: {
  ownerId: string;
  jobId: string;
  workerId: string;
  now: string;
  leaseExpiresAt: string;
  maxAttempts: number;
  retryBaseDelayMs?: number;
  retryMaxDelayMs?: number;
  store: SyncSnapshotWorkerStore;
  materialize: SnapshotMaterializer;
}): Promise<SyncSnapshotWorkerJob | null> {
  const retryBaseDelayMs = input.retryBaseDelayMs ?? 30_000;
  const retryMaxDelayMs = input.retryMaxDelayMs ?? 3_600_000;
  validate({ ...input, retryBaseDelayMs, retryMaxDelayMs });
  if (typeof input.materialize !== 'function') invalid();
  const claimed = await input.store.claim({ ownerId: input.ownerId, jobId: input.jobId, workerId: input.workerId, now: input.now, leaseExpiresAt: input.leaseExpiresAt, maxAttempts: input.maxAttempts });
  if (!claimed) return null;
  try {
    if (claimed.ownerId !== input.ownerId || claimed.jobId !== input.jobId) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    await input.materialize({ ownerId: claimed.ownerId, jobId: claimed.jobId, snapshotId: claimed.snapshotId });
    return await input.store.complete({ ownerId: input.ownerId, jobId: input.jobId, workerId: input.workerId, now: input.now });
  } catch (error) {
    const code = safeError(error);
    return input.store.fail({ ownerId: input.ownerId, jobId: input.jobId, workerId: input.workerId, now: input.now, retryAt: retryAt(input.now, claimed.attemptCount, retryBaseDelayMs, retryMaxDelayMs), safeErrorCode: code, maxAttempts: input.maxAttempts });
  }
}
