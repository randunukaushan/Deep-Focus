// Keep this adapter directly importable by the bundled domain-test runtime.
// @ts-expect-error The bundled domain test runner imports TypeScript modules directly.
import { RemoteApiError, type RemoteApiFetch, createRemoteApiClient } from '../auth/remote-api-client.ts';
// @ts-expect-error The bundled domain test runner imports TypeScript modules directly.
import { applyAuthorizedSyncPage, type SyncPullPage } from './sync-pull-apply.ts';

type RemoteRequestClient = {
  request<T>(path: string, options?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; idempotencyKey?: string; expectedVersion?: number }): Promise<T>;
};

export type RemoteSyncPullerDependencies = {
  baseUrl?: string;
  getAccessToken?: () => Promise<string | null>;
  fetcher?: RemoteApiFetch;
  client?: RemoteRequestClient;
};

const OWNER = /^account:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CURSOR = /^(?=.{1,2048}$)[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?$/;

function validLimit(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 1 && value <= 100;
}

function pullPath(cursor: string | null, limit: number): string {
  if (!validLimit(limit) || (cursor !== null && !CURSOR.test(cursor))) throw new RemoteApiError(0, 'SYNC_CURSOR_INVALID');
  const query = new URLSearchParams({ limit: String(limit) });
  if (cursor !== null) query.set('cursor', cursor);
  return `/v1/sync/pull?${query.toString()}`;
}

function pageFromResponse(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RemoteApiError(0, 'SYNC_PAGE_INVALID');
  const body = value as Record<string, unknown>;
  if (!body.data || typeof body.data !== 'object' || Array.isArray(body.data)) throw new RemoteApiError(0, 'SYNC_PAGE_INVALID');
  return body.data;
}

/** Fetches one authenticated, bounded page; local storage remains the caller's atomic boundary. */
export function createRemoteSyncPuller(dependencies: RemoteSyncPullerDependencies) {
  const client = dependencies.client ?? createRemoteApiClient({
    baseUrl: dependencies.baseUrl,
    getAccessToken: dependencies.getAccessToken ?? (async () => null),
    ...(dependencies.fetcher ? { fetcher: dependencies.fetcher } : {}),
  });
  return async function pull(ownerId: string, cursor: string | null, limit = 50): Promise<SyncPullPage> {
    if (!OWNER.test(ownerId)) throw new RemoteApiError(0, 'SYNC_OWNER_INVALID');
    let captured: SyncPullPage | undefined;
    const response = await client.request<unknown>(pullPath(cursor, limit));
    await applyAuthorizedSyncPage(ownerId, pageFromResponse(response), {
      applyPageAtomically: async (_receivedOwner, page) => { captured = page; },
    });
    if (!captured) throw new RemoteApiError(0, 'SYNC_PAGE_INVALID');
    return captured;
  };
}
