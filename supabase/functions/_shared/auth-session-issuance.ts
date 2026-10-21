/** Local candidate for issuing the server app-session row after provider verification. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { issueAppSessionTransactionally, type AppSessionMutation, type AppSessionTransactionStore, type VerifiedSessionClaims } from './app-session.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validNow(value: string): boolean {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

export function validateVerifiedSessionClaims(value: unknown, expectedIssuer: string, expectedAudience: string, now: string): value is VerifiedSessionClaims {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const claims = value as Partial<VerifiedSessionClaims>;
  if (typeof expectedIssuer !== 'string' || !expectedIssuer || typeof expectedAudience !== 'string' || !expectedAudience || !validNow(now)) return false;
  if (typeof claims.sub !== 'string' || !UUID.test(claims.sub)
    || typeof claims.sessionId !== 'string' || !UUID.test(claims.sessionId)
    || typeof claims.exp !== 'number' || !Number.isSafeInteger(claims.exp) || claims.exp <= 0
    || claims.iss !== expectedIssuer || claims.aud !== expectedAudience) return false;
  const expiry = new Date(claims.exp * 1000);
  return Number.isFinite(expiry.getTime()) && expiry.getTime() > Date.parse(now);
}

/**
 * Converts already provider-verified claims into one owner-bound app-session
 * registry insert. The caller must obtain the claims from the provider
 * verifier; this function never accepts or decodes a raw token.
 */
export async function issueAppSessionFromVerifiedClaims(input: {
  claims: unknown;
  expectedIssuer: string;
  expectedAudience: string;
  now: string;
  store: AppSessionTransactionStore;
}): Promise<AppSessionMutation> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, reason: 'invalid_input' };
  if (!validateVerifiedSessionClaims(input.claims, input.expectedIssuer, input.expectedAudience, input.now)) return { ok: false, reason: 'invalid_input' };
  return issueAppSessionTransactionally({
    ownerId: input.claims.sub,
    sessionId: input.claims.sessionId,
    issuedAt: input.now,
    expiresAt: new Date(input.claims.exp * 1000).toISOString(),
    store: input.store,
  });
}
