import assert from 'node:assert/strict';
import test from 'node:test';

const { applyPatchMe } = await import('../../supabase/functions/_shared/postgres-profile-applier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const HASH = 'a'.repeat(64);

function clientHarness(rows) {
  const calls = [];
  return {
    calls,
    client: { query: async (sql, params) => { calls.push({ sql: sql.replace(/\s+/g, ' ').trim(), params }); return { rows }; } },
  };
}

test('profile update is owner-bound and uses expected version', async () => {
  const h = clientHarness([{ owner_id: OWNER, display_name: 'New name', account_state: 'active', version: 2 }]);
  const result = await applyPatchMe(h.client, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'New name' } });
  assert.deepEqual(result, { responseBody: { id: OWNER, displayName: 'New name', accountState: 'active', version: 2 }, responseStatus: 200 });
  assert.deepEqual(h.calls[0].params, [OWNER, 1, 'New name']);
  assert.match(h.calls[0].sql, /owner_id = \$1/);
  assert.match(h.calls[0].sql, /version = \$2/);
});

test('profile update rejects unknown fields and stale versions', async () => {
  const h = clientHarness([]);
  await assert.rejects(() => applyPatchMe(h.client, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Name', ownerId: OWNER } }), /VALIDATION_FAILED/);
  await assert.rejects(() => applyPatchMe(h.client, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Name' } }), /VERSION_CONFLICT/);
});

test('profile update does not accept blank or oversized names', async () => {
  const h = clientHarness([]);
  await assert.rejects(() => applyPatchMe(h.client, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: '   ' } }), /VALIDATION_FAILED/);
  await assert.rejects(() => applyPatchMe(h.client, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'x'.repeat(101) } }), /VALIDATION_FAILED/);
});

test('profile update rejects malformed client, actor and result containers safely', async () => {
  await assert.rejects(() => applyPatchMe({ query: null }, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Name' } }), /DEPENDENCY_UNAVAILABLE/);
  await assert.rejects(() => applyPatchMe(clientHarness([]).client, { actorId: Symbol('actor'), operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Name' } }), /VALIDATION_FAILED/);
  await assert.rejects(() => applyPatchMe(clientHarness([]).client, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: 'not-an-object' }), /VALIDATION_FAILED/);
  await assert.rejects(() => applyPatchMe({ query: async () => ({ rows: null }) }, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Name' } }), /DEPENDENCY_UNAVAILABLE/);
  await assert.rejects(() => applyPatchMe(clientHarness([{ owner_id: OWNER, display_name: 'A', account_state: 'active', version: 2 }, { owner_id: OWNER, display_name: 'B', account_state: 'active', version: 2 }]).client, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Name' } }), /DEPENDENCY_UNAVAILABLE/);
});

test('profile update fails closed on sparse returned rows', async () => {
  const sparse = [];
  sparse[1] = { owner_id: OWNER, display_name: 'Name', account_state: 'active', version: 2 };
  await assert.rejects(() => applyPatchMe(clientHarness(sparse).client, { actorId: OWNER, operation: 'patchMe', mutationId: OWNER, requestSha256: HASH, body: { expectedVersion: 1, displayName: 'Name' } }), /DEPENDENCY_UNAVAILABLE/);
});
