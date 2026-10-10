import assert from 'node:assert/strict';
import test from 'node:test';

import { accountOwnerId, createLocalOwnerRegistry } from '../../src/features/storage/local-owner.ts';

const userA = '11111111-1111-4111-8111-111111111111';
const userB = '22222222-2222-4222-8222-222222222222';

test('account owner IDs accept only UUID-shaped authenticated identities', () => {
  assert.equal(accountOwnerId(userA), `account:${userA}`);
  assert.equal(accountOwnerId(userA.toUpperCase()), `account:${userA}`);
  for (const invalid of ['', 'local:device', 'not-a-user-id', '11111111-1111-1111-1111-111111111111']) {
    assert.throws(() => accountOwnerId(invalid), /INVALID_AUTH_ID/);
  }
});

test('owner registry isolates identities and retains device-local data without claiming it', () => {
  const deviceStore = { name: 'device' };
  const created = [];
  const registry = createLocalOwnerRegistry(deviceStore, (userId, ownerId) => {
    const store = { userId, ownerId };
    created.push(store);
    return store;
  });

  registry.useAccount(userA);
  const firstA = registry.current();
  registry.useAccount(userB);
  const onlyB = registry.current();
  assert.notEqual(firstA, onlyB);
  assert.equal(onlyB.ownerId, `account:${userB}`);

  registry.useAccount(userA);
  assert.strictEqual(registry.current(), firstA, 'Returning to an account reuses only that account namespace');
  registry.useDeviceLocal();
  assert.strictEqual(registry.current(), deviceStore, 'Sign-out routing does not copy local rows into an account');
  assert.equal(created.length, 2);
});
