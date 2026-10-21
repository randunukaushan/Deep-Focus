/** Server-only rate-limit admission. The caller must provide an atomic shared counter store. */

import type { GatewayRateLimitOperation } from './gateway-router.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export type RateLimitCounter = {
  consume: (key: string, windowMs: number, limit: number, nowMs: number) => Promise<{ allowed: boolean; retryAfterSeconds: number }>;
};

export async function enforceGatewayRateLimit(input: {
  actorId: string;
  operation: GatewayRateLimitOperation;
  counter: RateLimitCounter;
  nowMs: number;
  windowMs: number;
  limit: number;
}): Promise<void> {
  if (!input || typeof input !== 'object' || Array.isArray(input)
    || !input.counter || typeof input.counter !== 'object' || Array.isArray(input.counter)
    || typeof input.counter.consume !== 'function'
    || !isUuid(input.actorId) || typeof input.operation !== 'string' || !Number.isSafeInteger(input.nowMs) || input.nowMs < 0
    || !Number.isSafeInteger(input.windowMs) || input.windowMs < 1000 || input.windowMs > 86_400_000
    || !Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 10_000) {
    throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  }
  const result = await input.counter.consume(`actor:${input.actorId}:${input.operation}`, input.windowMs, input.limit, input.nowMs);
  if (!result || typeof result.allowed !== 'boolean' || !Number.isSafeInteger(result.retryAfterSeconds) || result.retryAfterSeconds < 0 || result.retryAfterSeconds > 86_400) {
    throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  if (!result.allowed) throw new SafeBoundaryError(429, 'RATE_LIMITED', { retryAfterSeconds: result.retryAfterSeconds });
}
