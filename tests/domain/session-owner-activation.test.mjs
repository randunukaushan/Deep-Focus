import assert from 'node:assert/strict';
import test from 'node:test';

const { activateSessionOwner } = await import('../../src/features/auth/session-owner-activation.ts');

const USER = '10000000-0000-4000-8000-000000000001';

function dependencies(overrides = {}) {
  const calls = { account: [], device: 0 };
  return {
    calls,
    activateAccount: (id) => calls.account.push(id),
    activateDevice: () => { calls.device += 1; },
    getClaims: async () => ({ claims: { sub: USER } }),
    readPreviouslyVerifiedOwner: async () => USER,
    rememberVerifiedOwner: async () => {},
    ...overrides,
  };
}

test('session owner activation opens only the verified account namespace', async () => {
  const deps = dependencies();
  assert.deepEqual(await activateSessionOwner({ userId: USER }, deps), { status: 'verified', userId: USER });
  assert.deepEqual(deps.calls.account, [USER]);
  assert.equal(deps.calls.device, 0);
});

test('session owner activation fails closed for a mismatched provider subject', async () => {
  const deps = dependencies({ getClaims: async () => ({ claims: { sub: '20000000-0000-4000-8000-000000000002' } }) });
  assert.deepEqual(await activateSessionOwner({ userId: USER }, deps), { status: 'denied' });
  assert.deepEqual(deps.calls.account, []);
  assert.equal(deps.calls.device, 1);
});

test('session owner activation can use only the previously verified matching owner offline', async () => {
  const deps = dependencies({ getClaims: async () => ({ error: new Error('offline') }) });
  assert.deepEqual(await activateSessionOwner({ userId: USER }, deps), { status: 'offline', userId: USER });
  assert.deepEqual(deps.calls.account, [USER]);
  assert.equal(deps.calls.device, 0);
});

test('signed-out activation returns to the device namespace', async () => {
  const deps = dependencies();
  assert.deepEqual(await activateSessionOwner(null, deps), { status: 'denied' });
  assert.deepEqual(deps.calls.account, []);
  assert.equal(deps.calls.device, 1);
});

test('stale activation cannot switch namespaces after a newer auth event', async () => {
  let current = true;
  const deps = dependencies({ isCurrent: () => current });
  const pending = activateSessionOwner({ userId: USER }, deps);
  current = false;
  assert.deepEqual(await pending, { status: 'denied' });
  assert.deepEqual(deps.calls.account, []);
  assert.equal(deps.calls.device, 0);
});
