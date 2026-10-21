/** Local bounded coordinator candidate; deployment scheduling remains separate. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { runRevocationJob, type ProviderRevoker, type RevocationWorkerStore } from './app-session-revocation-runner.ts';
import type { RevocationOutboxJob } from './app-session-revocation-worker.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isTimestamp(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

/** Processes a bounded due snapshot without silently swallowing a job failure. */
export async function processDueRevocationBatch(input: {
  now: string;
  leaseUntil: string;
  maxAttempts: number;
  limit: number;
  store: RevocationWorkerStore & { listDue: (request: { now: string; limit: number }) => Promise<RevocationOutboxJob[]> };
  provider: ProviderRevoker;
  workerLeaseIdFor: (revocationId: string) => string;
}): Promise<RevocationOutboxJob[]> {
  if (!isTimestamp(input.now) || !isTimestamp(input.leaseUntil) || Date.parse(input.leaseUntil) <= Date.parse(input.now)
    || !Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1 || !Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 100) invalid();
  const jobs = await input.store.listDue({ now: input.now, limit: input.limit });
  if (!Array.isArray(jobs) || jobs.length > input.limit) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  const results: RevocationOutboxJob[] = [];
  for (const job of jobs) {
    const workerLeaseId = input.workerLeaseIdFor(job.revocationId);
    if (!isUuid(workerLeaseId)) invalid();
    const result = await runRevocationJob({ revocationId: job.revocationId, workerLeaseId, now: input.now, leaseUntil: input.leaseUntil, maxAttempts: input.maxAttempts, store: input.store, provider: input.provider });
    if (result) results.push(result);
  }
  return results;
}
