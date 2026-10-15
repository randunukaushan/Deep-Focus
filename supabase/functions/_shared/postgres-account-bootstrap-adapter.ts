/** Local PostgreSQL adapter for the atomic account bootstrap candidate. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
import type { AccountBootstrapStore, AccountBootstrapTransactionStore, BootstrapProfile, BootstrapSyncHead, BootstrapWorkspace } from './account-bootstrap.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function resultRows(result: unknown): Record<string, unknown>[] {
  if (!result || typeof result !== 'object' || !Array.isArray((result as { rows?: unknown }).rows)
    || !isPlainJsonValueForBoundary((result as { rows: unknown[] }).rows)) dependencyFailure();
  const rows = (result as { rows: unknown[] }).rows;
  if (rows.some((row) => !row || typeof row !== 'object' || Array.isArray(row))) dependencyFailure();
  return rows as Record<string, unknown>[];
}
function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}
function ids(ownerId: unknown, id?: unknown): asserts ownerId is string {
  if (!isUuid(ownerId) || (id !== undefined && !isUuid(id))) invalid();
}

function profile(row: Record<string, unknown>, ownerId: string): BootstrapProfile {
  if (row.owner_id !== ownerId || row.account_state !== 'active' || typeof row.display_name !== 'string'
    || row.display_name.length < 1 || row.display_name.length > 100 || !/\S/.test(row.display_name)
    || !Number.isSafeInteger(row.version) || (row.version as number) < 1) dependencyFailure();
  return { ownerId, displayName: row.display_name, accountState: 'active', version: row.version as number };
}

function workspace(row: Record<string, unknown>, ownerId: string): BootstrapWorkspace {
  if (row.owner_id !== ownerId || !isUuid(row.id) || row.kind !== 'personal') dependencyFailure();
  return { ownerId, workspaceId: row.id, kind: 'personal' };
}

function syncHead(row: Record<string, unknown>, ownerId: string): BootstrapSyncHead {
  if (row.owner_id !== ownerId || typeof row.last_sequence !== 'string' || !/^\d+$/.test(row.last_sequence)) dependencyFailure();
  return { ownerId, lastSequence: row.last_sequence };
}

function createStore(client: PostgresTransactionClient): AccountBootstrapStore {
  return {
    ensureProfile: async ({ ownerId, displayName }) => {
      ids(ownerId);
      if (typeof displayName !== 'string' || displayName.length < 1 || displayName.length > 100 || !/\S/.test(displayName) || /[\u0000-\u001f\u007f]/.test(displayName)) invalid();
      const inserted = await client.query(`insert into df_private.profiles (owner_id, display_name) values ($1, $2) on conflict (owner_id) do nothing returning owner_id, display_name, account_state, version`, [ownerId, displayName]);
      const insertedRows = resultRows(inserted);
      if (insertedRows.length === 0) {
        const existing = await client.query(`select owner_id, display_name, account_state, version from df_private.profiles where owner_id = $1`, [ownerId]);
        const existingRows = resultRows(existing);
        if (existingRows.length !== 1) dependencyFailure();
        return profile(existingRows[0], ownerId);
      }
      if (insertedRows.length !== 1) dependencyFailure();
      return profile(insertedRows[0], ownerId);
    },
    ensurePersonalWorkspace: async ({ ownerId, workspaceId }) => {
      ids(ownerId, workspaceId);
      const inserted = await client.query(`insert into df_private.workspaces (id, owner_id, kind) values ($1, $2, 'personal') on conflict (owner_id) do nothing returning id, owner_id, kind`, [workspaceId, ownerId]);
      const insertedRows = resultRows(inserted);
      if (insertedRows.length === 0) {
        const existing = await client.query(`select id, owner_id, kind from df_private.workspaces where owner_id = $1`, [ownerId]);
        const existingRows = resultRows(existing);
        if (existingRows.length !== 1) dependencyFailure();
        return workspace(existingRows[0], ownerId);
      }
      if (insertedRows.length !== 1) dependencyFailure();
      return workspace(insertedRows[0], ownerId);
    },
    ensureSyncHead: async (ownerId) => {
      ids(ownerId);
      const inserted = await client.query(`insert into df_private.sync_heads (owner_id, last_sequence) values ($1, 0) on conflict (owner_id) do nothing returning owner_id, last_sequence`, [ownerId]);
      const insertedRows = resultRows(inserted);
      if (insertedRows.length === 0) {
        const existing = await client.query(`select owner_id, last_sequence from df_private.sync_heads where owner_id = $1`, [ownerId]);
        const existingRows = resultRows(existing);
        if (existingRows.length !== 1) dependencyFailure();
        return syncHead(existingRows[0], ownerId);
      }
      if (insertedRows.length !== 1) dependencyFailure();
      return syncHead(insertedRows[0], ownerId);
    },
  };
}

export function createPostgresAccountBootstrapStore(input: { runner: PostgresTransactionRunner }): AccountBootstrapTransactionStore {
  if (!input || typeof input !== 'object' || !input.runner || typeof input.runner.withTransaction !== 'function') invalid();
  return { withTransaction: (operation) => {
    if (typeof operation !== 'function') invalid();
    return input.runner.withTransaction((client) => {
      if (!client || typeof client !== 'object' || typeof client.query !== 'function') dependencyFailure();
      return operation(createStore(client));
    });
  } };
}
