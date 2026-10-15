const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type BootstrappedAccount = {
  ownerId: string;
  displayName: string;
  profileVersion: number;
  workspaceId: string;
  syncLastSequence: string;
};

type BootstrapRemoteClient = {
  request<T>(path: string, options: {
    method: 'POST';
    body: { displayName: string };
    idempotencyKey: string;
  }): Promise<T>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index]);
}

function validDisplayName(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 1 && value.length <= 100
    && /\S/.test(value) && !/[\u0000-\u001f\u007f]/.test(value);
}

function validVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 && value <= 2_147_483_647;
}

/**
 * Validates only the account bootstrap response belonging to the already
 * provider-verified local user. Server identity remains authoritative.
 */
export function parseBootstrappedAccount(response: unknown, verifiedUserId: string): BootstrappedAccount {
  if (!UUID.test(verifiedUserId)) throw new RangeError('BOOTSTRAP_ACTOR_INVALID');
  if (!isRecord(response) || !exactKeys(response, ['data']) || !isRecord(response.data)) throw new RangeError('BOOTSTRAP_RESPONSE_INVALID');
  const account = response.data;
  if (!exactKeys(account, ['profile', 'workspace', 'syncHead'])
    || !isRecord(account.profile) || !isRecord(account.workspace) || !isRecord(account.syncHead)) {
    throw new RangeError('BOOTSTRAP_RESPONSE_INVALID');
  }
  const { profile, workspace, syncHead } = account;
  if (!exactKeys(profile, ['ownerId', 'displayName', 'accountState', 'version'])
    || !exactKeys(workspace, ['ownerId', 'workspaceId', 'kind'])
    || !exactKeys(syncHead, ['ownerId', 'lastSequence'])) throw new RangeError('BOOTSTRAP_RESPONSE_INVALID');
  if (profile.ownerId !== verifiedUserId || workspace.ownerId !== verifiedUserId || syncHead.ownerId !== verifiedUserId) {
    throw new RangeError('BOOTSTRAP_ACTOR_MISMATCH');
  }
  if (!validDisplayName(profile.displayName) || profile.accountState !== 'active' || !validVersion(profile.version)
    || typeof workspace.workspaceId !== 'string' || !UUID.test(workspace.workspaceId) || workspace.kind !== 'personal'
    || typeof syncHead.lastSequence !== 'string' || !/^\d+$/.test(syncHead.lastSequence)) {
    throw new RangeError('BOOTSTRAP_RESPONSE_INVALID');
  }
  return {
    ownerId: verifiedUserId.toLowerCase(),
    displayName: profile.displayName,
    profileVersion: profile.version,
    workspaceId: workspace.workspaceId.toLowerCase(),
    syncLastSequence: syncHead.lastSequence,
  };
}

/** Sends one explicit display-name choice; it never sends a client owner ID. */
export async function bootstrapOwnAccount(
  client: BootstrapRemoteClient,
  input: { verifiedUserId: string; displayName: string; idempotencyKey: string },
): Promise<BootstrappedAccount> {
  if (!validDisplayName(input.displayName)) throw new RangeError('BOOTSTRAP_DISPLAY_NAME_INVALID');
  if (!UUID.test(input.idempotencyKey)) throw new RangeError('BOOTSTRAP_IDEMPOTENCY_KEY_INVALID');
  const response = await client.request<unknown>('/v1/account/bootstrap', {
    method: 'POST', body: { displayName: input.displayName }, idempotencyKey: input.idempotencyKey,
  });
  return parseBootstrappedAccount(response, input.verifiedUserId);
}
