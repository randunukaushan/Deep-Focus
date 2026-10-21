import assert from 'node:assert/strict';
import test from 'node:test';
import { register } from 'node:module';
register('../helpers/setup-flow-loader.mjs', import.meta.url);
const { createSetupFlow } = await import('../../src/features/onboarding/setup-flow.ts');
const defaults = { defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5, appearance: 'system', reduceMotion: false };
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function fixture(overrides = {}) {
  const saves = [], applies = [];
  let serial = 0;
  const storage = {
    async loadLatestSetupDraft() { return null; }, async loadSetupPreferences() { return defaults; },
    async saveAssessmentDraft(draft, expected) { saves.push({ draft, expected }); return `2026-10-20T00:00:0${saves.length}.000Z`; },
    async applySetupPreferences(expected, patch, attempt) { applies.push({ expected, patch, attempt }); return { ...expected, ...patch }; },
    ...overrides,
  };
  const flow = createSetupFlow(storage, () => ({ id: `personal-setup-v2:${++serial}`, startedAt: '2026-10-20T00:00:00.000Z' }));
  return { flow, storage, saves, applies };
}

test('an empty failed load can retry; invalid legacy answers never become v2 choices', async () => {
  let fail = true;
  const { flow } = fixture({ async loadLatestSetupDraft() { if (fail) throw Error('private provider detail'); return null; } });
  assert.equal(await flow.load(), false); assert.equal(flow.getState().error, 'load');
  assert.equal(JSON.stringify(flow.getState()).includes('private'), false);
  fail = false; assert.equal(await flow.retry(), true); assert.equal(flow.getState().status, 'ready');
  const legacy = fixture({ async loadLatestSetupDraft() { return { id: 'v1', answers: { focus_pace: 'long' } }; } }).flow;
  assert.equal(await legacy.load(), false); assert.equal(legacy.getState().error, 'load');
});

test('resume happens once; saving never advances the current question and Back retains answers', async () => {
  const { flow } = fixture({ async loadLatestSetupDraft() { return { id: 'personal-setup-v2:saved', startedAt: '2026-10-20T00:00:00.000Z', updatedAt: '2026-10-20T00:00:01.000Z', answers: { focus_duration: '45' } }; } });
  await flow.load(); assert.equal(flow.getState().questionIndex, 1);
  assert.equal(await flow.answer('break_duration', '15'), true); assert.equal(flow.getState().questionIndex, 1);
  flow.move(2); flow.move(0); assert.equal(flow.getState().answers.focus_duration, '45');
  await flow.answer('focus_duration', '60'); assert.equal(flow.getState().questionIndex, 0);
  assert.equal(flow.move(-1), false); assert.equal(flow.move(4), false);
});

test('save is immediately locked, keeps the shown choice, blocks duplicate taps and advances revisions', async () => {
  const first = deferred(); let count = 0;
  const { flow, saves } = fixture({ async saveAssessmentDraft(draft, expected) { saves.push({ draft, expected }); return ++count === 1 ? first.promise : '2026-10-20T00:00:02.000Z'; } });
  await flow.load();
  const save = flow.answer('focus_duration', '60');
  assert.equal(flow.getState().status, 'saving'); assert.equal(flow.getState().answers.focus_duration, '60');
  assert.equal(await flow.answer('appearance', 'dark'), false); assert.equal(flow.move(1), false);
  first.resolve('2026-10-20T00:00:01.000Z'); assert.equal(await save, true);
  await flow.answer('break_duration', '10');
  assert.equal(saves.length, 2); assert.equal(saves[1].expected, '2026-10-20T00:00:01.000Z');
  assert.equal(saves[1].draft.id, saves[0].draft.id);
});

test('failed save retains answers and safe error; explicit retry persists the same answers', async () => {
  let fail = true;
  const { flow, saves } = fixture({ async saveAssessmentDraft(draft) { saves.push(draft); if (fail) throw Error('secret disk path'); return '2026-10-20T00:00:01.000Z'; } });
  await flow.load(); assert.equal(await flow.answer('appearance', 'dark'), false);
  assert.equal(flow.getState().answers.appearance, 'dark'); assert.equal(flow.getState().error, 'save');
  assert.equal(await flow.answer('motion', 'reduced'), false);
  fail = false; assert.equal(await flow.retry(), true); assert.deepEqual(saves[1].answers, { appearance: 'dark' });
  assert.equal(saves[0].id, saves[1].id, 'a failed first save retries the same attempt identity');
});

test('stale draft save offers reload instead of replaying against the same revision', async () => {
  let reads = 0, writes = 0;
  const { flow } = fixture({ async loadLatestSetupDraft() { ++reads; return null; }, async saveAssessmentDraft() { ++writes; return null; } });
  await flow.load(); assert.equal(await flow.answer('motion', 'reduced'), false); assert.equal(flow.getState().error, 'conflict');
  await flow.retry(); assert.equal(reads, 2); assert.equal(writes, 1);
});

test('Apply derives only checked rows, captures reviewed revision and rejects duplicate confirmation', async () => {
  const pending = deferred();
  const { flow, applies } = fixture({ async applySetupPreferences(expected, patch, attempt) { applies.push({ expected, patch, attempt }); return pending.promise; } });
  await flow.load(); await flow.answer('focus_duration', '60'); await flow.answer('appearance', 'dark');
  const apply = flow.apply(['appearance']);
  assert.equal(await flow.apply(['defaultFocusDurationMinutes']), false);
  assert.deepEqual(applies[0].patch, { appearance: 'dark' });
  assert.equal(applies[0].attempt.updatedAt, '2026-10-20T00:00:02.000Z');
  pending.resolve({ ...defaults, appearance: 'dark' }); assert.equal(await apply, true); assert.equal(flow.getState().status, 'applied');
  assert.equal(await flow.apply(['appearance']), false);
});

test('failed Apply retry returns to review without a hidden second settings write', async () => {
  let writes = 0;
  const { flow } = fixture({ async applySetupPreferences() { ++writes; throw Error('disk failed'); } });
  await flow.load(); await flow.answer('motion', 'reduced');
  assert.equal(await flow.apply(['reduceMotion']), false); assert.equal(flow.getState().error, 'apply');
  await flow.retry(); assert.equal(flow.getState().status, 'ready'); assert.equal(writes, 1);
});

test('disposed owner instances ignore delayed reads/writes and cannot issue more storage calls', async () => {
  const read = deferred(), write = deferred(); let writes = 0;
  const first = fixture({ loadLatestSetupDraft: () => read.promise }).flow;
  const loading = first.load(); first.dispose(); read.resolve(null);
  assert.equal(await loading, false); assert.equal(await first.answer('appearance', 'dark'), false);
  const second = fixture({ async saveAssessmentDraft() { ++writes; return write.promise; } }).flow;
  await second.load(); const saving = second.answer('appearance', 'dark'); second.dispose();
  write.resolve('2026-10-20T00:00:01.000Z'); assert.equal(await saving, false);
  assert.equal(await second.ensureDraft(), false); assert.equal(await second.retry(), false); assert.equal(writes, 1);
});

test('unavailable attempt identity generation is a retryable save error, not a permanent lock', async () => {
  const { storage } = fixture(); let fail = true;
  const flow = createSetupFlow(storage, () => { if (fail) throw Error('identity unavailable'); return { id: 'personal-setup-v2:retry', startedAt: '2026-10-20T00:00:00.000Z' }; });
  await flow.load(); assert.equal(await flow.answer('appearance', 'dark'), false);
  assert.equal(flow.getState().error, 'save'); fail = false;
  assert.equal(await flow.retry(), true); assert.equal(flow.getState().status, 'ready');
});
