import { decideCapabilityAccess, type VerifiedEntitlement } from '@/features/monetization/entitlement-policy';

export type CloudResourceSelection = {
  ownerId: string;
  resourceId: string;
  resourceRevision: number;
  selectedAt: string;
  consent: 'granted' | 'missing';
};

export type CloudUploadIntent = {
  ownerId: string;
  resourceId: string;
  resourceRevision: number;
  operationId: string;
};

export type CloudUploadDecision =
  | { ready: true; intent: CloudUploadIntent }
  | { ready: false; reason: 'invalid_selection' | 'selection_required' | 'consent_required' | 'entitlement_denied' };

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Date.parse(value));
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 128 && !/[\u0000-\u001f\u007f]/.test(value);
}

/** Creates only a user-selected upload intent; it does not read bytes or contact a provider. */
export function prepareCloudUploadIntent(
  selection: CloudResourceSelection | null,
  entitlement: VerifiedEntitlement | null,
  verifiedOwnerId: string,
  now: string,
): CloudUploadDecision {
  if (!selection) return { ready: false, reason: 'selection_required' };
  if (!validId(selection.ownerId) || selection.ownerId !== verifiedOwnerId || !validId(selection.resourceId)
    || !Number.isSafeInteger(selection.resourceRevision) || selection.resourceRevision < 1
    || !validTimestamp(selection.selectedAt) || !validTimestamp(now) || Date.parse(selection.selectedAt) > Date.parse(now)) {
    return { ready: false, reason: 'invalid_selection' };
  }
  if (selection.consent !== 'granted') return { ready: false, reason: 'consent_required' };
  const access = decideCapabilityAccess('cloud_resources', verifiedOwnerId, entitlement, now);
  if (!access.allowed) return { ready: false, reason: 'entitlement_denied' };
  return {
    ready: true,
    intent: {
      ownerId: verifiedOwnerId,
      resourceId: selection.resourceId.trim(),
      resourceRevision: selection.resourceRevision,
      operationId: `cloud-resource:${verifiedOwnerId}:${selection.resourceId.trim()}:${selection.resourceRevision}:${selection.selectedAt}`,
    },
  };
}

/** Sandbox boundary: live upload, billing and storage provider access are disabled. */
export function createDisabledCloudResourceAdapter() {
  return {
    async upload(_intent: CloudUploadIntent): Promise<never> {
      throw new Error('CLOUD_RESOURCES_NOT_CONFIGURED: upload is disabled');
    },
    async download(_ownerId: string, _resourceId: string, _revision: number): Promise<never> {
      throw new Error('CLOUD_RESOURCES_NOT_CONFIGURED: download is disabled');
    },
  };
}
