import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';
register('../helpers/local-database-loader.mjs', import.meta.url);
register('../helpers/setup-flow-loader.mjs', import.meta.url);
const { createSetupFlow } = await import('../../src/features/onboarding/setup-flow.ts');
const { DatabaseSync } = await import('node:sqlite');
const { createLocalDatabaseStore, createAccountLocalDatabaseStore } = await import('../../src/features/storage/local-database.ts');
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';

function fixture(t) {
  const sqlite = new DatabaseSync(':memory:');
  t.after(() => sqlite.close());
  const db = {
    async execAsync(sql) { sqlite.exec(sql); },
    async getFirstAsync(sql, ...args) { return sqlite.prepare(sql).get(...args) ?? null; },
    async getAllAsync(sql, ...args) { return sqlite.prepare(sql).all(...args); },
    async runAsync(sql, ...args) { return sqlite.prepare(sql).run(...args); },
  };
  const deps = { platform: 'android', openDatabase: async () => db, readLegacyFiles: async () => ({}) };
  return { db, sqlite, deps, a: createAccountLocalDatabaseStore(A, deps), b: createAccountLocalDatabaseStore(B, deps), local: createLocalDatabaseStore(deps) };
}

test('one commit applies selected settings and completion; preserves language, personal words and owner isolation', async t => {
  const { a, b, local, deps, sqlite } = fixture(t);
  await a.saveSettings({ defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 10, uiLocale: 'si' });
  const personal = { ...await a.loadPresentationPreferences(), motivation: 'personal', personalPhrase: 'Keep these words', showDuringFocus: true };
  await a.savePresentationPreferences(personal);
  const baseline = await a.loadSetupPreferences();
  const patch = { defaultFocusDurationMinutes: 60, defaultBreakDurationMinutes: 15, appearance: 'dark', reduceMotion: true };
  assert.deepEqual(await a.applySetupPreferences(baseline, patch), patch);
  const reopened = createAccountLocalDatabaseStore(A, deps);
  assert.deepEqual(await reopened.loadSetupPreferences(), patch);
  assert.deepEqual(await reopened.loadSettings(), { defaultFocusDurationMinutes: 60, defaultBreakDurationMinutes: 15, uiLocale: 'si' });
  assert.deepEqual(await reopened.loadPresentationPreferences(), { ...personal, appearance: 'dark', reduceMotion: true });
  assert.equal((await reopened.loadOnboardingState()).status, 'completed');
  assert.deepEqual(await b.loadSetupPreferences(), { defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5, appearance: 'system', reduceMotion: false });
  assert.deepEqual(await local.loadSetupPreferences(), await b.loadSetupPreferences());
  assert.deepEqual(await reopened.loadPendingOutbox(), []);
  assert.deepEqual(await reopened.loadSessionHistory(), []);
  assert.equal(sqlite.prepare('PRAGMA user_version').get().user_version, 21, 'setup does not add its own schema migration');
});

test('language-first write changes only locale and preserves explicit preferences and drafts', async t => {
  const { a, b } = fixture(t);
  await a.saveSettings({ defaultFocusDurationMinutes: 60, defaultBreakDurationMinutes: 15, uiLocale: 'en' });
  await a.saveOnboardingState({ status: 'in_progress', step: 'assessment', version: 1 });
  await a.saveSetupLocale('si');
  assert.deepEqual(await a.loadSettings(), { defaultFocusDurationMinutes: 60, defaultBreakDurationMinutes: 15, uiLocale: 'si' });
  assert.equal((await a.loadOnboardingState()).status, 'in_progress');
  assert.equal((await b.loadSettings()).uiLocale, 'en');
  await assert.rejects(a.saveSetupLocale('unsupported'), /INVALID_SETUP_LOCALE/);
  assert.equal((await a.loadSettings()).uiLocale, 'si');
});

test('failure in the second table rolls back durations and completion; same command can retry', async t => {
  const { a, db } = fixture(t);
  await a.saveOnboardingState({ status: 'in_progress', step: 'profile', version: 1 });
  const baseline = await a.loadSetupPreferences();
  const patch = { defaultFocusDurationMinutes: 60, appearance: 'dark' };
  const run = db.runAsync;
  db.runAsync = async (sql, ...args) => {
    if (sql.startsWith('INSERT INTO device_presentation_preferences')) throw Error('synthetic disk failure');
    return run(sql, ...args);
  };
  await assert.rejects(a.applySetupPreferences(baseline, patch), /synthetic disk failure/);
  db.runAsync = run;
  assert.deepEqual(await a.loadSetupPreferences(), baseline);
  assert.deepEqual(await a.loadOnboardingState(), { status: 'in_progress', step: 'profile', version: 1 });
  await a.applySetupPreferences(baseline, patch);
  assert.equal((await a.loadSetupPreferences()).appearance, 'dark');
  assert.equal((await a.loadOnboardingState()).status, 'completed');
});

test('stale selected values reject without applying other fields; unrelated fresh edits survive', async t => {
  const { a } = fixture(t);
  const baseline = await a.loadSetupPreferences();
  await a.saveSettings({ defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 5, uiLocale: 'ta' });
  await assert.rejects(a.applySetupPreferences(baseline, { defaultFocusDurationMinutes: 60, appearance: 'dark' }), /SETUP_PREFERENCES_CONFLICT/);
  assert.equal((await a.loadSetupPreferences()).appearance, 'system');
  assert.equal((await a.loadOnboardingState()).status, 'not_started');
  await a.applySetupPreferences(baseline, { appearance: 'dark' });
  assert.deepEqual(await a.loadSettings(), { defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 5, uiLocale: 'ta' });
});

test('lost-response retries are idempotent and duplicate Apply creates no extra records', async t => {
  const { a, sqlite } = fixture(t);
  const baseline = await a.loadSetupPreferences();
  const patch = { defaultFocusDurationMinutes: 60, appearance: 'dark' };
  const first = await a.applySetupPreferences(baseline, patch);
  assert.deepEqual(await a.applySetupPreferences(baseline, patch), first);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM user_settings').get().n, 1);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM device_presentation_preferences').get().n, 1);
});

test('skip applies no defaults; malformed patches and corrupted data fail closed', async t => {
  const { a, sqlite } = fixture(t);
  await a.saveSettings({ defaultFocusDurationMinutes: 60, defaultBreakDurationMinutes: 15, uiLocale: 'si' });
  const baseline = await a.loadSetupPreferences();
  assert.deepEqual(await a.applySetupPreferences(baseline, {}), baseline);
  await assert.rejects(a.applySetupPreferences(baseline, { uiLocale: 'en' }), /INVALID_INPUT/);
  await assert.rejects(a.applySetupPreferences(baseline, { reduceMotion: 'false' }), /INVALID_INPUT/);
  sqlite.prepare('INSERT INTO device_presentation_preferences (owner_id,preferences_json) VALUES (?,?)').run(`account:${A}`, '{}');
  await assert.rejects(a.loadSetupPreferences(), /INVALID_RECORD/);
  await assert.rejects(a.applySetupPreferences(baseline, { defaultFocusDurationMinutes: 25 }), /INVALID_RECORD/);
  assert.equal((await a.loadSettings()).defaultFocusDurationMinutes, 60);
});

test('queued writes capture the caller patch and preserve existing tasks and assessments', async t => {
  const { a } = fixture(t);
  const task = { id: 'preserve', title: 'Preserve', status: 'pending', createdAt: '2026-10-20T00:00:00.000Z', updatedAt: '2026-10-20T00:00:00.000Z' };
  await a.saveTasks([task]);
  const revision = await a.saveAssessmentDraft({ id: 'personal-assessment-v1', version: '1.0.0', startedAt: '2026-10-20T00:00:00.000Z', answers: { focus_pace: 'long' } }, null);
  const legacy = await a.loadAssessment('personal-assessment-v1');
  const baseline = await a.loadSetupPreferences();
  const patch = { appearance: 'dark' };
  const pending = a.applySetupPreferences(baseline, patch);
  patch.appearance = 'light';
  baseline.appearance = 'light';
  await pending;
  assert.equal((await a.loadSetupPreferences()).appearance, 'dark');
  assert.deepEqual(await a.loadTasks(), [task]);
  assert.deepEqual(await a.loadAssessment('personal-assessment-v1'), legacy);
  assert.equal(legacy.updatedAt, revision);
});

test('v2 resume excludes legacy, foreign, cancelled and completed attempts; retakes get fresh IDs', async t => {
  const { a, b } = fixture(t);
  const make = (id, version = '2.0.0') => ({ id, version, startedAt: '2026-10-20T00:00:00.000Z', answers: { focus_duration: '60' } });
  await a.saveAssessmentDraft(make('personal-assessment-v1', '1.0.0'), null);
  await b.saveAssessmentDraft(make('personal-setup-v2:foreign'), null);
  assert.equal(await a.loadLatestSetupDraft(), null);
  const first = await a.saveAssessmentDraft(make('personal-setup-v2:first'), null);
  assert.equal((await a.loadLatestSetupDraft()).id, 'personal-setup-v2:first');
  await a.cancelAssessment('personal-setup-v2:first', first);
  assert.equal(await a.loadLatestSetupDraft(), null);
  const next = await a.saveAssessmentDraft(make('personal-setup-v2:second'), null);
  const preferences = await a.loadSetupPreferences();
  await a.applySetupPreferences(preferences, { defaultFocusDurationMinutes: 60 }, { id: 'personal-setup-v2:second', updatedAt: next });
  assert.equal(await a.loadLatestSetupDraft(), null);
  const completed = await a.loadAssessment('personal-setup-v2:second');
  assert.equal(completed.status, 'completed');
  assert.ok(completed.completedAt);
  await a.saveAssessmentDraft(make('personal-setup-v2:third'), null);
  assert.equal((await a.loadLatestSetupDraft()).id, 'personal-setup-v2:third');
  assert.equal((await a.loadAssessment('personal-setup-v2:first')).status, 'cancelled');
  assert.equal((await a.loadAssessment('personal-assessment-v1')).version, '1.0.0');
});

test('draft completion failure rolls back both settings tables; receipt retry never overwrites a later edit', async t => {
  const { a, db } = fixture(t);
  const id = 'personal-setup-v2:receipt';
  const updatedAt = await a.saveAssessmentDraft({ id, version: '2.0.0', startedAt: '2026-10-20T00:00:00.000Z', answers: { focus_duration: '60', appearance: 'dark' } }, null);
  const baseline = await a.loadSetupPreferences();
  const patch = { defaultFocusDurationMinutes: 60, appearance: 'dark' };
  const attempt = { id, updatedAt };
  const run = db.runAsync;
  db.runAsync = async (sql, ...args) => { if (sql.startsWith("UPDATE assessments SET status = 'completed'")) throw Error('synthetic final write failure'); return run(sql, ...args); };
  await assert.rejects(a.applySetupPreferences(baseline, patch, attempt), /synthetic final write failure/);
  db.runAsync = run;
  assert.deepEqual(await a.loadSetupPreferences(), baseline);
  assert.equal((await a.loadAssessment(id)).status, 'in_progress');
  await a.applySetupPreferences(baseline, patch, attempt);
  await a.saveSettings({ defaultFocusDurationMinutes: 45, defaultBreakDurationMinutes: 5, uiLocale: 'si' });
  assert.equal((await a.applySetupPreferences(baseline, patch, attempt)).defaultFocusDurationMinutes, 45, 'receipt does not re-apply after a later settings edit');
  await assert.rejects(a.applySetupPreferences(baseline, { appearance: 'light' }, attempt), /SETUP_DRAFT_CONFLICT/);
});

test('stale or foreign draft references cannot commit settings or a completion marker', async t => {
  const { a, b } = fixture(t);
  const id = 'personal-setup-v2:revision';
  const draft = { id, version: '2.0.0', startedAt: '2026-10-20T00:00:00.000Z', answers: {} };
  const first = await a.saveAssessmentDraft(draft, null);
  await a.saveAssessmentDraft({ ...draft, answers: { appearance: 'dark' } }, first);
  const baseline = await a.loadSetupPreferences();
  await assert.rejects(a.applySetupPreferences(baseline, { appearance: 'dark' }, { id, updatedAt: first }), /SETUP_DRAFT_CONFLICT/);
  await assert.rejects(b.applySetupPreferences(baseline, { appearance: 'dark' }, { id, updatedAt: first }), /SETUP_DRAFT_CONFLICT/);
  assert.deepEqual(await a.loadSetupPreferences(), baseline);
  assert.equal((await a.loadOnboardingState()).status, 'not_started');
});

test('actual flow resumes its SQLite draft and commits four reviewed effects atomically', async t => {
  const { a, b, deps } = fixture(t);
  await a.saveSetupLocale('si');
  const identity = () => ({ id: 'personal-setup-v2:integration', startedAt: '2026-10-20T00:00:00.000Z' });
  const first = createSetupFlow(a, identity);
  await first.load(); await first.ensureDraft(); await first.answer('focus_duration', '60');
  first.dispose();
  const resumed = createSetupFlow(createAccountLocalDatabaseStore(A, deps), identity);
  await resumed.load();
  assert.equal(resumed.getState().questionIndex, 1);
  assert.equal(resumed.getState().answers.focus_duration, '60');
  await resumed.answer('break_duration', '15');
  await resumed.answer('appearance', 'dark');
  await resumed.answer('motion', 'reduced');
  assert.deepEqual(await a.loadSetupPreferences(), { defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5, appearance: 'system', reduceMotion: false }, 'nothing applies before reviewed confirmation');
  assert.equal(await resumed.apply(['defaultFocusDurationMinutes', 'defaultBreakDurationMinutes', 'appearance', 'reduceMotion']), true);
  assert.deepEqual(await a.loadSetupPreferences(), { defaultFocusDurationMinutes: 60, defaultBreakDurationMinutes: 15, appearance: 'dark', reduceMotion: true });
  assert.equal((await a.loadSettings()).uiLocale, 'si');
  assert.equal((await a.loadOnboardingState()).status, 'completed');
  assert.equal(await a.loadLatestSetupDraft(), null);
  assert.equal((await b.loadSetupPreferences()).appearance, 'system');
});
