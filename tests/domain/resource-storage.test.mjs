import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';

register('../helpers/local-database-loader.mjs', import.meta.url);

const { DatabaseSync } = await import('node:sqlite');
const { createAccountLocalDatabaseStore } = await import('../../src/features/storage/local-database.ts');

const USER_A = '11111111-1111-4111-8111-111111111111';
const USER_B = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-09T02:00:00.000Z';

function makeDatabaseAdapter() {
  const database = new DatabaseSync(':memory:');
  return {
    database,
    async execAsync(sql) { database.exec(sql); },
    async getFirstAsync(sql, ...parameters) { return database.prepare(sql).get(...parameters) ?? null; },
    async getAllAsync(sql, ...parameters) { return database.prepare(sql).all(...parameters); },
    async runAsync(sql, ...parameters) { return database.prepare(sql).run(...parameters); },
    close() { database.close(); },
  };
}

function task(id) {
  return { id, title: id, status: 'pending', createdAt: NOW, updatedAt: NOW };
}

function resource(id, overrides = {}) {
  return {
    id, kind: 'reference', title: `Reference ${id}`, reference: `Book:${id}`, revision: 1,
    lifecycle: 'active', createdAt: NOW, updatedAt: NOW, ...overrides,
  };
}

function dependencies(db, now = NOW) {
  return { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now };
}

test('SQLite v8 creates resource, saved-plan and teacher-draft tables and persists references across store reopen', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const first = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  await first.saveResource(resource('study-book'));
  assert.equal(db.database.prepare('PRAGMA user_version').get().user_version, 12);
  assert.ok(db.database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='local_resources'").get());
  assert.deepEqual((await createAccountLocalDatabaseStore(USER_A, dependencies(db)).loadResources()).map(({ id, reference }) => ({ id, reference })), [{ id: 'study-book', reference: 'Book:study-book' }]);
});

test('resources and links remain isolated by owner, including same IDs', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const a = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  const b = createAccountLocalDatabaseStore(USER_B, dependencies(db));
  await a.saveTasks([task('shared-task')]); await b.saveTasks([task('shared-task')]);
  await a.saveResource(resource('shared-resource', { title: 'A private reference' }));
  await b.saveResource(resource('shared-resource', { title: 'B private reference' }));
  assert.equal(await a.linkResourceToTask('shared-task', 'shared-resource', 1, 'A notes'), true);
  assert.equal(await b.linkResourceToTask('shared-task', 'shared-resource', 1, 'B notes'), true);
  assert.deepEqual(await a.loadTaskResourceLinks('shared-task'), [{ taskId: 'shared-task', resourceId: 'shared-resource', resourceRevision: 1, workSlice: 'A notes', position: 0 }]);
  assert.deepEqual(await b.loadTaskResourceLinks('shared-task'), [{ taskId: 'shared-task', resourceId: 'shared-resource', resourceRevision: 1, workSlice: 'B notes', position: 0 }]);
  assert.equal((await a.loadResources())[0].title, 'A private reference');
  assert.equal((await b.loadResources())[0].title, 'B private reference');
  assert.equal(await a.linkResourceToTask('missing-task', 'shared-resource', 1), false);
});

test('resource revisions are required for links and missing resources cannot be linked', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  await store.saveTasks([task('resource-task')]); await store.saveResource(resource('changing-resource'));
  assert.equal(await store.linkResourceToTask('resource-task', 'changing-resource', 2), false);
  assert.equal(await store.markResourceMissing('changing-resource', NOW), true);
  const missing = (await store.loadResources())[0];
  assert.equal(missing.lifecycle, 'missing'); assert.equal(missing.revision, 2);
  assert.equal(await store.linkResourceToTask('resource-task', 'changing-resource', 2), false);
  assert.equal(await store.markResourceMissing('changing-resource', NOW), false);
});

test('links update idempotently, unlink independently, and cascade only with their task', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  await store.saveTasks([task('task-a'), task('task-b')]); await store.saveResource(resource('resource-a'));
  assert.equal(await store.linkResourceToTask('task-a', 'resource-a', 1, 'first', 2), true);
  assert.equal(await store.linkResourceToTask('task-a', 'resource-a', 1, 'updated', 1), true);
  assert.deepEqual(await store.loadTaskResourceLinks('task-a'), [{ taskId: 'task-a', resourceId: 'resource-a', resourceRevision: 1, workSlice: 'updated', position: 1 }]);
  assert.equal(await store.linkResourceToTask('task-b', 'resource-a', 1), true);
  assert.equal(await store.unlinkResourceFromTask('task-a', 'resource-a'), true);
  assert.deepEqual(await store.loadTaskResourceLinks('task-a'), []);
  assert.equal((await store.loadTaskResourceLinks('task-b'))[0].resourceId, 'resource-a');
});

test('resource writes roll back together and corrupted rows fail closed on read', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  await store.saveTasks([task('rollback-task')]); await store.saveResource(resource('rollback-resource'));
  await assert.rejects(store.linkResourceToTask('rollback-task', 'rollback-resource', 1, '\u0000bad'), /INVALID_RESOURCE/);
  assert.deepEqual(await store.loadTaskResourceLinks('rollback-task'), []);
  await db.runAsync('PRAGMA ignore_check_constraints = ON');
  await db.runAsync('UPDATE local_resources SET title = ? WHERE owner_id = ? AND id = ?', '', `account:${USER_A}`, 'rollback-resource');
  await assert.rejects(store.loadResources(), /INVALID_RESOURCE/);
});
