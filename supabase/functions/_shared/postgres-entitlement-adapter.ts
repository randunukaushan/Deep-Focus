/** Local PostgreSQL candidate for server-authoritative entitlement reads. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { admitServerCapability, type CapabilityAdmission, type ServerCapability, type ServerEntitlement } from './entitlement-boundary.ts';
import type { PostgresTransactionClient, PostgresTransactionRunner } from './postgres-domain-mutation-adapter.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { recheckPostgresAppSession } from './postgres-session-guard.ts';
// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { isPlainJsonValueForBoundary } from './json-response-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }
function dependencyFailure(): never { throw new SafeBoundaryError(503, 'DEPENDENCY_UNAVAILABLE'); }
function isUuid(value: unknown): value is string { return typeof value === 'string' && UUID.test(value); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function resultRows(result: unknown): unknown[] {
  if (!isRecord(result) || !Array.isArray(result.rows) || !isPlainJsonValueForBoundary(result.rows)) dependencyFailure();
  return result.rows;
}
function validRunner(value: unknown): value is PostgresTransactionRunner {
  return Boolean(value) && typeof value === 'object' && typeof (value as PostgresTransactionRunner).withTransaction === 'function';
}
function requireClient(value: unknown): asserts value is PostgresTransactionClient {
  if (!isRecord(value) || typeof value.query !== 'function') dependencyFailure();
}
function validateReadInput(ownerId: unknown, requestedCapability: unknown, sessionId: unknown): asserts ownerId is string {
  if (!isUuid(ownerId) || (requestedCapability !== 'ai' && requestedCapability !== 'cloud_resources') || !isUuid(sessionId)) invalid();
}

function cap(value: unknown): ServerCapability {
  if (value !== 'ai' && value !== 'cloud_resources') invalid();
  return value;
}

function mapEntitlement(row: unknown, expectedOwnerId: string, expectedCapability: ServerCapability): ServerEntitlement {
  if (!isRecord(row) || !isUuid(row.owner_id) || (row.capability !== 'ai' && row.capability !== 'cloud_resources')
    || row.owner_id !== expectedOwnerId || row.capability !== expectedCapability
    || (row.status !== 'pending' && row.status !== 'active' && row.status !== 'grace' && row.status !== 'expired' && row.status !== 'revoked') || row.verified_by !== 'server'
    || typeof row.policy_version !== 'string' || row.policy_version.length < 1 || row.policy_version.length > 64
    || (row.expires_at !== null && (typeof row.expires_at !== 'string' || !Number.isFinite(Date.parse(row.expires_at))))
    || (row.offer_id !== null && typeof row.offer_id !== 'string')) dependencyFailure();
  return { ownerId: row.owner_id, capability: row.capability as ServerCapability, status: row.status as ServerEntitlement['status'], verifiedBy: 'server', policyVersion: row.policy_version, expiresAt: row.expires_at as string | null, offerId: row.offer_id as string | null };
}

export async function readPostgresEntitlement(client: PostgresTransactionClient, ownerId: string, requestedCapability: ServerCapability, sessionId: string): Promise<ServerEntitlement | null> {
  validateReadInput(ownerId, requestedCapability, sessionId);
  requireClient(client);
  await recheckPostgresAppSession(client, ownerId, sessionId);
  const result = await client.query(`select owner_id, capability, status, verified_by, policy_version, expires_at, offer_id from df_private.server_entitlements where owner_id = $1 and capability = $2`, [ownerId, cap(requestedCapability)]);
  const rows = resultRows(result);
  if (rows.length === 0) return null;
  if (rows.length !== 1) dependencyFailure();
  return mapEntitlement(rows[0], ownerId, cap(requestedCapability));
}

export function createPostgresEntitlementReader(input: { runner: PostgresTransactionRunner }): { readEntitlement: (ownerId: string, capability: ServerCapability, sessionId: string) => Promise<ServerEntitlement | null> } {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  return {
    readEntitlement: async (ownerId, requestedCapability, sessionId) => {
      validateReadInput(ownerId, requestedCapability, sessionId);
      return input.runner.withTransaction((client) => readPostgresEntitlement(client, ownerId, requestedCapability, sessionId));
    },
  };
}

export function createPostgresCapabilityAdmission(input: { runner: PostgresTransactionRunner }): {
  admit: (verifiedActorId: string, capability: ServerCapability, now: string, sessionId: string) => Promise<CapabilityAdmission>;
} {
  if (!input || typeof input !== 'object' || !validRunner(input.runner)) invalid();
  const reader = createPostgresEntitlementReader(input);
  return {
    admit: async (verifiedActorId, capability, now, sessionId) => {
      validateReadInput(verifiedActorId, capability, sessionId);
      return admitServerCapability({ verifiedActorId, capability, entitlement: await reader.readEntitlement(verifiedActorId, capability, sessionId), now });
    },
  };
}
