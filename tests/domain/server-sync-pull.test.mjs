import assert from 'node:assert/strict';
import test from 'node:test';

const { readAuthorizedSyncPage } = await import('../../supabase/functions/_shared/sync-pull.ts');
const { verifySyncCursor } = await import('../../supabase/functions/_shared/sync-cursor.ts');

const SECRET = 'server-only-development-secret-with-32-bytes-minimum';
const OWNER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '22222222-2222-4222-8222-222222222222';
const TASK = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-10-10T00:00:00.000Z';
const EXPIRY = '2026-10-10T01:00:00.000Z';

const change = { sequence: '11', entityKind: 'task', entityId: TASK, operation: 'upsert', payload: { title: 'Study' } };

test('server pull binds the read to the verified actor and signs the returned high-water cursor', async () => {
  const calls = [];
  const result = await readAuthorizedSyncPage({ actorId: OWNER, cursor: null, limit: 50, secret: SECRET, now: NOW, expiresAt: EXPIRY, store: {
    async readPage(input) { calls.push(input); return { highWater: '20', changes: [change] }; },
  } });
  assert.deepEqual(calls, [{ ownerId: OWNER, after: '0', highWater: null, limit: 50 }]);
  assert.deepEqual(result.changes, [change]);
  assert.deepEqual(await verifySyncCursor(result.nextCursor, SECRET, { ownerId: OWNER, limit: 50, now: NOW }), {
    version: 1, ownerId: OWNER, endpoint: 'sync', limit: 50, after: '11', highWater: '20', expiresAt: EXPIRY,
  });
});

test('server pull reuses a verified cursor scope and does not accept a foreign cursor', async () => {
  let reads = 0;
  const store = { async readPage(input) { reads += 1; assert.deepEqual(input, { ownerId: OWNER, after: '11', highWater: '20', limit: 50 }); return { highWater: '20', changes: [] }; } };
  const first = await readAuthorizedSyncPage({ actorId: OWNER, cursor: null, limit: 50, secret: SECRET, now: NOW, expiresAt: EXPIRY, store: { async readPage() { return { highWater: '20', changes: [change] }; } } });
  const second = await readAuthorizedSyncPage({ actorId: OWNER, cursor: first.nextCursor, limit: 50, secret: SECRET, now: NOW, expiresAt: EXPIRY, store });
  assert.deepEqual(second.changes, []);
  assert.equal(reads, 1);
  await assert.rejects(readAuthorizedSyncPage({ actorId: FOREIGN, cursor: first.nextCursor, limit: 50, secret: SECRET, now: NOW, expiresAt: EXPIRY, store }), /SYNC_CURSOR_INVALID/);
});

test('server pull preserves a canonical delete change with a null payload', async () => {
  const deleted = { sequence: '11', entityKind: 'goal', entityId: TASK, operation: 'delete', payload: null };
  const result = await readAuthorizedSyncPage({ actorId: OWNER, cursor: null, limit: 50, secret: SECRET, now: NOW, expiresAt: EXPIRY, store: {
    async readPage() { return { highWater: '20', changes: [deleted] }; },
  } });
  assert.deepEqual(result.changes, [deleted]);
});

test('server pull rejects foreign-shaped, out-of-range and unordered store data', async () => {
  const base = { actorId: OWNER, cursor: null, limit: 50, secret: SECRET, now: NOW, expiresAt: EXPIRY };
  await assert.rejects(readAuthorizedSyncPage({ ...base, store: { async readPage() { return { highWater: '10', changes: [{ ...change, sequence: '11' }] }; } } }), /SYNC_CHANGE_INVALID/);
  await assert.rejects(readAuthorizedSyncPage({ ...base, store: { async readPage() { return { highWater: '20', changes: [{ ...change, sequence: '12' }, { ...change, sequence: '11' }] }; } } }), /SYNC_SEQUENCE_ORDER_INVALID/);
  await assert.rejects(readAuthorizedSyncPage({ ...base, store: { async readPage() { return { highWater: '20', changes: [{ ...change, entityId: 'not-an-id' }] }; } } }), /SYNC_CHANGE_INVALID/);
});

test('server pull never hides a store failure as an empty page', async () => {
  await assert.rejects(readAuthorizedSyncPage({ actorId: OWNER, cursor: null, limit: 50, secret: SECRET, now: NOW, expiresAt: EXPIRY, store: { async readPage() { throw new Error('DB_UNAVAILABLE'); } } }), /DB_UNAVAILABLE/);
});
