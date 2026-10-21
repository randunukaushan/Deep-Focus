/** Local candidate for atomic account profile/workspace/sync-head bootstrap. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type BootstrapProfile = { ownerId: string; displayName: string; accountState: 'active'; version: number };
export type BootstrapWorkspace = { ownerId: string; workspaceId: string; kind: 'personal' };
export type BootstrapSyncHead = { ownerId: string; lastSequence: string };
export type AccountBootstrap = { profile: BootstrapProfile; workspace: BootstrapWorkspace; syncHead: BootstrapSyncHead };

export type AccountBootstrapStore = {
  ensureProfile: (input: { ownerId: string; displayName: string }) => Promise<BootstrapProfile>;
  ensurePersonalWorkspace: (input: { ownerId: string; workspaceId: string }) => Promise<BootstrapWorkspace>;
  ensureSyncHead: (ownerId: string) => Promise<BootstrapSyncHead>;
};

export type AccountBootstrapTransactionStore = {
  withTransaction: <T>(operation: (store: AccountBootstrapStore) => Promise<T>) => Promise<T>;
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function validDisplayName(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= 100 && /\S/.test(value) && !/[\u0000-\u001f\u007f]/.test(value);
}

function validateResult(result: AccountBootstrap): AccountBootstrap {
  if (!result || typeof result !== 'object' || !result.profile || !result.workspace || !result.syncHead
    || !isUuid(result.profile.ownerId) || !isUuid(result.workspace.ownerId) || !isUuid(result.syncHead.ownerId)
    || result.profile.ownerId !== result.workspace.ownerId || result.workspace.ownerId !== result.syncHead.ownerId
    || !isUuid(result.workspace.workspaceId) || result.workspace.kind !== 'personal'
    || !validDisplayName(result.profile.displayName) || result.profile.accountState !== 'active'
    || !Number.isSafeInteger(result.profile.version) || result.profile.version < 1
    || typeof result.syncHead.lastSequence !== 'string' || !/^\d+$/.test(result.syncHead.lastSequence)) dependencyFailure();
  return result;
}

/**
 * Creates the account foundation once and returns the canonical existing rows
 * on an idempotent retry. Existing profile names/workspace IDs are never
 * overwritten by a retry using a newly generated candidate ID.
 */
export async function bootstrapAccountTransactionally(input: {
  ownerId: string;
  workspaceId: string;
  displayName: string;
  store: AccountBootstrapTransactionStore;
}): Promise<AccountBootstrap> {
  if (!isUuid(input.ownerId) || !isUuid(input.workspaceId) || !validDisplayName(input.displayName)) invalid();
  return input.store.withTransaction(async (store) => {
    const profile = await store.ensureProfile({ ownerId: input.ownerId, displayName: input.displayName });
    const workspace = await store.ensurePersonalWorkspace({ ownerId: input.ownerId, workspaceId: input.workspaceId });
    const syncHead = await store.ensureSyncHead(input.ownerId);
    return validateResult({ profile, workspace, syncHead });
  });
}
