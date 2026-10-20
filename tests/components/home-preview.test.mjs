import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
const ts = createRequire(import.meta.url)('typescript');
const compile = file => ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const code = compile('src/features/home/home-screen.tsx');
const planning = {}; runInNewContext(compile('src/features/tasks/task-planning.ts'), { exports: planning, Date });
const wording = {}; runInNewContext(compile('src/features/localization/preview-home-copy.ts'), { exports: wording });

function fixture({ session = null, taskFailure = false, sessionFailure = false, progressFailure = false, minuteUnit = 'min' } = {}) {
  const slots = []; const routes = []; let cursor = 0, effect, mounted = false, tree;
  const router = { push: path => routes.push(path), replace: path => routes.push(path) };
  const deps = {
    react: { useState(initial) { const i = cursor++; slots[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, value => { slots[i].value = typeof value === 'function' ? value(slots[i].value) : value; }]; }, useRef: value => slots[cursor++] ??= { current: value }, useCallback: fn => fn },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'Fragment' },
    'expo-router': { useRouter: () => router, useFocusEffect(fn) { if (!mounted) effect = fn; } },
    '@expo/vector-icons': { Ionicons: 'Icon' }, 'expo-image': { Image: 'Image' },
    'react-native': { Pressable: 'Pressable', ScrollView: 'ScrollView', View: 'View', StyleSheet: { create: value => value } },
    '@/components/themed-text': { ThemedText: 'Text' }, '@/components/themed-view': { ThemedView: 'View' }, '@/components/ui/button': { Button: 'Button' }, '@/components/deep-focus-scene': { DeepFocusScene: 'Scene' },
    '@/hooks/use-theme': { useTheme: () => ({ text: '#142E48', primary: '#2165DF', border: '#DBE5F0' }) }, '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/theme/tokens': { Palette: {}, Radius: {}, Spacing: { lg: 24, md: 16, sm: 8, xs: 4 }, Typography: { heading1: { fontSize: 32 }, heading3: { fontSize: 24 }, heading4: { fontSize: 20 } } },
    '@/features/focus/session-storage': { async loadActiveSession() { if (sessionFailure) throw Error('private session detail'); return session; }, async loadSessionHistory() { if (progressFailure) throw Error('private history detail'); return []; } },
    '@/features/tasks/task-storage': { async loadTasks() { if (taskFailure) throw Error('private task detail'); return [{ id: 'real-task', title: 'Real task', status: 'pending', estimatedMinutes: 45 }]; } },
    '@/features/tasks/task-planning': planning,
    '@/features/settings/presentation-context': { usePresentation: () => null },
    '@/features/settings/presentation-preferences': { defaultPresentationPreferences: {}, motivationPhrase: (_p, fallback) => fallback },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en', copy: { home: { settings: 'Settings', hoursUnit: 'h', minutesUnit: 'min', focusSession: 'Focus session', pausedKicker: 'Paused', remaining: 'remaining', startFocusAccessibility: 'Start new focus', startFocus: 'Standalone focus', quickActions: 'Quick actions', tasks: 'Tasks', goals: 'Goals', plan: 'Plan my day', focusSoFar: 'Progress', blocks: 'blocks' }, tasks: { loading: 'Loading tasks', loadError: 'Tasks unavailable', retry: 'Retry tasks', ready: 'Ready', completedState: 'Completed' }, focus: { minutes: minuteUnit } } }) },
    '@/features/localization/preview-home-copy': wording, '@/features/localization/progress-copy': { getProgressCopy: () => ({ loading: 'Loading progress', loadErrorDetail: 'Progress unavailable' }) }, '@/assets/branding/deep-focus-logo.png': 1,
  };
  const exports = {}; runInNewContext(code, { exports, Date, require(name) { assert.ok(name in deps, name); return deps[name]; } });
  function nodes(node) { if (Array.isArray(node)) return node.flatMap(nodes); if (!node || typeof node !== 'object') return []; return [node, ...nodes(node.props.children)]; }
  return {
    render() { cursor = 0; tree = exports.HomeScreen(); if (!mounted) { mounted = true; effect(); } return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    find(label) { return nodes(tree).find(node => node.props.label === label || node.props.accessibilityLabel === label || node.props.children === label); }, routes,
  };
}

test('Home renders real task estimates with the selected localized minute unit', async () => {
  for (const minuteUnit of ['min', 'මිනිත්තු', 'நிமி']) {
    const app = fixture({ minuteUnit }); app.render(); await app.settle();
    assert.ok(app.find(`45 ${minuteUnit}`));
  }
});

test('preview Home uses real next work and keeps standalone focus and navigation', async () => {
  const app = fixture(); app.render(); await app.settle();
  assert.ok(app.find('Real task'));
  app.find('Start focus').props.onPress(); assert.equal(app.routes[0].params.taskId, 'real-task');
  app.find('Standalone focus').props.onPress(); assert.equal(app.routes[1], '/focus/setup');
  app.find('View plan').props.onPress(); assert.equal(app.routes[2], '/(tabs)/plan');
});

test('preview Home returns to the saved paused session rather than starting another', async () => {
  const app = fixture({ session: { status: 'paused', taskName: 'Saved work', plannedDurationSeconds: 1500, focusedDurationSeconds: 120 } });
  app.render(); await app.settle(); app.find('Return to focus').props.onPress();
  assert.equal(app.routes[0].pathname, '/focus/session'); assert.equal(app.routes[0].params.resume, '1');
  app.find('Standalone focus').props.onPress(); assert.equal(app.routes[1].pathname, '/focus/session');
});

test('preview Home does not hide task/history failures or swallow active-session recovery errors', async () => {
  const app = fixture({ taskFailure: true, progressFailure: true }); app.render(); await app.settle();
  assert.ok(app.find('Tasks unavailable')); assert.ok(app.find('Progress unavailable')); assert.equal(app.find('Start focus'), undefined);
  const brokenSession = fixture({ sessionFailure: true }); brokenSession.render(); await brokenSession.settle();
  assert.ok(brokenSession.routes.includes('/focus/recovery'));
});
