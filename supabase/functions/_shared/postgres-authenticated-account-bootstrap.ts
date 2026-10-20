/** Local provider-verified account bootstrap flow for the server boundary. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { issueAppSessionFromVerifiedClaims, validateVerifiedSessionClaims } from './auth-session-issuance.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { bootstrapAccountTransactionally, type AccountBootstrap } from './account-bootstrap.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAccountBootstrapStore } from './postgres-account-bootstrap-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createPostgresAppSessionStore } from './postgres-app-session-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { createSupabaseProviderSessionVerifier, type SupabaseClaimsClient } from './supabase-provider-session-verifier.ts';
import type { AppSessionMutation } from './app-session.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { enforceGatewayRateLimit, type RateLimitCounter } from './gateway-rate-limit.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }

export type AuthenticatedAccountBootstrapResult =
  | { ok: true; account: AccountBootstrap; session: AppSessionMutation & { ok: true } }
  | { ok: false; reason: 'invalid_input' | 'invalid_provider_session' | 'rate_limited'; retryAfterSeconds?: number };

type BootstrapRateLimit = {
  counter: RateLimitCounter;
  /** Hosted counters reference profiles and must use the bootstrap transaction. */
  counterForTransaction?: (runner: PostgresTransactionRunner) => RateLimitCounter;
  windowMs: number; limit: number; nowMs: number;
};

/**
 * Verifies the provider token first, then creates the app session and account
 * foundation under one caller-owned PostgreSQL transaction. It does not
 * create a guest account, accept a client owner ID or read a server secret.
 */
export async function bootstrapAuthenticatedAccount(input: {
  providerClient: SupabaseClaimsClient;
  accessToken: string;
  expectedIssuer: string;
  expectedAudience: string;
  now: string;
  displayName: string;
  createWorkspaceId: () => string;
  runner: PostgresTransactionRunner;
  rateLimit: BootstrapRateLimit;
}): Promise<AuthenticatedAccountBootstrapResult> {
  if (!isRecord(input) || typeof input.accessToken !== 'string' || input.accessToken.length === 0
    || typeof input.displayName !== 'string' || typeof input.createWorkspaceId !== 'function'
    || typeof input.now !== 'string' || !Number.isFinite(Date.parse(input.now))
    || !isRecord(input.runner) || typeof input.runner.withTransaction !== 'function'
    || !isRecord(input.rateLimit) || !isRecord(input.rateLimit.counter) || typeof input.rateLimit.counter.consume !== 'function'
    || (input.rateLimit.counterForTransaction !== undefined && typeof input.rateLimit.counterForTransaction !== 'function')
    || !Number.isSafeInteger(input.rateLimit.windowMs) || input.rateLimit.windowMs < 1_000 || input.rateLimit.windowMs > 86_400_000
    || !Number.isSafeInteger(input.rateLimit.limit) || input.rateLimit.limit < 1 || input.rateLimit.limit > 10_000
    || !Number.isSafeInteger(input.rateLimit.nowMs) || input.rateLimit.nowMs < 0) {
    return { ok: false, reason: 'invalid_input' };
  }
  let claims: unknown;
  try {
    claims = await createSupabaseProviderSessionVerifier(input.providerClient)(input.accessToken);
  } catch {
    return { ok: false, reason: 'invalid_provider_session' };
  }
  if (!validateVerifiedSessionClaims(claims, input.expectedIssuer, input.expectedAudience, input.now)) {
    return { ok: false, reason: 'invalid_provider_session' };
  }
  const actorId = claims.sub;
  async function checkRateLimit(counter: RateLimitCounter) {
    await enforceGatewayRateLimit({
      actorId,
      operation: 'bootstrapAccount',
      counter,
      nowMs: input.rateLimit.nowMs,
      windowMs: input.rateLimit.windowMs,
      limit: input.rateLimit.limit,
    });
  }
  try {
    if (!input.rateLimit.counterForTransaction) await checkRateLimit(input.rateLimit.counter);
  } catch (error) {
    if (error instanceof SafeBoundaryError && error.code === 'RATE_LIMITED') {
      return { ok: false, reason: 'rate_limited', retryAfterSeconds: error.retryAfterSeconds };
    }
    throw error;
  }
  let workspaceId: string;
  try { workspaceId = input.createWorkspaceId(); }
  catch { return { ok: false, reason: 'invalid_input' }; }
  if (typeof workspaceId !== 'string' || !UUID.test(workspaceId)) return { ok: false, reason: 'invalid_input' };
  const scopedRunner: PostgresTransactionRunner = input.runner;
  return scopedRunner.withTransaction(async (client) => {
    const transactionRunner: PostgresTransactionRunner = { withTransaction: (operation) => operation(client) };
    // Both app_sessions and hosted rate buckets have a profile FK. Create the
    // owner foundation first, within this same transaction, before either insert.
    const account = await bootstrapAccountTransactionally({
      ownerId: claims.sub,
      workspaceId,
      displayName: input.displayName,
      store: createPostgresAccountBootstrapStore({ runner: transactionRunner }),
    });
    if (input.rateLimit.counterForTransaction) {
      try { await checkRateLimit(input.rateLimit.counterForTransaction(transactionRunner)); }
      catch (error) {
        if (error instanceof SafeBoundaryError && error.code === 'RATE_LIMITED') {
          return { ok: false, reason: 'rate_limited', retryAfterSeconds: error.retryAfterSeconds };
        }
        throw error;
      }
    }
    const session = await issueAppSessionFromVerifiedClaims({
      claims,
      expectedIssuer: input.expectedIssuer,
      expectedAudience: input.expectedAudience,
      now: input.now,
      store: createPostgresAppSessionStore({ runner: transactionRunner }),
    });
    if (!session.ok) return { ok: false, reason: 'invalid_provider_session' };
    return { ok: true, account, session };
  });
}
