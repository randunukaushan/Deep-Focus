import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { defaultPresentationPreferences as defaults, motivationPhrase, validPresentationPreferences } from '../../src/features/settings/presentation-preferences.ts';
const ts = createRequire(import.meta.url)('typescript');
const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const copy = {}; runInNewContext(compile('src/features/localization/presentation-copy.ts'), { exports: copy });
function fixture(file, extra = {}) {
  const slots = []; let cursor = 0;
  const deps = {
    react: { useState(initial) { const i = cursor++; slots[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, next => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }]; } },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'Fragment' },
    'react-native': { Pressable: 'Pressable', Switch: 'Switch', TextInput: 'TextInput', View: 'View', StyleSheet: { create: value => value } },
    '@/components/themed-text': { ThemedText: 'Text' }, '@/components/ui/button': { Button: 'Button' },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en' }) }, '@/features/localization/presentation-copy': copy,
    '@/hooks/use-theme': { useTheme: () => ({}) }, '@/theme/tokens': { Radius: {}, Spacing: {} },
    './presentation-context': { usePresentation: () => null }, './presentation-preferences': { validPresentationPreferences },
    '@/features/settings/presentation-preferences': { motivationPhrase }, ...extra,
  };
  const exports = {}; runInNewContext(compile(file) + (file.endsWith('presentation-panel.tsx') ? '\nexports.Editor=PreferenceEditor;' : ''), { exports, require(name) { assert.ok(name in deps, name); return deps[name]; } });
  return { render(name, props) { cursor = 0; return exports[name](props); } };
}
function nodes(node) { if (Array.isArray(node)) return node.flatMap(nodes); if (!node || typeof node !== 'object') return []; return [node, ...nodes(node.props.children)]; }
test('Profile editor validates before writing and keeps a failed-save draft', async () => {
  const app = fixture('src/features/settings/presentation-panel.tsx'); const writes = [];
  const props = { initial: defaults, saving: false, save: async value => { writes.push(value); return false; } };
  let tree = app.render('Editor', props);
  const find = label => nodes(tree).find(n => n.props.accessibilityLabel === label || n.props.label === label || n.props.children === label);
  find('My own words').props.onPress(); tree = app.render('Editor', props);
  nodes(tree).find(n => n.type === 'TextInput').props.onChangeText('🌱'.repeat(241)); tree = app.render('Editor', props);
  find('Save preferences').props.onPress(); tree = app.render('Editor', props); assert.equal(writes.length, 0); assert.ok(find(copy.getPresentationCopy('en').invalid));
  nodes(tree).find(n => n.type === 'TextInput').props.onChangeText('One calm step.'); tree = app.render('Editor', props);
  find('Save preferences').props.onPress(); await new Promise(setImmediate); tree = app.render('Editor', props);
  assert.equal(writes[0].personalPhrase, 'One calm step.'); assert.equal(nodes(tree).find(n => n.type === 'TextInput').props.value, 'One calm step.'); assert.ok(find(copy.getPresentationCopy('en').failed));
  tree = app.render('Editor', { ...props, saving: true }); assert.equal(find('Off').props.disabled, true); assert.equal(find('Save preferences').props.disabled, true);
});
test('focus words remain steady, are opt-in, and Off hides them for the rest of the session', () => {
  const app = fixture('src/features/focus/steady-focus-words.tsx');
  const preferences = { ...defaults, motivation: 'personal', personalPhrase: 'Original', showDuringFocus: true };
  assert.equal(app.render('SteadyFocusWords', { preferences, fallback: 'Default' }).props.children, 'Original');
  assert.equal(app.render('SteadyFocusWords', { preferences: { ...preferences, personalPhrase: 'Changed' }, fallback: 'Default' }).props.children, 'Original');
  assert.equal(app.render('SteadyFocusWords', { preferences: { ...preferences, motivation: 'off' }, fallback: 'Default' }), null);
  assert.equal(app.render('SteadyFocusWords', { preferences, fallback: 'Default' }), null);
  const next = fixture('src/features/focus/steady-focus-words.tsx'); assert.equal(next.render('SteadyFocusWords', { preferences: defaults, fallback: 'Default' }), null);
  assert.equal(next.render('SteadyFocusWords', { preferences, fallback: 'Default' }), null);
});
