import assert from 'node:assert/strict';
import test from 'node:test';

const { signSnapshotPageCursor, verifySnapshotPageCursor } = await import('../../supabase/functions/_shared/snapshot-page-cursor.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const SNAPSHOT = '33333333-3333-4333-8333-333333333333';
const SECRET = 'secret-for-snapshot-cursor-0123456789';
const NOW = '2026-10-10T00:00:00.000Z';
const payload = { version: 1, ownerId: OWNER, endpoint: 'snapshot-pages', snapshotId: SNAPSHOT, pageIndex: 1, pageCount: 3, expiresAt: '2026-10-11T00:00:00.000Z' };

test('snapshot cursor signs and verifies owner, snapshot and page scope', async () => {
  const token = await signSnapshotPageCursor(payload, SECRET);
  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.deepEqual(await verifySnapshotPageCursor(token, SECRET, { ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW }), payload);
});

test('snapshot cursor rejects a foreign owner or snapshot', async () => {
  const token = await signSnapshotPageCursor(payload, SECRET);
  await assert.rejects(() => verifySnapshotPageCursor(token, SECRET, { ownerId: OTHER, snapshotId: SNAPSHOT, now: NOW }), /SNAPSHOT_CURSOR_INVALID/);
  await assert.rejects(() => verifySnapshotPageCursor(token, SECRET, { ownerId: OWNER, snapshotId: OTHER, now: NOW }), /SNAPSHOT_CURSOR_INVALID/);
});

test('snapshot cursor rejects tampering, wrong secret and expired tokens', async () => {
  const token = await signSnapshotPageCursor(payload, SECRET);
  const [encoded, signature] = token.split('.');
  const changed = `${encoded.slice(0, -1)}${encoded.endsWith('A') ? 'B' : 'A'}.${signature}`;
  await assert.rejects(() => verifySnapshotPageCursor(changed, SECRET, { ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW }), /SNAPSHOT_CURSOR_INVALID/);
  await assert.rejects(() => verifySnapshotPageCursor(token, `${SECRET}-wrong`, { ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW }), /SNAPSHOT_CURSOR_INVALID/);
  await assert.rejects(() => verifySnapshotPageCursor(token, SECRET, { ownerId: OWNER, snapshotId: SNAPSHOT, now: '2026-10-11T00:00:00.000Z' }), /SNAPSHOT_CURSOR_INVALID/);
});

test('snapshot cursor rejects invalid payload boundaries and secret configuration', async () => {
  await assert.rejects(() => signSnapshotPageCursor({ ...payload, pageIndex: 3 }, SECRET), /SNAPSHOT_CURSOR_INVALID/);
  await assert.rejects(() => signSnapshotPageCursor({ ...payload, pageCount: 0 }, SECRET), /SNAPSHOT_CURSOR_INVALID/);
  await assert.rejects(() => signSnapshotPageCursor(payload, 'short'), /SNAPSHOT_CURSOR_SECRET_INVALID/);
});

test('snapshot cursor rejects malformed token and invalid verification context', async () => {
  await assert.rejects(() => verifySnapshotPageCursor('bad-token', SECRET, { ownerId: OWNER, snapshotId: SNAPSHOT, now: NOW }), /SNAPSHOT_CURSOR_INVALID/);
  await assert.rejects(() => verifySnapshotPageCursor('a.b', SECRET, { ownerId: 'bad', snapshotId: SNAPSHOT, now: NOW }), /SNAPSHOT_CURSOR_INVALID/);
});
