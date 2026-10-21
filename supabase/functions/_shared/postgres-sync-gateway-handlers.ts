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
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function validRunner(value: unknown): value is PostgresTransactionRunner {
  return isRecord(value) && typeof value.withTransaction === 'function';
}

type InstantSource = string | (() => string);

function validInstantSource(value: unknown): value is InstantSource {
  return (typeof value === 'string' && Number.isFinite(Date.parse(value))) || typeof value === 'function';
}

function readInstant(value: InstantSource): string {
  const instant = typeof value === 'function' ? value() : value;
  if (typeof instant !== 'string' || !Number.isFinite(Date.parse(instant))) invalid();
  return instant;
}

export function createPostgresSyncGatewayHandlers(input: { runner: PostgresTransactionRunner; cursorSecret: string; now: InstantSource; expiresAt: InstantSource }) {
  if (!isRecord(input) || !validRunner(input.runner) || typeof input.cursorSecret !== 'string' || input.cursorSecret.length < 32
    || !validInstantSource(input.now) || !validInstantSource(input.expiresAt)
    || (typeof input.now === 'string' && typeof input.expiresAt === 'string' && Date.parse(input.expiresAt) <= Date.parse(input.now))) invalid();
  return {
    pull: async (request: { actorId: string; sessionId: string; cursor: string | null; limit: number }) => {
      if (!isRecord(request) || !isUuid(request.actorId) || !isUuid(request.sessionId)) invalid();
      // Edge isolates can live longer than a cursor TTL. Resolve both clocks at
      // request time rather than retaining the values from handler creation.
      const now = readInstant(input.now);
      const expiresAt = readInstant(input.expiresAt);
      if (Date.parse(expiresAt) <= Date.parse(now)) invalid();
      return readAuthorizedSyncPage({ actorId: request.actorId, cursor: request.cursor, limit: request.limit, secret: input.cursorSecret, now, expiresAt, store: createPostgresSyncPullStore({ runner: input.runner, sessionId: request.sessionId }) });
    },
    commit: async (request: { actorId: string; sessionId: string; cursorLastSequence: string; nextCursor: string; changes: ServerSyncChange[] }) => {
      if (!isRecord(request) || !isUuid(request.actorId) || !isUuid(request.sessionId)) invalid();
      return commitAuthorizedSyncPage({ actorId: request.actorId, cursorOwnerId: request.actorId, cursorLastSequence: request.cursorLastSequence, nextCursor: request.nextCursor, changes: request.changes, store: createPostgresSyncTransactionStore({ runner: input.runner, sessionId: request.sessionId }) });
    },
  };
}
