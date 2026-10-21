import assert from 'node:assert/strict';
import test from 'node:test';

import { bootstrapOwnAccount, parseBootstrappedAccount } from '../../src/features/auth/account-bootstrap-client.ts';

const OWNER = '11111111-1111-4111-8111-111111111111';
const WORKSPACE = '22222222-2222-4222-8222-222222222222';
const MUTATION = '33333333-3333-4333-8333-333333333333';

function response(overrides = {}) {
  return {
    data: {
      profile: { ownerId: OWNER, displayName: 'Randunu', accountState: 'active', version: 1 },
      workspace: { ownerId: OWNER, workspaceId: WORKSPACE, kind: 'personal' },
      syncHead: { ownerId: OWNER, lastSequence: '0' },
      ...overrides,
    },
  };
}

test('bootstrap client sends only the selected display name and validates a matching owner response', async () => {
  let request;
  const result = await bootstrapOwnAccount({
    async request(path, options) { request = { path, options }; return response(); },
  }, { verifiedUserId: OWNER, displayName: 'Randunu', idempotencyKey: MUTATION });
  assert.deepEqual(request, { path: '/v1/account/bootstrap', options: { method: 'POST', body: { displayName: 'Randunu' }, idempotencyKey: MUTATION } });
  assert.deepEqual(result, { ownerId: OWNER, displayName: 'Randunu', profileVersion: 1, workspaceId: WORKSPACE, syncLastSequence: '0' });
});

test('bootstrap client rejects foreign, malformed and unexpected server account results', () => {
  assert.throws(() => parseBootstrappedAccount(response({ profile: { ownerId: WORKSPACE, displayName: 'Randunu', accountState: 'active', version: 1 } }), OWNER), /BOOTSTRAP_ACTOR_MISMATCH/);
  assert.throws(() => parseBootstrappedAccount({ data: { profile: {}, workspace: {}, syncHead: {} } }, OWNER), /BOOTSTRAP_RESPONSE_INVALID/);
  assert.throws(() => parseBootstrappedAccount(response({ ownerId: OWNER }), OWNER), /BOOTSTRAP_RESPONSE_INVALID/);
});

test('bootstrap client rejects an unsafe display-name or idempotency key before transport', async () => {
  let calls = 0;
  const client = { async request() { calls += 1; return response(); } };
  await assert.rejects(() => bootstrapOwnAccount(client, { verifiedUserId: OWNER, displayName: '   ', idempotencyKey: MUTATION }), /BOOTSTRAP_DISPLAY_NAME_INVALID/);
  await assert.rejects(() => bootstrapOwnAccount(client, { verifiedUserId: OWNER, displayName: 'Randunu', idempotencyKey: 'not-a-uuid' }), /BOOTSTRAP_IDEMPOTENCY_KEY_INVALID/);
  assert.equal(calls, 0);
});
