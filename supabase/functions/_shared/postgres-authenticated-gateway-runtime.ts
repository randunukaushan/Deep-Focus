/** Local composition boundary for an authenticated PostgreSQL gateway runtime. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { handleAuthenticatedGatewayRequest, type GatewayResponse } from './gateway-entrypoint.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createSupabaseProviderSessionVerifier, type SupabaseClaimsClient } from './supabase-provider-session-verifier.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAppSessionStore } from './postgres-app-session-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresGatewayAuthorizationStore } from './postgres-gateway-authorization-adapter.ts';
import type { GatewayAuthorizationStore } from './gateway-authorization.ts';
import type { GatewayHandler } from './gateway-execution.ts';
import type { GatewayOperation } from './gateway-router.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { RateLimitCounter } from './gateway-rate-limit.ts';

function invalidRuntime(): never { throw new Error('GATEWAY_RUNTIME_INVALID'); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function positiveInteger(value: unknown): value is number { return Number.isSafeInteger(value) && (value as number) > 0; }

type RuntimeRequest = {
  method: string;
  path: string;
  headers: Record<string, string | undefined>;
  bodyText?: string;
};

type RuntimeInput = {
  providerClient: SupabaseClaimsClient;
  expectedIssuer: string;
  expectedAudience: string;
  runner: PostgresTransactionRunner;
  handlers: Partial<Record<GatewayOperation, GatewayHandler>>;
  rateLimit: { counter: RateLimitCounter; windowMs: number; limit: number };
  ownerStore?: GatewayAuthorizationStore;
  now?: () => string;
  nowMs?: () => number;
};

export type AuthenticatedGatewayRuntime = {
  handle: (request: RuntimeRequest) => Promise<GatewayResponse>;
};

/**
 * Wires only explicit server dependencies. It creates no database connection,
 * reads no secret and does not expose a service credential to the caller.
 * Session issuance/bootstrap remains a separate authenticated-account flow.
 */
export function createPostgresAuthenticatedGatewayRuntime(input: RuntimeInput): AuthenticatedGatewayRuntime {
  if (!isRecord(input) || typeof input.expectedIssuer !== 'string' || input.expectedIssuer.length === 0
    || typeof input.expectedAudience !== 'string' || input.expectedAudience.length === 0
    || !isRecord(input.providerClient) || !isRecord(input.providerClient.auth)
    || typeof input.providerClient.auth.getClaims !== 'function'
    || !isRecord(input.runner) || typeof input.runner.withTransaction !== 'function'
    || !isRecord(input.handlers) || !isRecord(input.rateLimit)
    || !isRecord(input.rateLimit.counter) || typeof input.rateLimit.counter.consume !== 'function'
    || !positiveInteger(input.rateLimit.windowMs) || !positiveInteger(input.rateLimit.limit)
    || (input.ownerStore !== undefined && (!isRecord(input.ownerStore) || typeof input.ownerStore.loadOwnerId !== 'function'))
    || (input.now !== undefined && typeof input.now !== 'function')
    || (input.nowMs !== undefined && typeof input.nowMs !== 'function')) invalidRuntime();
  const verifyProviderToken = createSupabaseProviderSessionVerifier(input.providerClient);
  const sessionStore = createPostgresAppSessionStore({ runner: input.runner });
  const ownerStore = input.ownerStore ?? createPostgresGatewayAuthorizationStore({ runner: input.runner });
  const now = input.now ?? (() => new Date().toISOString());
  const nowMs = input.nowMs ?? (() => Date.now());
  return {
    handle: (request) => handleAuthenticatedGatewayRequest({
      ...request,
      verifyProviderToken,
      expectedIssuer: input.expectedIssuer,
      expectedAudience: input.expectedAudience,
      now: now(),
      loadSession: (ownerId, sessionId) => sessionStore.withTransaction((store) => store.loadSession(ownerId, sessionId)),
      ownerStore,
      handlers: input.handlers,
      rateLimit: { counter: input.rateLimit.counter, windowMs: input.rateLimit.windowMs, limit: input.rateLimit.limit, nowMs: nowMs() },
    }),
  };
}
