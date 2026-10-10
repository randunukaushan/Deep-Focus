/** Local composition candidate for materializing and atomically staging a snapshot. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { materializeSnapshot } from './snapshot-materializer.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createSnapshotPageCursorFactory } from './snapshot-page-cursor-factory.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSnapshotStager } from './postgres-snapshot-staging-adapter.ts';
import type { SnapshotEntity } from '../../../src/features/sync/snapshot-mirror.ts';
import type { SnapshotStagingResult } from './postgres-snapshot-staging-adapter.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

export type PostgresSnapshotBuildInput = {
  ownerId: string;
  sessionId: string;
  snapshotId: string;
  highWater: string;
  records: SnapshotEntity[];
  contractVersion: 1;
  createdAt: string;
  expiresAt: string;
  secret: string;
  digestPage: (input: { snapshotId: string; pageIndex: number; highWater: string; data: SnapshotEntity[] }) => Promise<string>;
  digestManifest: (records: SnapshotEntity[]) => Promise<string>;
};

export function createPostgresSnapshotBuilder(input: { runner: PostgresTransactionRunner }) {
  const stager = createPostgresSnapshotStager(input);
  return {
    build: async (value: PostgresSnapshotBuildInput): Promise<SnapshotStagingResult> => {
      const nextCursor = createSnapshotPageCursorFactory({
        ownerId: value.ownerId,
        snapshotId: value.snapshotId,
        expiresAt: value.expiresAt,
        secret: value.secret,
      });
      const materialized = await materializeSnapshot({
        snapshotId: value.snapshotId,
        highWater: value.highWater,
        records: value.records,
        digestPage: value.digestPage,
        digestManifest: value.digestManifest,
        nextCursor,
      });
      return stager.stage({
        ownerId: value.ownerId,
        sessionId: value.sessionId,
        snapshotId: value.snapshotId,
        contractVersion: value.contractVersion,
        highWater: value.highWater,
        createdAt: value.createdAt,
        expiresAt: value.expiresAt,
        pageCount: materialized.pageCount,
        manifestDigest: materialized.manifestDigest,
        pages: materialized.pages,
      });
    },
  };
}
