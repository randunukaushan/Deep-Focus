/** Composes the owner/session-bound source reader with the consistent builder. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { SnapshotMaterializer } from './sync-snapshot-runner.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresConsistentSnapshotBuilder } from './postgres-consistent-snapshot-builder.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSyncSnapshotSourceReader } from './postgres-sync-snapshot-source-reader.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validRunner(value: unknown): value is PostgresTransactionRunner {
  return isRecord(value) && typeof value.withTransaction === 'function';
}

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

/**
 * The scheduler supplies the session binding and immutable build window. The
 * worker job still supplies owner/job/snapshot identity, so a stale or forged
 * materializer call cannot replace those identities.
 */
export function createPostgresSyncSnapshotMaterializer(input: {
  runner: PostgresTransactionRunner;
  sessionId: string;
  createdAt: string;
  expiresAt: string;
  cursorSecret: string;
  digestPage: Parameters<ReturnType<typeof createPostgresConsistentSnapshotBuilder>['build']>[0]['digestPage'];
  digestManifest: Parameters<ReturnType<typeof createPostgresConsistentSnapshotBuilder>['build']>[0]['digestManifest'];
}): SnapshotMaterializer {
  if (!isRecord(input) || !validRunner(input.runner) || !isUuid(input.sessionId) || typeof input.createdAt !== 'string' || typeof input.expiresAt !== 'string'
    || !Number.isFinite(Date.parse(input.createdAt)) || !Number.isFinite(Date.parse(input.expiresAt))
    || Date.parse(input.expiresAt) <= Date.parse(input.createdAt) || typeof input.cursorSecret !== 'string' || input.cursorSecret.length < 32
    || typeof input.digestPage !== 'function' || typeof input.digestManifest !== 'function') invalid();
  const builder = createPostgresConsistentSnapshotBuilder({ runner: input.runner });
  const sourceReader = createPostgresSyncSnapshotSourceReader();
  return async ({ ownerId, jobId, snapshotId }) => {
    if (!isUuid(ownerId) || !isUuid(jobId) || !isUuid(snapshotId)) invalid();
    await builder.build({
      ownerId,
      sessionId: input.sessionId,
      snapshotId,
      createdAt: input.createdAt,
      expiresAt: input.expiresAt,
      cursorSecret: input.cursorSecret,
      readSource: sourceReader.read,
      digestPage: input.digestPage,
      digestManifest: input.digestManifest,
    });
  };
}
