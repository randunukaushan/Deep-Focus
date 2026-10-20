import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { getAppLocaleCopy } from '../../src/features/localization/app-locale.ts';
import { getSessionCopy } from '../../src/features/localization/session-copy.ts';
import * as tokens from '../../src/theme/tokens.ts';

const ts = createRequire(import.meta.url)('typescript');
const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const contrast = {};
runInNewContext(compile('src/theme/action-colors.ts'), { exports: contrast, require: () => tokens });

function fixture(route, { scheme = 'light', locale = 'en', platform = 'android', params = {}, taskMissing = false, error = null, hydrated = true, status = 'active' } = {}) {
  const slots = [], effects = [], pushes = [], replacements = [], alerts = [];
  const counts = { pause: 0, resume: 0, complete: 0, cancel: 0, terminalWrites: 0 };
  let cursor = 0, mounted = false, tree;
  const session = { id: 'synthetic-session', status, taskName: 'Stored work', plannedDurationSeconds: 1500, focusedDurationSeconds: 300 };
  const dependencies = {
    react: {
      useState(initial) { const i = cursor++; slots[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, next => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }]; },
      useRef: initial => slots[cursor++] ??= { current: initial },
      useEffect(fn) { if (!mounted) effects.push(fn); }, useCallback: fn => fn,
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ push: path => pushes.push(path), replace: path => replacements.push(path), dismissTo() {} }), useLocalSearchParams: () => params },
    'expo-status-bar': { StatusBar: 'StatusBar' },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    'react-native': { KeyboardAvoidingView: 'KeyboardAvoidingView', Platform: { OS: platform }, Pressable: 'Pressable', ScrollView: 'ScrollView', TextInput: 'TextInput', View: 'View', StyleSheet: { create: value => value }, Alert: { alert: (...args) => alerts.push(args) } },
    '@/components/themed-text': { ThemedText: 'Text' }, '@/components/themed-view': { ThemedView: 'View' }, '@/components/ui/button': { Button: 'Button' },
    '@/components/deep-focus-scene': { DeepFocusScene: 'Scene' }, '@/components/ui/focus-dial': { FocusDial: 'Dial' },
    '@/theme/tokens': tokens, '@/theme/action-colors': contrast,
    '@/hooks/use-theme': { useTheme: () => ({ ...tokens.Colors[scheme], text: tokens.Colors[scheme].textPrimary }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => scheme },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale, copy: getAppLocaleCopy(locale) }) },
    '@/features/localization/session-copy': { getSessionCopy },
    '@/features/settings/settings-storage': { async loadSettings() { return { defaultFocusDurationMinutes: 45 }; } },
    '@/features/tasks/task-storage': { async loadTasks() { return taskMissing ? [] : [{ id: 'stored-task', title: 'Stored task title', status: 'pending' }]; } },
    '@/features/settings/presentation-context': { usePresentation: () => null },
    '@/features/focus/steady-focus-words': { SteadyFocusWords: 'Words' },
    '@/features/localization/preview-home-copy': { getPreviewHomeCopy: () => ({ encouragement: '' }) },
    '@/features/focus/session-storage': { async persistTerminalSession() { counts.terminalWrites++; } },
    '@/features/focus/use-focus-session': { useFocusSession: () => ({
      session, projection: { remainingSeconds: 1200, progress: 0.2 }, hydrated, error, canRetrySave: Boolean(error), retrySave: async () => {},
      pause() { counts.pause++; return true; }, resume() { counts.resume++; }, complete() { counts.complete++; }, cancel() { counts.cancel++; },
    }) },
  };
  const exports = {};
  runInNewContext(compile(`src/app/focus/${route}.tsx`), { exports, require(name) { assert.ok(name in dependencies, `Unexpected dependency ${name}`); return dependencies[name]; } });
  function nodes(value) { if (Array.isArray(value)) return value.flatMap(nodes); if (!value || typeof value !== 'object') return []; if (typeof value.type === 'function') return nodes(value.type(value.props)); return [value, ...nodes(value.props?.children)]; }
  return {
    render() { cursor = 0; tree = exports.default(); if (!mounted) { mounted = true; for (const effect of effects) effect(); } return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    ofType: type => nodes(tree).filter(node => node.type === type),
    find: label => nodes(tree).find(node => node.props.accessibilityLabel === label || node.props.label === label),
    pushes, replacements, alerts, counts,
  };
}

test('Focus setup honors saved duration, checked/contrast choices and app-theme status bar in both themes', async () => {
  for (const scheme of ['light', 'dark']) for (const locale of ['en', 'si', 'ta']) {
    const text = getAppLocaleCopy(locale).focus;
    const app = fixture('setup', { scheme, locale, platform: 'ios' }); app.render();
    assert.equal(app.find(text.startSession).props.disabled, true);
    await app.settle();
    assert.equal(app.ofType('SafeAreaView').length, 1);
    assert.equal(app.ofType('StatusBar')[0].props.style, scheme === 'dark' ? 'light' : 'dark');
    assert.equal(app.ofType('KeyboardAvoidingView')[0].props.behavior, 'padding');
    const selected = app.find(`45 ${text.minutes}`);
    assert.equal(selected.props.accessibilityState.checked, true);
    assert.equal(selected.props.children.props.style.color, contrast.accentTextColor(tokens.Colors[scheme].primary));
    assert.equal(app.ofType('Dial')[0].props.value, '45:00');
    app.find(text.startSession).props.onPress();
    assert.equal(app.pushes[0].params.durationMinutes, '45');
  }
});

test('Focus setup keeps custom-duration validation and authoritative linked-task identity', async () => {
  const text = getAppLocaleCopy('en').focus;
  const app = fixture('setup', { params: { taskId: 'stored-task', taskName: 'Untrusted title' } }); app.render(); await app.settle();
  app.find(text.custom).props.onPress(); app.render();
  app.find(`${text.custom} ${text.minutes}`).props.onChangeText('181'); app.render();
  app.find(text.startSession).props.onPress(); assert.equal(app.pushes.length, 0);
  app.find(`${text.custom} ${text.minutes}`).props.onChangeText('15'); app.render();
  app.find(text.startSession).props.onPress();
  assert.equal(app.pushes[0].params.taskId, 'stored-task');
  assert.equal(app.pushes[0].params.taskName, 'Stored task title');
  assert.equal(app.pushes[0].params.durationMinutes, '15');
  const missing = fixture('setup', { params: { taskId: 'missing' }, taskMissing: true }); missing.render(); await missing.settle();
  assert.equal(missing.find(text.startSession).props.disabled, true);
});

test('active Focus preserves countdown, explicit break/pause and guarded completion/exit handlers', () => {
  const text = getSessionCopy('en');
  for (const scheme of ['light', 'dark']) {
    const app = fixture('session', { scheme }); app.render();
    assert.equal(app.ofType('SafeAreaView').length, 1);
    assert.equal(app.ofType('StatusBar')[0].props.style, scheme === 'dark' ? 'light' : 'dark');
    assert.equal(app.ofType('Dial')[0].props.value, '20:00');
    assert.equal(app.ofType('Dial')[0].props.progress, 0.2);
    assert.equal(app.ofType('ScrollView')[0].props.children.props.style.flexGrow, 1);
    assert.equal(app.counts.resume, 0);
    app.find(text.completeSession).props.onPress(); assert.equal(app.counts.complete, 0);
    assert.ok(app.alerts.length);
    app.find(text.break).props.onPress(); assert.equal(app.counts.pause, 1); assert.equal(app.pushes[0], '/focus/break');
    app.find(text.endSession).props.onPress();
    assert.equal(app.counts.cancel, 0); app.alerts.at(-1)[2][1].onPress(); assert.equal(app.counts.cancel, 1);
    assert.equal(app.counts.terminalWrites, 0);
  }
});

test('Focus error/loading states have scrollable safe-area content, retaining save retry and paused resume', () => {
  const text = getSessionCopy('en');
  for (const options of [{ error: 'SAFE_FAILURE' }, { hydrated: false }]) {
    const app = fixture('session', options); app.render();
    assert.equal(app.ofType('SafeAreaView').length, 1);
    assert.equal(app.ofType('ScrollView')[0].props.contentContainerStyle.flexGrow, 1);
    assert.ok(app.find(text.returnHome));
    assert.equal(app.counts.pause, 0); assert.equal(app.counts.resume, 0);
  }
  const paused = fixture('session', { status: 'paused' }); paused.render();
  assert.equal(paused.counts.resume, 0); paused.find(text.resume).props.onPress(); assert.equal(paused.counts.resume, 1);
});
