import assert from 'node:assert/strict';
import test from 'node:test';

const { applyAuthorizedSyncPage } = await import('../../src/features/sync/sync-pull-apply.ts');
const { signSyncCursor } = await import('../../supabase/functions/_shared/sync-cursor.ts');

const OWNER = 'account:11111111-1111-4111-8111-111111111111';
const ID = '22222222-2222-4222-8222-222222222222';
const OWNER_ID = '11111111-1111-4111-8111-111111111111';
const SECRET = 'secret-for-sync-pull-apply-cursor-0123456789';
const page = { nextCursor: 'signed-cursor', changes: [{ sequence: '1', entityKind: 'task', entityId: ID, operation: 'upsert', payload: { title: 'Study' } }] };

test('sync pull validates the page and delegates page plus cursor atomically', async () => {
  const calls = [];
  await applyAuthorizedSyncPage(OWNER, page, { applyPageAtomically: async (...args) => { calls.push(args); } });
  assert.deepEqual(calls, [[OWNER, page]]);
});

test('sync pull rejects malformed, oversized and foreign-shaped pages before storage', async () => {
  let applied = false;
  const apply = async () => { applied = true; };
  await assert.rejects(applyAuthorizedSyncPage(OWNER, { ...page, nextCursor: '' }, { applyPageAtomically: apply }), /SYNC_PAGE_INVALID/);
  await assert.rejects(applyAuthorizedSyncPage(OWNER, { ...page, changes: [{ ...page.changes[0], entityId: 'not-a-uuid' }] }, { applyPageAtomically: apply }), /SYNC_PAGE_INVALID/);
  await assert.rejects(applyAuthorizedSyncPage(OWNER, { ...page, changes: Array.from({ length: 101 }, () => page.changes[0]) }, { applyPageAtomically: apply }), /SYNC_PAGE_INVALID/);
  assert.equal(applied, false);
});

test('sync pull never accepts a non-account owner namespace', async () => {
  await assert.rejects(applyAuthorizedSyncPage('account:foreign', page, { applyPageAtomically: async () => { throw new Error('must not run'); } }), /SYNC_OWNER_INVALID/);
});

test('sync pull preserves store failure for retry instead of advancing a cursor', async () => {
  let attempts = 0;
  const dependencies = { applyPageAtomically: async () => { attempts += 1; throw new Error('SQLITE_BUSY'); } };
  await assert.rejects(applyAuthorizedSyncPage(OWNER, page, dependencies), /SQLITE_BUSY/);
  assert.equal(attempts, 1);
});

test('sync pull accepts the signed cursor emitted by the server pull boundary', async () => {
  const nextCursor = await signSyncCursor({
    version: 1, ownerId: OWNER_ID, endpoint: 'sync', limit: 50, after: '1', highWater: '2',
    expiresAt: '2026-10-11T00:00:00.000Z',
  }, SECRET);
  let received;
  await applyAuthorizedSyncPage(OWNER, { ...page, nextCursor }, { applyPageAtomically: async (_owner, receivedPage) => { received = receivedPage; } });
  assert.equal(received.nextCursor, nextCursor);
});
