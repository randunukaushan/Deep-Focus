/** Local composition candidate for verified-owner snapshot read handlers. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSnapshotMetadataReader } from './postgres-snapshot-metadata-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSnapshotPageReader } from './postgres-snapshot-page-adapter.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function notFound(): never { throw new SafeBoundaryError(404, 'NOT_FOUND'); }

export function createPostgresSnapshotReadHandlers(input: { runner: PostgresTransactionRunner }) {
  const metadataReader = createPostgresSnapshotMetadataReader(input);
  const pageReader = createPostgresSnapshotPageReader(input);
  return {
    readMetadata: async (request: { actorId: string; sessionId: string; snapshotId: string; now: string }) => {
      if (!UUID.test(request.actorId) || !UUID.test(request.sessionId) || !UUID.test(request.snapshotId) || !Number.isFinite(Date.parse(request.now))) invalid();
      const snapshot = await metadataReader.read({ ownerId: request.actorId, sessionId: request.sessionId, snapshotId: request.snapshotId, now: request.now });
      if (!snapshot) notFound();
      return { status: 200 as const, body: { data: { snapshot } } };
    },
    readPage: async (request: { actorId: string; sessionId: string; snapshotId: string; pageIndex: number; now: string }) => {
      if (!UUID.test(request.actorId) || !UUID.test(request.sessionId) || !UUID.test(request.snapshotId) || !Number.isInteger(request.pageIndex)
        || request.pageIndex < 0 || !Number.isFinite(Date.parse(request.now))) invalid();
      const page = await pageReader.readPage({ ownerId: request.actorId, sessionId: request.sessionId, snapshotId: request.snapshotId, pageIndex: request.pageIndex, now: request.now });
      if (!page) notFound();
      return { status: 200 as const, body: { data: { page } } };
    },
  };
}
