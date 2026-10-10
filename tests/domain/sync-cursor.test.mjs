import assert from 'node:assert/strict';
import test from 'node:test';

const { signSyncCursor, verifySyncCursor } = await import('../../supabase/functions/_shared/sync-cursor.ts');

const SECRET = 'server-only-development-secret-with-32-bytes-minimum';
const OWNER = '11111111-1111-4111-8111-111111111111';
const NOW = '2026-10-10T00:00:00.000Z';
const payload = { version: 1, ownerId: OWNER, endpoint: 'sync', limit: 50, after: '10', highWater: '20', expiresAt: '2026-10-10T01:00:00.000Z' };

test('sync cursor is signed and verifies only for its owner and limit', async () => {
  const token = await signSyncCursor(payload, SECRET);
  assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.deepEqual(await verifySyncCursor(token, SECRET, { ownerId: OWNER, limit: 50, now: NOW }), payload);
});

test('sync cursor rejects tampering and wrong secrets', async () => {
  const token = await signSyncCursor(payload, SECRET);
  const [body, signature] = token.split('.');
  await assert.rejects(verifySyncCursor(`${body.slice(0, -1)}${body.endsWith('A') ? 'B' : 'A'}.${signature}`, SECRET, { ownerId: OWNER, limit: 50, now: NOW }), /SYNC_CURSOR_INVALID/);
  await assert.rejects(verifySyncCursor(token, `${SECRET}x`, { ownerId: OWNER, limit: 50, now: NOW }), /SYNC_CURSOR_INVALID/);
});

test('sync cursor rejects cross-account and query-scope reuse', async () => {
  const token = await signSyncCursor(payload, SECRET);
  await assert.rejects(verifySyncCursor(token, SECRET, { ownerId: '22222222-2222-4222-8222-222222222222', limit: 50, now: NOW }), /SYNC_CURSOR_INVALID/);
  await assert.rejects(verifySyncCursor(token, SECRET, { ownerId: OWNER, limit: 25, now: NOW }), /SYNC_CURSOR_INVALID/);
});

test('sync cursor rejects expiry, inverted sequence and unsafe secret configuration', async () => {
  await assert.rejects(signSyncCursor({ ...payload, after: '21', highWater: '20' }, SECRET), /SYNC_CURSOR_INVALID/);
  const expired = await signSyncCursor({ ...payload, expiresAt: NOW }, SECRET);
  await assert.rejects(verifySyncCursor(expired, SECRET, { ownerId: OWNER, limit: 50, now: NOW }), /SYNC_CURSOR_INVALID/);
  await assert.rejects(signSyncCursor(payload, 'short-secret'), /SYNC_CURSOR_SECRET_INVALID/);
});

test('sync cursor rejects malformed encoded segments and oversized tokens safely', async () => {
  await assert.rejects(verifySyncCursor('A.A', SECRET, { ownerId: OWNER, limit: 50, now: NOW }), /SYNC_CURSOR_INVALID/);
  await assert.rejects(verifySyncCursor(`${'A'.repeat(4096)}.A`, SECRET, { ownerId: OWNER, limit: 50, now: NOW }), /SYNC_CURSOR_INVALID/);
});
