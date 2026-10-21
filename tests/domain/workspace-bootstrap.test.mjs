import assert from 'node:assert/strict';
import test from 'node:test';

import { parseOwnWorkspaceProfile } from '../../src/features/sync/workspace-bootstrap.ts';

const USER = '10000000-0000-4000-8000-000000000001';
const WORKSPACE = '20000000-0000-4000-8000-000000000001';

function response(overrides = {}) {
  return { data: { id: USER, displayName: 'Owner', personalWorkspaceId: WORKSPACE, version: 1, ...overrides } };
}

test('workspace bootstrap binds the server profile to the verified actor', () => {
  assert.deepEqual(parseOwnWorkspaceProfile(response(), USER), { userId: USER, workspaceId: WORKSPACE, displayName: 'Owner', version: 1 });
});

test('workspace bootstrap rejects a foreign actor or malformed workspace', () => {
  assert.throws(() => parseOwnWorkspaceProfile(response({ id: '30000000-0000-4000-8000-000000000001' }), USER), /BOOTSTRAP_ACTOR_MISMATCH/);
  assert.throws(() => parseOwnWorkspaceProfile(response({ personalWorkspaceId: 'legacy-workspace' }), USER), /BOOTSTRAP_WORKSPACE_INVALID/);
});

test('workspace bootstrap rejects extra, missing, invalid or unsafe fields', () => {
  assert.throws(() => parseOwnWorkspaceProfile({ data: { ...response().data, extra: true } }, USER), /BOOTSTRAP_RESPONSE_INVALID/);
  assert.throws(() => parseOwnWorkspaceProfile(response({ displayName: '   ' }), USER), /BOOTSTRAP_PROFILE_INVALID/);
  assert.throws(() => parseOwnWorkspaceProfile(response({ version: 0 }), USER), /BOOTSTRAP_VERSION_INVALID/);
  assert.throws(() => parseOwnWorkspaceProfile(response(), 'legacy-user'), /BOOTSTRAP_ACTOR_INVALID/);
});
