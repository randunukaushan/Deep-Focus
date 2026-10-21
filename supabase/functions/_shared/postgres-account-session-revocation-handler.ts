/** Local PostgreSQL candidate for the already-admitted EX-27 route. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { revokeAccountSessionsTransactionally } from './app-session-revocation-plan.ts';
import type { SessionRevocationScope } from './app-session-revocation-plan.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAccountSessionRevocationStore } from './postgres-app-session-adapter.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

function scopeFromBody(body: Record<string, unknown>): SessionRevocationScope {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid();
  const keys = Object.keys(body).sort();
  if (body.scope === 'one' && keys.length === 2 && keys[0] === 'scope' && keys[1] === 'sessionId'
    && isUuid(body.sessionId)) return { scope: 'one', sessionId: body.sessionId };
  if ((body.scope === 'others' || body.scope === 'all') && keys.length === 1 && keys[0] === 'scope') {
    return { scope: body.scope };
  }
  invalid();
}

export function createPostgresAccountSessionRevocationHandler(input: {
  runner: PostgresTransactionRunner;
  now: () => string;
  createRevocationId?: () => string;
}) {
  if (!isRecord(input) || !isRecord(input.runner) || typeof input.runner.withTransaction !== 'function'
    || typeof input.now !== 'function' || (input.createRevocationId !== undefined && typeof input.createRevocationId !== 'function')) invalid();
  return async (request: {
    actorId: string;
    currentSessionId: string;
    requestId: string;
    body: Record<string, unknown>;
    requestSha256: string;
  }) => {
    if (!isRecord(request) || !isUuid(request.actorId) || !isUuid(request.currentSessionId) || !isUuid(request.requestId)
      || typeof request.requestSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(request.requestSha256)) invalid();
    const scope = scopeFromBody(request.body);
    const now = requestNow(input.now);
    return input.runner.withTransaction(async (client) => {
      const result = await revokeAccountSessionsTransactionally({
        verifiedOwnerId: request.actorId,
        currentSessionId: request.currentSessionId,
        scope,
        now,
        // The gateway performs the configured recent-auth check before this
        // already-admitted server callback is invoked.
        recentAuthVerified: true,
        mutationId: request.requestId,
        requestSha256: request.requestSha256,
        revocationIdFor: () => input.createRevocationId?.() ?? crypto.randomUUID(),
        store: createPostgresAccountSessionRevocationStore({ runner: { withTransaction: async (run) => run(client) } }),
      });
      return {
        responseStatus: 200 as const,
        responseBody: {
          data: {
            revokedCount: result.sessionIds.length,
            currentSessionRevoked: result.currentSessionRevoked,
            providerRevocationStatus: result.providerRevocationStatus,
          },
        },
      };
    });
  };
}

function requestNow(now: () => string): string {
  const value = now();
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) invalid();
  return value;
}
