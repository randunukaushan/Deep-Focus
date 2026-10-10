import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const { outputText } = ts.transpileModule(readFileSync(new URL('../../src/app/goals/index.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function fixture({ goals = [], goalReadFailures = 0, historyReadFailures = 0, saveFailures = 0, save } = {}) {
  const slots = [];
  let cursor = 0, effect, mounted = false, tree, writes = 0;
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
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ copy: { goals: { eyebrow: 'GOALS', title: 'Keep your direction clear.', subtitle: 'Set one measurable intention. Focus time and completed sessions count toward the goal you chose.', create: 'Create a goal', newWeekly: 'NEW WEEKLY GOAL', titleLabel: 'Goal title', titlePlaceholder: 'What do you want to achieve?', sessions: 'Sessions', focusMinutes: 'Focus minutes', target: 'Target', save: 'Save goal', cancel: 'Cancel', yourGoals: 'YOUR GOALS', emptyLabel: 'No goals yet', empty: 'Create a simple goal when you are ready.', loading: 'Loading goals', loadErrorTitle: 'Your goals could not be loaded.', loadErrorBody: 'Your saved goals have not been changed. Try again to reload goals and progress.', retry: 'Retry loading goals', sessionError: 'Enter a whole number of sessions.', focusError: 'Enter a valid focus-time target in minutes.', saveError: 'This goal could not be saved. Your existing goals were kept; try again.', back: 'Back to Goals' } } }) },
    '@/features/identity/stable-ids': { createStableId: () => '20000000-0000-4000-8000-000000000001' },
    '@/features/focus/session-storage': { async loadSessionHistory() { if (historyReadFailures-- > 0) throw Error('private history detail'); return []; } },
    '@/features/goals/goal-progress': { formatGoalValue: () => '0', getGoalProgress: () => ({ progress: 0, currentValue: 0 }) },
    '@/features/goals/goal-period': { getDeviceTimeZone: () => 'UTC', getGoalPeriodRange: () => ({ periodStart: '2026-10-05T00:00:00.000Z', periodEnd: '2026-10-12T00:00:00.000Z', periodTimeZone: 'UTC' }) },
    '@/features/goals/goal-read-state': { async readGoalData(readGoals, readSessions) { try { const [resultGoals, sessions] = await Promise.all([readGoals(), readSessions()]); return { status: 'ready', goals: resultGoals, sessions }; } catch { return { status: 'error' }; } } },
    '@/features/goals/goal-storage': {
      async loadGoals() { if (goalReadFailures-- > 0) throw Error('private goal detail'); return goals; },
      async saveGoals(next) { writes++; if (saveFailures-- > 0) throw Error('private write detail'); if (save) await save(); goals = next; },
    },
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
    writes: () => writes,
  };
}

test('Goals read failure is distinct from empty and retry restores the real list', async () => {
  const app = fixture({ goals: [{ id: 'g1', title: 'Read chapter', type: 'session_count', period: 'weekly', status: 'active', targetValue: 5, createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' }], goalReadFailures: 1 });
  app.render(); await app.settle();
  assert.equal(app.find('Create a goal'), undefined);
  assert.equal(app.alerts().length, 1);
  app.find('Retry loading goals').props.onPress(); await app.settle();
  assert.ok(app.find('Read chapter. WEEKLY. 0 percent complete'));
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

test('Goals prevents duplicate submissions while a save is pending', async () => {
  let resolve;
  const app = fixture({ save: () => new Promise(done => { resolve = done; }) });
  app.render(); await app.settle(); app.find('Create a goal').props.onPress(); app.render();
  app.find('Goal title').props.onChangeText('Read chapter'); app.render();
  const submit = app.find('Save goal').props.onPress;
  submit(); submit(); app.render();
  assert.equal(app.writes(), 1);
  assert.equal(app.find('Save goal').props.loading, true);
  assert.equal(app.find('Goal title').props.editable, false);
  assert.equal(app.find('Cancel').props.disabled, true);
  resolve(); await app.settle();
  assert.ok(app.find('Read chapter. WEEKLY. 0 percent complete'));
  assert.ok(app.find('Create a goal'));
});

test('Goals save failure preserves the draft and permits an explicit retry', async () => {
  const app = fixture({ saveFailures: 1 });
  app.render(); await app.settle(); app.find('Create a goal').props.onPress(); app.render();
  app.find('Goal title').props.onChangeText('Keep this goal'); app.render();
  app.find('Save goal').props.onPress(); await app.settle();
  assert.equal(app.find('Goal title').props.value, 'Keep this goal');
  assert.equal(app.find('Keep this goal. WEEKLY. 0 percent complete'), undefined);
  assert.equal(app.alerts().length, 1);
  app.find('Save goal').props.onPress(); await app.settle();
  assert.ok(app.find('Keep this goal. WEEKLY. 0 percent complete'));
  assert.equal(app.writes(), 2);
});

test('Goals list labels completed records as completed instead of active', async () => {
  const app = fixture({ goals: [{ id: 'finished', title: 'A finished goal', type: 'session_count', period: 'weekly', status: 'completed', targetValue: 5, completedAt: '2026-10-06T00:00:00.000Z', createdAt: '2026-10-05T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' }] });
  app.render(); await app.settle();
  assert.ok(app.find('A finished goal. COMPLETED. 0 percent complete'));
  assert.equal(app.find('A finished goal. WEEKLY. 0 percent complete'), undefined);
});
