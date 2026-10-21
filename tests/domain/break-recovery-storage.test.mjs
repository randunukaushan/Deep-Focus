import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

register('../helpers/local-database-loader.mjs', import.meta.url);
const { createAccountLocalDatabaseStore, createLocalDatabaseStore } = await import('../../src/features/storage/local-database.ts');
const { createBreakTimer, projectBreakTimer } = await import('../../src/features/focus/break-engine.ts');
const { createFocusSession, pauseFocusSession, resumeFocusSession, cancelFocusSession } = await import('../../src/features/focus/session-engine.ts');
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const T = Date.parse('2026-10-21T00:00:00.000Z');
const paused = () => pauseFocusSession(createFocusSession(25, 'synthetic', T), T + 60000);
const timer = session => ({ ...createBreakTimer(5, T + 61000), sessionId: session.id, pauseStartedAt: session.lastPausedAt });

function fixture(t, path = ':memory:') {
  const raw = new DatabaseSync(path);
  let closed = false;
  const close = () => { if (!closed) { raw.close(); closed = true; } };
  const db = {
    async execAsync(sql) { raw.exec(sql); },
    async runAsync(sql, ...args) { return raw.prepare(sql).run(...args); },
    async getFirstAsync(sql, ...args) { return raw.prepare(sql).get(...args) ?? null; },
    async getAllAsync(sql, ...args) { return raw.prepare(sql).all(...args); },
  };
  t.after(close);
  const deps = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}) };
  return { raw, db, deps, close, a: createAccountLocalDatabaseStore(A, deps), b: createAccountLocalDatabaseStore(B, deps) };
}

test('disk reopen recovers original deadline and never resumes focus automatically', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'deep-focus-break-test-'));
  const path = join(dir, 'synthetic.db');
  const first = fixture(t, path); const session = paused(); const record = timer(session);
  await first.a.saveActiveSession(session); await first.a.saveActiveBreak(record);
  first.close();
  const reopened = fixture(t, path);
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const result = await reopened.a.loadFocusRecovery();
  assert.deepEqual(result.activeBreak, record);
  assert.equal(result.session.status, 'paused');
  assert.equal(projectBreakTimer(result.activeBreak, T + 181000).remainingSeconds, 180);
  assert.equal(projectBreakTimer(result.activeBreak, T + 900000).remainingSeconds, 0);
  assert.throws(() => projectBreakTimer(result.activeBreak, T), /CLOCK_UNCERTAIN/);
  assert.equal((await reopened.a.loadSessionHistory()).length, 0);
});

test('identical session IDs are isolated across A, B and device namespaces', async t => {
  const f = fixture(t); const session = paused(); const record = timer(session);
  await f.a.saveActiveSession(session); await f.b.saveActiveSession(session);
  await f.a.saveActiveBreak(record);
  assert.equal((await f.b.loadFocusRecovery()).activeBreak, null);
  const device = createLocalDatabaseStore(f.deps);
  assert.deepEqual(await device.loadFocusRecovery(), { session: null, activeBreak: null });
  await f.b.saveActiveBreak({ ...record, ...createBreakTimer(10, T + 62000) });
  assert.deepEqual((await f.a.loadFocusRecovery()).activeBreak, record);
  assert.equal((await f.b.loadFocusRecovery()).activeBreak.plannedDurationSeconds, 600);
});

test('duplicate and concurrent starts preserve the first durable break deadline', async t => {
  const f = fixture(t); const session = paused(); const record = timer(session);
  await f.a.saveActiveSession(session);
  const results = await Promise.all([f.a.saveActiveBreak(record), f.a.saveActiveBreak({ ...record, ...createBreakTimer(15, T + 62000) })]);
  assert.deepEqual(results, [record, record]);
  assert.equal(f.raw.prepare('SELECT count(*) AS n FROM active_breaks').get().n, 1);
});

test('reject missing, active, foreign and wrong-pause associations; validate before write', async t => {
  const f = fixture(t); const session = paused(); const record = timer(session);
  await assert.rejects(f.b.saveActiveBreak(record), /CONFLICT/);
  await f.a.saveActiveSession(resumeFocusSession(session, T + 62000));
  await assert.rejects(f.a.saveActiveBreak(record), /CONFLICT/);
  const next = pauseFocusSession(resumeFocusSession(session, T + 62000), T + 63000);
  await f.a.saveActiveSession(next);
  await assert.rejects(f.a.saveActiveBreak(record), /CONFLICT/);
  await assert.rejects(f.a.saveActiveBreak({ ...record, plannedDurationSeconds: 1 }), /INVALID/);
  assert.equal(f.raw.prepare('SELECT count(*) AS n FROM active_breaks').get().n, 0);
});

test('failed save preserves paused session and retry is safe, including lost response', async t => {
  const f = fixture(t); const session = paused(); const record = timer(session);
  await f.a.saveActiveSession(session);
  const run = f.db.runAsync;
  f.db.runAsync = async (sql, ...args) => { if (sql.startsWith('INSERT INTO active_breaks')) throw Error('synthetic full disk'); return run(sql, ...args); };
  await assert.rejects(f.a.saveActiveBreak(record), /synthetic/);
  assert.equal((await f.a.loadFocusRecovery()).activeBreak, null);
  assert.equal((await f.a.loadActiveSession(true)).status, 'paused');
  f.db.runAsync = run;
  await f.a.saveActiveBreak(record);
  assert.deepEqual(await f.a.saveActiveBreak({ ...record, ...createBreakTimer(10, T + 62000) }), record);
});

test('resume and break cleanup roll back together on failure', async t => {
  const f = fixture(t); const session = paused(); const record = timer(session);
  await f.a.saveActiveSession(session); await f.a.saveActiveBreak(record);
  const run = f.db.runAsync;
  f.db.runAsync = async (sql, ...args) => { if (sql.startsWith('DELETE FROM active_breaks')) throw Error('synthetic cleanup failure'); return run(sql, ...args); };
  await assert.rejects(f.a.saveActiveSession(resumeFocusSession(session, T + 121000)), /synthetic/);
  assert.equal((await f.a.loadActiveSession(true)).status, 'paused');
  f.db.runAsync = run;
  assert.deepEqual((await f.a.loadFocusRecovery()).activeBreak, record);
  await f.a.saveActiveSession(resumeFocusSession(session, T + 121000));
  assert.equal((await f.a.loadFocusRecovery()).activeBreak, null);
});

test('terminal cleanup rollback retains break and duplicate finalization does not repeat history', async t => {
  const f = fixture(t); const session = paused(); const record = timer(session);
  await f.a.saveActiveSession(session); await f.a.saveActiveBreak(record);
  const terminal = cancelFocusSession(session, T + 121000);
  const run = f.db.runAsync;
  f.db.runAsync = async (sql, ...args) => { if (sql.startsWith('DELETE FROM active_breaks')) throw Error('synthetic terminal failure'); return run(sql, ...args); };
  await assert.rejects(f.a.persistTerminalSession(terminal), /synthetic/);
  f.db.runAsync = run;
  assert.equal((await f.a.loadSessionHistory()).length, 0);
  assert.deepEqual((await f.a.loadFocusRecovery()).activeBreak, record);
  await f.a.persistTerminalSession(terminal); await f.a.persistTerminalSession(terminal);
  assert.deepEqual(await f.a.loadFocusRecovery(), { session: null, activeBreak: null });
  assert.equal((await f.a.loadSessionHistory()).length, 1);
});

test('valid stale pause records are cleared; malformed records fail closed without deletion', async t => {
  const f = fixture(t); const session = paused(); const record = timer(session);
  await f.a.saveActiveSession(session); await f.a.saveActiveBreak(record);
  const later = pauseFocusSession(resumeFocusSession(session, T + 62000), T + 63000);
  await f.a.saveActiveSession(later);
  assert.equal((await f.a.loadFocusRecovery()).activeBreak, null);
  await f.db.runAsync('INSERT INTO active_breaks (owner_id,session_id,timer_json) VALUES (?,?,?)', `account:${A}`, session.id, '{"bad":true}');
  await assert.rejects(f.a.loadFocusRecovery(), /INVALID/);
  assert.equal(f.raw.prepare('SELECT count(*) AS n FROM active_breaks').get().n, 1);
});

test('v20 upgrade rollback retains schema/data and retries safely', async t => {
  const f = fixture(t); const session = paused(); await f.a.saveActiveSession(session);
  f.raw.exec('DROP TABLE active_breaks; PRAGMA user_version = 20;');
  const exec = f.db.execAsync;
  f.db.execAsync = async sql => { if (sql.startsWith('CREATE TABLE IF NOT EXISTS active_breaks')) throw Error('synthetic migration failure'); return exec(sql); };
  await assert.rejects(createAccountLocalDatabaseStore(A, f.deps).loadFocusRecovery(), /synthetic/);
  assert.equal(f.raw.prepare('PRAGMA user_version').get().user_version, 20);
  assert.equal(f.raw.prepare("SELECT count(*) AS n FROM sqlite_master WHERE name='active_breaks'").get().n, 0);
  f.db.execAsync = exec;
  const upgraded = createAccountLocalDatabaseStore(A, f.deps);
  assert.equal((await upgraded.loadFocusRecovery()).session.id, session.id);
  assert.equal(f.raw.prepare('PRAGMA user_version').get().user_version, 21);
});
