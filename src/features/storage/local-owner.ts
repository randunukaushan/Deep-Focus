const AUTH_USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function accountOwnerId(authenticatedUserId: string): string {
  if (!AUTH_USER_ID.test(authenticatedUserId)) {
    throw new RangeError('INVALID_AUTH_ID: a verified account UUID is required');
  }
  return `account:${authenticatedUserId.toLowerCase()}`;
}

export function createLocalOwnerRegistry<T>(
  deviceLocalStore: T,
  createAccountStore: (authenticatedUserId: string, ownerId: string) => T,
) {
  const accountStores = new Map<string, T>();
  let activeStore = deviceLocalStore;

  return {
    useAccount(authenticatedUserId: string): void {
      const ownerId = accountOwnerId(authenticatedUserId);
      let store = accountStores.get(ownerId);
      if (!store) {
        store = createAccountStore(authenticatedUserId, ownerId);
        accountStores.set(ownerId, store);
      }
      activeStore = store;
    },
    useDeviceLocal(): void {
      activeStore = deviceLocalStore;
    },
    current(): T {
      return activeStore;
    },
  };
}
