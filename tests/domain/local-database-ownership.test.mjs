import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';

register('../helpers/local-database-loader.mjs', import.meta.url);

const { DatabaseSync } = await import('node:sqlite');
const { createLocalDatabaseStore, createAccountLocalDatabaseStore } = await import('../../src/features/storage/local-database.ts');
const { applyAuthorizedSyncPage } = await import('../../src/features/sync/sync-pull-apply.ts');
const { recoverSyncPullFailure } = await import('../../src/features/sync/sync-pull-recovery.ts');
const { createFocusSession, completeFocusSession, cancelFocusSession } = await import('../../src/features/focus/session-engine.ts');
const USER_A = '11111111-1111-4111-8111-111111111111';
const USER_B = '22222222-2222-4222-8222-222222222222';

function makeDatabaseAdapter() {
  const database = new DatabaseSync(':memory:');
  return {
    async execAsync(sql) { database.exec(sql); },
    async getFirstAsync(sql, ...parameters) { return database.prepare(sql).get(...parameters) ?? null; },
    async getAllAsync(sql, ...parameters) { return database.prepare(sql).all(...parameters); },
    async runAsync(sql, ...parameters) { return database.prepare(sql).run(...parameters); },
    close() { database.close(); },
  };
}

function task(id, title) {
  return { id, title, status: 'pending', createdAt: '2026-10-07T00:00:00.000Z', updatedAt: '2026-10-07T00:00:00.000Z' };
}

test('real SQLite keeps overlapping task IDs isolated by authenticated owner and preserves device-local rows', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const legacyTask = task('same-id', 'Legacy device-only task');
  let legacyReadCount = 0;
  const dependencies = {
    platform: 'android',
    openDatabase: async () => db,
    readLegacyFiles: async () => { legacyReadCount += 1; return { 'deep-focus-tasks.json': JSON.stringify([legacyTask]) }; },
    now: () => '2026-10-07T00:00:00.000Z',
  };
  const local = createLocalDatabaseStore(dependencies);
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);

  assert.deepEqual(await local.loadTasks(), [legacyTask]);
  await accountA.saveTasks([task('same-id', 'Account A task')]);
  await accountB.saveTasks([task('same-id', 'Account B task')]);

  assert.deepEqual((await accountA.loadTasks()).map(({ title }) => title), ['Account A task']);
  assert.deepEqual((await accountB.loadTasks()).map(({ title }) => title), ['Account B task']);
  assert.deepEqual((await local.loadTasks()).map(({ title }) => title), ['Legacy device-only task']);
  assert.equal(legacyReadCount, 1, 'Account stores must not re-import or claim legacy JSON');

  await Promise.all([
    accountA.saveTasks([task('a-second', 'A second')]),
    accountB.saveTasks([task('b-second', 'B second')]),
  ]);
  assert.deepEqual((await accountA.loadTasks()).map(({ title }) => title).sort(), ['A second', 'Account A task']);
  assert.deepEqual((await accountB.loadTasks()).map(({ title }) => title).sort(), ['Account B task', 'B second']);
});

test('real SQLite stages snapshot pages atomically, makes retries idempotent, and preserves owner isolation', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}) };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const snapshot = {
    snapshotId: '33333333-3333-4333-8333-333333333333', highWater: '12', pageCount: 2,
    manifestDigest: 'a'.repeat(64), resumeCursor: 'resume-12',
  };
  const page0 = {
    snapshotId: snapshot.snapshotId, pageIndex: 0, pageCount: 2, highWater: '12', pageDigest: 'b'.repeat(64),
    payload: [{ entity: 'task', entityId: '44444444-4444-4444-8444-444444444444', version: 1 }], nextCursor: 'page-1',
  };
  const page1 = { ...page0, pageIndex: 1, pageDigest: 'c'.repeat(64), payload: [{ entity: 'goal', entityId: '55555555-5555-4555-8555-555555555555', version: 1 }], nextCursor: null };

  assert.equal(await accountA.beginSnapshotStaging(snapshot), 'created');
  assert.equal(await accountA.beginSnapshotStaging(snapshot), 'existing', 'retrying the same staging header must not duplicate it');
  assert.equal(await accountA.stageSnapshotPage(page0), 'inserted');
  assert.equal(await accountA.stageSnapshotPage(page0), 'existing', 'retrying the same page must be idempotent');
  await assert.rejects(accountA.stageSnapshotPage({ ...page0, pageDigest: 'd'.repeat(64) }), /SNAPSHOT_PAGE_CONFLICT/);
  assert.equal(await accountA.failSnapshotStaging(snapshot.snapshotId), true);
  assert.equal((await accountA.loadSnapshotStaging(snapshot.snapshotId)).pages.length, 1, 'failure must retain durable pages');
  await assert.rejects(accountA.stageSnapshotPage(page1), /SNAPSHOT_NOT_BUILDING/);
  assert.equal(await accountA.resumeSnapshotStaging(snapshot.snapshotId), true, 'restart recovery must reopen only failed staging');
  await assert.rejects(accountA.finalizeSnapshotStaging(snapshot.snapshotId), /SNAPSHOT_INCOMPLETE/);
  assert.equal(await accountB.loadSnapshotStaging(snapshot.snapshotId), null, 'a snapshot must never be readable from another account');

  await accountA.stageSnapshotPage(page1);
  await accountA.finalizeSnapshotStaging(snapshot.snapshotId);
  const reopened = createAccountLocalDatabaseStore(USER_A, dependencies);
  const loaded = await reopened.loadSnapshotStaging(snapshot.snapshotId);
  assert.equal(loaded.staging.status, 'ready');
  assert.deepEqual(loaded.pages.map(({ pageIndex, payload }) => ({ pageIndex, payload })), [
    { pageIndex: 0, payload: page0.payload }, { pageIndex: 1, payload: page1.payload },
  ]);
  await assert.rejects(accountA.stageSnapshotPage(page1), /SNAPSHOT_NOT_BUILDING/);

  await db.runAsync('UPDATE sync_snapshot_staging_pages SET payload_json = ? WHERE owner_id = ? AND snapshot_id = ? AND page_index = 0',
    '["corrupt-shape"]', `account:${USER_A.toLowerCase()}`, snapshot.snapshotId);
  await assert.rejects(reopened.loadSnapshotStaging(snapshot.snapshotId), /SNAPSHOT_DATA_UNAVAILABLE/);
});

test('validated snapshot orchestration binds the owner and marks failed staging for recovery', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}) };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const snapshotId = '99999999-9999-4999-8999-999999999999';
  const page = {
    snapshotId, pageIndex: 0, pageCount: 1, highWater: '15', pageDigest: 'e'.repeat(64),
    payload: [{ entity: 'task', entityId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', version: 1 }], nextCursor: null,
  };
  const input = { ownerId: USER_A, snapshotId, highWater: '15', pageCount: 1, manifestDigest: 'f'.repeat(64), resumeCursor: 'resume-15', pages: [page] };
  assert.deepEqual(await accountA.stageValidatedSnapshot(input), { snapshotId, status: 'ready', pageCount: 1 });
  assert.equal((await accountA.loadSnapshotStaging(snapshotId)).staging.status, 'ready');
  await assert.rejects(accountB.stageValidatedSnapshot(input), /SNAPSHOT_OWNER_INVALID/);
});

test('validated mirror pages map into SQLite staging without touching live domain rows', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const store = createAccountLocalDatabaseStore(USER_A, { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}) });
  const snapshotId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const page = { snapshotId, pageIndex: 0, pageCount: 1, highWater: '18', pageDigest: 'a'.repeat(64), data: [{ entity: 'goal', entityId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', version: 1, operation: 'upsert' }], nextCursor: null };
  assert.deepEqual(await store.stageValidatedMirrorSnapshot({ ownerId: USER_A, snapshotId, highWater: '18', resumeCursor: 'cursor-18', pages: [page] }), { snapshotId, status: 'ready', pageCount: 1 });
  const loaded = await store.loadSnapshotStaging(snapshotId);
  assert.deepEqual(loaded.pages[0].payload, page.data);
  assert.deepEqual(await store.loadTasks(), []);
  assert.deepEqual(await store.loadGoals(), []);
});

test('SQLite snapshot apply swaps only the remote mirror, preserves local work, and rolls back on cursor failure', async (t) => {
  const database = new DatabaseSync(':memory:');
  t.after(() => database.close());
  let failCursorWrite = false;
  const db = {
    async execAsync(sql) { database.exec(sql); },
    async getFirstAsync(sql, ...parameters) { return database.prepare(sql).get(...parameters) ?? null; },
    async getAllAsync(sql, ...parameters) { return database.prepare(sql).all(...parameters); },
    async runAsync(sql, ...parameters) {
      if (failCursorWrite && sql.startsWith('INSERT INTO sync_remote_cursors')) {
        failCursorWrite = false;
        throw new Error('injected cursor failure');
      }
      return database.prepare(sql).run(...parameters);
    },
  };
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => '2026-10-10T00:00:00.000Z' };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  await accountA.saveTasks([task('local-task', 'Keep local overlay')]);
  await db.runAsync(
    `INSERT INTO local_outbox (owner_id,mutation_id,command,entity_type,target_id,base_version,payload_schema_version,payload_json,payload_hash,client_created_at,next_attempt_at,state)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending')`,
    `account:${USER_A}`, 'mutation-a', 'task.update', 'task', 'local-task', 1, 1, '{"title":"pending"}', 'a'.repeat(64), dependencies.now(), dependencies.now(),
  );
  const first = {
    ownerId: `account:${USER_A}`,
    snapshotId: '66666666-6666-4666-8666-666666666666',
    highWater: '20',
    resumeCursor: 'cursor-20',
    entities: [{ entity: 'task', entityId: '77777777-7777-4777-8777-777777777777', version: 1, operation: 'upsert', payload: { title: 'Remote v1' } }],
    preserveOutbox: true,
    preserveLocalOverlay: true,
  };
  await accountA.applySnapshotAtomically(first);
  assert.deepEqual((await accountA.loadRemoteMirror()).entities, first.entities);
  assert.equal((await accountA.loadRemoteMirror()).cursor.highWater, '20');
  assert.deepEqual((await accountA.loadTasks()).map(({ id }) => id), ['local-task']);
  assert.equal((await accountA.loadPendingOutbox()).length, 1);
  assert.deepEqual((await accountB.loadRemoteMirror()), { cursor: null, entities: [] }, 'mirror rows are owner isolated');

  failCursorWrite = true;
  await assert.rejects(accountA.applySnapshotAtomically({ ...first, snapshotId: '88888888-8888-4888-8888-888888888888', highWater: '21', resumeCursor: 'cursor-21', entities: [{ ...first.entities[0], payload: { title: 'Remote v2' } }] }), /injected cursor failure/);
  assert.deepEqual((await accountA.loadRemoteMirror()).entities, first.entities, 'failed swap restores previous mirror');
  assert.equal((await accountA.loadRemoteMirror()).cursor.highWater, '20', 'failed swap restores previous cursor');
  assert.deepEqual((await accountA.loadTasks()).map(({ id }) => id), ['local-task']);
  assert.equal((await accountA.loadPendingOutbox()).length, 1);
});

test('SQLite incremental pull is owner-scoped, replay-safe, conflict-safe, and atomic with its cursor', async (t) => {
  const database = new DatabaseSync(':memory:');
  t.after(() => database.close());
  let failCursorWrite = false;
  const db = {
    async execAsync(sql) { database.exec(sql); },
    async getFirstAsync(sql, ...parameters) { return database.prepare(sql).get(...parameters) ?? null; },
    async getAllAsync(sql, ...parameters) { return database.prepare(sql).all(...parameters); },
    async runAsync(sql, ...parameters) {
      if (failCursorWrite && sql.startsWith('INSERT INTO sync_remote_pull_cursors')) {
        failCursorWrite = false;
        throw new Error('injected pull cursor failure');
      }
      return database.prepare(sql).run(...parameters);
    },
  };
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => '2026-10-10T01:00:00.000Z' };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const owner = `account:${USER_A}`;
  const page = {
    nextCursor: 'cursor-1',
    changes: [{ sequence: '1', entityKind: 'task', entityId: '99999999-9999-4999-8999-999999999999', operation: 'upsert', payload: { title: 'Remote task' } }],
  };
  let firstResult;
  await applyAuthorizedSyncPage(owner, page, {
    applyPageAtomically: async (ownerId, validated) => { firstResult = await accountA.applySyncPageAtomically({ ownerId, ...validated }); },
  });
  assert.deepEqual(firstResult, { applied: 1, replayed: 0, nextCursor: 'cursor-1' });
  await applyAuthorizedSyncPage(owner, page, {
    applyPageAtomically: async (ownerId, validated) => { firstResult = await accountA.applySyncPageAtomically({ ownerId, ...validated }); },
  });
  assert.deepEqual(firstResult, { applied: 0, replayed: 1, nextCursor: 'cursor-1' });
  assert.deepEqual((await accountA.loadRemoteMirror()).entities.map(({ entity, entityId, payload }) => ({ entity, entityId, payload })), [
    { entity: 'task', entityId: page.changes[0].entityId, payload: page.changes[0].payload },
  ]);
  assert.deepEqual(await accountB.loadRemoteMirror(), { cursor: null, entities: [] });
  failCursorWrite = true;
  await assert.rejects(accountA.applySyncPageAtomically({ ownerId: owner, nextCursor: 'cursor-2', changes: [{ sequence: '2', entityKind: 'goal', entityId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', operation: 'upsert', payload: { title: 'Should roll back' } }] }), /injected pull cursor failure/);
  assert.equal((await accountA.loadRemotePullState()).lastSequence, '1');
  assert.equal((await accountA.loadRemoteMirror()).entities.some(({ entityId }) => entityId === 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), false);
  await db.runAsync(
    `INSERT INTO sync_remote_change_receipts (owner_id,sequence,change_hash,entity_kind,entity_id,operation,created_at)
     VALUES (?,?,?,?,?,?,?)`, owner, '4', 'b'.repeat(64), 'task', page.changes[0].entityId, 'upsert', dependencies.now(),
  );
  await assert.rejects(accountA.applySyncPageAtomically({ ownerId: owner, nextCursor: 'cursor-4', changes: [{ sequence: '4', entityKind: 'task', entityId: page.changes[0].entityId, operation: 'upsert', payload: { title: 'Conflicting replay' } }] }), /SYNC_REPLAY_CONFLICT/);
});

test('SQLite materializes owner settings sync atomically, replays safely, and rejects unsupported data', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => '2026-10-11T00:00:00.000Z' };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const owner = `account:${USER_A}`;
  const settingsId = '77777777-7777-4777-8777-777777777777';
  const page = { nextCursor: 'settings-1', changes: [{ sequence: '1', entityKind: 'settings', entityId: settingsId, operation: 'upsert', payload: { id: settingsId, theme: 'dark', uiLocale: 'si', defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 10, aiFeaturesEnabled: true, version: 2, updatedAt: '2026-10-11T00:00:00.000Z' } }] };
  await applyAuthorizedSyncPage(owner, page, { applyPageAtomically: async (ownerId, validated) => accountA.applySyncPageAtomically({ ownerId, ...validated }) });
  const materialized = await db.getFirstAsync('SELECT theme,ai_features_enabled,version,updated_at FROM user_settings WHERE owner_id = ?', owner);
  assert.equal(materialized.theme, 'dark');
  assert.equal(materialized.ai_features_enabled, 1);
  assert.equal(materialized.version, 2);
  assert.equal(materialized.updated_at, '2026-10-11T00:00:00.000Z');
  assert.equal(await db.getFirstAsync('SELECT owner_id FROM user_settings WHERE owner_id = ?', `account:${USER_B}`), null);
  const replay = await accountA.applySyncPageAtomically({ ownerId: owner, ...page });
  assert.deepEqual(replay, { applied: 0, replayed: 1, nextCursor: 'settings-1' });
  await assert.rejects(accountA.applySyncPageAtomically({ ownerId: owner, nextCursor: 'settings-2', changes: [{ sequence: '2', entityKind: 'settings', entityId: settingsId, operation: 'upsert', payload: { ...page.changes[0].payload, defaultFocusDurationMinutes: 30, version: 3 } }] }), /SYNC_SETTINGS_INVALID/);
  assert.equal((await accountA.loadRemotePullState()).lastSequence, '1');
});

test('SQLite stale-cursor reset clears only remote sync state and preserves local work and mirror data', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}) };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const owner = `account:${USER_A}`;
  await accountA.saveTasks([task('kept-local', 'Keep during reset')]);
  await accountA.applySyncPageAtomically({
    ownerId: owner, nextCursor: 'cursor-7',
    changes: [{ sequence: '7', entityKind: 'task', entityId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', operation: 'upsert', payload: { title: 'Retain until snapshot swap' } }],
  });
  assert.equal((await accountA.loadRemotePullState()).lastSequence, '7');
  await recoverSyncPullFailure({ errorCode: 'SYNC_RESET_REQUIRED', resetCursor: () => accountA.resetRemotePullForSnapshot(owner) });
  assert.equal(await accountA.loadRemotePullState(), null);
  assert.deepEqual((await accountA.loadRemoteMirror()).entities.map(({ entityId }) => entityId), ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb']);
  assert.deepEqual((await accountA.loadTasks()).map(({ id }) => id), ['kept-local']);
  assert.equal(await accountB.loadRemotePullState(), null, 'reset state is isolated to the requesting owner');
});

test('real SQLite assessment drafts migrate atomically, survive reopen, and stay owner-isolated', async (t) => {
  const database = new DatabaseSync(':memory:');
  t.after(() => database.close());
  const adapter = {
    async execAsync(sql) { database.exec(sql); },
    async getFirstAsync(sql, ...parameters) { return database.prepare(sql).get(...parameters) ?? null; },
    async getAllAsync(sql, ...parameters) { return database.prepare(sql).all(...parameters); },
    async runAsync(sql, ...parameters) { return database.prepare(sql).run(...parameters); },
  };
  let failMigration = false;
  const migrationAdapter = {
    ...adapter,
    async execAsync(sql) {
      if (failMigration && sql.includes('ALTER TABLE user_settings')) {
        failMigration = false;
        database.exec(sql.split('ALTER TABLE user_settings')[0]);
        throw Error('injected migration interruption');
      }
      database.exec(sql);
    },
  };
  const dependencies = { platform: 'android', openDatabase: async () => adapter, readLegacyFiles: async () => ({}), now: () => '2026-10-07T02:00:00.000Z' };
  const initial = createAccountLocalDatabaseStore(USER_A, dependencies);
  await initial.saveTasks([task('kept-task', 'Keep existing data')]);
  assert.equal(database.prepare('PRAGMA user_version').get().user_version, 12);
  assert.ok(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sync_snapshot_staging'").get());
  assert.ok(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sync_snapshot_staging_pages'").get());
  assert.ok(database.prepare('PRAGMA table_info(user_settings)').all().some(({ name }) => name === 'ui_locale'));
  const legacyImport = database.prepare('SELECT version FROM local_migrations WHERE version = 1').get();
  assert.equal(legacyImport?.version, 1);

  database.exec('DROP TABLE user_settings; CREATE TABLE user_settings (owner_id TEXT PRIMARY KEY NOT NULL REFERENCES local_owners(id), default_break_duration_minutes INTEGER NOT NULL CHECK (default_break_duration_minutes IN (5,10,15)), legacy_extra_json TEXT); PRAGMA user_version = 2;');
  failMigration = true;
  const failedUpgrade = createAccountLocalDatabaseStore(USER_A, { ...dependencies, openDatabase: async () => migrationAdapter });
  await assert.rejects(failedUpgrade.loadTasks(), /injected migration interruption/);
  assert.equal(database.prepare('PRAGMA user_version').get().user_version, 2);
  assert.equal(database.prepare("SELECT name FROM pragma_table_info('user_settings') WHERE name='default_focus_duration_minutes'").get(), undefined);

  const recovered = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const startedAt = '2026-10-07T01:00:00.000Z';
  const draft = { id: 'assessment-one', version: '1', startedAt, answers: { pace: 'short', focusWindow: 25, interests: ['study', 'reading'], optional: false } };
  const revision = await recovered.saveAssessmentDraft(draft, null);
  assert.equal(revision, '2026-10-07T02:00:00.000Z');
  assert.equal(await recovered.saveAssessmentDraft(draft, null), null, 'retrying the same create must not duplicate or overwrite the saved attempt');
  assert.equal(await accountB.loadAssessment(draft.id), null);
  assert.deepEqual((await recovered.loadAssessment(draft.id)).answers, draft.answers);
  const reservedKeyDraft = { ...draft, id: 'assessment-reserved-key', answers: JSON.parse('{"__proto__":"kept as ordinary answer data"}') };
  await recovered.saveAssessmentDraft(reservedKeyDraft, null);
  const reservedKeyRead = await recovered.loadAssessment(reservedKeyDraft.id);
  assert.equal(Object.getPrototypeOf(reservedKeyRead.answers), Object.prototype);
  assert.equal(Object.hasOwn(reservedKeyRead.answers, '__proto__'), true);
  assert.equal(reservedKeyRead.answers.__proto__, 'kept as ordinary answer data');
  assert.deepEqual((await recovered.loadTasks()).map(({ id }) => id), ['kept-task']);

  const reopened = createAccountLocalDatabaseStore(USER_A, dependencies);
  assert.deepEqual((await reopened.loadAssessment(draft.id)).answers, draft.answers);
  assert.equal(database.prepare('PRAGMA user_version').get().user_version, 12);
  assert.ok(database.prepare('PRAGMA table_info(user_settings)').all().some(({ name }) => name === 'ui_locale'));
});

test('real SQLite assessment draft updates are atomic, revision-checked, and validate answers', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const now = '2026-10-07T02:00:00.000Z';
  const store = createAccountLocalDatabaseStore(USER_A, { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now });
  const initial = { id: 'assessment-revision', version: '1', startedAt: '2026-10-07T01:00:00.000Z', answers: { pace: 'short', duration: 25 } };
  const firstRevision = await store.saveAssessmentDraft(initial, null);
  const answerCreatedAt = (await db.getFirstAsync('SELECT created_at FROM assessment_answers WHERE assessment_id = ? AND question_id = ?', initial.id, 'pace')).created_at;
  const next = { ...initial, answers: { pace: 'long', duration: 45, flexibility: true } };
  const secondRevision = await store.saveAssessmentDraft(next, firstRevision);
  assert.equal(secondRevision, '2026-10-07T02:00:00.001Z');
  assert.equal((await db.getFirstAsync('SELECT created_at FROM assessment_answers WHERE assessment_id = ? AND question_id = ?', initial.id, 'pace')).created_at, answerCreatedAt, 'editing another answer preserves the original answer creation time');
  assert.equal(await store.saveAssessmentDraft({ ...initial, answers: { pace: 'stale' } }, firstRevision), null);
  assert.deepEqual((await store.loadAssessment(initial.id)).answers, next.answers);
  const competing = await Promise.all([
    store.saveAssessmentDraft({ ...initial, answers: { pace: 'choice-a' } }, secondRevision),
    store.saveAssessmentDraft({ ...initial, answers: { pace: 'choice-b' } }, secondRevision),
  ]);
  assert.equal(competing.filter(Boolean).length, 1, 'only one concurrent writer may advance a revision');
  const afterConcurrent = await store.loadAssessment(initial.id);
  assert.ok(['choice-a', 'choice-b'].includes(afterConcurrent.answers.pace));
  await assert.rejects(store.saveAssessmentDraft({ ...next, answers: { pace: Number.NaN } }, secondRevision), /INVALID_ASSESSMENT_ANSWER/);
  await assert.rejects(store.saveAssessmentDraft({ ...next, answers: { pace: { diagnostic: 'not allowed' } } }, secondRevision), /INVALID_ASSESSMENT_ANSWER/);
  assert.deepEqual((await store.loadAssessment(initial.id)).answers, afterConcurrent.answers);
  await db.execAsync('PRAGMA ignore_check_constraints = ON');
  await db.runAsync('UPDATE assessment_answers SET value_json = ? WHERE owner_id = ? AND assessment_id = ?', '{"unexpected":"object"}', `account:${USER_A}`, initial.id);
  await assert.rejects(store.loadAssessment(initial.id), /ASSESSMENT_DATA_UNAVAILABLE/);
});

test('real SQLite assessment cancellation is owner-scoped, revision-checked, and hides skipped drafts on reopen', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => '2026-10-07T03:00:00.000Z' };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const draft = { id: 'skipped-assessment', version: '1.0.0', startedAt: '2026-10-07T02:00:00.000Z', answers: { focus_time: 'morning' } };
  const revision = await accountA.saveAssessmentDraft(draft, null);
  assert.equal(await accountB.cancelAssessment(draft.id, revision), false, 'another owner cannot cancel the draft');
  assert.equal(await accountA.cancelAssessment(draft.id, '2026-10-07T01:00:00.000Z'), false, 'stale cancellation does not change the draft');
  assert.equal((await accountA.loadAssessment(draft.id)).status, 'in_progress');
  assert.equal(await accountA.cancelAssessment(draft.id, revision), true);
  assert.equal((await accountA.loadAssessment(draft.id)).status, 'cancelled');
  assert.equal((await accountB.loadAssessment(draft.id)), null);
  assert.equal(await accountA.cancelAssessment(draft.id, revision), false, 'cancellation is idempotent after terminal state');
});

test('real SQLite task-title update is owner-scoped, revision-checked, and rejects terminal tasks', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => '2026-10-07T02:00:00.000Z' };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const ownedTask = task('editable-task', 'Original title');
  await accountA.saveTasks([ownedTask]);
  assert.equal(await accountA.updateTaskTitle(ownedTask.id, ownedTask.updatedAt, ' Updated title '), '2026-10-07T02:00:00.000Z');
  assert.equal((await accountA.loadTasks())[0].title, 'Updated title');
  assert.equal(await accountA.updateTaskTitle(ownedTask.id, ownedTask.updatedAt, 'Stale overwrite'), null);
  assert.deepEqual(await accountB.loadTasks(), []);
  const renamedTask = (await accountA.loadTasks())[0];
  await accountA.saveTasks([{ ...renamedTask, status: 'completed', completedAt: '2026-10-07T02:01:00.000Z' }]);
  assert.equal(await accountA.updateTaskTitle(ownedTask.id, renamedTask.updatedAt, 'Terminal rewrite'), null);
  await assert.rejects(accountA.updateTaskTitle(ownedTask.id, renamedTask.updatedAt, '   '), /1 to 120/);
  assert.equal((await accountA.loadTasks())[0].title, 'Updated title');
});

test('real SQLite task archive is reversible, revision-checked, owner-scoped, and preserves linked focus history', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const now = '2026-10-07T02:00:00.000Z';
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const ownedTask = { ...task('archivable-task', 'Focus task'), description: 'Keep this note', priority: 'high' };
  await accountA.saveTasks([ownedTask]);
  await accountB.saveTasks([task(ownedTask.id, 'Other owner task')]);
  const terminal = completeFocusSession({ ...createFocusSession(25, ownedTask.title, 0), taskId: ownedTask.id }, 1_500_000);
  await accountA.persistTerminalSession(terminal);

  const revision = await accountA.updateTaskArchive(ownedTask.id, ownedTask.updatedAt, now);
  assert.equal(revision, now);
  const archived = (await accountA.loadTasks())[0];
  assert.equal(archived.archivedAt, now);
  assert.equal(archived.description, ownedTask.description);
  assert.equal(archived.priority, ownedTask.priority);
  assert.equal(await accountA.updateTaskArchive(ownedTask.id, ownedTask.updatedAt, null), null, 'stale archive request cannot restore');
  assert.equal((await accountB.loadTasks())[0].archivedAt, undefined, 'archive cannot cross owner boundary');
  assert.equal((await accountA.loadSessionHistory())[0].taskId, ownedTask.id, 'archiving keeps historical task identity');
  const restartedAccountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  assert.equal((await restartedAccountA.loadTasks())[0].archivedAt, now, 'archive state survives reopening the SQLite namespace');

  const restoredRevision = await restartedAccountA.updateTaskArchive(ownedTask.id, archived.updatedAt, null);
  assert.ok(restoredRevision > archived.updatedAt);
  const restored = (await restartedAccountA.loadTasks())[0];
  assert.equal(restored.archivedAt, undefined);
  assert.equal(restored.id, ownedTask.id);
  assert.equal(restored.title, ownedTask.title);
  assert.equal((await restartedAccountA.loadSessionHistory())[0].taskName, ownedTask.title);
  await assert.rejects(restartedAccountA.updateTaskArchive(ownedTask.id, restored.updatedAt, 'invalid'), /archive timestamp/);
});

test('real SQLite terminal records enqueue one durable owner-scoped mutation and acknowledge safely', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const now = '2026-10-07T02:30:00.000Z';
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const raw = createFocusSession(1, 'Outbox session', Date.parse(now));
  const terminal = completeFocusSession(raw, Date.parse(now) + 60_000);

  await accountA.persistTerminalSession(terminal);
  const first = await accountA.loadPendingOutbox();
  assert.equal(first.length, 1);
  assert.equal(first[0].command, 'session.terminal');
  assert.equal(first[0].entityType, 'focus_session');
  assert.equal(first[0].targetId, terminal.id);
  assert.equal(first[0].payload.id, terminal.id);
  assert.equal(first[0].payload.status, 'completed');
  assert.equal(first[0].payload.focusedDurationSeconds, terminal.focusedDurationSeconds);
  assert.deepEqual(await accountB.loadPendingOutbox(), [], 'another account cannot read the mutation');

  await accountA.persistTerminalSession(terminal);
  assert.equal((await accountA.loadPendingOutbox()).length, 1, 'retry does not duplicate the mutation');
  await accountA.recordOutboxAttempt(`terminal:${terminal.id}`, '2026-10-07T02:31:00.000Z', 'NETWORK_TIMEOUT');
  assert.deepEqual((await accountA.loadPendingOutbox())[0], {
    ...first[0], attemptCount: 1, nextAttemptAt: '2026-10-07T02:31:00.000Z', lastErrorCode: 'NETWORK_TIMEOUT',
  });
  await accountA.rejectOutbox(`terminal:${terminal.id}`, 'VERSION_CONFLICT');
  assert.deepEqual(await accountA.loadPendingOutbox(), [], 'quarantined conflicts are not retried automatically');
  assert.deepEqual(await accountB.loadPendingOutbox(), [], 'another account cannot quarantine or read the mutation');
  await accountA.acknowledgeOutbox(`terminal:${terminal.id}`);
  assert.deepEqual(await accountA.loadPendingOutbox(), []);
  assert.equal((await accountA.loadSessionHistory())[0].id, terminal.id, 'acknowledgement never removes local history');
});

test('real SQLite goal edit preserves period semantics, isolates owners, and rejects stale revisions', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const now = '2026-10-07T07:00:00.000Z';
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const goal = (title) => ({
    id: 'shared-goal-edit', title, type: 'focus_time', period: 'weekly', status: 'active', targetValue: 3600, legacyOpenPeriod: false,
    startsAt: '2026-10-05T18:30:00.000Z', endsAt: '2026-10-12T18:30:00.000Z', periodTimeZone: 'Asia/Colombo',
    createdAt: '2026-10-05T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z',
  });
  await accountA.saveGoals([goal('A weekly goal')]);
  await accountB.saveGoals([goal('B weekly goal')]);
  const firstRevision = await accountA.updateGoalDefinition('shared-goal-edit', goal('A weekly goal').updatedAt, 'A revised goal', 5400);
  assert.equal(firstRevision.updatedAt, now);
  assert.equal(firstRevision.title, 'A revised goal');
  assert.equal(firstRevision.targetValue, 5400);
  assert.deepEqual(await accountA.loadGoals(), [firstRevision]);
  assert.deepEqual(await accountB.loadGoals(), [goal('B weekly goal')]);

  const secondRevision = await accountA.updateGoalDefinition('shared-goal-edit', firstRevision.updatedAt, 'A revised again', 7200);
  assert.equal(secondRevision.updatedAt, '2026-10-07T07:00:00.001Z', 'same-clock writes still advance the optimistic revision');
  assert.equal(await accountA.updateGoalDefinition('shared-goal-edit', firstRevision.updatedAt, 'Stale overwrite', 1), null);
  assert.equal((await accountA.loadGoals())[0].title, 'A revised again');
  assert.equal((await accountA.loadGoals())[0].targetValue, 7200);
  await assert.rejects(accountA.updateGoalDefinition('shared-goal-edit', secondRevision.updatedAt, '', 1), /title and positive integer target/);

  await accountA.saveGoals([{ ...(await accountA.loadGoals())[0], status: 'completed', completedAt: now }]);
  assert.equal(await accountA.updateGoalDefinition('shared-goal-edit', secondRevision.updatedAt, 'Rewrite completed', 9000), null);
});

test('real SQLite completes goals from qualifying terminal events exactly once', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const now = '2026-10-07T08:00:00.000Z';
  let failCompletionWrite = false;
  const run = db.runAsync.bind(db);
  db.runAsync = async (sql, ...parameters) => {
    if (failCompletionWrite && sql.startsWith('UPDATE goals SET status = ?')) throw new Error('injected goal completion failure');
    return run(sql, ...parameters);
  };
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const makeGoal = (id, type, targetValue) => ({
    id, title: id, type, period: 'weekly', status: 'active', targetValue,
    startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', periodTimeZone: 'Asia/Colombo',
    createdAt: '2026-10-05T00:00:00.000Z', updatedAt: '2026-10-05T00:00:00.000Z',
  });
  const timeGoal = makeGoal('cancelled-time-goal', 'focus_time', 30);
  const countGoal = makeGoal('completed-session-goal', 'session_count', 1);
  const editableGoal = makeGoal('editable-progress-goal', 'focus_time', 100);
  await accountA.saveGoals([timeGoal, countGoal, editableGoal]);
  await accountB.saveGoals([timeGoal]);

  const cancelledRaw = createFocusSession(1, 'Early stop', Date.parse(now));
  const cancelled = cancelFocusSession(cancelledRaw, Date.parse(now) + 40_000);
  failCompletionWrite = true;
  await assert.rejects(accountA.appendSessionHistory(cancelled), /injected goal completion failure/);
  failCompletionWrite = false;
  assert.deepEqual(await accountA.loadSessionHistory(), [], 'session history rolls back with a failed goal-completion write');
  assert.equal((await accountA.loadGoals()).find((goal) => goal.id === timeGoal.id).status, 'active');
  await accountA.appendSessionHistory(cancelled);
  let goalsA = await accountA.loadGoals();
  assert.equal(goalsA.find((goal) => goal.id === timeGoal.id).status, 'completed');
  assert.equal(goalsA.find((goal) => goal.id === timeGoal.id).completedAt, cancelled.cancelledAt);
  assert.equal(goalsA.find((goal) => goal.id === countGoal.id).status, 'active', 'cancelled sessions never count toward session goals');
  assert.equal(goalsA.find((goal) => goal.id === editableGoal.id).status, 'active');
  await accountA.appendSessionHistory(cancelled);
  goalsA = await accountA.loadGoals();
  assert.equal(goalsA.find((goal) => goal.id === timeGoal.id).completedAt, cancelled.cancelledAt);

  const editable = goalsA.find((goal) => goal.id === editableGoal.id);
  const lowered = await accountA.updateGoalDefinition(editable.id, editable.updatedAt, editable.title, 30);
  assert.equal(lowered.status, 'completed', 'editing a target below verified existing progress completes the goal atomically');
  assert.equal(lowered.completedAt, cancelled.cancelledAt);

  const completedRaw = createFocusSession(1, 'Completed block', Date.parse(now) + 60_000);
  const completed = completeFocusSession(completedRaw, Date.parse(now) + 120_000);
  await accountA.persistTerminalSession(completed);
  const countAfter = (await accountA.loadGoals()).find((goal) => goal.id === countGoal.id);
  assert.equal(countAfter.status, 'completed');
  assert.equal(countAfter.completedAt, completed.completedAt);
  assert.equal((await accountB.loadGoals())[0].status, 'active', 'goal completion stays within the owner namespace');
});

test('legacy SQLite import reconciles completed goals without changing source JSON', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const startedAt = '2026-10-05T00:00:00.000Z';
  const completedAt = '2026-10-06T00:25:00.000Z';
  const legacyGoal = { id: 'legacy-complete', title: 'Legacy goal', type: 'session_count', period: 'weekly', status: 'active', targetValue: 1, createdAt: startedAt, updatedAt: startedAt };
  const legacySession = { ...completeFocusSession(createFocusSession(25, 'Old session', Date.parse(startedAt)), Date.parse(completedAt)), createdAt: startedAt };
  const files = {
    'deep-focus-goals.json': JSON.stringify([legacyGoal]),
    'deep-focus-session-history.json': JSON.stringify([legacySession]),
  };
  const sourceSnapshot = structuredClone(files);
  let legacyReads = 0;
  const local = createLocalDatabaseStore({ platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => { legacyReads += 1; return files; } });
  const imported = await local.loadGoals();
  assert.equal(imported[0].status, 'completed');
  assert.equal(imported[0].completedAt, completedAt);
  assert.deepEqual(files, sourceSnapshot, 'migration does not modify or delete legacy JSON sources');
  assert.equal(legacyReads, 1);
  assert.equal((await local.loadGoals())[0].status, 'completed');
  assert.equal(legacyReads, 1, 'restart-safe import marker prevents a duplicate re-import');
});

test('expired goals stay historical and a late in-period event can reconcile to completed', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const asOf = '2026-10-20T00:00:00.000Z';
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => asOf };
  const account = createAccountLocalDatabaseStore(USER_A, dependencies);
  const makeGoal = (id, type = 'session_count', targetValue = 1) => ({
    id, title: id, type, period: 'weekly', status: 'active', targetValue,
    startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-10T00:00:00.000Z', periodTimeZone: 'Asia/Colombo',
    createdAt: '2026-10-05T00:00:00.000Z', updatedAt: '2026-10-05T00:00:00.000Z',
  });
  await account.saveGoals([makeGoal('late-completion'), makeGoal('unmet-expired', 'focus_time', 3600)]);
  assert.deepEqual((await account.loadGoals()).map((goal) => goal.status), ['expired', 'expired']);

  const startsAt = Date.parse('2026-10-08T00:00:00.000Z');
  const session = completeFocusSession(createFocusSession(1, 'Late synced session', startsAt), startsAt + 60_000);
  await account.appendSessionHistory(session);
  const goals = await account.loadGoals();
  assert.equal(goals.find((goal) => goal.id === 'late-completion').status, 'completed');
  assert.equal(goals.find((goal) => goal.id === 'late-completion').completedAt, session.completedAt);
  assert.equal(goals.find((goal) => goal.id === 'unmet-expired').status, 'expired');
});

test('real SQLite goal deletion atomically unlinks tasks, preserves sessions, isolates owners, and is duplicate-safe', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const now = '2026-10-07T08:00:00.000Z';
  let failDelete = false;
  const run = db.runAsync.bind(db);
  db.runAsync = async (sql, ...parameters) => {
    if (failDelete && sql.startsWith('DELETE FROM goals')) throw new Error('injected goal delete failure');
    return run(sql, ...parameters);
  };
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const goal = { id: 'delete-goal', title: 'Goal to remove', type: 'session_count', period: 'weekly', status: 'active', targetValue: 4, legacyOpenPeriod: false,
    startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', periodTimeZone: 'Asia/Colombo',
    createdAt: '2026-10-05T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' };
  const linkedTask = { ...task('delete-linked-task', 'Keep this task'), goalId: goal.id };
  await accountA.saveGoals([goal]);
  await accountB.saveGoals([{ ...goal, title: 'Other account goal' }]);
  await accountA.saveTasks([linkedTask]);
  const raw = { ...createFocusSession(25, linkedTask.title, Date.parse(now) - 2_000_000), taskId: linkedTask.id };
  await accountA.appendSessionHistory(completeFocusSession(raw, Date.parse(now) - 500_000));
  const historyBefore = await accountA.loadSessionHistory();

  failDelete = true;
  await assert.rejects(accountA.deleteGoal(goal.id, goal.updatedAt), /injected goal delete failure/);
  failDelete = false;
  assert.deepEqual(await accountA.loadGoals(), [goal]);
  assert.deepEqual(await accountA.loadTasks(), [linkedTask]);
  assert.deepEqual(await accountA.loadSessionHistory(), historyBefore);
  assert.equal(await accountA.deleteGoal(goal.id, '2026-10-05T00:00:00.000Z'), false, 'stale request leaves links and rows untouched');

  const results = await Promise.all([
    accountA.deleteGoal(goal.id, goal.updatedAt),
    accountA.deleteGoal(goal.id, goal.updatedAt),
  ]);
  assert.deepEqual(results.sort(), [false, true]);
  assert.deepEqual(await accountA.loadGoals(), []);
  const retainedTask = (await accountA.loadTasks())[0];
  assert.equal(retainedTask.id, linkedTask.id);
  assert.equal(retainedTask.title, linkedTask.title);
  assert.equal(retainedTask.goalId, undefined);
  assert.ok(Date.parse(retainedTask.updatedAt) > Date.parse(linkedTask.updatedAt));
  assert.deepEqual(await accountA.loadSessionHistory(), historyBefore);
  assert.equal((await accountB.loadGoals())[0].title, 'Other account goal');
});

test('real SQLite edits task due date while typed columns override and clear stale legacy JSON', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => '2026-10-07T03:00:00.000Z' };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const goal = { id: 'task-goal', title: 'Study', type: 'focus_time', period: 'weekly', status: 'active', targetValue: 3600, startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', periodTimeZone: 'Asia/Colombo', createdAt: '2026-10-07T00:00:00.000Z', updatedAt: '2026-10-07T00:00:00.000Z' };
  await accountA.saveGoals([goal]);
  const foreignGoal = { ...goal, id: 'foreign-goal', title: 'Account B only' };
  await accountB.saveGoals([foreignGoal]);
  const linkedTask = { ...task('details-task', 'Original title'), goalId: goal.id, dueAt: '2026-10-20T12:00:00.000Z' };
  await accountA.saveTasks([linkedTask]);
  await db.runAsync('UPDATE tasks SET legacy_extra_json = ? WHERE owner_id = ? AND id = ?', JSON.stringify({ goalId: goal.id, priority: 'low', dueAt: linkedTask.dueAt }), USER_A, linkedTask.id);
  const updatedAt = await accountA.updateTaskDetails(linkedTask.id, linkedTask.updatedAt, 'Updated title', 'Review chapter notes', 'high', goal.id);
  assert.equal(updatedAt, '2026-10-07T03:00:00.000Z');
  assert.deepEqual(await accountA.loadTasks(), [{ ...linkedTask, title: 'Updated title', description: 'Review chapter notes', priority: 'high', updatedAt }]);
  assert.deepEqual(await accountB.loadTasks(), []);
  await assert.rejects(accountA.updateTaskDetails(linkedTask.id, updatedAt, 'Foreign link', 'notes', 'high', foreignGoal.id), /FOREIGN KEY/);
  assert.deepEqual(await accountA.loadTasks(), [{ ...linkedTask, title: 'Updated title', description: 'Review chapter notes', priority: 'high', updatedAt }]);
  const unlinkedAt = await accountA.updateTaskDetails(linkedTask.id, updatedAt, 'Updated title', 'Review chapter notes', 'high', null);
  const unlinked = (await accountA.loadTasks())[0];
  assert.equal(unlinked.goalId, undefined);
  assert.equal(unlinked.dueAt, linkedTask.dueAt);
  assert.equal(unlinked.updatedAt, unlinkedAt);
  const dueAt = '2026-10-25T00:00:00.000Z';
  const clearedAt = await accountA.updateTaskDetails(linkedTask.id, unlinkedAt, 'Updated title', 'Review chapter notes', undefined, null, dueAt);
  assert.equal((await accountA.loadTasks())[0].priority, undefined);
  assert.equal((await accountA.loadTasks())[0].dueAt, dueAt, 'the typed due_at column wins over the stale legacy JSON duplicate');
  const clearedDueAt = await accountA.updateTaskDetails(linkedTask.id, clearedAt, 'Updated title', 'Review chapter notes', undefined, null, null);
  assert.equal((await accountA.loadTasks())[0].dueAt, undefined, 'clearing the typed column does not resurrect the legacy duplicate');
  await assert.rejects(accountA.updateTaskDetails(linkedTask.id, clearedDueAt, 'Another title', 'notes', 'urgent'), /invalid/);
  await assert.rejects(accountA.updateTaskDetails(linkedTask.id, clearedDueAt, 'Another title', 'notes', undefined, null, '2026-10-25'), /due date is invalid/);
  assert.equal((await accountA.loadTasks())[0].title, 'Updated title');
});

test('real SQLite task deletion is atomic, owner-scoped, duplicate-safe, and keeps linked session history', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const now = '2026-10-07T04:00:00.000Z';
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const taskA = task('deletable-shared-id', 'Account A context');
  const taskB = task('deletable-shared-id', 'Account B private task');
  await accountA.saveTasks([taskA]);
  await accountB.saveTasks([taskB]);
  const active = { ...createFocusSession(25, taskA.title, Date.parse(now)), taskId: taskA.id };
  await accountA.saveActiveSession(active);
  const completedRaw = createFocusSession(25, taskA.title, Date.parse(now) - 2_000_000);
  const completed = { ...completeFocusSession(completedRaw, Date.parse(now) - 500_000), taskId: taskA.id };
  await accountA.appendSessionHistory(completed);

  const duplicateDeletes = await Promise.all([
    accountA.deleteTask(taskA.id, taskA.updatedAt),
    accountA.deleteTask(taskA.id, taskA.updatedAt),
  ]);
  assert.deepEqual(duplicateDeletes.sort(), [false, true]);
  assert.deepEqual(await accountA.loadTasks(), []);
  assert.deepEqual(await accountB.loadTasks(), [taskB]);
  const activeAfter = await accountA.loadActiveSession();
  assert.equal(activeAfter.id, active.id);
  assert.equal(activeAfter.taskId, undefined);
  assert.equal(activeAfter.taskName, taskA.title);
  const history = await accountA.loadSessionHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].taskId, undefined);
  assert.equal(history[0].taskName, taskA.title);
  assert.equal(await accountA.deleteTask(taskA.id, taskA.updatedAt), false);
});

test('real SQLite rolls back session unlinking if task deletion fails mid-transaction', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const now = '2026-10-07T05:00:00.000Z';
  let failDelete = false;
  const run = db.runAsync.bind(db);
  db.runAsync = async (sql, ...parameters) => {
    if (failDelete && sql.startsWith('DELETE FROM tasks')) throw new Error('injected task delete failure');
    return run(sql, ...parameters);
  };
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}), now: () => now };
  const account = createAccountLocalDatabaseStore(USER_A, dependencies);
  const linkedTask = task('rollback-task', 'Keep this task');
  await account.saveTasks([linkedTask]);
  const active = { ...createFocusSession(25, linkedTask.title, Date.parse(now)), taskId: linkedTask.id };
  await account.saveActiveSession(active);

  failDelete = true;
  await assert.rejects(account.deleteTask(linkedTask.id, linkedTask.updatedAt), /injected task delete failure/);
  failDelete = false;
  assert.deepEqual(await account.loadTasks(), [linkedTask]);
  const recovered = await account.loadActiveSession();
  assert.equal(recovered.taskId, linkedTask.id);
  assert.equal(recovered.taskName, linkedTask.title);
});

test('invalid account identity is rejected before the database is opened', async () => {
  let opened = false;
  assert.throws(() => createAccountLocalDatabaseStore('local:device', {
    platform: 'android',
    openDatabase: async () => { opened = true; throw new Error('unexpected open'); },
    readLegacyFiles: async () => ({}),
  }), /INVALID_AUTH_ID/);
  assert.equal(opened, false);
});

test('goals, linked tasks, active pointers, settings and history remain in the same account namespace', async (t) => {
  const db = makeDatabaseAdapter();
  t.after(() => db.close());
  const dependencies = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}) };
  const accountA = createAccountLocalDatabaseStore(USER_A, dependencies);
  const accountB = createAccountLocalDatabaseStore(USER_B, dependencies);
  const now = '2026-10-07T00:00:00.000Z';
  const goal = (title) => ({
    id: 'shared-goal', title, type: 'focus_time', period: 'weekly', status: 'active', targetValue: 3600,
    startsAt: '2026-10-06T18:30:00.000Z', endsAt: '2026-10-13T18:30:00.000Z', periodTimeZone: 'Asia/Colombo',
    createdAt: now, updatedAt: now,
  });
  const linkedTask = (title) => ({ ...task('shared-task', title), goalId: 'shared-goal' });

  await accountA.saveGoals([goal('A goal')]);
  await accountB.saveGoals([goal('B goal')]);
  await accountA.saveTasks([linkedTask('A linked task'), task('a-only-task', 'Private to account A')]);
  await accountB.saveTasks([linkedTask('B linked task')]);
  const session = { ...createFocusSession(25, 'A-only session', Date.parse(now)), taskId: 'shared-task' };
  await accountA.saveActiveSession(session);
  assert.equal((await accountA.loadActiveSession())?.id, session.id);
  assert.equal((await accountA.loadActiveSession())?.taskId, 'shared-task');
  assert.equal(await accountB.loadActiveSession(), null, 'An active-session pointer must never cross accounts');
  await assert.rejects(accountB.saveActiveSession({ ...createFocusSession(25, 'Invalid link', Date.parse(now)), taskId: 'a-only-task' }), /FOREIGN KEY/);
  await accountA.saveSettings({ defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 15, uiLocale: 'si' });
  const completed = completeFocusSession(session, Date.parse(now) + 25 * 60_000);
  await accountA.persistTerminalSession(completed);

  assert.deepEqual((await accountA.loadGoals()).map(({ title }) => title), ['A goal']);
  assert.deepEqual((await accountB.loadGoals()).map(({ title }) => title), ['B goal']);
  assert.deepEqual((await accountA.loadTasks()).map(({ title, goalId }) => ({ title, goalId })).sort((a, b) => a.title.localeCompare(b.title)), [
    { title: 'A linked task', goalId: 'shared-goal' }, { title: 'Private to account A', goalId: undefined },
  ]);
  assert.deepEqual((await accountB.loadTasks()).map(({ title, goalId }) => ({ title, goalId })), [{ title: 'B linked task', goalId: 'shared-goal' }]);
  assert.equal(await accountA.loadActiveSession(), null, 'Terminal write clears only the owning account pointer');
  assert.equal(await accountB.loadActiveSession(), null);
  assert.equal((await accountA.loadSessionHistory()).length, 1);
  assert.equal((await accountB.loadSessionHistory()).length, 0);
  assert.deepEqual(await accountA.loadSettings(), { defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 15, uiLocale: 'si' });
  assert.deepEqual(await accountB.loadSettings(), { defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5, uiLocale: 'en' });
});
