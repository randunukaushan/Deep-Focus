import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const ts = createRequire(import.meta.url)('typescript');
const code = ts.transpileModule(readFileSync('src/features/onboarding/onboarding-context.tsx', 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function fixture() {
  const slots = [], effects = [], layouts = [], writes = [], reads = [];
  let cursor = 0, owner = 'A', value;
  const effect = (fn, deps, queue) => {
    const i = cursor++; const previous = slots[i];
    if (!previous || deps.some((v, n) => v !== previous.deps[n])) { previous?.cleanup?.(); slots[i] = { deps }; queue.push(() => { slots[i].cleanup = fn(); }); }
  };
  const setLocale = () => {};
  const jsx = (_type, props) => { value = props.value; return props; };
  const deps = {
    react: {
      createContext: () => ({ Provider: 'Provider' }), useContext: () => value,
      useRef: initial => slots[cursor++] ??= { current: initial },
      useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, next => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }]; },
      useMemo: fn => fn(), useCallback: fn => fn,
      useEffect: (fn, deps) => effect(fn, deps, effects), useLayoutEffect: (fn, deps) => effect(fn, deps, layouts),
    },
    'react/jsx-runtime': { jsx },
    '@/features/auth/auth-context': { useAuth: () => ({ snapshot: owner ? { status: 'signed_in', userId: owner } : { status: 'signed_out' } }) },
    '@/features/settings/settings-storage': { loadSettings: async () => ({ uiLocale: 'en' }) },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ setLocale }) },
    './onboarding-storage': {
      loadOnboardingState() { const request = deferred(); reads.push({ owner, ...request }); return request.promise; },
      saveOnboardingState(state) { const request = deferred(); writes.push({ owner, state, ...request }); return request.promise; },
    },
  };
  const exports = {}; runInNewContext(code, { exports, require(name) { assert.ok(name in deps, name); return deps[name]; } });
  return {
    render() { cursor = 0; exports.OnboardingProvider({ children: null }); layouts.splice(0).forEach(fn => fn()); effects.splice(0).forEach(fn => fn()); return value; },
    switch(next) { owner = next; return this.render(); },
    async settle() { await new Promise(setImmediate); return this.render(); }, reads, writes,
  };
}

test('onboarding immediately hides a previous owner marker and ignores stale callbacks', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.reads[0].resolve({ status: 'completed', step: 'intro', version: 1 });
  let value = await app.settle(); assert.equal(value.state.status, 'completed');
  const old = value;
  value = app.switch('B'); assert.equal(value.state, null); assert.equal(value.loading, true);
  await assert.rejects(old.beginAssessment(), /ONBOARDING_OWNER_CHANGED/);
  assert.equal(app.writes.length, 0);
  await app.settle(); app.reads[1].resolve({ status: 'not_started', step: 'intro', version: 1 });
  value = await app.settle(); assert.equal(value.state.status, 'not_started');
});

test('a write finishing after an owner switch cannot mark the new owner completed', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.reads[0].resolve({ status: 'in_progress', step: 'profile', version: 1 });
  const old = await app.settle(); const pending = old.complete();
  assert.equal(app.writes[0].owner, 'A');
  app.switch('B'); app.writes[0].resolve();
  await assert.rejects(pending, /ONBOARDING_OWNER_CHANGED/);
  const value = await app.settle(); assert.equal(value.state, null);
});

test('atomic-apply refresh reads the committed marker without a second write', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.reads[0].resolve({ status: 'in_progress', step: 'profile', version: 1 });
  const old = await app.settle(); const pending = old.refresh();
  app.reads[1].resolve({ status: 'completed', step: 'intro', version: 1 });
  await pending; const value = await app.settle();
  assert.equal(value.state.status, 'completed'); assert.equal(app.writes.length, 0);
});
