import { captureFocusRecoveryStore } from '@/features/storage/local-database';

/** Bind a mounted flow to its owner; do not resolve another owner after await. */
export function createBreakRecoveryStorage() {
  const store = captureFocusRecoveryStore();
  return { load: store.loadFocusRecovery, save: store.saveActiveBreak, isCurrent: store.isCurrent };
}
