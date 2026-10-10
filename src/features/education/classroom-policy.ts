// @ts-expect-error The bundled domain test runner imports TypeScript modules directly.
import { decideAgeSensitiveAccess, type AgeBand } from '../policy/age-eligibility.ts';

export type ClassroomInvite = {
  inviteId: string;
  classId: string;
  state: 'issued' | 'consumed' | 'revoked' | 'expired';
  expiresAt: string;
  token: string | null;
  version: number;
};

export type InvitePreview = {
  available: boolean;
  classId?: string;
  inviteId?: string;
  reason: 'available' | 'not_found' | 'not_issued' | 'expired' | 'invalid_data';
};

export type ClassroomAccessContext = {
  fixture: 'synthetic' | 'adult_test' | 'real_minor';
  legalReviewComplete: boolean;
  pilotEnabled: boolean;
  ageBand?: AgeBand;
};

export function previewInvite(invite: ClassroomInvite | null, now: string): InvitePreview {
  if (!invite || typeof invite.inviteId !== 'string' || typeof invite.classId !== 'string' || invite.version < 1
    || typeof invite.expiresAt !== 'string' || !Number.isFinite(Date.parse(invite.expiresAt)) || typeof now !== 'string' || !Number.isFinite(Date.parse(now))) {
    return { available: false, reason: 'invalid_data' };
  }
  if (invite.state !== 'issued' || !invite.token) return { available: false, reason: invite.state === 'issued' ? 'invalid_data' : 'not_issued' };
  if (Date.parse(invite.expiresAt) <= Date.parse(now)) return { available: false, reason: 'expired' };
  return { available: true, classId: invite.classId, inviteId: invite.inviteId, reason: 'available' };
}

/** Development gate: never enables a real-minor classroom pilot by accident. */
export function canUseClassroom(context: ClassroomAccessContext): boolean {
  if (context.fixture === 'real_minor') {
    return context.ageBand === 'minor_15_17'
      && decideAgeSensitiveAccess(context.ageBand, context.legalReviewComplete, context.pilotEnabled).releaseAllowed;
  }
  return context.fixture === 'synthetic' || context.fixture === 'adult_test';
}

export function canAcceptInvite(
  invite: ClassroomInvite | null,
  now: string,
  context: ClassroomAccessContext,
  policyVersion: number,
): boolean {
  if (!canUseClassroom(context) || !Number.isSafeInteger(policyVersion) || policyVersion < 1) return false;
  if (!invite || invite.version < 1 || invite.version !== policyVersion) return false;
  return previewInvite(invite, now).available;
}
