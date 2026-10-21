import assert from 'node:assert/strict';
import test from 'node:test';
import { createAccountBackendConnection } from '../../src/features/auth/account-backend-connection.ts';

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const WORKSPACE = '33333333-3333-4333-8333-333333333333';
const KEY = '44444444-4444-4444-8444-444444444444';
const account = { userId: OWNER, displayName: 'Development owner', idempotencyKey: KEY };
function harness({ owner = OWNER, switchAfterBootstrap = false, profileOwner = OWNER, workspace = WORKSPACE } = {}) {
  let current = true;
  const requests = [];
  const connection = createAccountBackendConnection({
    baseUrl: 'https://project.supabase.co/functions/v1/deep-focus-gateway',
    auth: { getSession: async () => ({ data: { session: { user: { id: owner }, access_token: 'test-token' } }, error: null }) },
    isCurrent: () => current,
    fetcher: async (url, init) => {
      requests.push({ url, init });
      const bootstrap = url.endsWith('/v1/account/bootstrap');
      const data = bootstrap ? {
        profile: { ownerId: OWNER, displayName: 'Development owner', accountState: 'active', version: 1 },
        workspace: { ownerId: OWNER, workspaceId: WORKSPACE, kind: 'personal' }, syncHead: { ownerId: OWNER, lastSequence: '0' },
      } : { id: profileOwner, displayName: 'Development owner', personalWorkspaceId: workspace, version: 1 };
      if (bootstrap && switchAfterBootstrap) current = false;
      return { ok: true, status: 200, json: async () => ({ data }) };
    },
  });
  return { connection, requests };
}

test('connect provisions the account and verifies its owned workspace through the function mount', async () => {
  const h = harness();
  const result = await h.connection.connect(account);
  assert.equal(result.profile.workspaceId, WORKSPACE);
  assert.equal(h.requests.length, 2);
  assert.equal(h.requests[0].url, 'https://project.supabase.co/functions/v1/deep-focus-gateway/v1/account/bootstrap');
  assert.deepEqual(JSON.parse(h.requests[0].init.body), { displayName: 'Development owner' });
  assert.equal(h.requests[0].init.headers['Idempotency-Key'], KEY);
  assert.equal(h.requests[1].init.headers.Authorization, 'Bearer test-token');
});

test('another account token is never sent with this account connection', async () => {
  const h = harness({ owner: OTHER });
  await assert.rejects(() => h.connection.connect(account), /AUTH_REQUIRED/);
  assert.equal(h.requests.length, 0);
});

test('switching accounts after bootstrap stops before fetching the old profile', async () => {
  const h = harness({ switchAfterBootstrap: true });
  await assert.rejects(() => h.connection.connect(account), /AUTH_REQUIRED/);
  assert.equal(h.requests.length, 1);
});

test('foreign response identities and inconsistent workspaces never become connected', async () => {
  await assert.rejects(() => harness({ profileOwner: OTHER }).connection.connect(account), /BOOTSTRAP_ACTOR_MISMATCH/);
  await assert.rejects(() => harness({ workspace: OTHER }).connection.connect(account), /BOOTSTRAP_WORKSPACE_MISMATCH/);
});

test('an unavailable backend cannot be mistaken for a successful connection', async () => {
  const connection = createAccountBackendConnection({
    baseUrl: 'https://project.supabase.co/functions/v1/deep-focus-gateway', isCurrent: () => true,
    auth: { getSession: async () => ({ data: { session: { user: { id: OWNER }, access_token: 'test-token' } }, error: null }) },
    fetcher: async () => ({ ok: false, status: 503, json: async () => ({ error: { code: 'DEPENDENCY_UNAVAILABLE' } }) }),
  });
  await assert.rejects(() => connection.connect(account), /DEPENDENCY_UNAVAILABLE/);
});
