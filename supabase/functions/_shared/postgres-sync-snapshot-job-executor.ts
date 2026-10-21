/** Server-only composition for one PostgreSQL sync-snapshot job attempt. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSyncSnapshotWorkerStore } from './postgres-sync-snapshot-worker-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSyncSnapshotMaterializer } from './postgres-sync-snapshot-materializer.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { runSyncSnapshotJob } from './sync-snapshot-runner.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { SyncSnapshotWorkerJob } from './sync-snapshot-worker.ts';

type DigestPage = Parameters<Parameters<typeof createPostgresSyncSnapshotMaterializer>[0]['digestPage']>[0] extends never ? never : Parameters<typeof createPostgresSyncSnapshotMaterializer>[0]['digestPage'];
type DigestManifest = Parameters<typeof createPostgresSyncSnapshotMaterializer>[0]['digestManifest'];

/**
 * This entrypoint intentionally accepts all scheduler context explicitly.
 * It cannot discover credentials, choose an account, or silently create a
 * background job. A missing claim results in no source reads.
 */
export function runPostgresSyncSnapshotJob(input: {
  runner: PostgresTransactionRunner;
  ownerId: string;
  jobId: string;
  workerId: string;
  now: string;
  leaseExpiresAt: string;
  maxAttempts: number;
  retryBaseDelayMs?: number;
  retryMaxDelayMs?: number;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  cursorSecret: string;
  digestPage: DigestPage;
  digestManifest: DigestManifest;
}): Promise<SyncSnapshotWorkerJob | null> {
  const store = createPostgresSyncSnapshotWorkerStore({ runner: input.runner });
  const materialize = createPostgresSyncSnapshotMaterializer({
    runner: input.runner,
    sessionId: input.sessionId,
    createdAt: input.createdAt,
    expiresAt: input.expiresAt,
    cursorSecret: input.cursorSecret,
    digestPage: input.digestPage,
    digestManifest: input.digestManifest,
  });
  return runSyncSnapshotJob({
    ownerId: input.ownerId,
    jobId: input.jobId,
    workerId: input.workerId,
    now: input.now,
    leaseExpiresAt: input.leaseExpiresAt,
    maxAttempts: input.maxAttempts,
    retryBaseDelayMs: input.retryBaseDelayMs,
    retryMaxDelayMs: input.retryMaxDelayMs,
    store,
    materialize,
  });
}
