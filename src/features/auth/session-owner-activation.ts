// @ts-expect-error The bundled domain runtime resolves TypeScript modules directly.
import { resolveSessionOwner, type SessionOwnerResult } from './session-identity.ts';

export type SessionOwnerActivationDependencies = {
  activateAccount: (userId: string) => void;
  activateDevice: () => void;
  getClaims: () => Promise<{ claims?: { sub?: unknown } | null; error?: unknown }>;
  readPreviouslyVerifiedOwner: () => Promise<string | null>;
  rememberVerifiedOwner: (userId: string) => Promise<void>;
  isCurrent?: () => boolean;
};

/** Activates local storage only after the provider identity contract admits it. */
export async function activateSessionOwner(
  session: { userId?: string } | null,
  dependencies: SessionOwnerActivationDependencies,
): Promise<SessionOwnerResult> {
  const result = await resolveSessionOwner(session?.userId, {
    getClaims: dependencies.getClaims,
    readPreviouslyVerifiedOwner: dependencies.readPreviouslyVerifiedOwner,
    rememberVerifiedOwner: dependencies.rememberVerifiedOwner,
    isCurrent: dependencies.isCurrent,
  });
  // Never let an older async auth event switch the active namespace after a
  // newer event has superseded it.
  if (dependencies.isCurrent && !dependencies.isCurrent()) return { status: 'denied' };
  if (result.status === 'verified' || result.status === 'offline') dependencies.activateAccount(result.userId);
  else dependencies.activateDevice();
  return result;
}
