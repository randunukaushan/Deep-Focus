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

function draft(revision = 1) {
  return {
    assignmentId: 'assignment-1', classId: 'class-1', title: 'Algebra practice',
    instructions: 'Complete the selected exercises.', revision,
    education: { country: 'LK', stage: 'ol', subject: 'Mathematics' },
  };
}

test('SQLite v8 persists assignment drafts and rejects stale revisions', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  assert.equal(await store.saveTeacherAssignmentDraft(draft()), true);
  assert.equal(db.database.prepare('PRAGMA user_version').get().user_version, 12);
  assert.equal(await store.saveTeacherAssignmentDraft(draft()), false);
  assert.equal(await store.saveTeacherAssignmentDraft({ ...draft(2), title: 'Algebra revision' }), true);
  assert.deepEqual(await store.loadTeacherAssignmentDrafts(), [{ ...draft(2), title: 'Algebra revision' }]);
});

test('assignment drafts remain isolated by account owner', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const a = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  const b = createAccountLocalDatabaseStore(USER_B, dependencies(db));
  await a.saveTeacherAssignmentDraft(draft());
  assert.deepEqual(await b.loadTeacherAssignmentDrafts(), []);
  await b.saveTeacherAssignmentDraft({ ...draft(), title: 'Private B draft' });
  assert.equal((await a.loadTeacherAssignmentDrafts())[0].title, 'Algebra practice');
  assert.equal((await b.loadTeacherAssignmentDrafts())[0].title, 'Private B draft');
});

test('corrupt assignment metadata fails closed on read', async (t) => {
  const db = makeDatabaseAdapter(); t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, dependencies(db));
  await store.saveTeacherAssignmentDraft(draft());
  await db.runAsync('PRAGMA ignore_check_constraints = ON');
  await db.runAsync('UPDATE teacher_assignment_drafts SET education_json = ? WHERE owner_id = ? AND assignment_id = ?', JSON.stringify({ country: 'US', stage: 'ol' }), `account:${USER_A}`, 'assignment-1');
  await assert.rejects(store.loadTeacherAssignmentDrafts(), /TEACHER_ASSIGNMENT_DATA_UNAVAILABLE/);
});
