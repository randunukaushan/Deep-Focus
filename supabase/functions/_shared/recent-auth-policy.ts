/** Server-only recent-auth admission; policy age is supplied by reviewed configuration. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

export function requireRecentAuthentication(input: { authenticatedAt: string; now: string; maxAgeMs: number }): void {
  const authenticatedAt = Date.parse(input.authenticatedAt);
  const now = Date.parse(input.now);
  if (!Number.isFinite(authenticatedAt) || !Number.isFinite(now)
    || !Number.isSafeInteger(input.maxAgeMs) || input.maxAgeMs < 1 || input.maxAgeMs > 86_400_000
    || authenticatedAt > now || now - authenticatedAt > input.maxAgeMs) {
    throw new SafeBoundaryError(401, 'AUTH_REQUIRED');
  }
}
