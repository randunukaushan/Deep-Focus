/**
 * Local composition boundary for one coherent owner snapshot.
 *
 * The source reader and page stager intentionally receive the same PostgreSQL
 * client. This prevents a materializer from combining rows read from separate
 * live transactions. Job claiming/retry policy remains a separate boundary.
 */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { materializeSnapshot } from './snapshot-materializer.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createSnapshotPageCursorFactory } from './snapshot-page-cursor-factory.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { stageSnapshotPages, type SnapshotStagingResult } from './postgres-snapshot-staging-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
import type { SnapshotEntity } from '../../../src/features/sync/snapshot-mirror.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function validRunner(value: unknown): value is PostgresTransactionRunner {
  return isRecord(value) && typeof value.withTransaction === 'function';
}

export type ConsistentSnapshotBuildInput = {
  ownerId: string;
  sessionId: string;
  snapshotId: string;
  createdAt: string;
  expiresAt: string;
  cursorSecret: string;
  readSource: (client: PostgresTransactionClient, ownerId: string) => Promise<{ highWater: string; records: SnapshotEntity[] }>;
  digestPage: (input: { snapshotId: string; pageIndex: number; highWater: string; data: SnapshotEntity[] }) => Promise<string>;
  digestManifest: (records: SnapshotEntity[]) => Promise<string>;
};

function validateInput(input: ConsistentSnapshotBuildInput): void {
  if (!isUuid(input.ownerId) || !isUuid(input.sessionId) || !isUuid(input.snapshotId)
    || typeof input.createdAt !== 'string' || typeof input.expiresAt !== 'string'
    || !Number.isFinite(Date.parse(input.createdAt)) || !Number.isFinite(Date.parse(input.expiresAt))
    || Date.parse(input.expiresAt) <= Date.parse(input.createdAt) || typeof input.cursorSecret !== 'string' || input.cursorSecret.length < 32
    || typeof input.readSource !== 'function' || typeof input.digestPage !== 'function' || typeof input.digestManifest !== 'function') invalid();
}

export function createPostgresConsistentSnapshotBuilder(input: { runner: PostgresTransactionRunner }) {
  if (!isRecord(input) || !validRunner(input.runner)) invalid();
  return {
    build: async (request: ConsistentSnapshotBuildInput): Promise<SnapshotStagingResult> => {
      validateInput(request);
      return input.runner.withTransaction(async (client) => {
        // Must be the first statement in the transaction before any source row read.
        await client.query('set transaction isolation level repeatable read', []);
        await recheckPostgresAppSession(client, request.ownerId, request.sessionId);
        const source = await request.readSource(client, request.ownerId);
        if (!source || typeof source.highWater !== 'string' || !DECIMAL.test(source.highWater) || !Array.isArray(source.records)) unavailable();
        const nextCursor = createSnapshotPageCursorFactory({ ownerId: request.ownerId, snapshotId: request.snapshotId, expiresAt: request.expiresAt, secret: request.cursorSecret });
        const materialized = await materializeSnapshot({
          snapshotId: request.snapshotId,
          highWater: source.highWater,
          records: source.records,
          digestPage: request.digestPage,
          digestManifest: request.digestManifest,
          nextCursor,
        });
        return stageSnapshotPages(client, {
          ownerId: request.ownerId,
          sessionId: request.sessionId,
          snapshotId: request.snapshotId,
          contractVersion: 1,
          highWater: source.highWater,
          createdAt: request.createdAt,
          expiresAt: request.expiresAt,
          pageCount: materialized.pageCount,
          manifestDigest: materialized.manifestDigest,
          pages: materialized.pages,
        });
      });
    },
  };
}
