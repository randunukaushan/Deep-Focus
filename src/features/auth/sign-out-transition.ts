import type { AuthServiceResult } from './auth-service.ts';

export type LocalSignOutDependencies = {
  invalidatePendingAuthWork: () => void;
  activateDeviceLocalStore: () => void;
  markSignedOut: () => void;
};

/** Clears the local account boundary immediately after provider sign-out succeeds. */
export function applySuccessfulLocalSignOut(
  result: AuthServiceResult,
  dependencies: LocalSignOutDependencies,
): boolean {
  if (result.status !== 'sent') return false;
  dependencies.invalidatePendingAuthWork();
  dependencies.activateDeviceLocalStore();
  dependencies.markSignedOut();
  return true;
}
