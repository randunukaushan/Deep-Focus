/** Local PostgreSQL candidate for app-session registry and revocation outbox persistence. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
import type { AppSessionRecord, AppSessionStore, AppSessionTransactionStore } from './app-session.ts';
import type { SessionRevocationOutbox, SessionRevocationTransactionStore } from './app-session-revocation.ts';
import type { SessionRevocationPlanStore, SessionRevocationPlanTransaction, SessionRevocationReceipt } from './app-session-revocation-plan.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isTimestamp(value: unknown): value is string { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function queryRows(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure();
  return result.rows;
}

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function record(row: unknown, expected: { ownerId: string; sessionId: string }): AppSessionRecord {
  if (!isRecord(row)) dependencyFailure();
  const issuedAt = typeof row.issued_at === 'string' ? Date.parse(row.issued_at) : Number.NaN;
  const expiresAt = typeof row.expires_at === 'string' ? Date.parse(row.expires_at) : Number.NaN;
  const revokedAt = row.revoked_at === null ? null : typeof row.revoked_at === 'string' ? Date.parse(row.revoked_at) : Number.NaN;
  if (row.owner_id !== expected.ownerId || row.session_id !== expected.sessionId
    || !isUuid(row.owner_id) || !isUuid(row.session_id)
    || !['active', 'revoked'].includes(String(row.status)) || !isTimestamp(row.expires_at) || !isTimestamp(row.issued_at)
    || !Number.isFinite(issuedAt) || !Number.isFinite(expiresAt) || expiresAt <= issuedAt
    || ((row.status === 'revoked') !== (row.revoked_at !== null))
    || (revokedAt !== null && (!Number.isFinite(revokedAt) || revokedAt < issuedAt))) dependencyFailure();
  return { ownerId: row.owner_id, sessionId: row.session_id, issuedAt: row.issued_at, status: row.status as AppSessionRecord['status'], expiresAt: row.expires_at, revokedAt: row.revoked_at as string | null };
}

function validateIds(ownerId: unknown, sessionId: unknown): asserts ownerId is string { if (!isUuid(ownerId) || !isUuid(sessionId)) invalid(); }

function receipt(row: Record<string, unknown>, expected: { ownerId: string; mutationId: string }): SessionRevocationReceipt {
  if (row.owner_id !== expected.ownerId || row.mutation_id !== expected.mutationId
    || !isUuid(row.owner_id)
    || !isUuid(row.mutation_id)
    || typeof row.request_sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(row.request_sha256)
    || !Array.isArray(row.session_ids) || !isPlainJsonValueForBoundary(row.session_ids) || row.session_ids.some((value) => !isUuid(value))
    || new Set(row.session_ids).size !== row.session_ids.length
    || typeof row.current_session_revoked !== 'boolean'
    || !['pending', 'confirmed', 'needs_retry'].includes(String(row.provider_revocation_status))) dependencyFailure();
  return {
    ownerId: row.owner_id,
    mutationId: row.mutation_id,
    requestSha256: row.request_sha256,
    sessionIds: row.session_ids,
    currentSessionRevoked: row.current_session_revoked,
    providerRevocationStatus: row.provider_revocation_status as SessionRevocationReceipt['providerRevocationStatus'],
  };
}

function createStore(client: PostgresTransactionClient): AppSessionStore {
  if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
  return {
    loadSession: async (ownerId, sessionId) => {
      validateIds(ownerId, sessionId);
      const result = await client.query(`select owner_id, session_id, status, issued_at, expires_at, revoked_at from df_private.app_sessions where owner_id = $1 and session_id = $2`, [ownerId, sessionId]);
      const rows = queryRows(result);
      if (rows.length > 1) dependencyFailure();
      return rows.length === 0 ? null : record(rows[0], { ownerId, sessionId });
    },
    insertSession: async (input) => {
      validateIds(input.ownerId, input.sessionId);
      if (!isTimestamp(input.expiresAt) || !isTimestamp(input.issuedAt) || Date.parse(input.expiresAt) <= Date.parse(input.issuedAt)) invalid();
      const inserted = await client.query(
        `insert into df_private.app_sessions (session_id, owner_id, issued_at, expires_at, status, revoked_at)
         values ($1, $2, $3, $4, 'active', null)
         on conflict (owner_id, session_id) do nothing
         returning owner_id, session_id, status, issued_at, expires_at, revoked_at`,
        [input.sessionId, input.ownerId, input.issuedAt, input.expiresAt],
      );
      const rows = queryRows(inserted);
      if (rows.length === 1) return record(rows[0], { ownerId: input.ownerId, sessionId: input.sessionId });
      if (rows.length !== 0) dependencyFailure();
      const existing = await client.query(`select owner_id, session_id, status, issued_at, expires_at, revoked_at from df_private.app_sessions where owner_id = $1 and session_id = $2 for update`, [input.ownerId, input.sessionId]);
      const existingRows = queryRows(existing);
      if (existingRows.length !== 1) dependencyFailure();
      return record(existingRows[0], { ownerId: input.ownerId, sessionId: input.sessionId });
    },
    revokeSession: async (input) => {
      validateIds(input.ownerId, input.sessionId);
      const result = await client.query<{ owner_id: string; session_id: string; status: string }>(`update df_private.app_sessions set status = 'revoked', revoked_at = $3, updated_at = now() where owner_id = $1 and session_id = $2 and status = 'active' and revoked_at is null returning owner_id, session_id, status`, [input.ownerId, input.sessionId, input.revokedAt]);
      const rows = queryRows(result);
      if (rows.length !== 1 || !isRecord(rows[0]) || rows[0].owner_id !== input.ownerId || rows[0].session_id !== input.sessionId || rows[0].status !== 'revoked') throw new SafeBoundaryError(409, 'INVALID_TRANSITION');
    },
  };
}

export function createPostgresAppSessionStore(input: { runner: PostgresTransactionRunner }): AppSessionTransactionStore {
  if (!input || typeof input !== 'object' || !input.runner || typeof input.runner !== 'object' || typeof input.runner.withTransaction !== 'function') invalid();
  return { withTransaction: (operation) => {
    if (typeof operation !== 'function') invalid();
    return input.runner.withTransaction((client) => operation(createStore(client)));
  } };
}

export function createPostgresSessionRevocationStore(input: { runner: PostgresTransactionRunner }): SessionRevocationTransactionStore {
  if (!input || typeof input !== 'object' || !input.runner || typeof input.runner !== 'object' || typeof input.runner.withTransaction !== 'function') invalid();
  return {
    withTransaction: (operation) => {
      if (typeof operation !== 'function') invalid();
      return input.runner.withTransaction(async (client) => {
      const sessions = createStore(client);
      const store: SessionRevocationOutbox = {
        loadSession: async (ownerId, sessionId) => {
          validateIds(ownerId, sessionId);
          const result = await client.query(`select owner_id, session_id, status, issued_at, expires_at, revoked_at from df_private.app_sessions where owner_id = $1 and session_id = $2 for update`, [ownerId, sessionId]);
          const rows = queryRows(result);
          if (rows.length > 1) dependencyFailure();
          return rows.length === 0 ? null : record(rows[0], { ownerId, sessionId });
        },
        revokeSession: sessions.revokeSession,
        enqueueProviderRevocation: async ({ revocationId, ownerId, sessionId }) => {
          validateIds(ownerId, sessionId);
          if (!isUuid(revocationId)) invalid();
          const result = await client.query<{ revocation_id: string; owner_id: string; session_id: string }>(`insert into df_private.app_session_revocation_outbox (revocation_id, owner_id, session_id) values ($1, $2, $3) on conflict (owner_id, session_id) do nothing returning revocation_id, owner_id, session_id`, [revocationId, ownerId, sessionId]);
          const rows = queryRows(result);
          if (rows.length === 1) {
            if (!isRecord(rows[0]) || rows[0].revocation_id !== revocationId || rows[0].owner_id !== ownerId || rows[0].session_id !== sessionId) dependencyFailure();
            return 'created';
          }
          return 'existing';
        },
      };
      return operation(store);
      });
    },
  };
}

/** Local adapter for the account-session one/others/all revocation candidate. */
export function createPostgresAccountSessionRevocationStore(input: { runner: PostgresTransactionRunner }): SessionRevocationPlanTransaction {
  if (!input || typeof input !== 'object' || !input.runner || typeof input.runner !== 'object' || typeof input.runner.withTransaction !== 'function') invalid();
  return {
    withTransaction: (operation) => {
      if (typeof operation !== 'function') invalid();
      return input.runner.withTransaction(async (client) => {
      const sessions = createStore(client);
      const store: SessionRevocationPlanStore = {
        listSessions: async (ownerId) => {
          if (!isUuid(ownerId)) invalid();
          const result = await client.query(`select owner_id, session_id, status, issued_at, expires_at, revoked_at from df_private.app_sessions where owner_id = $1 order by issued_at desc, session_id desc for update`, [ownerId]);
          return queryRows(result).map((row) => {
            if (!isRecord(row) || typeof row.session_id !== 'string') dependencyFailure();
            return record(row, { ownerId, sessionId: row.session_id });
          });
        },
        loadReceipt: async ({ ownerId, mutationId }) => {
          if (!isUuid(ownerId) || !isUuid(mutationId)) invalid();
          const result = await client.query(`select owner_id, mutation_id, request_sha256, session_ids, current_session_revoked, provider_revocation_status from df_private.app_session_revocation_receipts where owner_id = $1 and mutation_id = $2 for update`, [ownerId, mutationId]);
          const rows = queryRows(result);
          if (rows.length === 0) return null;
          if (rows.length > 1) dependencyFailure();
          if (!isRecord(rows[0])) dependencyFailure();
          return receipt(rows[0], { ownerId, mutationId });
        },
        saveReceipt: async (value) => {
          if (!isUuid(value.ownerId) || !isUuid(value.mutationId) || typeof value.requestSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.requestSha256)
            || !Array.isArray(value.sessionIds) || !isPlainJsonValueForBoundary(value.sessionIds) || value.sessionIds.some((sessionId) => !isUuid(sessionId))
            || new Set(value.sessionIds).size !== value.sessionIds.length
            || typeof value.currentSessionRevoked !== 'boolean'
            || !['pending', 'confirmed', 'needs_retry'].includes(value.providerRevocationStatus)) invalid();
          const result = await client.query(`insert into df_private.app_session_revocation_receipts (owner_id, mutation_id, request_sha256, session_ids, current_session_revoked, provider_revocation_status) values ($1, $2, $3, $4::jsonb, $5, $6) on conflict (owner_id, mutation_id) do nothing returning owner_id, mutation_id, request_sha256, session_ids, current_session_revoked, provider_revocation_status`, [value.ownerId, value.mutationId, value.requestSha256, JSON.stringify(value.sessionIds), value.currentSessionRevoked, value.providerRevocationStatus]);
          const rows = queryRows(result);
          if (rows.length === 1) {
            if (!isRecord(rows[0])) dependencyFailure();
            const stored = receipt(rows[0], { ownerId: value.ownerId, mutationId: value.mutationId });
            if (stored.requestSha256 !== value.requestSha256
              || stored.sessionIds.length !== value.sessionIds.length
              || stored.sessionIds.some((sessionId, index) => sessionId !== value.sessionIds[index])
              || stored.currentSessionRevoked !== value.currentSessionRevoked
              || stored.providerRevocationStatus !== value.providerRevocationStatus) dependencyFailure();
            return undefined;
          }
          if (rows.length !== 0) dependencyFailure();
          const existingResult = await client.query(`select owner_id, mutation_id, request_sha256, session_ids, current_session_revoked, provider_revocation_status from df_private.app_session_revocation_receipts where owner_id = $1 and mutation_id = $2 for update`, [value.ownerId, value.mutationId]);
          const existingRows = queryRows(existingResult);
          if (existingRows.length !== 1 || !isRecord(existingRows[0])) dependencyFailure();
          const existing = receipt(existingRows[0], { ownerId: value.ownerId, mutationId: value.mutationId });
          if (existing.requestSha256 !== value.requestSha256) throw new SafeBoundaryError(409, 'IDEMPOTENCY_CONFLICT');
          return existing;
        },
        enqueueProviderRevocation: async ({ revocationId, ownerId, sessionId }) => {
          validateIds(ownerId, sessionId);
          if (!isUuid(revocationId)) invalid();
          const result = await client.query<{ revocation_id: string; owner_id: string; session_id: string }>(`insert into df_private.app_session_revocation_outbox (revocation_id, owner_id, session_id) values ($1, $2, $3) on conflict (owner_id, session_id) do nothing returning revocation_id, owner_id, session_id`, [revocationId, ownerId, sessionId]);
          const rows = queryRows(result);
          if (rows.length === 1) {
            if (!isRecord(rows[0]) || rows[0].revocation_id !== revocationId || rows[0].owner_id !== ownerId || rows[0].session_id !== sessionId) dependencyFailure();
            return 'created';
          }
          return 'existing';
        },
        revokeSession: sessions.revokeSession,
      };
      return operation(store);
      });
    },
  };
}
