import type { LocalOutboxMutation } from '@/features/storage/local-database';

export type SyncOutboxStore = {
  loadPendingOutbox(): Promise<LocalOutboxMutation[]>;
  acknowledgeOutbox(mutationId: string): Promise<void>;
  rejectOutbox(mutationId: string, errorCode: string): Promise<void>;
  recordOutboxAttempt(mutationId: string, nextAttemptAt: string, errorCode?: string | null): Promise<void>;
};

export type SyncPushItem = {
  mutationId: string;
  command: string;
  targetId: string;
  body: Record<string, unknown>;
};

export type SyncPushResult = {
  acceptedMutationIds: string[];
  rejectedMutationIds?: { mutationId: string; errorCode: string }[];
};

export type SyncServiceDependencies = {
  store: SyncOutboxStore;
  push: (items: SyncPushItem[], idempotencyKey: string) => Promise<SyncPushResult>;
  now?: () => string;
  retryDelaySeconds?: number;
};

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function retryAt(now: string, seconds: number): string {
  if (!validTimestamp(now) || !Number.isSafeInteger(seconds) || seconds < 1 || seconds > 86_400) {
    throw new RangeError('INVALID_SYNC_CLOCK');
  }
  return new Date(Date.parse(now) + seconds * 1000).toISOString();
}

function safeErrorCode(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    ? error.code : 'SYNC_UNAVAILABLE';
  return /^[A-Z][A-Z0-9_]{0,79}$/.test(code) ? code : 'SYNC_UNAVAILABLE';
}

/** Server decisions that require user action must not be retried blindly. */
function isNonRetryableRejection(errorCode: string): boolean {
  return new Set([
    'ACCESS_DENIED', 'AUTH_REQUIRED', 'ACCOUNT_DISABLED', 'ENTITY_DELETED',
    'NOT_FOUND', 'PERMISSION_REVOKED', 'VERSION_CONFLICT', 'INVALID_TRANSITION',
    'VALIDATION_FAILED', 'UNSUPPORTED', 'IDEMPOTENCY_CONFLICT',
    'SYNC_PAYLOAD_INVALID', 'SYNC_TARGET_INVALID', 'SYNC_EVENT_REQUIRED',
    'SYNC_COMMAND_UNSUPPORTED', 'SYNC_IDEMPOTENCY_INVALID',
  ]).has(errorCode);
}

function syncItems(mutations: LocalOutboxMutation[]): SyncPushItem[] {
  return mutations.map((mutation) => ({
    mutationId: mutation.mutationId,
    command: mutation.command,
    targetId: mutation.targetId,
    body: mutation.payload,
  }));
}

/**
 * Sends only due, owner-routed outbox entries. A mutation is acknowledged only
 * when the server explicitly returns its stable mutation ID. Permanent server
 * decisions are quarantined locally for explicit recovery instead of looping.
 */
type SyncResult = {
  attempted: number;
  acknowledged: number;
  deferred: number;
  failed: number;
};

const inFlightByStore = new WeakMap<SyncOutboxStore, Promise<SyncResult>>();

async function performSync(dependencies: SyncServiceDependencies): Promise<SyncResult> {
  const now = dependencies.now?.() ?? new Date().toISOString();
  if (!validTimestamp(now)) throw new RangeError('INVALID_SYNC_CLOCK');
  const retryDelay = dependencies.retryDelaySeconds ?? 30;
  if (!Number.isSafeInteger(retryDelay) || retryDelay < 1 || retryDelay > 86_400) throw new RangeError('INVALID_SYNC_RETRY_DELAY');
  const pending = await dependencies.store.loadPendingOutbox();
  const due = pending.filter((mutation) => validTimestamp(mutation.nextAttemptAt) && Date.parse(mutation.nextAttemptAt) <= Date.parse(now));
  if (due.length === 0) return { attempted: 0, acknowledged: 0, deferred: pending.length, failed: 0 };
  const batch = due.slice(0, 25);
  try {
    const expected = new Set(batch.map((mutation) => mutation.mutationId));
    if (expected.size !== batch.length) {
      throw Object.assign(new Error('SYNC_OUTBOX_INVALID'), { code: 'SYNC_OUTBOX_INVALID' });
    }
    const idempotencyKey = `sync:${batch[0].mutationId}:${batch[batch.length - 1].mutationId}`;
    const response = await dependencies.push(syncItems(batch), idempotencyKey);
    if (!response || !Array.isArray(response.acceptedMutationIds) || response.acceptedMutationIds.some((id) => !expected.has(id))) {
      throw Object.assign(new Error('SYNC_RESPONSE_INVALID'), { code: 'SYNC_RESPONSE_INVALID' });
    }
    const accepted = new Set(response.acceptedMutationIds);
    if (accepted.size !== response.acceptedMutationIds.length) {
      throw Object.assign(new Error('SYNC_RESPONSE_INVALID'), { code: 'SYNC_RESPONSE_INVALID' });
    }
    const rejected = response.rejectedMutationIds ?? [];
    const rejectedIds = new Set(Array.isArray(rejected) ? rejected.map((item) => item?.mutationId) : []);
    if (!Array.isArray(rejected) || rejectedIds.size !== rejected.length || rejected.some((item) => !item || !expected.has(item.mutationId) || accepted.has(item.mutationId) || !/^[A-Z][A-Z0-9_]{0,79}$/.test(item.errorCode))) {
      throw Object.assign(new Error('SYNC_RESPONSE_INVALID'), { code: 'SYNC_RESPONSE_INVALID' });
    }
    for (const mutation of batch) {
      if (accepted.has(mutation.mutationId)) await dependencies.store.acknowledgeOutbox(mutation.mutationId);
      else {
        const rejection = rejected.find((item) => item.mutationId === mutation.mutationId);
        const errorCode = rejection?.errorCode ?? 'SYNC_NOT_ACKNOWLEDGED';
        if (rejection && isNonRetryableRejection(errorCode)) await dependencies.store.rejectOutbox(mutation.mutationId, errorCode);
        else await dependencies.store.recordOutboxAttempt(mutation.mutationId, retryAt(now, retryDelay), errorCode);
      }
    }
    return { attempted: batch.length, acknowledged: accepted.size, deferred: pending.length - batch.length, failed: batch.length - accepted.size };
  } catch (error) {
    const code = safeErrorCode(error);
    for (const mutation of batch) await dependencies.store.recordOutboxAttempt(mutation.mutationId, retryAt(now, retryDelay), code);
    return { attempted: batch.length, acknowledged: 0, deferred: pending.length - batch.length, failed: batch.length };
  }
}

/** Concurrent calls for the same owner store share one push operation. */
export function syncPendingOutbox(dependencies: SyncServiceDependencies): Promise<SyncResult> {
  const existing = inFlightByStore.get(dependencies.store);
  if (existing) return existing;
  const current = performSync(dependencies);
  inFlightByStore.set(dependencies.store, current);
  // Do not create an unobserved rejected promise when the underlying sync
  // fails before its internal recovery boundary (for example, outbox load).
  // The original promise still carries the error to its caller; this derived
  // cleanup promise deliberately handles both completion paths.
  void current.then(() => {
    if (inFlightByStore.get(dependencies.store) === current) inFlightByStore.delete(dependencies.store);
  }, () => {
    if (inFlightByStore.get(dependencies.store) === current) inFlightByStore.delete(dependencies.store);
  });
  return current;
}
