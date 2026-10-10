// @ts-expect-error The bundled domain test runtime imports TypeScript modules directly.
import { parseOwnWorkspaceProfile, type OwnWorkspaceProfile } from './workspace-bootstrap.ts';

type WorkspaceBootstrapClient = {
  request<T>(path: string, options?: { method?: 'GET' }): Promise<T>;
};

/** Loads only the authenticated user's own workspace context. */
export async function loadOwnWorkspaceProfile(
  client: WorkspaceBootstrapClient,
  verifiedUserId: string,
): Promise<OwnWorkspaceProfile> {
  const response = await client.request<unknown>('/v1/me', { method: 'GET' });
  return parseOwnWorkspaceProfile(response, verifiedUserId);
}
