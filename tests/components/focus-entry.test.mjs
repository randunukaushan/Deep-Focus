import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
const ts = createRequire(import.meta.url)('typescript');
const code = ts.transpileModule(readFileSync('src/app/(tabs)/focus.tsx', 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
function fixture(session, failed = false) {
  const slots = [], routes = []; let cursor = 0, effect, cleanup, mounted = false;
  const deps = {
    react: { useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, next => { slots[i].value = next; }]; }, useRef: initial => slots[cursor++] ??= { current: initial }, useCallback: fn => fn },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'Fragment' },
    'expo-router': { useRouter: () => ({ replace: path => routes.push(path) }), useFocusEffect(fn) { if (!mounted) effect = fn; } },
    'react-native': { ActivityIndicator: 'Indicator', ScrollView: 'ScrollView', View: 'View', StyleSheet: { create: v => v } },
    '@/components/themed-text': { ThemedText: 'Text' }, '@/components/themed-view': { ThemedView: 'View' }, '@/components/ui/button': { Button: 'Button' },
    '@/features/focus/session-storage': { async loadActiveSession() { if (failed) throw Error('private'); return session; } },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en' }) }, '@/features/localization/session-copy': { getSessionCopy: () => ({ recoveryError: 'Cannot load session' }) }, '@/features/localization/progress-copy': { getProgressCopy: () => ({ retry: 'Retry' }) }, '@/hooks/use-theme': { useTheme: () => ({}) }, '@/theme/tokens': { Spacing: {} },
  };
  const exports = {}; runInNewContext(code, { exports, require: name => deps[name] });
  return { routes, render() { cursor = 0; const result = exports.default(); if (!mounted) { mounted = true; cleanup = effect(); } return result; }, retrySucceeds() { failed = false; }, unmount() { cleanup(); } };
}
test('Focus entry restores paused work without automatically resuming, or enters setup when absent', async () => {
  for (const status of ['active', 'paused']) {
    const app = fixture({ status, plannedDurationSeconds: 2700, taskName: 'Saved' }); app.render(); await new Promise(setImmediate);
    assert.equal(app.routes[0].pathname, '/focus/session'); assert.equal(app.routes[0].params.durationMinutes, '45'); assert.equal(app.routes[0].params.resume, undefined);
  }
  const empty = fixture(null); empty.render(); await new Promise(setImmediate); assert.equal(empty.routes[0], '/focus/setup');
});
test('Focus entry read failure blocks new work, retries, and ignores an unmounted reply', async () => {
  const app = fixture(null, true); app.render(); await new Promise(setImmediate); const tree = app.render(); assert.equal(app.routes.length, 0);
  assert.equal(tree.props.children.type, 'ScrollView');
  assert.equal(tree.props.children.props.contentContainerStyle.flexGrow, 1);
  const children = tree.props.children.props.children.props.children;
  assert.equal(children[0].props.children, 'Cannot load session'); app.retrySucceeds(); children[1].props.onPress(); await new Promise(setImmediate); assert.equal(app.routes[0], '/focus/setup');
  const unmounted = fixture(null); unmounted.render(); unmounted.unmount(); await new Promise(setImmediate); assert.equal(unmounted.routes.length, 0);
});
