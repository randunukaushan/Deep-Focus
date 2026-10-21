// @ts-expect-error The installed domain runner imports TypeScript modules directly.
import { createRemoteApiClient, RemoteApiError, type RemoteApiFetch } from './remote-api-client.ts';
// @ts-expect-error The installed domain runner imports TypeScript modules directly.
import { bootstrapOwnAccount } from './account-bootstrap-client.ts';
// @ts-expect-error The installed domain runner imports TypeScript modules directly.
import { loadOwnWorkspaceProfile } from '../sync/workspace-bootstrap-client.ts';

export type BackendSessionSource = {
  getSession(): Promise<{ data: { session: { access_token: string; user: { id: string } } | null }; error: unknown }>;
};

/** Authenticated app -> Edge -> private database connection; no direct table access. */
export function createAccountBackendConnection(input: {
  baseUrl: string | undefined;
  auth: BackendSessionSource;
  isCurrent: (userId: string) => boolean;
  fetcher?: RemoteApiFetch;
}) {
  return {
    async connect(account: { userId: string; displayName: string; idempotencyKey: string }) {
      const current = () => input.isCurrent(account.userId);
      const fetcher = input.fetcher ?? (fetch as unknown as RemoteApiFetch);
      const client = createRemoteApiClient({
        baseUrl: input.baseUrl,
        getAccessToken: async () => {
          if (!current()) return null;
          const { data, error } = await input.auth.getSession();
          return !error && current() && data.session?.user.id === account.userId ? data.session.access_token : null;
        },
        fetcher: (url, init) => {
          if (!current()) throw new RemoteApiError(401, 'AUTH_REQUIRED');
          return fetcher(url, init);
        },
      });
      const bootstrap = await bootstrapOwnAccount(client, {
        verifiedUserId: account.userId,
        displayName: account.displayName,
        idempotencyKey: account.idempotencyKey,
      });
      if (!current()) throw new RemoteApiError(401, 'AUTH_REQUIRED');
      const profile = await loadOwnWorkspaceProfile(client, account.userId);
      if (!current()) throw new RemoteApiError(401, 'AUTH_REQUIRED');
      if (profile.workspaceId !== bootstrap.workspaceId) throw new RemoteApiError(0, 'BOOTSTRAP_WORKSPACE_MISMATCH');
      return { account: bootstrap, profile, client };
    },
  };
}
