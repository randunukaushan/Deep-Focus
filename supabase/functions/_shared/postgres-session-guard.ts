/** Shared PostgreSQL transaction guard for server-verified app sessions. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SessionGuardClient = {
  query: <Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: readonly unknown[]) => Promise<{ rows: Row[] }>;
};

/** Locks the registry row so revocation cannot race a sensitive transaction. */
export async function recheckPostgresAppSession(client: SessionGuardClient, ownerId: string, sessionId: string): Promise<void> {
  if (!UUID.test(ownerId) || !UUID.test(sessionId)) throw new SafeBoundaryError(400, 'VALIDATION_FAILED');
  const result = await client.query<{ owner_id: string; session_id: string; status: string; revoked_at: string | null }>(
    `select owner_id, session_id, status, revoked_at
     from df_private.app_sessions
     where owner_id = $1 and session_id = $2 and status = 'active'
       and revoked_at is null and expires_at > now()
     for update`,
    [ownerId, sessionId],
  );
  const row = result.rows[0];
  if (result.rows.length !== 1 || row?.owner_id !== ownerId || row?.session_id !== sessionId
    || row?.status !== 'active' || row?.revoked_at !== null) {
    throw new SafeBoundaryError(401, 'AUTH_REQUIRED');
  }
}
