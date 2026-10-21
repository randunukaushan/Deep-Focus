import assert from 'node:assert/strict';
import test from 'node:test';

import { loadOwnWorkspaceProfile } from '../../src/features/sync/workspace-bootstrap-client.ts';

const USER = '10000000-0000-4000-8000-000000000001';
const WORKSPACE = '20000000-0000-4000-8000-000000000001';

test('workspace client requests only the own-profile route and validates its response', async () => {
  const calls = [];
  const profile = await loadOwnWorkspaceProfile({
    async request(path, options) {
      calls.push({ path, options });
      return { data: { id: USER, displayName: 'Owner', personalWorkspaceId: WORKSPACE, version: 1 } };
    },
  }, USER);
  assert.deepEqual(profile, { userId: USER, workspaceId: WORKSPACE, displayName: 'Owner', version: 1 });
  assert.deepEqual(calls, [{ path: '/v1/me', options: { method: 'GET' } }]);
});

test('workspace client does not convert a malformed response into a local workspace', async () => {
  let calls = 0;
  await assert.rejects(() => loadOwnWorkspaceProfile({
    async request() { calls += 1; return { data: { id: USER, displayName: 'Owner', personalWorkspaceId: 'bad', version: 1 } }; },
  }, USER), /BOOTSTRAP_WORKSPACE_INVALID/);
  assert.equal(calls, 1);
});
