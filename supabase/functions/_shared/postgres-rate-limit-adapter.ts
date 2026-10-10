/** Local PostgreSQL candidate for an atomic, server-only gateway rate counter. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { RateLimitCounter } from './gateway-rate-limit.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KEY = /^actor:([0-9a-f-]{36}):([a-z][A-Za-z0-9.]{0,79})$/;

function invalid(): never { throw new SafeBoundaryError(400, 'VALIDATION_FAILED'); }
function unavailable(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function parseKey(key: string): { ownerId: string; operation: string } {
  if (typeof key !== 'string' || key.length > 128) invalid();
  const match = KEY.exec(key);
  if (!match || !UUID.test(match[1])) invalid();
  return { ownerId: match[1], operation: match[2] };
}

function validateWindow(windowMs: number, limit: number, nowMs: number): void {
  if (!Number.isSafeInteger(windowMs) || windowMs < 1000 || windowMs > 86_400_000
    || !Number.isSafeInteger(limit) || limit < 1 || limit > 10_000
    || !Number.isSafeInteger(nowMs) || nowMs < 0) invalid();
}

export function createPostgresRateLimitCounter(input: { runner: PostgresTransactionRunner }): RateLimitCounter {
  return {
    consume: async (key, windowMs, limit, nowMs) => {
      const { ownerId, operation } = parseKey(key);
      validateWindow(windowMs, limit, nowMs);
      const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
      const result = await input.runner.withTransaction((client) => client.query<{ request_count: number }>(
        `insert into df_private.gateway_rate_limit_buckets
           (owner_id, operation, window_start_ms, request_count)
         values ($1, $2, $3, 1)
         on conflict (owner_id, operation, window_start_ms)
         do update set request_count = gateway_rate_limit_buckets.request_count + 1,
                       updated_at = now()
         returning request_count`,
        [ownerId, operation, windowStartMs],
      ));
      const count = result.rows[0]?.request_count;
      if (!Number.isSafeInteger(count) || count < 1) unavailable();
      const retryAfterSeconds = Math.max(0, Math.ceil((windowStartMs + windowMs - nowMs) / 1000));
      return { allowed: count <= limit, retryAfterSeconds };
    },
  };
}
