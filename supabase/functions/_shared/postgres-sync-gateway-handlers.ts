/** Local composition candidate for verified-owner sync pull and page commit handlers. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { readAuthorizedSyncPage } from './sync-pull.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { commitAuthorizedSyncPage, type ServerSyncChange } from './sync-transaction.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSyncPullStore } from './postgres-sync-pull-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresSyncTransactionStore } from './postgres-sync-transaction-adapter.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

export function createPostgresSyncGatewayHandlers(input: { runner: PostgresTransactionRunner; cursorSecret: string; now: string; expiresAt: string }) {
  return {
    pull: async (request: { actorId: string; sessionId: string; cursor: string | null; limit: number }) => {
      if (!UUID.test(request.actorId) || !UUID.test(request.sessionId)) invalid();
      return readAuthorizedSyncPage({ actorId: request.actorId, cursor: request.cursor, limit: request.limit, secret: input.cursorSecret, now: input.now, expiresAt: input.expiresAt, store: createPostgresSyncPullStore({ runner: input.runner, sessionId: request.sessionId }) });
    },
    commit: async (request: { actorId: string; sessionId: string; cursorLastSequence: string; nextCursor: string; changes: ServerSyncChange[] }) => {
      if (!UUID.test(request.actorId) || !UUID.test(request.sessionId)) invalid();
      return commitAuthorizedSyncPage({ actorId: request.actorId, cursorOwnerId: request.actorId, cursorLastSequence: request.cursorLastSequence, nextCursor: request.nextCursor, changes: request.changes, store: createPostgresSyncTransactionStore({ runner: input.runner, sessionId: request.sessionId }) });
    },
  };
}
