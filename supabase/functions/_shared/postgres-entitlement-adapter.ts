/** Local PostgreSQL candidate for server-authoritative entitlement reads. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { admitServerCapability, type CapabilityAdmission, type ServerCapability, type ServerEntitlement } from './entitlement-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }

function cap(value: unknown): ServerCapability {
  if (value !== 'ai' && value !== 'cloud_resources') invalid();
  return value;
}

function mapEntitlement(row: Record<string, unknown>, expectedOwnerId: string, expectedCapability: ServerCapability): ServerEntitlement {
  if (typeof row.owner_id !== 'string' || !UUID.test(row.owner_id) || !['ai', 'cloud_resources'].includes(String(row.capability))
    || row.owner_id !== expectedOwnerId || row.capability !== expectedCapability
    || !['pending', 'active', 'expired', 'revoked'].includes(String(row.status)) || row.verified_by !== 'server'
    || typeof row.policy_version !== 'string' || row.policy_version.length < 1 || row.policy_version.length > 64
    || (row.expires_at !== null && typeof row.expires_at !== 'string')
    || (row.offer_id !== null && typeof row.offer_id !== 'string')) dependencyFailure();
  return { ownerId: row.owner_id, capability: row.capability as ServerCapability, status: row.status as ServerEntitlement['status'], verifiedBy: 'server', policyVersion: row.policy_version, expiresAt: row.expires_at as string | null, offerId: row.offer_id as string | null };
}

export async function readPostgresEntitlement(client: PostgresTransactionClient, ownerId: string, requestedCapability: ServerCapability, sessionId: string): Promise<ServerEntitlement | null> {
  if (!UUID.test(ownerId)) invalid();
  await recheckPostgresAppSession(client, ownerId, sessionId);
  const result = await client.query(`select owner_id, capability, status, verified_by, policy_version, expires_at, offer_id from df_private.server_entitlements where owner_id = $1 and capability = $2`, [ownerId, cap(requestedCapability)]);
  return result.rows.length === 0 ? null : mapEntitlement(result.rows[0], ownerId, cap(requestedCapability));
}

export function createPostgresEntitlementReader(input: { runner: PostgresTransactionRunner }): { readEntitlement: (ownerId: string, capability: ServerCapability, sessionId: string) => Promise<ServerEntitlement | null> } {
  return {
    readEntitlement: (ownerId, requestedCapability, sessionId) => input.runner.withTransaction((client) => readPostgresEntitlement(client, ownerId, requestedCapability, sessionId)),
  };
}

export function createPostgresCapabilityAdmission(input: { runner: PostgresTransactionRunner }): {
  admit: (verifiedActorId: string, capability: ServerCapability, now: string, sessionId: string) => Promise<CapabilityAdmission>;
} {
  const reader = createPostgresEntitlementReader(input);
  return {
    admit: async (verifiedActorId, capability, now, sessionId) => admitServerCapability({
      verifiedActorId,
      capability,
      entitlement: await reader.readEntitlement(verifiedActorId, capability, sessionId),
      now,
    }),
  };
}
