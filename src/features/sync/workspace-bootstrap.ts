const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type OwnWorkspaceProfile = {
  userId: string;
  workspaceId: string;
  displayName: string;
  version: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === keys.length && actual.every((key, index) => key === keys.slice().sort()[index]);
}

/**
 * Validates the owned `/me` response before any workspace-scoped local or sync
 * operation can use it. The actor comes from the verified session, never from
 * the response body.
 */
export function parseOwnWorkspaceProfile(response: unknown, verifiedUserId: string): OwnWorkspaceProfile {
  if (!UUID.test(verifiedUserId)) throw new RangeError('BOOTSTRAP_ACTOR_INVALID');
  if (!isRecord(response) || !exactKeys(response, ['data']) || !isRecord(response.data)) throw new RangeError('BOOTSTRAP_RESPONSE_INVALID');
  const data = response.data;
  if (!exactKeys(data, ['id', 'displayName', 'personalWorkspaceId', 'version'])) throw new RangeError('BOOTSTRAP_RESPONSE_INVALID');
  if (typeof data.id !== 'string' || !UUID.test(data.id) || data.id.toLowerCase() !== verifiedUserId.toLowerCase()) throw new RangeError('BOOTSTRAP_ACTOR_MISMATCH');
  if (typeof data.personalWorkspaceId !== 'string' || !UUID.test(data.personalWorkspaceId)) throw new RangeError('BOOTSTRAP_WORKSPACE_INVALID');
  if (typeof data.displayName !== 'string' || !data.displayName.trim() || data.displayName.length > 100) throw new RangeError('BOOTSTRAP_PROFILE_INVALID');
  const version = data.version;
  if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1 || version > 2_147_483_647) throw new RangeError('BOOTSTRAP_VERSION_INVALID');
  return { userId: verifiedUserId.toLowerCase(), workspaceId: data.personalWorkspaceId.toLowerCase(), displayName: data.displayName, version };
}
