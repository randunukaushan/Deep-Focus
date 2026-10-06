import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const { outputText } = ts.transpileModule(readFileSync(new URL('../../src/app/goals/index.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function fixture({ goals = [], goalReadFailures = 0, historyReadFailures = 0 } = {}) {
  const slots = [];
  let cursor = 0, effect, mounted = false, tree;
  const dependencies = {
    react: {
      useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, value => { slots[i].value = value; }]; },
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useCallback(fn) { return fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ push() {} }), useFocusEffect(fn) { if (!mounted) effect = fn; } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { ActivityIndicator: 'ActivityIndicator', Pressable: 'Pressable', ScrollView: 'ScrollView', TextInput: 'TextInput', View: 'View', StyleSheet: { create: x => x } },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/ui/button': { Button: 'Button' },
    '@/features/focus/session-storage': { async loadSessionHistory() { if (historyReadFailures-- > 0) throw Error('private history detail'); return []; } },
    '@/features/goals/goal-progress': { formatGoalValue: () => '0', getGoalProgress: () => ({ progress: 0, currentValue: 0 }) },
    '@/features/goals/goal-period': { getDeviceTimeZone: () => 'UTC', getGoalPeriodRange: () => ({ periodStart: '2026-10-05T00:00:00.000Z', periodEnd: '2026-10-12T00:00:00.000Z', periodTimeZone: 'UTC' }) },
    '@/features/goals/goal-read-state': { async readGoalData(readGoals, readSessions) { try { const [resultGoals, sessions] = await Promise.all([readGoals(), readSessions()]); return { status: 'ready', goals: resultGoals, sessions }; } catch { return { status: 'error' }; } } },
    '@/features/goals/goal-storage': { async loadGoals() { if (goalReadFailures-- > 0) throw Error('private goal detail'); return goals; }, async saveGoals() {} },
    '@/hooks/use-theme': { useTheme: () => ({ background: '#fff', surface: '#fff', border: '#ddd', text: '#111', textMuted: '#666' }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/theme/tokens': { Palette: { homeLightBackground: '#fff', homeLightSurface: '#fff', homeLightBorder: '#ddd', homeLightAction: '#123', homeLightActionSoft: '#eee', deepNavy: '#123', mintPrimary: '#123' }, Radius: { card: 16 }, Spacing: { xs: 4, sm: 8, md: 16, lg: 24 } },
  };
  const exports = {};
  runInNewContext(outputText, { exports, require: name => {
    if (!(name in dependencies)) throw Error(`Unexpected dependency ${name}`);
    return dependencies[name];
  } });
  function nodes(value) {
    if (Array.isArray(value)) return value.flatMap(nodes);
    if (!value || typeof value !== 'object') return [];
    if (typeof value.type === 'function') return nodes(value.type(value.props));
    return [value, ...nodes(value.props?.children)];
  }
  return {
    render() { cursor = 0; tree = exports.default(); if (!mounted) { mounted = true; effect(); } return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    find(label) { return nodes(tree).find(node => node.props.label === label || node.props.accessibilityLabel === label); },
    alerts() { return nodes(tree).filter(node => node.props.accessibilityRole === 'alert'); },
  };
}

test('Goals read failure is distinct from empty and retry restores the real list', async () => {
  const app = fixture({ goals: [{ id: 'g1', title: 'Read chapter', type: 'session_count', period: 'weekly', status: 'active', targetValue: 5, createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' }], goalReadFailures: 1 });
  app.render(); await app.settle();
  assert.equal(app.find('Create a goal'), undefined);
  assert.equal(app.alerts().length, 1);
  app.find('Retry loading goals').props.onPress(); await app.settle();
  assert.ok(app.find('Read chapter. 0 percent complete'));
  assert.equal(app.alerts().length, 0);
});

test('Goals do not present unreadable session history as zero progress', async () => {
  const app = fixture({ goals: [{ id: 'g1', title: 'Read chapter', type: 'session_count', period: 'weekly', status: 'active', targetValue: 5, createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' }], historyReadFailures: 1 });
  app.render(); await app.settle();
  assert.equal(app.find('Create a goal'), undefined);
  assert.equal(app.alerts().length, 1);
});

test('Goals still show the intentional empty state after successful empty reads', async () => {
  const app = fixture(); app.render(); await app.settle();
  assert.ok(app.find('Create a goal'));
  assert.equal(app.alerts().length, 0);
});
