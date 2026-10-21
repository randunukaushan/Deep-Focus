import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveSessionOwner } from '../../src/features/auth/session-identity.ts';

const USER = '8b1c2d3e-4f50-4a60-8b70-1234567890ab';
const OTHER = '9c2d3e4f-5061-4b70-9c80-2345678901bc';

function dependencies({ claims, error, savedOwner = null, rememberError = false } = {}) {
  const calls = [];
  return {
    calls,
    getClaims: async () => ({ claims, error }),
    readPreviouslyVerifiedOwner: async () => { calls.push('read'); return savedOwner; },
    rememberVerifiedOwner: async (id) => {
      calls.push(['remember', id]);
      if (rememberError) throw new Error('secure store unavailable');
    },
  };
}

test('account namespace requires a verified JWT subject matching the session user', async () => {
  const deps = dependencies({ claims: { sub: USER.toUpperCase() } });
  assert.deepEqual(await resolveSessionOwner(USER, deps), { status: 'verified', userId: USER });
  assert.deepEqual(deps.calls, [['remember', USER]]);
});

test('offline access is limited to a previously verified matching account', async () => {
  const deps = dependencies({ error: new Error('network unavailable'), savedOwner: USER });
  assert.deepEqual(await resolveSessionOwner(USER, deps), { status: 'offline', userId: USER });
  assert.deepEqual(deps.calls, ['read']);

  const otherAccount = dependencies({ error: new Error('network unavailable'), savedOwner: OTHER });
  assert.deepEqual(await resolveSessionOwner(USER, otherAccount), { status: 'denied' });
});

test('invalid, missing, or mismatched claims fail closed without offline fallback', async () => {
  for (const claims of [undefined, {}, { sub: OTHER }]) {
    const deps = dependencies({ claims, savedOwner: USER });
    assert.deepEqual(await resolveSessionOwner(USER, deps), { status: 'denied' });
    assert.deepEqual(deps.calls, []);
  }
  assert.deepEqual(await resolveSessionOwner('not-a-uuid', dependencies({ claims: { sub: USER } })), { status: 'denied' });
});

test('failed SecureStore binding write prevents opening account-local data', async () => {
  const deps = dependencies({ claims: { sub: USER }, rememberError: true });
  assert.deepEqual(await resolveSessionOwner(USER, deps), { status: 'denied' });
});

test('a superseded auth event cannot authorize an account namespace', async () => {
  const deps = dependencies({ claims: { sub: USER } });
  deps.isCurrent = () => false;
  assert.deepEqual(await resolveSessionOwner(USER, deps), { status: 'denied' });
  assert.deepEqual(deps.calls, []);
});

test('claim lookup exceptions can use only the matching secure offline binding', async () => {
  const deps = dependencies({ savedOwner: USER });
  deps.getClaims = async () => { throw new Error('network unavailable'); };
  assert.deepEqual(await resolveSessionOwner(USER, deps), { status: 'offline', userId: USER });
});
