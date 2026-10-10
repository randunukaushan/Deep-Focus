/** Local composition candidate for verified opaque snapshot page cursors. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { verifySnapshotPageCursor } from './snapshot-page-cursor.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSnapshotPageReader } from './postgres-snapshot-page-adapter.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function notFound(): never { throw new SafeBoundaryError(404, 'NOT_FOUND'); }

export function createPostgresSnapshotCursorHandlers(input: {
  runner: PostgresTransactionRunner;
  secret: string;
}) {
  const pageReader = createPostgresSnapshotPageReader(input);

  return {
    readPageByCursor: async (request: {
      actorId: string;
      sessionId: string;
      snapshotId: string;
      cursor: string;
      now: string;
    }) => {
      if (!UUID.test(request.actorId) || !UUID.test(request.sessionId) || !UUID.test(request.snapshotId)
        || typeof request.cursor !== 'string' || !Number.isFinite(Date.parse(request.now))) invalid();

      let verified;
      try {
        verified = await verifySnapshotPageCursor(request.cursor, input.secret, {
          ownerId: request.actorId,
          snapshotId: request.snapshotId,
          now: request.now,
        });
      } catch {
        invalid();
      }

      const page = await pageReader.readPage({
        ownerId: verified.ownerId,
        sessionId: request.sessionId,
        snapshotId: verified.snapshotId,
        pageIndex: verified.pageIndex,
        now: request.now,
      });
      if (!page) notFound();
      return { status: 200 as const, body: { data: { page } } };
    },
  };
}
