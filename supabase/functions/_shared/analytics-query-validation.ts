/** Server-only validation foundation for the bounded analytics query contract. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const MAX_TEXT = 128;

export type AnalyticsQuery = {
  start: string;
  end: string;
  timeZone: string;
};

export type ValidatedAnalyticsQuery = AnalyticsQuery & {
  startMs: number;
  endMs: number;
  rangeMs: number;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

function validTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format();
    return true;
  } catch { return false; }
}

/** Rejects extra fields and requires the caller to supply the reviewed range limit. */
export function validateAnalyticsQuery(value: unknown, maxRangeMs: number): ValidatedAnalyticsQuery {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Number.isSafeInteger(maxRangeMs) || maxRangeMs < 1) invalid();
  const input = value as Record<string, unknown>;
  if (Object.keys(input).length !== 3 || typeof input.start !== 'string' || typeof input.end !== 'string' || typeof input.timeZone !== 'string'
    || input.start.length > MAX_TEXT || input.end.length > MAX_TEXT || input.timeZone.length < 1 || input.timeZone.length > MAX_TEXT) invalid();
  if (!validTimeZone(input.timeZone)) invalid();
  const startMs = Date.parse(input.start);
  const endMs = Date.parse(input.end);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs || endMs - startMs > maxRangeMs) invalid();
  return { start: input.start, end: input.end, timeZone: input.timeZone, startMs, endMs, rangeMs: endMs - startMs };
}
