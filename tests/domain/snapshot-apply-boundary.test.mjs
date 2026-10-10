import assert from 'node:assert/strict';
import test from 'node:test';

const { applyValidatedSnapshotAtomically } = await import('../../src/features/sync/snapshot-apply-boundary.ts');

const OWNER = 'account:11111111-1111-4111-8111-111111111111';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const ENTITY = '33333333-3333-4333-8333-333333333333';
const DIGEST = 'a'.repeat(64);
const pages = [{ snapshotId: SNAPSHOT, pageIndex: 0, pageCount: 1, highWater: '20', pageDigest: DIGEST, data: [{ entity: 'task', entityId: ENTITY, version: 1, operation: 'upsert', payload: { title: 'Remote task' } }], nextCursor: null }];

test('validated snapshot requests one atomic mirror swap and preserves local work', async () => {
  let received;
  const result = await applyValidatedSnapshotAtomically({ ownerId: OWNER, snapshotId: SNAPSHOT, highWater: '20', pages, resumeCursor: 'cursor-20', digestPage: async () => DIGEST, store: { applySnapshotAtomically: async (value) => { received = value; } } });
  assert.deepEqual(result, { installedPages: 1, entityCount: 1, highWater: '20' });
  assert.deepEqual(received, { ownerId: OWNER, snapshotId: SNAPSHOT, highWater: '20', resumeCursor: 'cursor-20', entities: pages[0].data, preserveOutbox: true, preserveLocalOverlay: true });
});

test('invalid snapshots never reach the mirror transaction callback', async () => {
  let calls = 0;
  await assert.rejects(() => applyValidatedSnapshotAtomically({ ownerId: OWNER, snapshotId: SNAPSHOT, highWater: '20', pages: [{ ...pages[0], data: [...pages[0].data, pages[0].data[0]] }], resumeCursor: 'cursor-20', digestPage: async () => DIGEST, store: { applySnapshotAtomically: async () => { calls += 1; } } }), /SNAPSHOT_DUPLICATE_ENTITY/);
  assert.equal(calls, 0);
});

test('mirror transaction failure is propagated without claiming installation', async () => {
  await assert.rejects(() => applyValidatedSnapshotAtomically({ ownerId: OWNER, snapshotId: SNAPSHOT, highWater: '20', pages, resumeCursor: 'cursor-20', digestPage: async () => DIGEST, store: { applySnapshotAtomically: async () => { throw new Error('MIRROR_ROLLBACK'); } } }), /MIRROR_ROLLBACK/);
});
