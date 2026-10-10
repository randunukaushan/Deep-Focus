import assert from 'node:assert/strict';
import test from 'node:test';

const { createSnapshotPageCursorFactory } = await import('../../supabase/functions/_shared/snapshot-page-cursor-factory.ts');
const { verifySnapshotPageCursor } = await import('../../supabase/functions/_shared/snapshot-page-cursor.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SNAPSHOT = '22222222-2222-4222-8222-222222222222';
const SECRET = 'secret-for-snapshot-cursor-factory-0123456789';
const EXPIRES = '2026-10-11T00:00:00.000Z';

test('factory creates a signed cursor for the next page and leaves the final page null', async () => {
  const next = createSnapshotPageCursorFactory({ ownerId: OWNER, snapshotId: SNAPSHOT, expiresAt: EXPIRES, secret: SECRET });
  const token = await next(0, 3);
  assert.equal((await verifySnapshotPageCursor(token, SECRET, { ownerId: OWNER, snapshotId: SNAPSHOT, now: '2026-10-10T00:00:00.000Z' })).pageIndex, 1);
  assert.equal(await next(2, 3), null);
});

test('factory preserves snapshot identity, page count and expiry in the signed payload', async () => {
  const next = createSnapshotPageCursorFactory({ ownerId: OWNER, snapshotId: SNAPSHOT, expiresAt: EXPIRES, secret: SECRET });
  const token = await next(4, 6);
  assert.deepEqual(await verifySnapshotPageCursor(token, SECRET, { ownerId: OWNER, snapshotId: SNAPSHOT, now: '2026-10-10T00:00:00.000Z' }), {
    version: 1, ownerId: OWNER, endpoint: 'snapshot-pages', snapshotId: SNAPSHOT,
    pageIndex: 5, pageCount: 6, expiresAt: EXPIRES,
  });
});

test('factory rejects invalid configuration and page boundaries', async () => {
  assert.throws(() => createSnapshotPageCursorFactory({ ownerId: 'bad', snapshotId: SNAPSHOT, expiresAt: EXPIRES, secret: SECRET }), /SNAPSHOT_CURSOR_FACTORY_INVALID/);
  const next = createSnapshotPageCursorFactory({ ownerId: OWNER, snapshotId: SNAPSHOT, expiresAt: EXPIRES, secret: SECRET });
  await assert.rejects(() => next(-1, 2), /SNAPSHOT_CURSOR_FACTORY_INVALID/);
  await assert.rejects(() => next(2, 2), /SNAPSHOT_CURSOR_FACTORY_INVALID/);
  await assert.rejects(() => next(0, 0), /SNAPSHOT_CURSOR_FACTORY_INVALID/);
});

test('factory rejects weak secrets and invalid expiry before materialization', () => {
  assert.throws(() => createSnapshotPageCursorFactory({ ownerId: OWNER, snapshotId: SNAPSHOT, expiresAt: EXPIRES, secret: 'short' }), /SNAPSHOT_CURSOR_FACTORY_INVALID/);
  assert.throws(() => createSnapshotPageCursorFactory({ ownerId: OWNER, snapshotId: SNAPSHOT, expiresAt: 'bad', secret: SECRET }), /SNAPSHOT_CURSOR_FACTORY_INVALID/);
});
