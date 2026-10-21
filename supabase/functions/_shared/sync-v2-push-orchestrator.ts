/** Local, review-gated V2 push orchestration. No route or database is wired here. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { validateSyncV2PushInput, type V2PushInput, type V2PushItem } from './sync-v2-push-validation.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(?:0|[1-9][0-9]*)$/;
const SAFE_CODE = /^[A-Z][A-Z0-9_]{0,79}$/;
const BIGINT_MAX = 9223372036854775807n;

export type V2PushOutcome = {
  mutationId: string;
  command: V2PushItem['command'];
  targetId: string;
  status: 'applied' | 'replayed' | 'rejected' | 'retryable';
  code?: string;
  receipt?: Record<string, unknown>;
  receiptId?: string;
  entityVersion?: number;
  committedThrough?: string;
  retryAfterSeconds?: number;
};

export type V2PushExecution = (input: { ownerId: string; item: V2PushItem }) => Promise<unknown>;
export type V2PushEpochReader = (ownerId: string) => Promise<string>;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function reset(): never { throw new SafeBoundaryError(410, 'SYNC_RESET_REQUIRED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function validEpoch(value: unknown): value is string {
  return typeof value === 'string' && DECIMAL.test(value) && BigInt(value) > 0n && BigInt(value) <= BIGINT_MAX;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  return value as Record<string, unknown>;
}
function safeOutcome(item: V2PushItem, status: 'rejected' | 'retryable', code: string, retryAfterSeconds?: number): V2PushOutcome {
  if (!SAFE_CODE.test(code)) code = 'DEPENDENCY_UNAVAILABLE';
  return { mutationId: item.mutationId, command: item.command, targetId: item.targetId, status, code,
    ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }) };
}

function validateExecutorOutcome(item: V2PushItem, value: unknown): V2PushOutcome {
  const result = object(value);
  if (result.mutationId !== item.mutationId || result.command !== item.command || result.targetId !== item.targetId
    || !['applied', 'replayed', 'rejected', 'retryable'].includes(String(result.status))) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  if (result.status === 'rejected' || result.status === 'retryable') {
    if (typeof result.code !== 'string' || !SAFE_CODE.test(result.code) || 'receipt' in result || 'receiptId' in result) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    if ('retryAfterSeconds' in result && (!Number.isSafeInteger(result.retryAfterSeconds) || (result.retryAfterSeconds as number) < 1 || (result.retryAfterSeconds as number) > 86400)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  } else {
    const hasPlanReceipt = result.receipt && typeof result.receipt === 'object' && !Array.isArray(result.receipt);
    const hasLegacyReceipt = typeof result.receiptId === 'string' && UUID.test(result.receiptId)
      && Number.isSafeInteger(result.entityVersion) && (result.entityVersion as number) > 0
      && typeof result.committedThrough === 'string' && DECIMAL.test(result.committedThrough);
    if (!hasPlanReceipt && !hasLegacyReceipt) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
  }
  return result as V2PushOutcome;
}

function mapFailure(item: V2PushItem, error: unknown): V2PushOutcome {
  if (error instanceof SafeBoundaryError) {
    return safeOutcome(item, error.status === 429 || error.status >= 500 ? 'retryable' : 'rejected', error.code, error.retryAfterSeconds);
  }
  return safeOutcome(item, 'retryable', 'DEPENDENCY_UNAVAILABLE');
}

/**
 * Validates and executes one admitted batch. The owner is trusted server
 * context; it is never read from the client envelope. A second epoch read
 * happens before each item so an erasure/reset cannot allow later writes.
 */
export async function executeSyncV2Push(input: {
  ownerId: string;
  value: unknown;
  readCurrentEpoch: V2PushEpochReader;
  executeItem: V2PushExecution;
}): Promise<{ data: { contractVersion: 2; privacyEpoch: string; outcomes: V2PushOutcome[] } }> {
  if (!input || typeof input !== 'object' || Array.isArray(input) || typeof input.ownerId !== 'string' || !UUID.test(input.ownerId)) invalid();
  if (typeof input.readCurrentEpoch !== 'function' || typeof input.executeItem !== 'function') dependencyFailure();
  const push: V2PushInput = validateSyncV2PushInput(input.value);
  const initialEpoch = await input.readCurrentEpoch(input.ownerId);
  if (!validEpoch(initialEpoch)) dependencyFailure();
  if (initialEpoch !== push.privacyEpoch) reset();

  const outcomes: V2PushOutcome[] = [];
  let currentEpoch = initialEpoch;
  for (const item of push.items) {
    currentEpoch = await input.readCurrentEpoch(input.ownerId);
    if (!validEpoch(currentEpoch)) throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE');
    if (currentEpoch !== push.privacyEpoch) {
      outcomes.push(...push.items.slice(outcomes.length).map((remaining) => safeOutcome(remaining, 'retryable', 'SYNC_RESET_REQUIRED')));
      break;
    }
    try {
      outcomes.push(validateExecutorOutcome(item, await input.executeItem({ ownerId: input.ownerId, item })));
    } catch (error) {
      outcomes.push(mapFailure(item, error));
    }
  }
  return { data: { contractVersion: 2, privacyEpoch: currentEpoch, outcomes } };
}
