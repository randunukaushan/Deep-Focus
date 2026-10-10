import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const route = readFileSync(new URL('../../src/app/(tabs)/progress/index.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(route, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });

function fixture({ sessionFailure = false, sessions = [{ id: 's1', status: 'completed', focusedDurationSeconds: 120, plannedDurationSeconds: 180 }], tasks = [{ id: 't1' }], goals = [{ id: 'g1' }], onSummary, summaryError = false } = {}) {
  const slots = [];
  let cursor = 0, effect, mounted = false, tree;
  const summary = { focusedSeconds: 120, completedSessions: 1, completedTasks: 1, activityDays: [], goals: [{ id: 'g1', title: 'Read', type: 'focus_time', currentValue: 120, targetValue: 300, progress: 0.4 }] };
  const dependencies = {
    react: {
      useState(initial) { const index = cursor++; slots[index] ??= { value: initial }; return [slots[index].value, value => { slots[index].value = value; }]; },
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useCallback(fn) { return fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ push() {} }), useFocusEffect(fn) { if (!mounted) effect = fn; } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { ActivityIndicator: 'ActivityIndicator', Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: value => value }, View: 'View' },
    '@/components/themed-text': { ThemedText: 'Text' }, '@/components/themed-view': { ThemedView: 'View' },
    '@/features/focus/session-history': { formatSessionDuration: seconds => `${seconds} sec`, getHistoricalSessions: value => value },
    '@/features/focus/session-storage': { async loadSessionHistory() { if (sessionFailure) throw Error('private session data'); return sessions; } },
    '@/features/focus/progress-analytics': { summarizeProgress: (...args) => { onSummary?.(args[3]); return summary; } },
    '@/features/progress/progress-analytics': { summarizeProgress: (...args) => { onSummary?.(args[3]); if (summaryError) throw Error('conflicting source data'); return summary; } },
    '@/features/localization/progress-copy': { getProgressCopy: () => ({ eyebrow: 'PROGRESS', title: 'Notice your rhythm.', subtitle: 'A clear view of the focus time you have protected.', loading: 'Loading progress', loadErrorLabel: 'Progress could not be loaded', loadErrorTitle: 'Your progress is still here.', loadErrorDetail: 'We could not read your saved sessions just now. Your data has not been changed.', retry: 'Try again', unavailableLabel: 'Progress summary unavailable', unavailableTitle: 'Your saved progress needs a refresh.', unavailableDetail: 'We found records that could not be safely combined. Your saved data has not been changed.', emptyLabel: 'No progress available yet', emptyTitle: 'Your pattern will appear here.', emptyDetail: 'Complete a focus session to start building a quiet, useful record of your work.', viewHistory: 'View session history', calendar: 'Calendar periods use {zone} time. Weeks begin Monday.', week: 'This week', month: 'This month', allTime: 'All time', focusTime: 'FOCUS TIME', sessions: 'SESSIONS', tasksDone: 'TASKS DONE', insightEyebrow: 'YOUR PROGRESS', oneBlock: 'One block protected.', blocks: 'blocks protected.', insightDetail: 'Focus time includes time actually focused, even in sessions ended early. Session count includes completed sessions only.', weekFocus: 'This week’s focus', goals: 'Your goals', sessionsWord: 'sessions', viewRewards: 'View rewards' }) },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en' }) },
    '@/features/goals/goal-storage': { async loadGoals() { return goals; } },
    '@/features/tasks/task-storage': { async loadTasks() { return tasks; } },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/hooks/use-theme': { useTheme: () => ({ background: '#fff', surface: '#fff', border: '#ddd' }) },
    '@/theme/tokens': { Palette: { homeLightBackground: '#fff', homeLightSurface: '#fff', homeLightBorder: '#ddd', homeLightAction: '#123', homeLightActionSoft: '#eee', deepNavy: '#123', mintPrimary: '#123' }, Radius: { card: 16 }, Spacing: { xs: 4, sm: 8, md: 16, lg: 24 } },
  };
  const exports = {};
  runInNewContext(outputText, { exports, Intl, Date, require(name) { if (!(name in dependencies)) throw Error(`Unexpected dependency ${name}`); return dependencies[name]; } });
  function nodes(value) { if (Array.isArray(value)) return value.flatMap(nodes); if (!value || typeof value !== 'object') return []; if (typeof value.type === 'function') return nodes(value.type(value.props)); return [value, ...nodes(value.props?.children)]; }
  return {
    render() { cursor = 0; tree = exports.default(); if (!mounted) { mounted = true; effect(); } return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    find(label) { return nodes(tree).find(node => node.props.accessibilityLabel === label || node.props.children === label); },
    nodes,
    periods() { return nodes(tree).filter(node => node.props.accessibilityRole === 'tab'); },
  };
}

test('Progress period controls select a window and show task, session, focus and goal summaries', async () => {
  const windows = [];
  const app = fixture({ onSummary: options => windows.push(options.window) }); app.render(); await app.settle();
  assert.deepEqual(windows, ['week']);
  assert.equal(app.find('FOCUS TIME: 120 sec') !== undefined, true);
  assert.equal(app.find('SESSIONS: 1') !== undefined, true);
  assert.equal(app.find('TASKS DONE: 1') !== undefined, true);
  assert.equal(app.find('Read, Your goals, 40%') !== undefined, true);
  const month = app.periods()[1];
  month.props.onPress(); app.render();
  assert.deepEqual(windows, ['week', 'month']);
});

test('Progress storage failure is visible and does not become the empty state', async () => {
  const app = fixture({ sessionFailure: true }); app.render(); await app.settle();
  assert.ok(app.find('Progress could not be loaded'));
  assert.equal(app.find('No progress available yet'), undefined);
});

test('Progress shows an empty state only after successful empty source reads', async () => {
  const app = fixture({ sessions: [], tasks: [], goals: [] }); app.render(); await app.settle();
  assert.ok(app.find('No progress available yet'));
});

test('Progress does not display derived zeros when the source records conflict', async () => {
  const app = fixture({ summaryError: true }); app.render(); await app.settle();
  assert.ok(app.find('Progress summary unavailable'));
  assert.equal(app.find('SESSIONS: 1'), undefined);
});
