/** Server-only Supabase Auth token verification adapter.
 *
 * The caller supplies a configured Supabase Auth client. This adapter uses the
 * provider's verified claims path and never reads a locally stored session or
 * decodes an unverified JWT. The returned shape is still checked again by the
 * app-session gateway boundary.
 */

import type { VerifiedSessionClaims } from './app-session.ts';

type VerifiedJwtClaims = {
  sub?: unknown;
  session_id?: unknown;
  exp?: unknown;
  iss?: unknown;
  aud?: unknown;
  is_anonymous?: unknown;
};

type ClaimsResult = {
  data: { claims: VerifiedJwtClaims } | null;
  error: unknown;
};

export type SupabaseClaimsClient = {
  auth: {
    getClaims: (jwt: string, options?: { allowExpired?: boolean }) => Promise<ClaimsResult>;
  };
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new Error('PROVIDER_TOKEN_INVALID'); }
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mapClaims(value: unknown): VerifiedSessionClaims {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  const claims = value as VerifiedJwtClaims;
  if (typeof claims.sub !== 'string' || !UUID.test(claims.sub)
    || typeof claims.session_id !== 'string' || !UUID.test(claims.session_id)
    || typeof claims.exp !== 'number' || !Number.isSafeInteger(claims.exp)
    || typeof claims.iss !== 'string' || !claims.iss
    || typeof claims.aud !== 'string' || !claims.aud
    || claims.is_anonymous === true) invalid();
  return {
    sub: claims.sub,
    sessionId: claims.session_id,
    exp: claims.exp,
    iss: claims.iss,
    aud: claims.aud,
  };
}

/** Returns a verifier suitable for authorizeRequestSession(). */
export function createSupabaseProviderSessionVerifier(client: SupabaseClaimsClient): (accessToken: string) => Promise<VerifiedSessionClaims> {
  if (!client || typeof client !== 'object' || !client.auth || typeof client.auth.getClaims !== 'function') {
    throw new Error('PROVIDER_VERIFIER_INVALID');
  }
  return async (accessToken: string) => {
    if (typeof accessToken !== 'string' || accessToken.length === 0 || accessToken.length > 8192 || /\s/.test(accessToken)) invalid();
    let result: ClaimsResult;
    try {
      result = await client.auth.getClaims(accessToken, { allowExpired: false });
    } catch {
      invalid();
    }
    if (!isRecord(result) || result.error || !isRecord(result.data)) invalid();
    return mapClaims(result.data.claims);
  };
}
