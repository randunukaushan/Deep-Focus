// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { authorizeAppSession, type AppSessionDecision, type AppSessionRecord } from './app-session.ts';

export type RequestSessionDecision = AppSessionDecision
  | { allowed: false; reason: 'missing_token' | 'invalid_token' };

export type ProviderSessionVerifier = (accessToken: string) => Promise<unknown>;

const CONTROL = /[\u0000-\u001f\u007f]/;
const MAX_TOKEN_LENGTH = 8192;

function bearer(headers: Record<string, string | undefined>): string | null {
  const value = headers.Authorization ?? headers.authorization;
  if (!value || CONTROL.test(value) || !/^Bearer\s+\S+$/.test(value)) return null;
  const token = value.slice(value.indexOf(' ') + 1);
  if (!token || token.length > MAX_TOKEN_LENGTH || /\s/.test(token)) return null;
  return token;
}

/**
 * Verifies the provider token first, then rechecks the private app-session
 * registry. No anonymous/guest branch exists and provider error details escape
 * neither the return value nor the caller's logs.
 */
export async function authorizeRequestSession(input: {
  headers: Record<string, string | undefined>;
  verifyProviderToken: ProviderSessionVerifier;
  expectedIssuer: string;
  expectedAudience: string;
  now: string;
  loadSession: (ownerId: string, sessionId: string) => Promise<AppSessionRecord | null>;
}): Promise<RequestSessionDecision> {
  const token = bearer(input.headers);
  if (!token) return { allowed: false, reason: 'missing_token' };
  let claims: unknown;
  try { claims = await input.verifyProviderToken(token); }
  catch { return { allowed: false, reason: 'invalid_token' }; }
  try {
    return await authorizeAppSession({
      claims,
      expectedIssuer: input.expectedIssuer,
      expectedAudience: input.expectedAudience,
      now: input.now,
      loadSession: input.loadSession,
    });
  } catch {
    return { allowed: false, reason: 'invalid_token' };
  }
}
