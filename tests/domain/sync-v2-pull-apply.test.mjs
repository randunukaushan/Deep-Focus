import assert from 'node:assert/strict';
import test from 'node:test';

const { applyAuthorizedV2SyncPage } = await import('../../src/features/sync/sync-v2-pull-apply.ts');
const { buildV2SyncGroup } = await import('../../supabase/functions/_shared/postgres-sync-v2-transaction-adapter.ts');

const OWNER = 'account:11111111-1111-4111-8111-111111111111';
const TRANSACTION = '22222222-2222-4222-8222-222222222222';
const PLAN = '33333333-3333-4333-8333-333333333333';
const WORKSPACE = '44444444-4444-4444-8444-444444444444';
const TASK = '55555555-5555-4555-8555-555555555555';
const BLOCK = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-10-11T00:00:00.000Z';
const plan = { id: PLAN, workspaceId: WORKSPACE, localDate: '2026-10-11', timeZone: 'Asia/Colombo', availableStart: NOW, availableEnd: '2026-10-11T02:00:00.000Z', explanation: null, blocks: [{ id: BLOCK, kind: 'focus', taskId: TASK, startsAt: '2026-10-11T00:10:00.000Z', endsAt: '2026-10-11T00:35:00.000Z', reminderId: null }], version: 1, createdAt: NOW, sourceProposalId: WORKSPACE, state: 'active', updatedAt: NOW };

async function page() {
  const group = await buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '8', changes: [{ entityKind: 'plan', entityId: PLAN, operation: 'upsert', payload: plan }, { entityKind: 'reminder', entityId: TASK, operation: 'delete', payload: null }] });
  return { contractVersion: 2, privacyEpoch: '1', highWater: '9', nextCursor: 'cursor.signature', caughtUp: true, groups: [{ transactionId: group.transactionId, committedThrough: group.committedThrough, changeCount: group.changeCount, groupDigest: group.groupDigest, changes: group.changes }] };
}

test('v2 local apply validates the full group before one atomic callback', async () => {
  const calls = [];
  await applyAuthorizedV2SyncPage(OWNER, await page(), { applyPageAtomically: async (ownerId, value) => calls.push({ ownerId, value }) });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].ownerId, OWNER);
  assert.equal(calls[0].value.groups[0].changes.length, 2);
});

test('v2 local apply rejects a changed digest without touching SQLite', async () => {
  const value = await page();
  value.groups[0].groupDigest = 'a'.repeat(64);
  let called = false;
  await assert.rejects(() => applyAuthorizedV2SyncPage(OWNER, value, { applyPageAtomically: async () => { called = true; } }), /SYNC_V2_PAGE_INVALID/);
  assert.equal(called, false);
});

test('v2 local apply rejects an incomplete group and preserves retry semantics', async () => {
  const value = await page();
  value.groups[0].changes.pop();
  let called = false;
  await assert.rejects(() => applyAuthorizedV2SyncPage(OWNER, value, { applyPageAtomically: async () => { called = true; } }), /SYNC_V2_PAGE_INVALID/);
  assert.equal(called, false);
});

test('v2 local apply rejects a valid-digest page over the wire byte limit', async () => {
  const changes = Array.from({ length: 500 }, (_, index) => ({ entityKind: 'reminder', entityId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, operation: 'delete', payload: null }));
  const group = await buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '1', changes });
  const value = { contractVersion: 2, privacyEpoch: '1', highWater: group.committedThrough, nextCursor: `${'a'.repeat(2047)}.${'b'.repeat(2048)}`, caughtUp: true, groups: [group] };
  let called = false;
  await assert.rejects(() => applyAuthorizedV2SyncPage(OWNER, value, { applyPageAtomically: async () => { called = true; } }), /SYNC_V2_PAGE_INVALID/);
  assert.equal(called, false);
});

test('v2 local apply propagates transaction failure instead of claiming installation', async () => {
  const value = await page();
  await assert.rejects(() => applyAuthorizedV2SyncPage(OWNER, value, { applyPageAtomically: async () => { throw new Error('rollback'); } }), /rollback/);
});
