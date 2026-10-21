export type SyncPullRecovery =
  | { action: 'start_snapshot'; reason: 'SYNC_RESET_REQUIRED'; preserveOutbox: true; preserveLocalOverlay: true }
  | { action: 'reauthenticate'; reason: 'AUTH_REQUIRED' }
  | { action: 'stop'; reason: 'ACCESS_DENIED' | 'ACCOUNT_DISABLED' }
  | { action: 'retry'; reason: 'DEPENDENCY_UNAVAILABLE' | 'RATE_LIMITED' };

/**
 * Maps only known server outcomes. A stale sync cursor starts a new snapshot;
 * it never becomes an empty successful page and never clears local work.
 */
export function decideSyncPullRecovery(errorCode: string): SyncPullRecovery {
  switch (errorCode) {
    case 'SYNC_RESET_REQUIRED':
      return { action: 'start_snapshot', reason: errorCode, preserveOutbox: true, preserveLocalOverlay: true };
    case 'AUTH_REQUIRED':
      return { action: 'reauthenticate', reason: errorCode };
    case 'ACCESS_DENIED':
    case 'ACCOUNT_DISABLED':
      return { action: 'stop', reason: errorCode };
    case 'DEPENDENCY_UNAVAILABLE':
    case 'RATE_LIMITED':
      return { action: 'retry', reason: errorCode };
    default:
      throw new Error('SYNC_PULL_RECOVERY_UNKNOWN');
  }
}

export async function recoverSyncPullFailure(input: {
  errorCode: string;
  resetCursor: () => Promise<void>;
}): Promise<SyncPullRecovery> {
  const recovery = decideSyncPullRecovery(input.errorCode);
  if (recovery.action === 'start_snapshot') await input.resetCursor();
  return recovery;
}
