import assert from 'node:assert/strict';
import test from 'node:test';

const { signReminderListCursor, verifyReminderListCursor, signSessionListCursor, verifySessionListCursor, signAppSessionListCursor, verifyAppSessionListCursor, signBreakListCursor, verifyBreakListCursor, signPlanListCursor, verifyPlanListCursor } = await import('../../supabase/functions/_shared/resource-list-cursor.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const ID = '88888888-8888-4888-8888-888888888888';
const SECRET = 's'.repeat(32);
const NOW = '2026-10-11T00:00:00.000Z';
const value = { version: 1, ownerId: OWNER, endpoint: 'task-reminders', limit: 25, afterScheduledFor: '2026-10-12T01:00:00.000Z', afterId: ID, expiresAt: '2026-10-11T01:00:00.000Z' };

test('reminder list cursor signs and verifies its owner, endpoint, order key and limit', async () => {
  const token = await signReminderListCursor(value, SECRET);
  assert.deepEqual(await verifyReminderListCursor(token, SECRET, { ownerId: OWNER, limit: 25, now: NOW }), value);
});

test('reminder list cursor rejects a foreign owner, changed limit, expiry and tampering', async () => {
  const token = await signReminderListCursor(value, SECRET);
  await assert.rejects(() => verifyReminderListCursor(token, SECRET, { ownerId: '22222222-2222-4222-8222-222222222222', limit: 25, now: NOW }), /LIST_CURSOR_INVALID/);
  await assert.rejects(() => verifyReminderListCursor(token, SECRET, { ownerId: OWNER, limit: 50, now: NOW }), /LIST_CURSOR_INVALID/);
  await assert.rejects(() => verifyReminderListCursor(token, SECRET, { ownerId: OWNER, limit: 25, now: '2026-10-11T01:00:00.000Z' }), /LIST_CURSOR_INVALID/);
  await assert.rejects(() => verifyReminderListCursor(`${token.slice(0, -1)}x`, SECRET, { ownerId: OWNER, limit: 25, now: NOW }), /LIST_CURSOR_INVALID/);
});

test('session list cursor signs descending history position and rejects owner or limit reuse', async () => {
  const value = { version: 1, ownerId: OWNER, endpoint: 'focus-sessions', limit: 25, beforeStartedAt: '2026-10-10T01:00:00.000Z', beforeId: ID, expiresAt: '2026-10-11T01:00:00.000Z' };
  const token = await signSessionListCursor(value, SECRET);
  assert.deepEqual(await verifySessionListCursor(token, SECRET, { ownerId: OWNER, limit: 25, now: NOW }), value);
  await assert.rejects(() => verifySessionListCursor(token, SECRET, { ownerId: '22222222-2222-4222-8222-222222222222', limit: 25, now: NOW }), /LIST_CURSOR_INVALID/);
  await assert.rejects(() => verifySessionListCursor(token, SECRET, { ownerId: OWNER, limit: 50, now: NOW }), /LIST_CURSOR_INVALID/);
});

test('app-session list cursor signs descending registry position and rejects owner or limit reuse', async () => {
  const cursor = await signAppSessionListCursor({ version: 1, ownerId: OWNER, endpoint: 'account-sessions', limit: 2, beforeIssuedAt: '2026-10-11T00:00:00.000Z', beforeId: ID, expiresAt: '2026-10-11T01:00:00.000Z' }, SECRET);
  const decoded = await verifyAppSessionListCursor(cursor, SECRET, { ownerId: OWNER, limit: 2, now: '2026-10-10T23:00:00.000Z' });
  assert.equal(decoded.endpoint, 'account-sessions');
  await assert.rejects(() => verifyAppSessionListCursor(cursor, SECRET, { ownerId: OTHER, limit: 2, now: '2026-10-10T23:00:00.000Z' }));
  await assert.rejects(() => verifyAppSessionListCursor(cursor, SECRET, { ownerId: OWNER, limit: 3, now: '2026-10-10T23:00:00.000Z' }));
});

test('break list cursor signs descending history position and rejects owner or limit reuse', async () => {
  const value = { version: 1, ownerId: OWNER, endpoint: 'breaks', limit: 25, beforeEndedAt: '2026-10-10T01:00:00.000Z', beforeId: ID, expiresAt: '2026-10-11T01:00:00.000Z' };
  const token = await signBreakListCursor(value, SECRET);
  assert.deepEqual(await verifyBreakListCursor(token, SECRET, { ownerId: OWNER, limit: 25, now: NOW }), value);
  await assert.rejects(() => verifyBreakListCursor(token, SECRET, { ownerId: OTHER, limit: 25, now: NOW }), /LIST_CURSOR_INVALID/);
});

test('plan list cursor signs descending creation position and rejects owner, limit or expiry reuse', async () => {
  const value = { version: 1, ownerId: OWNER, endpoint: 'plans', limit: 2, beforeCreatedAt: '2026-10-10T01:00:00.000Z', beforeId: ID, expiresAt: '2026-10-11T01:00:00.000Z' };
  const token = await signPlanListCursor(value, SECRET);
  assert.deepEqual(await verifyPlanListCursor(token, SECRET, { ownerId: OWNER, limit: 2, now: NOW }), value);
  await assert.rejects(() => verifyPlanListCursor(token, SECRET, { ownerId: OTHER, limit: 2, now: NOW }), /LIST_CURSOR_INVALID/);
  await assert.rejects(() => verifyPlanListCursor(token, SECRET, { ownerId: OWNER, limit: 3, now: NOW }), /LIST_CURSOR_INVALID/);
  await assert.rejects(() => verifyPlanListCursor(token, SECRET, { ownerId: OWNER, limit: 2, now: '2026-10-11T01:00:00.000Z' }), /LIST_CURSOR_INVALID/);
});

test('resource list cursors reject unsafe expected runtime types before HMAC verification', async () => {
  const reminder = await signReminderListCursor(value, SECRET);
  const session = await signSessionListCursor({ version: 1, ownerId: OWNER, endpoint: 'focus-sessions', limit: 25, beforeStartedAt: '2026-10-10T01:00:00.000Z', beforeId: ID, expiresAt: '2026-10-11T01:00:00.000Z' }, SECRET);
  const appSession = await signAppSessionListCursor({ version: 1, ownerId: OWNER, endpoint: 'account-sessions', limit: 2, beforeIssuedAt: '2026-10-11T00:00:00.000Z', beforeId: ID, expiresAt: '2026-10-11T01:00:00.000Z' }, SECRET);
  const breakCursor = await signBreakListCursor({ version: 1, ownerId: OWNER, endpoint: 'breaks', limit: 25, beforeEndedAt: '2026-10-10T01:00:00.000Z', beforeId: ID, expiresAt: '2026-10-11T01:00:00.000Z' }, SECRET);
  const plan = await signPlanListCursor({ version: 1, ownerId: OWNER, endpoint: 'plans', limit: 2, beforeCreatedAt: '2026-10-10T01:00:00.000Z', beforeId: ID, expiresAt: '2026-10-11T01:00:00.000Z' }, SECRET);
  for (const verify of [
    () => verifyReminderListCursor(reminder, SECRET, { ownerId: Symbol('owner'), limit: 25, now: NOW }),
    () => verifySessionListCursor(session, SECRET, { ownerId: OWNER, limit: 25, now: Symbol('clock') }),
    () => verifyAppSessionListCursor(appSession, SECRET, { ownerId: Symbol('owner'), limit: 2, now: NOW }),
    () => verifyBreakListCursor(breakCursor, SECRET, { ownerId: OWNER, limit: 25, now: Symbol('clock') }),
    () => verifyPlanListCursor(plan, SECRET, { ownerId: Symbol('owner'), limit: 2, now: NOW }),
  ]) await assert.rejects(verify, /LIST_CURSOR_INVALID/);
});
