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
  /** Optional auth binding; a changed account must never consume this batch's response. */
  getOwnerId?: () => string | null;
  now?: () => string;
  retryDelaySeconds?: number;
};

const OWNER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function isOutboxMutation(value: unknown): value is LocalOutboxMutation {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const mutation = value as Partial<LocalOutboxMutation>;
  return typeof mutation.mutationId === 'string' && mutation.mutationId.length > 0 && mutation.mutationId.length <= 128
    && typeof mutation.command === 'string' && mutation.command.length > 0 && mutation.command.length <= 120
    && typeof mutation.targetId === 'string' && mutation.targetId.length > 0 && mutation.targetId.length <= 128
    && (mutation.baseVersion === null || (typeof mutation.baseVersion === 'number' && Number.isSafeInteger(mutation.baseVersion) && mutation.baseVersion >= 0))
    && mutation.payloadSchemaVersion === 1
    && Boolean(mutation.payload) && typeof mutation.payload === 'object' && !Array.isArray(mutation.payload)
    && typeof mutation.payloadHash === 'string' && mutation.payloadHash.length > 0 && mutation.payloadHash.length <= 128
    && validTimestamp(mutation.clientCreatedAt)
    && typeof mutation.attemptCount === 'number' && Number.isSafeInteger(mutation.attemptCount) && mutation.attemptCount >= 0
    && validTimestamp(mutation.nextAttemptAt)
    && (mutation.state === 'pending' || mutation.state === 'in_flight' || mutation.state === 'rejected')
    && (mutation.lastErrorCode === null || typeof mutation.lastErrorCode === 'string');
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
  const ownerAtStart = dependencies.getOwnerId?.() ?? null;
  if (dependencies.getOwnerId && (typeof ownerAtStart !== 'string' || !OWNER_ID.test(ownerAtStart))) {
    throw Object.assign(new Error('SYNC_OWNER_INVALID'), { code: 'SYNC_OWNER_INVALID' });
  }
  const ownerChanged = () => Boolean(dependencies.getOwnerId && dependencies.getOwnerId() !== ownerAtStart);
  const now = dependencies.now?.() ?? new Date().toISOString();
  if (!validTimestamp(now)) throw new RangeError('INVALID_SYNC_CLOCK');
  const retryDelay = dependencies.retryDelaySeconds ?? 30;
  if (!Number.isSafeInteger(retryDelay) || retryDelay < 1 || retryDelay > 86_400) throw new RangeError('INVALID_SYNC_RETRY_DELAY');
  const pending = await dependencies.store.loadPendingOutbox();
  if (!Array.isArray(pending) || pending.some((mutation) => !isOutboxMutation(mutation))) {
    throw Object.assign(new Error('SYNC_OUTBOX_INVALID'), { code: 'SYNC_OUTBOX_INVALID' });
  }
  const due = pending.filter((mutation) => mutation.state !== 'rejected'
    && validTimestamp(mutation.nextAttemptAt) && Date.parse(mutation.nextAttemptAt) <= Date.parse(now));
  if (due.length === 0) return { attempted: 0, acknowledged: 0, deferred: pending.length, failed: 0 };
  const batch = due.slice(0, 25);
  // Account switching can replace the auth token while the local read is in
  // flight. Never send an old account's outbox under the new account.
  if (ownerChanged()) return { attempted: 0, acknowledged: 0, deferred: pending.length, failed: 0 };
  try {
    const expected = new Set(batch.map((mutation) => mutation.mutationId));
    if (expected.size !== batch.length) {
      throw Object.assign(new Error('SYNC_OUTBOX_INVALID'), { code: 'SYNC_OUTBOX_INVALID' });
    }
    const idempotencyKey = `sync:${batch[0].mutationId}:${batch[batch.length - 1].mutationId}`;
    const response = await dependencies.push(syncItems(batch), idempotencyKey);
    // Do not apply a response obtained under one account to a store that may
    // now route to another account. Leave the old batch pending for recovery.
    if (ownerChanged()) return { attempted: batch.length, acknowledged: 0, deferred: pending.length - batch.length, failed: batch.length };
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
  if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies)
    || !dependencies.store || typeof dependencies.store !== 'object' || Array.isArray(dependencies.store)
    || typeof dependencies.push !== 'function'
    || (dependencies.getOwnerId !== undefined && typeof dependencies.getOwnerId !== 'function')
    || (dependencies.now !== undefined && typeof dependencies.now !== 'function')
    || typeof dependencies.store.loadPendingOutbox !== 'function'
    || typeof dependencies.store.acknowledgeOutbox !== 'function'
    || typeof dependencies.store.rejectOutbox !== 'function'
    || typeof dependencies.store.recordOutboxAttempt !== 'function') {
    return Promise.reject(Object.assign(new Error('SYNC_DEPENDENCY_INVALID'), { code: 'SYNC_DEPENDENCY_INVALID' }));
  }
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
