import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import * as engine from '../../src/features/focus/break-engine.ts';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/focus/use-break-recovery.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const T = Date.parse('2026-10-21T00:00:00.000Z');
const session = { id: 'synthetic-session', status: 'paused', lastPausedAt: new Date(T).toISOString() };
const saved = { ...engine.createBreakTimer(10, T), sessionId: session.id, pauseStartedAt: session.lastPausedAt };

// Actual hook source; bounded scheduling/AppState fakes, not native React proof.
function fixture({ load = async () => ({ session, activeBreak: null }), save = async value => value } = {}) {
  const slots = []; let cursor = 0, effects = [], clock = T, current = true, foreground, reads = 0;
  const writes = []; const timers = new Map();
  const changed = (a, b) => !a || b.some((value, i) => !Object.is(value, a[i]));
  const react = {
    useState(initial) { const i = cursor++; slots[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, value => { slots[i].value = typeof value === 'function' ? value(slots[i].value) : value; }]; },
    useRef(initial) { return slots[cursor++] ??= { current: initial }; },
    useCallback(fn, deps) { const i = cursor++; if (changed(slots[i]?.deps, deps)) slots[i] = { value: fn, deps }; return slots[i].value; },
    useEffect(fn, deps) { const i = cursor++; if (changed(slots[i]?.deps, deps)) effects.push(() => { slots[i]?.cleanup?.(); slots[i] = { deps, cleanup: fn() }; }); },
  };
  const dependencies = {
    react, './break-engine': engine,
    'react-native': { AppState: { addEventListener(_event, callback) { foreground = callback; return { remove() { foreground = null; } }; } } },
    './break-storage': { createBreakRecoveryStorage: () => ({
      isCurrent: () => current,
      load: () => { reads++; return load(); },
      save: value => { writes.push(value); return save(value); },
    }) },
  };
  const exports = {};
  runInNewContext(outputText, {
    exports, require(name) { if (!(name in dependencies)) throw Error(`Unexpected dependency ${name}`); return dependencies[name]; },
    Date: class extends Date { static now() { return clock; } },
    setInterval(fn) { const id = timers.size + 1; timers.set(id, fn); return id; }, clearInterval(id) { timers.delete(id); },
  });
  return {
    render() { cursor = 0; const result = exports.useBreakRecovery(); const pending = effects; effects = []; pending.forEach(fn => fn()); return result; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    tick(time) { clock = time; for (const fn of timers.values()) fn(); },
    foreground(time) { clock = time; foreground?.('active'); },
    switchOwner() { current = false; }, writes, reads: () => reads,
    unmount() { slots.forEach(slot => slot?.cleanup?.()); },
  };
}

test('hydration blocks start; recovered 10-minute break ignores current defaults and reconciles foreground', async () => {
  let resolve; const f = fixture({ load: () => new Promise(done => { resolve = done; }) });
  let state = f.render(); await state.start(5); assert.equal(f.writes.length, 0);
  resolve({ session, activeBreak: saved }); state = await f.settle();
  assert.equal(state.projection.remainingSeconds, 600);
  f.foreground(T + 180000); state = f.render(); assert.equal(state.projection.remainingSeconds, 420);
  f.tick(T + 900000); state = f.render(); assert.equal(state.projection.remainingSeconds, 0);
  assert.equal(state.record.session.status, 'paused'); f.unmount();
});

test('failed read stays distinct from empty and retry restores the record', async () => {
  let fail = true; const f = fixture({ load: async () => { if (fail) throw Error('private disk path'); return { session, activeBreak: saved }; } });
  f.render(); let state = await f.settle(); assert.equal(state.failed, true); assert.equal(state.ready, false);
  fail = false; await state.retry(); state = await f.settle();
  assert.equal(state.failed, false); assert.equal(state.projection.remainingSeconds, 600); f.unmount();
});

test('save failure retains intent timestamp; explicit retry never silently resets deadline', async () => {
  let fail = true; const f = fixture({ save: async value => { if (fail) throw Error('synthetic full disk'); return value; } });
  f.render(); let state = await f.settle(); await state.start(5); state = await f.settle();
  assert.equal(state.failed, true); assert.equal(state.record.activeBreak, null);
  f.tick(T + 120000); fail = false; await state.retry(); state = await f.settle();
  assert.equal(f.writes.length, 2); assert.deepEqual(f.writes[0], f.writes[1]);
  assert.equal(state.projection.remainingSeconds, 180); assert.equal(state.failed, false); f.unmount();
});

test('duplicate start while saving is coalesced and recovered durable result wins', async () => {
  let resolve; const f = fixture({ save: () => new Promise(done => { resolve = done; }) });
  f.render(); const state = await f.settle(); const write = state.start(5); await state.start(15);
  assert.equal(f.writes.length, 1); resolve(saved); await write;
  assert.equal((await f.settle()).record.activeBreak.plannedDurationSeconds, 600); f.unmount();
});

test('backward clock is explicit, does not fabricate completion, and can be retried', async () => {
  const f = fixture({ load: async () => ({ session, activeBreak: saved }) });
  f.render(); await f.settle(); f.tick(T - 1); let state = f.render();
  assert.equal(state.clockError, true); assert.equal(state.projection, null);
  f.tick(T + 10000); await state.retry(); state = await f.settle();
  assert.equal(state.clockError, false); assert.equal(state.projection.remainingSeconds, 590); f.unmount();
});

test('owner switch or unmount discards late recovery and cannot start another owner break', async () => {
  for (const action of ['switchOwner', 'unmount']) {
    let resolve; const f = fixture({ load: () => new Promise(done => { resolve = done; }) });
    f.render(); await Promise.resolve(); f[action](); resolve({ session, activeBreak: saved });
    const state = await f.settle(); assert.equal(state.record, null);
    await state.start(5); assert.equal(f.writes.length, 0); f.unmount();
  }
});

test('empty or running session does not start an orphan break', async () => {
  for (const value of [null, { ...session, status: 'active' }]) {
    const f = fixture({ load: async () => ({ session: value, activeBreak: null }) });
    f.render(); const state = await f.settle(); assert.equal(state.ready, false);
    await state.start(5); assert.equal(f.writes.length, 0); f.unmount();
  }
});

test('startup and manual recovery retain auth/onboarding ordering and owner cancellation', () => {
  const root = readFileSync(new URL('../../src/app/_layout.tsx', import.meta.url), 'utf8');
  const recovery = readFileSync(new URL('../../src/app/focus/recovery.tsx', import.meta.url), 'utf8');
  assert.ok(root.indexOf("['completed', 'skipped']") < root.indexOf('store.loadFocusRecovery()'));
  assert.match(root, /if \(!current\(\)\) return/);
  assert.match(root, /if \(activeBreak\) router.replace\('\/focus\/break'\)/);
  assert.match(root, /cancelled = true/);
  assert.match(root, /recovery === 'found' && segments\[0\] === 'focus'/);
  assert.match(root, /<Stack key=\{snapshot.userId/);
  assert.match(recovery, /if \(result.activeBreak\) router.replace\('\/focus\/break'\)/);
  assert.match(recovery, /!storage.isCurrent\(\)/);
});
