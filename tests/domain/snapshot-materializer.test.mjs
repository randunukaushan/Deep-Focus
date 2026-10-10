import assert from 'node:assert/strict';
import test from 'node:test';

const { materializeSnapshot } = await import('../../supabase/functions/_shared/snapshot-materializer.ts');

const SNAPSHOT = '11111111-1111-4111-8111-111111111111';
const ID_A = '22222222-2222-4222-8222-222222222222';
const ID_B = '33333333-3333-4333-8333-333333333333';
const DIGEST = 'a'.repeat(64);

function entity(entity, entityId, version = 1) {
  return { entity, entityId, version, operation: 'upsert', payload: { title: entityId } };
}

function options(records, overrides = {}) {
  return { snapshotId: SNAPSHOT, highWater: '12', records,
    digestPage: async () => DIGEST, digestManifest: async () => 'b'.repeat(64),
    nextCursor: (index, count) => index === count - 1 ? null : `cursor-${index + 1}`, ...overrides };
}

test('materializer sorts records and partitions them into bounded immutable pages', async () => {
  const seen = [];
  const result = await materializeSnapshot(options([entity('task', ID_B), entity('goal', ID_A)], {
    digestPage: async (page) => { seen.push(page); return DIGEST; },
  }));
  assert.equal(result.pageCount, 1);
  assert.deepEqual(result.pages[0].data.map((record) => `${record.entity}:${record.entityId}`), [`goal:${ID_A}`, `task:${ID_B}`]);
  assert.deepEqual(seen[0].data, result.pages[0].data);
  assert.equal(result.pages[0].nextCursor, null);
});

test('empty accounts still produce one empty final page', async () => {
  const result = await materializeSnapshot(options([]));
  assert.deepEqual(result.pages, [{ snapshotId: SNAPSHOT, pageIndex: 0, pageCount: 1, highWater: '12', data: [], pageDigest: DIGEST, nextCursor: null }]);
});

test('more than one hundred records uses fixed page boundaries and nonfinal cursors', async () => {
  const records = Array.from({ length: 101 }, (_, index) => entity('task', `${String(index + 1).padStart(8, '0')}-1111-4111-8111-111111111111`));
  const result = await materializeSnapshot(options(records));
  assert.equal(result.pageCount, 2);
  assert.equal(result.pages[0].data.length, 100);
  assert.equal(result.pages[1].data.length, 1);
  assert.equal(result.pages[0].nextCursor, 'cursor-1');
  assert.equal(result.pages[1].nextCursor, null);
});

test('duplicate or malformed entities are rejected before digest callbacks', async () => {
  let calls = 0;
  await assert.rejects(() => materializeSnapshot(options([entity('task', ID_A), entity('task', ID_A)], { digestPage: async () => { calls += 1; return DIGEST; } })), /SNAPSHOT_DUPLICATE_ENTITY/);
  await assert.rejects(() => materializeSnapshot(options([{ ...entity('task', ID_B), version: 0 }], { digestPage: async () => { calls += 1; return DIGEST; } })), /SNAPSHOT_ENTITY_INVALID/);
  assert.equal(calls, 0);
});

test('invalid page or manifest digest and invalid cursor fail closed', async () => {
  await assert.rejects(() => materializeSnapshot(options([entity('task', ID_A)], { digestPage: async () => 'bad' })), /SNAPSHOT_PAGE_DIGEST_INVALID/);
  await assert.rejects(() => materializeSnapshot(options([entity('task', ID_A)], { digestManifest: async () => 'bad' })), /SNAPSHOT_MANIFEST_DIGEST_INVALID/);
  const many = Array.from({ length: 101 }, (_, index) => entity('task', `${String(index + 1).padStart(8, '0')}-1111-4111-8111-111111111111`));
  await assert.rejects(() => materializeSnapshot(options(many, { nextCursor: () => null })), /SNAPSHOT_CURSOR_INVALID/);
});
