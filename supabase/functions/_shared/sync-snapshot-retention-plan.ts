/** Non-destructive retention planner for expired snapshot staging data. */

// @ts-expect-error The Edge runtime and domain test loader resolve TypeScript modules directly.
import { SafeBoundaryError } from './server-boundary.ts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATES = new Set(['building', 'ready', 'expired', 'failed']);

export type SnapshotRetentionCandidate = {
  ownerId: string;
  snapshotId: string;
  status: 'building' | 'ready' | 'expired' | 'failed';
  expiresAt: string;
};

export type SnapshotRetentionAction = {
  ownerId: string;
  snapshotId: string;
  action: 'mark_expired' | 'delete_expired';
  reason: 'expired';
};

function invalid(): never { throw new SafeBoundaryError(422, 'VALIDATION_FAILED'); }

/**
 * Produces an owner-bound plan only. The caller must apply it through a
 * reviewed transaction and retention policy; this function never deletes data.
 */
export function planSyncSnapshotRetention(input: {
  ownerId: string;
  now: string;
  candidates: unknown;
  maxItems?: number;
}): SnapshotRetentionAction[] {
  const maxItems = input.maxItems ?? 100;
  if (!UUID.test(input.ownerId) || !Number.isFinite(Date.parse(input.now))
    || !Number.isSafeInteger(maxItems) || maxItems < 1 || maxItems > 100) invalid();
  if (!Array.isArray(input.candidates) || input.candidates.length > maxItems) invalid();
  const seen = new Set<string>();
  const actions: SnapshotRetentionAction[] = [];
  for (const value of input.candidates) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
    const candidate = value as Partial<SnapshotRetentionCandidate>;
    if (candidate.ownerId !== input.ownerId || typeof candidate.snapshotId !== 'string' || !UUID.test(candidate.snapshotId)
      || typeof candidate.status !== 'string' || !STATES.has(candidate.status)
      || typeof candidate.expiresAt !== 'string' || !Number.isFinite(Date.parse(candidate.expiresAt))) invalid();
    if (seen.has(candidate.snapshotId)) invalid();
    seen.add(candidate.snapshotId);
    if (Date.parse(candidate.expiresAt) > Date.parse(input.now)) continue;
    actions.push({ ownerId: input.ownerId, snapshotId: candidate.snapshotId, action: candidate.status === 'expired' ? 'delete_expired' : 'mark_expired', reason: 'expired' });
  }
  return actions;
}
