import assert from 'node:assert/strict';
import test from 'node:test';

const { signSyncV2Cursor, verifySyncV2Cursor } = await import('../../supabase/functions/_shared/sync-v2-cursor.ts');
const OWNER = '11111111-1111-4111-8111-111111111111';
const SECRET = 'v2-cursor-secret-that-is-long-enough-123456';
const payload = { version: 2, endpoint: 'replication-v2-pull', ownerId: OWNER, privacyEpoch: '1', limit: 50, after: '7', highWater: '9', expiresAt: '2026-10-11T01:00:00.000Z' };

test('v2 cursor signs and verifies its owner, epoch, range and limit', async () => {
  const token = await signSyncV2Cursor(payload, SECRET);
  const decoded = await verifySyncV2Cursor(token, SECRET, { ownerId: OWNER, limit: 50, now: '2026-10-11T00:00:00.000Z' });
  assert.deepEqual(decoded, payload);
});

test('v2 cursor rejects cross-account, changed-limit, expired and tampered reuse', async () => {
  const token = await signSyncV2Cursor(payload, SECRET);
  await assert.rejects(() => verifySyncV2Cursor(token, SECRET, { ownerId: '22222222-2222-4222-8222-222222222222', limit: 50, now: '2026-10-11T00:00:00.000Z' }), /SYNC_V2_CURSOR_INVALID/);
  await assert.rejects(() => verifySyncV2Cursor(token, SECRET, { ownerId: OWNER, limit: 49, now: '2026-10-11T00:00:00.000Z' }), /SYNC_V2_CURSOR_INVALID/);
  await assert.rejects(() => verifySyncV2Cursor(token, SECRET, { ownerId: OWNER, limit: 50, now: '2026-10-11T01:00:00.000Z' }), /SYNC_V2_CURSOR_INVALID/);
  await assert.rejects(() => verifySyncV2Cursor(`${token.slice(0, -1)}A`, SECRET, { ownerId: OWNER, limit: 50, now: '2026-10-11T00:00:00.000Z' }), /SYNC_V2_CURSOR_INVALID/);
});

test('v2 cursor rejects unsafe bigint ranges and weak secrets', async () => {
  await assert.rejects(() => signSyncV2Cursor({ ...payload, highWater: '9223372036854775808' }, SECRET), /SYNC_V2_CURSOR_INVALID/);
  await assert.rejects(() => signSyncV2Cursor(payload, 'short'), /SYNC_V2_CURSOR_SECRET_INVALID/);
});

test('v2 cursor rejects unsafe expected runtime types before verification', async () => {
  const token = await signSyncV2Cursor(payload, SECRET);
  await assert.rejects(() => verifySyncV2Cursor(token, SECRET, { ownerId: Symbol('owner'), limit: 50, now: payload.expiresAt }), /SYNC_V2_CURSOR_INVALID/);
  await assert.rejects(() => verifySyncV2Cursor(token, SECRET, { ownerId: OWNER, limit: 50, now: Symbol('clock') }), /SYNC_V2_CURSOR_INVALID/);
});
