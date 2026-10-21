import type { RemoteApiFetch } from '../auth/remote-api-client.ts';
// @ts-expect-error The bundled domain runtime resolves TypeScript modules directly.
import { createRemoteSyncPusher } from './remote-sync-pusher.ts';
// @ts-expect-error The bundled domain runtime resolves TypeScript modules directly.
import { syncPendingOutbox, type SyncOutboxStore } from './sync-service.ts';

type SyncResult = Awaited<ReturnType<typeof syncPendingOutbox>>;

export type AccountSyncBoundaryDependencies = {
  store: SyncOutboxStore;
  ownerId: () => string | null;
  baseUrl: string | undefined;
  getAccessToken: () => Promise<string | null>;
  fetcher?: RemoteApiFetch;
};

export type AccountSyncOutcome =
  | { status: 'unavailable' }
  | { status: 'completed'; result: SyncResult };

/**
 * Composes the local owner-scoped outbox with the reviewed remote adapter.
 * This boundary is deliberately inert until the caller supplies a verified
 * owner, a configured HTTPS endpoint and an access-token provider.
 */
export function createAccountSyncBoundary(dependencies: AccountSyncBoundaryDependencies) {
  return {
    async run(): Promise<AccountSyncOutcome> {
      const ownerId = dependencies.ownerId();
      if (!ownerId || !dependencies.baseUrl) return { status: 'unavailable' };
      const push = createRemoteSyncPusher({
        baseUrl: dependencies.baseUrl,
        getAccessToken: dependencies.getAccessToken,
        ...(dependencies.fetcher ? { fetcher: dependencies.fetcher } : {}),
      });
      const result = await syncPendingOutbox({
        store: dependencies.store,
        getOwnerId: dependencies.ownerId,
        push,
      });
      return { status: 'completed', result };
    },
  };
}
