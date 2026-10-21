/** Server-only structured logging boundary; private payloads never enter the sink. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const EVENT = /^[a-z][a-z0-9_.-]{1,79}$/;
const CODE = /^[A-Z][A-Z0-9_]{0,79}$/;
const REQUEST = /^[A-Za-z0-9_-]{1,128}$/;
const ALLOWED = new Set(['event', 'operation', 'outcome', 'errorCode', 'requestId', 'durationMs']);

type SafeLog = {
  event: string;
  operation: string;
  outcome: 'success' | 'failure' | 'denied';
  errorCode?: string;
  requestId?: string;
  durationMs?: number;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

function validate(input: unknown): asserts input is SafeLog {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid();
  const value = input as Record<string, unknown>;
  const keys = Object.keys(value);
  if (keys.some((key) => !ALLOWED.has(key)) || typeof value.event !== 'string' || !EVENT.test(value.event)
    || typeof value.operation !== 'string' || !EVENT.test(value.operation)
    || typeof value.outcome !== 'string'
    || !['success', 'failure', 'denied'].includes(value.outcome)
    || (value.errorCode !== undefined && (typeof value.errorCode !== 'string' || !CODE.test(value.errorCode)))
    || (value.requestId !== undefined && (typeof value.requestId !== 'string' || !REQUEST.test(value.requestId)))
    || (value.durationMs !== undefined && (typeof value.durationMs !== 'number' || !Number.isSafeInteger(value.durationMs) || value.durationMs < 0 || value.durationMs > 86_400_000))) invalid();
  if (value.outcome === 'success' && value.errorCode !== undefined) invalid();
  if (value.outcome !== 'success' && value.errorCode === undefined) invalid();
}

/** A sink receives only the validated allowlist; it must not be a raw console sink. */
export function createSafeServerLogger(input: { sink: (entry: Readonly<SafeLog>) => void }) {
  if (!input || typeof input.sink !== 'function') invalid();
  return {
    write: (entry: unknown): void => {
      validate(entry);
      input.sink(Object.freeze({ ...entry }));
    },
  };
}
