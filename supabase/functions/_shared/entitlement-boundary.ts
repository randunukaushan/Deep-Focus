/** Server-only capability admission. Client flags and prices are never trusted. */

export type ServerCapability = 'ai' | 'cloud_resources';
export type ServerEntitlement = {
  ownerId: string;
  capability: ServerCapability;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  verifiedBy: 'server';
  policyVersion: string;
  expiresAt: string | null;
  offerId: string | null;
};

export type CapabilityAdmission =
  | { allowed: true; ownerId: string; capability: ServerCapability; policyVersion: string }
  | { allowed: false; reason: 'invalid_actor' | 'missing_entitlement' | 'owner_mismatch' | 'not_active' | 'expired' | 'invalid_clock' };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function admitServerCapability(input: {
  verifiedActorId: string;
  capability: ServerCapability;
  entitlement: ServerEntitlement | null;
  now: string;
}): CapabilityAdmission {
  if (!UUID.test(input.verifiedActorId)) return { allowed: false, reason: 'invalid_actor' };
  if (!input.entitlement) return { allowed: false, reason: 'missing_entitlement' };
  if (input.entitlement.ownerId !== input.verifiedActorId || input.entitlement.capability !== input.capability) {
    return { allowed: false, reason: 'owner_mismatch' };
  }
  if (!Number.isFinite(Date.parse(input.now))) return { allowed: false, reason: 'invalid_clock' };
  if (input.entitlement.status !== 'active' || input.entitlement.verifiedBy !== 'server'
    || typeof input.entitlement.policyVersion !== 'string'
    || input.entitlement.policyVersion.length < 1 || input.entitlement.policyVersion.length > 64) {
    return { allowed: false, reason: 'not_active' };
  }
  if (input.entitlement.expiresAt !== null && (!Number.isFinite(Date.parse(input.entitlement.expiresAt)) || Date.parse(input.entitlement.expiresAt) <= Date.parse(input.now))) {
    return { allowed: false, reason: 'expired' };
  }
  return { allowed: true, ownerId: input.verifiedActorId, capability: input.capability, policyVersion: input.entitlement.policyVersion };
}
