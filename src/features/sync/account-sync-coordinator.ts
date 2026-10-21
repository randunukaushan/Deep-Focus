// Local account-scoped sync orchestration. Startup activation remains a review gate.
// @ts-expect-error The bundled domain test runner imports TypeScript modules directly.
import { accountOwnerId } from '../storage/local-owner.ts';
// @ts-expect-error The bundled domain test runner imports TypeScript modules directly.
import { syncPendingOutbox, type SyncOutboxStore, type SyncPushItem, type SyncPushResult } from './sync-service.ts';
import type { SyncPullPage } from './sync-pull-apply.ts';

type SyncPullState = { nextCursor: string; lastSequence: string } | null;
type AccountSyncStore = SyncOutboxStore & {
  loadRemotePullState: () => Promise<SyncPullState>;
  applySyncPageAtomically: (input: { ownerId: string; nextCursor: string; changes: SyncPullPage['changes'] }) => Promise<{ applied: number; replayed: number; nextCursor: string }>;
};

export type AccountSyncCoordinatorDependencies = {
  store: AccountSyncStore;
  authenticatedUserId: () => string | null;
  pull: (ownerId: string, cursor: string | null, limit: number) => Promise<SyncPullPage>;
  push: (items: SyncPushItem[], batchKey: string) => Promise<SyncPushResult>;
  now?: () => string;
  pullLimit?: number;
};

export type AccountSyncCoordinatorResult =
  | { status: 'account_changed' }
  | { status: 'completed'; pull: { applied: number; replayed: number; nextCursor: string }; push: Awaited<ReturnType<typeof syncPendingOutbox>> };

/** Pulls and commits one remote page before retry-safe local outbox push. */
export async function runAccountSync(dependencies: AccountSyncCoordinatorDependencies): Promise<AccountSyncCoordinatorResult> {
  const authenticatedUserId = dependencies.authenticatedUserId();
  if (!authenticatedUserId) return { status: 'account_changed' };
  const localOwnerId = accountOwnerId(authenticatedUserId);
  const limit = dependencies.pullLimit ?? 50;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new RangeError('SYNC_PULL_LIMIT_INVALID');
  const state = await dependencies.store.loadRemotePullState();
  if (dependencies.authenticatedUserId() !== authenticatedUserId) return { status: 'account_changed' };
  const page = await dependencies.pull(localOwnerId, state?.nextCursor ?? null, limit);
  if (dependencies.authenticatedUserId() !== authenticatedUserId) return { status: 'account_changed' };
  const pullResult = await dependencies.store.applySyncPageAtomically({ ownerId: localOwnerId, nextCursor: page.nextCursor, changes: page.changes });
  if (dependencies.authenticatedUserId() !== authenticatedUserId) return { status: 'account_changed' };
  const push = await syncPendingOutbox({
    store: dependencies.store,
    getOwnerId: () => dependencies.authenticatedUserId(),
    push: dependencies.push,
    ...(dependencies.now ? { now: dependencies.now } : {}),
  });
  return { status: 'completed', pull: pullResult, push };
}
