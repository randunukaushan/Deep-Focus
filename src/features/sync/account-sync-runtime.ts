import type { RemoteApiFetch } from '../auth/remote-api-client.ts';
// @ts-expect-error The bundled domain runtime resolves TypeScript modules directly.
import { createAccountSyncBoundary, type AccountSyncOutcome, type AccountSyncBoundaryDependencies } from './account-sync-boundary.ts';

type SessionClient = {
  auth: {
    getSession: () => Promise<{
      data: { session: { access_token?: string; user?: { id?: string } } | null };
      error: unknown;
    }>;
  };
};

const OWNER = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validEndpoint(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash;
  } catch {
    return false;
  }
}
function validSessionClient(value: unknown): value is SessionClient {
  return Boolean(value) && typeof value === 'object' && Boolean((value as SessionClient).auth)
    && typeof (value as SessionClient).auth.getSession === 'function';
}

export type AccountSyncRuntimeDependencies = {
  store: AccountSyncBoundaryDependencies['store'];
  ownerId: () => string | null;
  baseUrl?: string;
  client?: SessionClient | null;
  fetcher?: RemoteApiFetch;
};

/**
 * Builds the authenticated sync boundary without activating it from app
 * startup. The bearer token is transport input only; the server must verify
 * it and derive the owner before reading or mutating remote data.
 */
export function createAccountSyncRuntime(dependencies: AccountSyncRuntimeDependencies) {
  const baseUrl = dependencies.baseUrl ?? process.env.EXPO_PUBLIC_DEEP_FOCUS_API_BASE_URL?.trim();
  return {
    async run(): Promise<AccountSyncOutcome> {
      if (dependencies.client === null) return { status: 'unavailable' };
      let client: SessionClient | null | undefined = dependencies.client;
      if (client === undefined) {
        // Keep native SecureStore out of domain-test imports. The app runtime
        // loads the configured Supabase client only when this boundary runs.
        // @ts-expect-error The bundled domain runtime resolves TypeScript modules directly.
        const authModule = await import('../auth/supabase-client.ts');
        client = authModule.supabase as SessionClient | null;
      }
      let ownerId: string | null;
      try { ownerId = dependencies.ownerId(); } catch { return { status: 'unavailable' }; }
      if (!validSessionClient(client) || !validEndpoint(baseUrl) || !OWNER.test(ownerId ?? '')) return { status: 'unavailable' };
      return createAccountSyncBoundary({
        store: dependencies.store,
        // Keep checking the live identity, not the captured value. Otherwise an
        // account switch while reading the outbox could send it as the new user.
        ownerId: () => dependencies.ownerId() === ownerId ? ownerId : null,
        baseUrl,
        fetcher: dependencies.fetcher,
        getAccessToken: async () => {
          try {
            const { data, error } = await client.auth.getSession();
            if (error || dependencies.ownerId() !== ownerId || data.session?.user?.id !== ownerId) return null;
            return data.session.access_token ?? null;
          } catch {
            return null;
          }
        },
      }).run();
    },
  };
}
