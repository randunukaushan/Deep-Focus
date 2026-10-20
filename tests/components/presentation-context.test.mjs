import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { defaultPresentationPreferences as defaults, motivationPhrase, validPresentationPreferences } from '../../src/features/settings/presentation-preferences.ts';
const ts = createRequire(import.meta.url)('typescript');
const code = ts.transpileModule(readFileSync('src/features/settings/presentation-context.tsx', 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function fixture() {
  const slots = []; let cursor = 0, owner = 'A', value; const pending = [], writes = [], effects = [];
  const jsx = (_type, props) => { value = props.value; return props; };
  const deps = {
    react: {
      createContext: () => ({ Provider: 'Provider' }), useContext: () => value,
      useRef: initial => slots[cursor++] ??= { current: initial },
      useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, next => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }]; },
      useCallback: fn => fn,
      useEffect(fn, deps) { const i = cursor++; const prev = slots[i]; if (!prev || deps.some((v, n) => v !== prev.deps[n])) { prev?.cleanup?.(); slots[i] = { deps }; effects.push(() => { slots[i].cleanup = fn(); }); } },
    },
    'react/jsx-runtime': { jsx }, 'react-native': { Platform: { OS: 'android' } },
    '@/features/auth/auth-context': { useAuth: () => ({ snapshot: owner ? { status: 'signed_in', userId: owner } : { status: 'signed_out' } }) },
    '@/features/storage/local-database': {
      loadPresentationPreferences() { const request = deferred(); pending.push({ owner, ...request }); return request.promise; },
      savePresentationPreferences(preferences) { const request = deferred(); writes.push({ owner, preferences, ...request }); return request.promise; },
    }, './presentation-preferences': { defaultPresentationPreferences: defaults },
  };
  deps.react.useLayoutEffect = deps.react.useEffect;
  const exports = {}; runInNewContext(code, { exports, require(name) { assert.ok(name in deps, name); return deps[name]; } });
  return { render() { cursor = 0; exports.PresentationProvider({ children: null }); effects.splice(0).forEach(fn => fn()); return value; }, switch(next) { owner = next; return this.render(); }, async settle() { await new Promise(setImmediate); return this.render(); }, pending, writes };
}
test('personal words validate Unicode length and never interpret markup', () => {
  assert.ok(validPresentationPreferences({ ...defaults, personalPhrase: '🌱'.repeat(240) }));
  assert.equal(validPresentationPreferences({ ...defaults, personalPhrase: '🌱'.repeat(241) }), false);
  assert.equal(validPresentationPreferences({ ...defaults, personalPhrase: '\0' }), false);
  assert.equal(validPresentationPreferences({ ...defaults, extra: true }), false);
  assert.equal(motivationPhrase({ ...defaults, motivation: 'off', personalPhrase: 'private' }, 'default'), '');
  assert.equal(motivationPhrase({ ...defaults, motivation: 'personal', personalPhrase: '<b>Plain words</b>' }, 'default'), '<b>Plain words</b>');
});
test('owner switch immediately hides private words and discards stale read replies', async () => {
  const app = fixture(); app.render(); app.switch('B');
  app.pending[0].resolve({ ...defaults, personalPhrase: 'A private words', motivation: 'personal' });
  let value = await app.settle(); assert.equal(value.preferences.personalPhrase, ''); assert.equal(value.loading, true);
  app.pending[1].resolve({ ...defaults, personalPhrase: 'B words', motivation: 'personal' });
  value = await app.settle(); assert.equal(value.preferences.personalPhrase, 'B words');
  value = app.switch(null); assert.equal(value.preferences.personalPhrase, '');
});
test('duplicate writes are blocked and failures do not advertise a saved draft', async () => {
  const app = fixture(); app.render(); app.pending[0].resolve(defaults); let value = await app.settle();
  const personal = { ...defaults, personalPhrase: 'new', motivation: 'personal' };
  const save = value.save(personal); assert.equal(await value.save(personal), false); assert.equal(app.writes.length, 1);
  app.writes[0].reject(Error('private synthetic failure')); assert.equal(await save, false);
  value = await app.settle(); assert.equal(value.preferences.personalPhrase, ''); assert.equal(value.saving, false);
  const next = value.save(personal); app.switch('B'); app.writes[1].resolve(); assert.equal(await next, false);
  value = await app.settle(); assert.equal(value.preferences.personalPhrase, '');
});
test('failed preference reads block writes until an explicit retry succeeds', async () => {
  const app = fixture(); app.render(); app.pending[0].reject(Error('private synthetic read')); let value = await app.settle();
  assert.equal(value.error, true); assert.equal(await value.save(defaults), false); assert.equal(app.writes.length, 0);
  value.retry(); app.render(); app.pending[1].resolve(defaults); value = await app.settle(); assert.equal(value.error, false);
});
