import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';

register('../helpers/local-database-loader.mjs', import.meta.url);

const { DatabaseSync } = await import('node:sqlite');
const { createAccountLocalDatabaseStore } = await import('../../src/features/storage/local-database.ts');

const USER_A = '11111111-1111-4111-8111-111111111111';
const USER_B = '22222222-2222-4222-8222-222222222222';
const NOW = '2026-10-09T03:00:00.000Z';

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

function dependencies(db) {
  return { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => NOW };
}

function task(id) { return { id, title: id, status: 'pending', createdAt: NOW, updatedAt: NOW }; }
function plan(id, taskId, overrides = {}) {
  return {
    id, provider: 'mock', model: 'local-heuristic-v1', createdAt: NOW, confirmedAt: NOW,
    status: 'active', items: [{ taskId, position: 0, focusDurationSeconds: 1500, breakDurationSeconds: 300 }], ...overrides,
  };
}

test('confirmed plans persist in SQLite and reopen with ordered items', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  await store.saveTasks([task('plan-task')]);
  await store.saveConfirmedPlan(plan('plan-one', 'plan-task'));
  assert.deepEqual(await store.loadActivePlan(), plan('plan-one', 'plan-task'));
  assert.ok(db.database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='saved_plans'").get());
  assert.equal(db.database.prepare('PRAGMA user_version').get().user_version, 12);
});

test('saving another confirmed plan retires the old plan atomically', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  await store.saveTasks([task('first-task'), task('second-task')]);
  await store.saveConfirmedPlan(plan('plan-one', 'first-task'));
  await store.saveConfirmedPlan(plan('plan-two', 'second-task'));
  assert.equal((await store.loadActivePlan()).id, 'plan-two');
  assert.equal(db.database.prepare("SELECT status FROM saved_plans WHERE id = 'plan-one'").get().status, 'cancelled');
  assert.equal(db.database.prepare("SELECT count(*) AS count FROM saved_plans WHERE status = 'active'").get().count, 1);
});

test('plan ownership and task ownership are enforced without cross-account reads', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const a = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  const b = createAccountLocalDatabaseStore(USER_B, dependencies(db));
  await a.saveTasks([task('same-task')]);
  await assert.rejects(b.saveConfirmedPlan(plan('other-plan', 'same-task')), /INVALID_PLAN/);
  assert.equal(await b.loadActivePlan(), null);
  assert.deepEqual((await a.loadActivePlan()), null);
});

test('invalid plan writes do not leave a partial saved plan', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  await store.saveTasks([task('valid-task')]);
  await assert.rejects(store.saveConfirmedPlan(plan('bad-plan', 'valid-task', { items: [{ taskId: 'valid-task', position: 0, focusDurationSeconds: 0, breakDurationSeconds: 300 }] })), /INVALID_PLAN/);
  assert.equal(await store.loadActivePlan(), null);
  assert.equal(db.database.prepare('SELECT count(*) AS count FROM saved_plans').get().count, 0);
});
