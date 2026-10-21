import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';

register('../helpers/local-database-loader.mjs', import.meta.url);
const { DatabaseSync } = await import('node:sqlite');
const { applySqliteV2SyncPage, ensureSqliteV2SyncSchema } = await import('../../src/features/sync/sqlite-v2-sync-storage.ts');
const { buildV2SyncGroup } = await import('../../supabase/functions/_shared/postgres-sync-v2-transaction-adapter.ts');

const OWNER_A = 'account:11111111-1111-4111-8111-111111111111';
const OWNER_B = 'account:22222222-2222-4222-8222-222222222222';
const TRANSACTION = '33333333-3333-4333-8333-333333333333';
const PLAN = '44444444-4444-4444-8444-444444444444';
const WORKSPACE = '55555555-5555-4555-8555-555555555555';
const TASK = '66666666-6666-4666-8666-666666666666';
const BLOCK = '77777777-7777-4777-8777-777777777777';
const NOW = '2026-10-11T00:00:00.000Z';
const plan = { id: PLAN, workspaceId: WORKSPACE, localDate: '2026-10-11', timeZone: 'Asia/Colombo', availableStart: NOW, availableEnd: '2026-10-11T02:00:00.000Z', explanation: null, blocks: [{ id: BLOCK, kind: 'focus', taskId: TASK, startsAt: '2026-10-11T00:10:00.000Z', endsAt: '2026-10-11T00:35:00.000Z', reminderId: null }], version: 1, createdAt: NOW, sourceProposalId: WORKSPACE, state: 'active', updatedAt: NOW };
function dbAdapter(database) { return { execAsync: async (sql) => database.exec(sql), getFirstAsync: async (sql, ...args) => database.prepare(sql).get(...args) ?? null, getAllAsync: async (sql, ...args) => database.prepare(sql).all(...args), runAsync: async (sql, ...args) => database.prepare(sql).run(...args) }; }
async function makePage() { const group = await buildV2SyncGroup({ transactionId: TRANSACTION, privacyEpoch: '1', firstSequence: '8', changes: [{ entityKind: 'plan', entityId: PLAN, operation: 'upsert', payload: plan }, { entityKind: 'reminder', entityId: TASK, operation: 'delete', payload: null }] }); return { contractVersion: 2, privacyEpoch: '1', highWater: '9', nextCursor: 'signed.cursor', caughtUp: true, groups: [group] }; }

test('SQLite v2 storage applies a complete group, replays it and isolates owners', async (t) => {
  const database = new DatabaseSync(':memory:'); t.after(() => database.close()); const db = dbAdapter(database); const page = await makePage();
  assert.deepEqual(await applySqliteV2SyncPage(db, OWNER_A, page, NOW), { applied: 1, replayed: 0, nextCursor: 'signed.cursor' });
  assert.equal((await db.getFirstAsync('PRAGMA foreign_keys')).foreign_keys, 1);
  assert.deepEqual(await applySqliteV2SyncPage(db, OWNER_A, page, NOW), { applied: 0, replayed: 1, nextCursor: 'signed.cursor' });
  assert.equal(await db.getFirstAsync('SELECT COUNT(*) AS count FROM sync_v2_groups WHERE owner_id = ?', OWNER_B).then((row) => row.count), 0);
  assert.equal(await db.getFirstAsync('SELECT COUNT(*) AS count FROM sync_v2_changes WHERE owner_id = ?', OWNER_A).then((row) => row.count), 2);
});

test('SQLite v2 storage rejects a replay when a persisted change hash is corrupted', async (t) => {
  const database = new DatabaseSync(':memory:'); t.after(() => database.close()); const db = dbAdapter(database); const page = await makePage();
  await applySqliteV2SyncPage(db, OWNER_A, page, NOW);
  await db.runAsync("UPDATE sync_v2_changes SET change_hash = 'b' || substr(change_hash, 2) WHERE owner_id = ?", OWNER_A);
  await assert.rejects(() => applySqliteV2SyncPage(db, OWNER_A, page, NOW), /SYNC_V2_REPLAY_CONFLICT/);
  assert.equal((await db.getFirstAsync('SELECT COUNT(*) AS count FROM sync_v2_groups WHERE owner_id = ?', OWNER_A)).count, 1);
});

test('SQLite v2 storage rolls back a failed group and retries after restart', async (t) => {
  const database = new DatabaseSync(':memory:'); t.after(() => database.close()); const db = dbAdapter(database); const page = await makePage();
  await ensureSqliteV2SyncSchema(db);
  await db.execAsync("CREATE TRIGGER fail_v2_change BEFORE INSERT ON sync_v2_changes WHEN NEW.sequence = '9' BEGIN SELECT RAISE(ABORT, 'injected'); END;");
  await assert.rejects(() => applySqliteV2SyncPage(db, OWNER_A, page, NOW), /injected/);
  assert.equal((await db.getFirstAsync('SELECT COUNT(*) AS count FROM sync_v2_groups')).count, 0);
  await db.execAsync('DROP TRIGGER fail_v2_change');
  assert.equal((await applySqliteV2SyncPage(db, OWNER_A, page, NOW)).applied, 1);
});
