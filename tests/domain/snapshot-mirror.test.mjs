import assert from 'node:assert/strict';
import test from 'node:test';

const { installSnapshotMirror } = await import('../../src/features/sync/snapshot-mirror.ts');
const { signSnapshotPageCursor } = await import('../../supabase/functions/_shared/snapshot-page-cursor.ts');

const OWNER = 'account:11111111-1111-4111-8111-111111111111';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const TASK = '33333333-3333-4333-8333-333333333333';
const GOAL = '44444444-4444-4444-8444-444444444444';
const OWNER_ID = '11111111-1111-4111-8111-111111111111';
const SECRET = 'secret-for-snapshot-mirror-cursor-0123456789';
const digest = 'a'.repeat(64);
const base = { snapshotId: SNAPSHOT, pageCount: 2, highWater: '12', pageDigest: digest };
const pages = [
  { ...base, pageIndex: 0, data: [{ entity: 'task', entityId: TASK, version: 1, operation: 'upsert', payload: { title: 'Study' } }], nextCursor: 'page-1' },
  { ...base, pageIndex: 1, data: [{ entity: 'goal', entityId: GOAL, version: 2, operation: 'delete', payload: null }], nextCursor: null },
];

function input(overrides = {}) {
  return { ownerId: OWNER, snapshotId: SNAPSHOT, highWater: '12', pages, resumeCursor: 'resume-12', digestPage: async () => digest, store: { installStagedSnapshot: async () => {} }, ...overrides };
}

test('validates every page and installs the complete mirror once', async () => {
  const calls = [];
  const result = await installSnapshotMirror(input({ store: { installStagedSnapshot: async (value) => calls.push(value) } }));
  assert.deepEqual(result, { installedPages: 2, entityCount: 2, highWater: '12' });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].pages, pages);
});

test('rejects gaps, digest mismatch and duplicate entities before installation', async () => {
  let calls = 0;
  const store = { installStagedSnapshot: async () => { calls += 1; } };
  await assert.rejects(() => installSnapshotMirror(input({ pages: [pages[0], { ...pages[1], pageCount: 3 }] , store })), /SNAPSHOT_PAGE_SEQUENCE_INVALID/);
  await assert.rejects(() => installSnapshotMirror(input({ digestPage: async () => 'b'.repeat(64), store })), /SNAPSHOT_DIGEST_INVALID/);
  await assert.rejects(() => installSnapshotMirror(input({ pages: [pages[0], { ...pages[1], data: [{ ...pages[0].data[0] }] }], store })), /SNAPSHOT_DUPLICATE_ENTITY/);
  assert.equal(calls, 0);
});

test('store failure is preserved and does not become a partial success', async () => {
  await assert.rejects(() => installSnapshotMirror(input({ store: { installStagedSnapshot: async () => { throw new Error('SQLITE_BUSY'); } } })), /SQLITE_BUSY/);
});

test('mirror accepts the signed two-segment cursor produced by the server builder', async () => {
  const cursor = await signSnapshotPageCursor({
    version: 1, ownerId: OWNER_ID, endpoint: 'snapshot-pages', snapshotId: SNAPSHOT,
    pageIndex: 1, pageCount: 2, expiresAt: '2026-10-11T00:00:00.000Z',
  }, SECRET);
  const signedPages = [{ ...pages[0], nextCursor: cursor }, pages[1]];
  const result = await installSnapshotMirror(input({ pages: signedPages }));
  assert.equal(result.installedPages, 2);
});
