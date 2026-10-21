import assert from 'node:assert/strict';
import test from 'node:test';

const { bootstrapAccountTransactionally } = await import('../../supabase/functions/_shared/account-bootstrap.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const WORKSPACE = '22222222-2222-4222-8222-222222222222';

function store(overrides = {}) {
  const calls = [];
  return {
    calls,
    store: { withTransaction: async (operation) => operation({
      ensureProfile: async (input) => { calls.push(['profile', input]); return overrides.profile ?? { ownerId: input.ownerId, displayName: input.displayName, accountState: 'active', version: 1 }; },
      ensurePersonalWorkspace: async (input) => { calls.push(['workspace', input]); return overrides.workspace ?? { ownerId: input.ownerId, workspaceId: input.workspaceId, kind: 'personal' }; },
      ensureSyncHead: async (ownerId) => { calls.push(['sync', ownerId]); return overrides.syncHead ?? { ownerId, lastSequence: '0' }; },
    }) },
  };
}

test('account bootstrap creates all three owner-bound foundations in one transaction', async () => {
  const h = store();
  const result = await bootstrapAccountTransactionally({ ownerId: OWNER, workspaceId: WORKSPACE, displayName: 'Owner', store: h.store });
  assert.deepEqual(result, { profile: { ownerId: OWNER, displayName: 'Owner', accountState: 'active', version: 1 }, workspace: { ownerId: OWNER, workspaceId: WORKSPACE, kind: 'personal' }, syncHead: { ownerId: OWNER, lastSequence: '0' } });
  assert.deepEqual(h.calls.map(([kind]) => kind), ['profile', 'workspace', 'sync']);
});

test('retry returns canonical existing workspace and preserves its display name and head', async () => {
  const h = store({ profile: { ownerId: OWNER, displayName: 'Original', accountState: 'active', version: 3 }, workspace: { ownerId: OWNER, workspaceId: '33333333-3333-4333-8333-333333333333', kind: 'personal' }, syncHead: { ownerId: OWNER, lastSequence: '41' } });
  const result = await bootstrapAccountTransactionally({ ownerId: OWNER, workspaceId: WORKSPACE, displayName: 'Replacement must not overwrite', store: h.store });
  assert.equal(result.profile.displayName, 'Original');
  assert.equal(result.workspace.workspaceId, '33333333-3333-4333-8333-333333333333');
  assert.equal(result.syncHead.lastSequence, '41');
});

test('invalid identity and display input fails before the transaction', async () => {
  let opened = false;
  const failingStore = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  await assert.rejects(bootstrapAccountTransactionally({ ownerId: 'not-owner', workspaceId: WORKSPACE, displayName: 'Owner', store: failingStore }), /VALIDATION_FAILED/);
  await assert.rejects(bootstrapAccountTransactionally({ ownerId: OWNER, workspaceId: WORKSPACE, displayName: '   ', store: failingStore }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('bootstrap rejects runtime type confusion before opening a transaction', async () => {
  let opened = false;
  const failingStore = { withTransaction: async () => { opened = true; throw new Error('must not open'); } };
  await assert.rejects(bootstrapAccountTransactionally({ ownerId: Symbol('owner'), workspaceId: WORKSPACE, displayName: 'Owner', store: failingStore }), /VALIDATION_FAILED/);
  await assert.rejects(bootstrapAccountTransactionally({ ownerId: OWNER, workspaceId: Symbol('workspace'), displayName: 'Owner', store: failingStore }), /VALIDATION_FAILED/);
  assert.equal(opened, false);
});

test('malformed foundation rows fail closed instead of returning a partial account', async () => {
  const h = store({ workspace: { ownerId: OWNER, workspaceId: WORKSPACE, kind: 'shared' } });
  await assert.rejects(bootstrapAccountTransactionally({ ownerId: OWNER, workspaceId: WORKSPACE, displayName: 'Owner', store: h.store }), /DEPENDENCY_UNAVAILABLE/);
});

test('transaction failure is propagated and cannot become a successful bootstrap', async () => {
  await assert.rejects(bootstrapAccountTransactionally({ ownerId: OWNER, workspaceId: WORKSPACE, displayName: 'Owner', store: { withTransaction: async () => { throw new Error('BOOTSTRAP_WRITE_FAILED'); } } }), /BOOTSTRAP_WRITE_FAILED/);
});
