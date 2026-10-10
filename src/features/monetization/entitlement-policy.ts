export type PremiumCapability = 'ai' | 'cloud_resources';
export type EntitlementStatus = 'none' | 'pending' | 'active' | 'expired' | 'revoked';

export type VerifiedEntitlement = {
  ownerId: string;
  capability: PremiumCapability;
  status: EntitlementStatus;
  verifiedBy: 'server' | 'none';
  policyVersion: string;
  expiresAt: string | null;
  offerId: string | null;
};

export type EntitlementDecision = {
  allowed: boolean;
  reason: 'core_capability' | 'server_verified' | 'missing_entitlement' | 'owner_mismatch' | 'not_server_verified' | 'not_active' | 'expired' | 'invalid_clock';
};

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

/**
 * Pure access decision only. It does not verify a JWT, call a billing provider,
 * or grant an entitlement; trusted server/auth code must supply the owner and
 * verified entitlement record.
 */
export function decideCapabilityAccess(
  capability: PremiumCapability | 'core_focus',
  verifiedOwnerId: string,
  entitlement: VerifiedEntitlement | null,
  now: string,
): EntitlementDecision {
  if (capability === 'core_focus') return { allowed: true, reason: 'core_capability' };
  if (!validTimestamp(now)) return { allowed: false, reason: 'invalid_clock' };
  if (!entitlement) return { allowed: false, reason: 'missing_entitlement' };
  if (entitlement.ownerId !== verifiedOwnerId) return { allowed: false, reason: 'owner_mismatch' };
  if (entitlement.verifiedBy !== 'server') return { allowed: false, reason: 'not_server_verified' };
  if (entitlement.status !== 'active') return { allowed: false, reason: 'not_active' };
  if (entitlement.expiresAt !== null && (!validTimestamp(entitlement.expiresAt) || Date.parse(entitlement.expiresAt) <= Date.parse(now))) {
    return { allowed: false, reason: 'expired' };
  }
  return { allowed: true, reason: 'server_verified' };
}

/** Local-only placeholder: no purchase, charge or premium grant is possible. */
export function createSandboxEntitlementProvider() {
  return {
    async load(_ownerId: string, capability: PremiumCapability): Promise<VerifiedEntitlement> {
      return { ownerId: _ownerId, capability, status: 'none', verifiedBy: 'none', policyVersion: 'sandbox-unconfigured', expiresAt: null, offerId: null };
    },
    async startPurchase(): Promise<never> {
      throw new Error('BILLING_NOT_CONFIGURED: live purchase is disabled');
    },
    async restore(): Promise<never> {
      throw new Error('BILLING_NOT_CONFIGURED: restore is disabled');
    },
  };
}
