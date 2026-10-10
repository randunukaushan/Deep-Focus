/** Local PostgreSQL candidate for app-session registry and revocation outbox persistence. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { AppSessionRecord, AppSessionStore, AppSessionTransactionStore } from './app-session.ts';
import type { SessionRevocationOutbox, SessionRevocationTransactionStore } from './app-session-revocation.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function record(row: Record<string, unknown>, expected: { ownerId: string; sessionId: string }): AppSessionRecord {
  if (row.owner_id !== expected.ownerId || row.session_id !== expected.sessionId
    || typeof row.owner_id !== 'string' || !UUID.test(row.owner_id) || typeof row.session_id !== 'string' || !UUID.test(row.session_id)
    || !['active', 'revoked'].includes(String(row.status)) || typeof row.expires_at !== 'string' || typeof row.issued_at !== 'string'
    || (row.revoked_at !== null && typeof row.revoked_at !== 'string')) dependencyFailure();
  return { ownerId: row.owner_id, sessionId: row.session_id, issuedAt: row.issued_at, status: row.status as AppSessionRecord['status'], expiresAt: row.expires_at, revokedAt: row.revoked_at as string | null };
}

function validateIds(ownerId: string, sessionId: string): void { if (!UUID.test(ownerId) || !UUID.test(sessionId)) invalid(); }

function createStore(client: PostgresTransactionClient): AppSessionStore {
  return {
    loadSession: async (ownerId, sessionId) => {
      validateIds(ownerId, sessionId);
      const result = await client.query(`select owner_id, session_id, status, issued_at, expires_at, revoked_at from df_private.app_sessions where owner_id = $1 and session_id = $2`, [ownerId, sessionId]);
      return result.rows.length === 0 ? null : record(result.rows[0], { ownerId, sessionId });
    },
    insertSession: async (input) => {
      validateIds(input.ownerId, input.sessionId);
      if (!Number.isFinite(Date.parse(input.expiresAt))) invalid();
      if (!Number.isFinite(Date.parse(input.issuedAt)) || Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) invalid();
      const inserted = await client.query<{ owner_id: string; session_id: string }>(
        `insert into df_private.app_sessions (session_id, owner_id, issued_at, expires_at, status, revoked_at)
         values ($1, $2, $3, $4, 'active', null)
         returning owner_id, session_id`,
        [input.sessionId, input.ownerId, input.issuedAt, input.expiresAt],
      );
      if (inserted.rows.length !== 1 || inserted.rows[0]?.owner_id !== input.ownerId || inserted.rows[0]?.session_id !== input.sessionId) dependencyFailure();
    },
    revokeSession: async (input) => {
      validateIds(input.ownerId, input.sessionId);
      const result = await client.query<{ owner_id: string; session_id: string; status: string }>(`update df_private.app_sessions set status = 'revoked', revoked_at = $3, updated_at = now() where owner_id = $1 and session_id = $2 and status = 'active' and revoked_at is null returning owner_id, session_id, status`, [input.ownerId, input.sessionId, input.revokedAt]);
      if (result.rows.length !== 1 || result.rows[0]?.owner_id !== input.ownerId || result.rows[0]?.session_id !== input.sessionId || result.rows[0]?.status !== 'revoked') throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
    },
  };
}

export function createPostgresAppSessionStore(input: { runner: PostgresTransactionRunner }): AppSessionTransactionStore {
  return { withTransaction: (operation) => input.runner.withTransaction((client) => operation(createStore(client))) };
}

export function createPostgresSessionRevocationStore(input: { runner: PostgresTransactionRunner }): SessionRevocationTransactionStore {
  return {
    withTransaction: (operation) => input.runner.withTransaction(async (client) => {
      const sessions = createStore(client);
      const store: SessionRevocationOutbox = {
        loadSession: async (ownerId, sessionId) => {
          validateIds(ownerId, sessionId);
          const result = await client.query(`select owner_id, session_id, status, issued_at, expires_at, revoked_at from df_private.app_sessions where owner_id = $1 and session_id = $2 for update`, [ownerId, sessionId]);
          return result.rows.length === 0 ? null : record(result.rows[0], { ownerId, sessionId });
        },
        revokeSession: sessions.revokeSession,
        enqueueProviderRevocation: async ({ revocationId, ownerId, sessionId }) => {
          validateIds(ownerId, sessionId);
          if (!UUID.test(revocationId)) invalid();
          const result = await client.query<{ revocation_id: string; owner_id: string; session_id: string }>(`insert into df_private.app_session_revocation_outbox (revocation_id, owner_id, session_id) values ($1, $2, $3) on conflict (owner_id, session_id) do nothing returning revocation_id, owner_id, session_id`, [revocationId, ownerId, sessionId]);
          if (result.rows.length === 1) {
            if (result.rows[0]?.revocation_id !== revocationId || result.rows[0]?.owner_id !== ownerId || result.rows[0]?.session_id !== sessionId) dependencyFailure();
            return 'created';
          }
          return 'existing';
        },
      };
      return operation(store);
    }),
  };
}
