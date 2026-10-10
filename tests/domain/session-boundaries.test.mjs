import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { runInNewContext } from 'node:vm';
import * as engine from '../../src/features/focus/session-engine.ts';
import * as goalProgress from '../../src/features/goals/goal-progress.ts';
import * as resourceTypes from '../../src/features/resources/resource-types.ts';
import * as teacherAssignmentDraft from '../../src/features/education/teacher-assignment-draft.ts';

const require = createRequire(import.meta.url);
const ts = require('typescript');

// Execute actual source, substituting only platform dependencies. This is not
// React integration/device evidence; effects and scheduling are a bounded model.
function sourceModule(file, dependencies, globals = {}) {
  const featurePath = file === 'local-database' ? '../../src/features/storage/local-database.ts' : `../../src/features/focus/${file}.ts`;
  const source = readFileSync(new URL(featurePath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  runInNewContext(outputText, { exports, require(name) {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, ...globals });
  return exports;
}

function sqliteFixture(initialFiles = {}, readError = false) {
  const files = new Map(Object.entries(initialFiles).map(([name, content]) => [`synthetic/${name}`, content]));
  const rawDb = new DatabaseSync(':memory:', { enableForeignKeyConstraints: false });
  let failMatching = null;
  let legacyReadError = readError;
  let dbWrites = 0;
  let localModule;
  const db = {
    async execAsync(sql) { rawDb.exec(sql); },
    async runAsync(sql, ...params) {
      if (failMatching && failMatching.test(sql)) { failMatching = null; throw new Error('injected SQLite write failure'); }
      dbWrites++;
      return rawDb.prepare(sql).run(...params);
    },
    async getFirstAsync(sql, ...params) { return rawDb.prepare(sql).get(...params) ?? null; },
    async getAllAsync(sql, ...params) { return rawDb.prepare(sql).all(...params); },
    // No synthetic serialization or inherited FK state: the store must own both.
    withExclusiveTransactionAsync() { throw new Error('Unexpected implicit transaction connection'); },
  };
  const dependencies = {
    'expo-sqlite': { async openDatabaseAsync() { return db; } },
    'expo-file-system/legacy': {
      documentDirectory: 'synthetic/',
      async getInfoAsync(path) { if (legacyReadError) throw new Error('read failed'); return { exists: files.has(path) }; },
      async readAsStringAsync(path) { if (legacyReadError) throw new Error('read failed'); return files.get(path); },
    },
    'react-native': { Platform: { OS: 'android' } },
    'expo-crypto': { CryptoDigestAlgorithm: { SHA256: 'SHA-256' }, async digestStringAsync(_algorithm, value) { return `sha256:${value}`; } },
    '@/features/focus/session-engine': engine,
    '@/features/goals/goal-progress': goalProgress,
    '@/features/resources/resource-types': resourceTypes,
    '@/features/education/teacher-assignment-draft': teacherAssignmentDraft,
    './local-owner': {
      accountOwnerId: (authenticatedId) => `account:${authenticatedId}`,
      createLocalOwnerRegistry(deviceStore) {
        return { current: () => deviceStore, useAccount() {}, useDeviceLocal() {} };
      },
    },
  };
  function loadStorage() {
    localModule = sourceModule('local-database', dependencies);
    return sourceModule('session-storage', {
      'react-native': { Platform: { OS: 'android' } },
      '@/features/storage/local-database': localModule,
    });
  }
  return {
    storage: loadStorage(), files, db,
    setReadError(value) { legacyReadError = value; },
    writes: () => dbWrites,
    failNextWrite(sqlPattern = /UPDATE focus_sessions|INSERT INTO focus_sessions/) { failMatching = sqlPattern; },
    failNextDelete() { failMatching = /DELETE FROM active_focus_sessions/; },
    async restart() { this.storage = loadStorage(); return this.storage; },
    local: () => localModule,
    rawDb,
    read(name) { return files.get(`synthetic/${name}`); },
    close() { rawDb.close(); },
  };
}

test('strict load distinguishes missing, corrupt, terminal and unreadable records without writes', async () => {
  assert.equal(await sqliteFixture().storage.loadActiveSession(true), null);
  for (const raw of ['{', '{}']) {
    const fixture = sqliteFixture({ 'deep-focus-active-session.json': raw });
    await assert.rejects(fixture.storage.loadActiveSession(true));
    assert.equal(fixture.writes(), 0);
    assert.equal(await fixture.storage.loadActiveSession(), null);
  }
  const pendingTerminal = engine.cancelFocusSession(engine.createFocusSession(25, undefined, 0), 1000);
  assert.equal((await sqliteFixture({ 'deep-focus-active-session.json': JSON.stringify(pendingTerminal) }).storage.loadActiveSession(true)).status, 'cancelled');
  const fixture = sqliteFixture({}, true);
  await assert.rejects(fixture.storage.loadActiveSession(true), /read failed/);
  assert.equal(fixture.writes(), 0);
});

const ACTIVE_PATH = 'deep-focus-active-session.json';
const HISTORY_PATH = 'deep-focus-session-history.json';
const terminalSession = (id, now = 10_000) => ({
  ...engine.cancelFocusSession(engine.createFocusSession(25, 'Synthetic', 0), now), id,
});
const persisted = (value) => JSON.parse(JSON.stringify(value));

test('active save errors reach the caller and an explicit retry succeeds', async () => {
  const previous = engine.createFocusSession(25, 'Previous', 0);
  const next = engine.pauseFocusSession(previous, 10_000);
  const fixture = sqliteFixture({ [ACTIVE_PATH]: JSON.stringify(previous) });
  assert.deepEqual(persisted(await fixture.storage.loadActiveSession(true)), previous);
  fixture.failNextWrite();
  await assert.rejects(fixture.storage.saveActiveSession(next), /injected SQLite write failure/);
  assert.deepEqual(persisted(await fixture.storage.loadActiveSession(true)), previous);
  await fixture.storage.saveActiveSession(next);
  assert.deepEqual(persisted(await fixture.storage.loadActiveSession(true)), next);
});

test('terminal history write failure preserves active record and retry finalizes it', async () => {
  const terminal = terminalSession('terminal-history-retry');
  const active = engine.createFocusSession(25, 'Synthetic', 0);
  const fixture = sqliteFixture({ [ACTIVE_PATH]: JSON.stringify({ ...active, id: terminal.id }) });
  await fixture.storage.loadActiveSession(true);
  fixture.failNextWrite();
  await assert.rejects(fixture.storage.persistTerminalSession(terminal), /injected SQLite write failure/);
  assert.deepEqual(persisted(await fixture.storage.loadActiveSession(true)), { ...active, id: terminal.id });
  assert.deepEqual(await fixture.storage.loadSessionHistory(), []);
  await fixture.storage.persistTerminalSession(terminal);
  assert.equal(await fixture.storage.loadActiveSession(true), null);
  assert.deepEqual(persisted(await fixture.storage.loadSessionHistory()), [persisted(terminal)]);
});

test('failed active cleanup leaves terminal retryable after restart without duplicate history', async () => {
  const terminal = terminalSession('terminal-clear-retry');
  const active = engine.createFocusSession(25, 'Synthetic', 0);
  const fixture = sqliteFixture({ [ACTIVE_PATH]: JSON.stringify({ ...active, id: terminal.id }) });
  await fixture.storage.loadActiveSession(true);
  fixture.failNextDelete();
  await assert.rejects(fixture.storage.persistTerminalSession(terminal), /injected SQLite write failure/);
  assert.deepEqual(persisted(await fixture.storage.loadActiveSession(true)), { ...active, id: terminal.id });
  assert.deepEqual(await fixture.storage.loadSessionHistory(), []);

  await fixture.restart();
  const restored = await fixture.storage.loadActiveSession(true);
  assert.deepEqual(persisted(restored), { ...active, id: terminal.id });
  await fixture.storage.persistTerminalSession(terminal);
  await fixture.storage.persistTerminalSession(terminal);
  assert.equal(await fixture.storage.loadActiveSession(true), null);
  assert.deepEqual(persisted(await fixture.storage.loadSessionHistory()), [persisted(terminal)]);
});

test('concurrent history appends serialize and preserve both sessions', async () => {
  const first = terminalSession('concurrent-first');
  const second = terminalSession('concurrent-second', 20_000);
  const fixture = sqliteFixture();
  await Promise.all([
    fixture.storage.appendSessionHistory(first),
    fixture.storage.appendSessionHistory(second),
  ]);
  assert.deepEqual((await fixture.storage.loadSessionHistory()).map((session) => session.id).sort(), [first.id, second.id].sort());
});

test('malformed history blocks terminal cleanup instead of being overwritten', async () => {
  const terminal = terminalSession('malformed-history');
  const rawHistory = '[{"not":"a focus session"}]';
  const rawActive = JSON.stringify(terminal);
  const fixture = sqliteFixture({ [ACTIVE_PATH]: rawActive, [HISTORY_PATH]: rawHistory });
  await assert.rejects(fixture.storage.loadActiveSession(true), /invalid history/i);
  assert.equal(fixture.read(ACTIVE_PATH), rawActive);
  assert.equal(fixture.read(HISTORY_PATH), rawHistory);
});

test('conflicting terminal record with the same ID preserves history and active recovery', async () => {
  const terminal = terminalSession('conflicting-terminal');
  const conflicting = { ...terminal, status: 'completed', completedAt: terminal.cancelledAt, cancelledAt: undefined };
  const rawActive = JSON.stringify(terminal);
  const rawHistory = JSON.stringify([conflicting]);
  const fixture = sqliteFixture({ [ACTIVE_PATH]: rawActive, [HISTORY_PATH]: rawHistory });
  await assert.rejects(fixture.storage.loadActiveSession(true), /conflicting duplicate session ID/i);
  assert.equal(fixture.read(ACTIVE_PATH), rawActive);
  assert.equal(fixture.read(HISTORY_PATH), rawHistory);
});

test('SQLite import rolls back every row on injected failure, then restart retries once', async () => {
  const task = { id: 'migration-task', title: 'Synthetic', status: 'pending', createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' };
  const raw = JSON.stringify([task]);
  const fixture = sqliteFixture({ 'deep-focus-tasks.json': raw });
  fixture.failNextWrite(/INSERT INTO tasks/);
  await assert.rejects(fixture.local().loadTasks(), /injected SQLite write failure/);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM local_owners').get().n, 0);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM tasks').get().n, 0);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM local_migrations').get().n, 0);
  assert.equal(fixture.read('deep-focus-tasks.json'), raw);

  await fixture.restart();
  assert.deepEqual(persisted(await fixture.local().loadTasks()), [task]);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM tasks').get().n, 1);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM local_migrations').get().n, 1);
  assert.equal(fixture.read('deep-focus-tasks.json'), raw);
});

test('identical active/history duplicate session imports exactly once', async () => {
  const terminal = terminalSession('identical-duplicate');
  const raw = JSON.stringify(terminal);
  const fixture = sqliteFixture({
    [ACTIVE_PATH]: raw,
    [HISTORY_PATH]: JSON.stringify([terminal]),
  });
  assert.equal((await fixture.storage.loadSessionHistory()).length, 1);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM focus_sessions').get().n, 1);
  await fixture.restart();
  assert.equal((await fixture.storage.loadSessionHistory()).length, 1);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM focus_sessions').get().n, 1);
  assert.equal(fixture.read(ACTIVE_PATH), raw);
});

test('composite owner keys prevent cross-owner goal references', async () => {
  const fixture = sqliteFixture();
  await fixture.local().loadTasks();
  await fixture.db.runAsync('INSERT INTO local_owners (id,kind,created_at) VALUES (?,?,?)', 'local:other', 'device_local', '2026-10-06T00:00:00.000Z');
  await fixture.db.runAsync(`INSERT INTO goals (owner_id,id,title,type,period,status,target_value,starts_at,ends_at,period_timezone,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    'local:device', 'goal-owned-here', 'Goal', 'session_count', 'weekly', 'active', 2,
    '2026-10-05T00:00:00.000Z', '2026-10-12T00:00:00.000Z', 'UTC', '2026-10-06T00:00:00.000Z', '2026-10-06T00:00:00.000Z');
  await assert.rejects(fixture.db.runAsync(`INSERT INTO tasks (owner_id,id,title,status,goal_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`,
    'local:other', 'cross-owner-task', 'Task', 'pending', 'goal-owned-here', '2026-10-06T00:00:00.000Z', '2026-10-06T00:00:00.000Z'), /FOREIGN KEY constraint failed/i);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM tasks').get().n, 0);
});

function hookFixture(load, duration = 25, saveFailures = 0) {
  const slots = [];
  let cursor = 0;
  let pending = [];
  let clock = 60000;
  let writes = 0;
  let strictLoad;
  const timers = new Map();
  let timerId = 0;
  const changed = (a, b) => !a || b.some((value, i) => !Object.is(value, a[i]));
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[i].value, (value) => { slots[i].value = typeof value === 'function' ? value(slots[i].value) : value; }];
    },
    useRef(value) { const i = cursor++; return slots[i] ??= { current: value }; },
    useMemo(factory, deps) {
      const i = cursor++;
      if (changed(slots[i]?.deps, deps)) slots[i] = { value: factory(), deps };
      return slots[i].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(fn, deps) {
      const i = cursor++;
      if (changed(slots[i]?.deps, deps)) {
        pending.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; });
      }
    },
  };
  const { useFocusSession } = sourceModule('use-focus-session', {
    react, 'react-native': { AppState: { addEventListener: () => ({ remove() {} }) } },
    './session-engine': engine,
    './session-storage': {
      loadActiveSession(strict) { strictLoad = strict; return load(); },
      async loadFocusableTask(taskId) { return taskId === 'valid-task' ? { id: taskId, title: 'Canonical task title', status: 'pending' } : null; },
      async saveActiveSession() {
        writes++;
        if (saveFailures > 0) { saveFailures--; throw new Error('disk full'); }
      },
    },
  }, {
    Date: class extends Date { static now() { return clock; } },
    setInterval(fn) { const id = ++timerId; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); },
    setTimeout(fn) { const id = ++timerId; timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  return {
    render: function HookProbe(taskId, taskName) { cursor = 0; const result = useFocusSession(duration, taskName, taskId); const effects = pending; pending = []; effects.forEach(fn => fn()); return result; },
    // Let cross-realm promises settle; no elapsed-time timer oracle is used.
    async settle() { await new Promise(setImmediate); return this.render(); },
    tick(timestamp) { clock = timestamp; [...timers.values()].forEach(fn => fn()); },
    writes: () => writes, strict: () => strictLoad, timers: () => timers.size,
    unmount() { slots.forEach(slot => slot?.cleanup?.()); },
  };
}

test('pending hydration blocks controls, writes and timers; creation waits for load', async () => {
  let resolve;
  const fixture = hookFixture(() => new Promise(done => { resolve = done; }));
  const pending = fixture.render();
  assert.equal(pending.session, null);
  assert.equal(pending.pause(), false);
  assert.equal(pending.complete(), false);
  assert.equal(fixture.writes(), 0);
  assert.equal(fixture.timers(), 0);
  assert.equal(fixture.strict(), true);
  resolve(null);
  const ready = await fixture.settle();
  assert.equal(ready.session.startedAt, '1970-01-01T00:01:00.000Z');
  assert.equal(ready.projection.remainingSeconds, 1500);
  assert.equal(fixture.writes(), 1);
  fixture.unmount();
});

test('stale active saves cannot revive terminal history, including queued writes', async () => {
  const fixture = sqliteFixture();
  const active = engine.createFocusSession(25, 'History', 0);
  const terminal = engine.cancelFocusSession(active, 60000);
  await fixture.storage.saveActiveSession(active);
  const results = await Promise.allSettled([
    fixture.storage.persistTerminalSession(terminal),
    fixture.storage.saveActiveSession(active),
  ]);
  assert.equal(results[0].status, 'fulfilled');
  assert.equal(results[1].status, 'rejected');
  assert.match(results[1].reason.message, /TERMINAL_SESSION_CONFLICT/);
  assert.deepEqual(persisted(await fixture.storage.loadSessionHistory()), persisted([terminal]));
  assert.equal(await fixture.storage.loadActiveSession(true), null);
  fixture.close();
});

test('foreign keys protect actual store write transactions and preserve rollback', async () => {
  const fixture = sqliteFixture();
  await fixture.local().loadTasks();
  // Mimic a connection whose FK flag is off: the store must restore it BEFORE BEGIN.
  fixture.rawDb.exec('PRAGMA foreign_keys=OFF');
  const task = { id: 'bad-link', title: 'Task', status: 'pending', goalId: 'missing', createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' };
  await assert.rejects(fixture.local().saveTasks([task]), /FOREIGN KEY/);
  assert.equal(fixture.rawDb.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);
  assert.equal((await fixture.local().loadTasks()).length, 0);
  assert.equal(fixture.rawDb.prepare('PRAGMA foreign_key_check').all().length, 0);
  fixture.close();
});

test('migrated goals can accompany a new goal without rewriting historical targets', async () => {
  const old = { id: 'old', title: 'Legacy', type: 'focus_time', period: 'weekly', status: 'active', targetValue: 120, createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z' };
  const fixture = sqliteFixture({ 'deep-focus-goals.json': JSON.stringify([old]) });
  const [legacy] = await fixture.local().loadGoals();
  assert.equal(legacy.targetValue, 7200);
  const goal = { ...old, id: 'new', targetValue: 7200, startsAt: '2026-10-05T00:00:00.000Z', endsAt: '2026-10-12T00:00:00.000Z', periodTimeZone: 'UTC', legacyOpenPeriod: false };
  await fixture.local().saveGoals([goal, legacy]);
  assert.equal((await fixture.local().loadGoals()).length, 2);
  assert.deepEqual(persisted((await fixture.local().loadGoals()).find(g => g.id === 'old')), persisted(legacy));
  await assert.rejects(fixture.local().saveGoals([{ ...legacy, targetValue: 1 }]), /preserved unchanged/);
  await assert.rejects(fixture.local().saveGoals([{ ...legacy, id: 'forged' }]), /preserved unchanged/);
  fixture.close();
});

test('transient initialization failure retries in the same store without restarting', async () => {
  const fixture = sqliteFixture({}, true);
  await assert.rejects(fixture.storage.loadActiveSession(true), /read failed/);
  fixture.setReadError(false);
  assert.equal(await fixture.storage.loadActiveSession(true), null);
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM local_migrations').get().n, 1);
  fixture.close();
});

test('import write failure rolls back and permits same-runtime retry', async () => {
  const active = engine.createFocusSession(25, undefined, 0);
  const fixture = sqliteFixture({ [ACTIVE_PATH]: JSON.stringify(active) });
  fixture.failNextWrite(/INSERT INTO focus_sessions/);
  await assert.rejects(fixture.storage.loadActiveSession(true), /injected/);
  assert.deepEqual(persisted(await fixture.storage.loadActiveSession(true)), persisted(active));
  assert.equal(fixture.rawDb.prepare('SELECT count(*) AS n FROM local_migrations').get().n, 1);
  fixture.close();
});

test('save-failure wait is pause time after retry, and resume requires user action', async () => {
  const fixture = hookFixture(async () => null, 25, 1);
  fixture.render(); await fixture.settle();
  const failed = await fixture.settle();
  assert.equal(failed.session.status, 'paused');
  fixture.tick(360000);
  assert.equal(await failed.retrySave(), true);
  const recovered = await fixture.settle();
  assert.equal(recovered.session.status, 'paused');
  assert.equal(recovered.projection.focusedSeconds, 0);
  assert.equal(recovered.projection.pausedSeconds, 300);
  assert.equal(recovered.resume(), true);
  fixture.render(); fixture.tick(420000);
  assert.equal(fixture.render().projection.focusedSeconds, 60);
  fixture.unmount();
});

test('load rejection, malformed timestamp and invalid new duration fail closed', async () => {
  for (const fixture of [
    hookFixture(async () => { throw new Error('read failed'); }),
    hookFixture(async () => ({ ...engine.createFocusSession(25, undefined, 0), startedAt: 'bad' })),
    hookFixture(async () => null, 0),
  ]) {
    fixture.render();
    const failed = await fixture.settle();
    assert.equal(failed.hydrated, true);
    assert.ok(failed.error);
    assert.equal(failed.projection, null);
    assert.equal(failed.cancel(), false);
    assert.equal(fixture.writes(), 0);
    assert.equal(fixture.timers(), 0);
    fixture.unmount();
  }
});

test('controller rejects early completion, then pauses and resumes without stale state', async () => {
  const fixture = hookFixture(async () => engine.createFocusSession(25, 'saved task', 0));
  fixture.render();
  let state = await fixture.settle();
  assert.equal(state.complete(), false);
  assert.equal(state.pause(), true);
  state = fixture.render();
  assert.equal(state.session.status, 'paused');
  assert.equal(state.session.taskName, 'saved task');
  fixture.tick(120000);
  assert.equal(state.resume(), true);
  state = fixture.render();
  assert.equal(state.session.pausedDurationSeconds, 60);
  assert.equal(state.projection.focusedSeconds, 60);
  fixture.unmount();
});

test('clock rollback errors do not become a zero-time successful completion', async () => {
  const fixture = hookFixture(async () => null);
  fixture.render();
  await fixture.settle();
  fixture.tick(59000);
  const state = fixture.render();
  assert.ok(state.error);
  assert.equal(state.projection, null);
  assert.equal(state.complete(), false);
  assert.equal(fixture.timers(), 0);
  assert.equal(fixture.writes(), 1);
  fixture.unmount();
});

test('unmount before load resolves does not start or save a session', async () => {
  let resolve;
  const fixture = hookFixture(() => new Promise(done => { resolve = done; }));
  fixture.render();
  fixture.unmount();
  resolve(null);
  const state = await fixture.settle();
  assert.equal(state.session, null);
  assert.equal(fixture.writes(), 0);
});

test('elapsed restored session completes only after hydration and keeps stored task', async () => {
  const fixture = hookFixture(async () => engine.createFocusSession(1, 'stored task', 0));
  const loading = fixture.render();
  assert.equal(loading.session, null);
  const ready = await fixture.settle();
  assert.equal(ready.session.status, 'active');
  assert.equal(ready.projection.remainingSeconds, 0);
  fixture.tick(60000);
  const completed = fixture.render();
  assert.equal(completed.session.status, 'completed');
  assert.equal(completed.session.focusedDurationSeconds, 60);
  assert.equal(completed.session.taskName, 'stored task');
  assert.equal(fixture.timers(), 0);
  fixture.unmount();
});

test('transition-time validation error is caught without mutating saved session', async () => {
  const fixture = hookFixture(async () => null);
  fixture.render();
  const ready = await fixture.settle();
  fixture.tick(59000);
  assert.equal(ready.pause(), false);
  const failed = fixture.render();
  assert.ok(failed.error);
  assert.equal(failed.session.status, 'active');
  assert.equal(failed.session.lastPausedAt, undefined);
  assert.equal(fixture.writes(), 1);
  fixture.unmount();
});

test('valid stored session is restored even when new route duration is invalid', async () => {
  const fixture = hookFixture(async () => engine.createFocusSession(25, undefined, 0), NaN);
  fixture.render();
  const state = await fixture.settle();
  assert.equal(state.error, null);
  assert.equal(state.projection.remainingSeconds, 1440);
  fixture.unmount();
});

test('task-linked focus uses the stored task title and stable ID, and rejects a missing task', async () => {
  const valid = hookFixture(() => Promise.resolve(null));
  valid.render('valid-task', 'Untrusted route title');
  const ready = await valid.settle();
  assert.equal(ready.session.taskId, 'valid-task');
  assert.equal(ready.session.taskName, 'Canonical task title');
  valid.unmount();

  const missing = hookFixture(() => Promise.resolve(null));
  missing.render('missing-task', 'Untrusted route title');
  const unavailable = await missing.settle();
  assert.equal(unavailable.session, null);
  assert.match(unavailable.error, /task is no longer available/);
  assert.equal(missing.writes(), 0);
  assert.equal(missing.timers(), 0);
  missing.unmount();
});

test('active save failure stops timing and exposes an explicit retry', async () => {
  const fixture = hookFixture(async () => null, 25, 1);
  fixture.render();
  await fixture.settle();
  const failed = await fixture.settle();
  assert.match(failed.error, /could not be saved/i);
  assert.equal(failed.projection, null);
  assert.equal(fixture.timers(), 0);
  assert.equal(failed.canRetrySave, true);
  assert.equal(await failed.retrySave(), true);
  const recovered = fixture.render();
  assert.equal(recovered.error, null);
  assert.equal(fixture.writes(), 2);
  fixture.unmount();
});
