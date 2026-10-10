import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const { outputText } = ts.transpileModule(readFileSync(new URL('../../src/app/plan-my-day.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function fixture({ tasks = [], loadFailures = 0, loadTasks, router = {}, savePlanFailures = 0 } = {}) {
  const slots = [];
  let cursor = 0, effect, cleanup, mounted = false, tree;
  const dependencies = {
    react: {
      useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, value => { slots[i].value = typeof value === 'function' ? value(slots[i].value) : value; }]; },
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useMemo(fn) { return fn(); },
      useCallback(fn) { return fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ push() {}, replace() {}, ...router }), useFocusEffect(fn) { if (!mounted) effect = fn; } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: x => x }, TextInput: 'TextInput', View: 'View' },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/ui/button': { Button: 'Button' },
    '@/features/tasks/task-storage': { loadTasks: async () => {
      if (loadTasks) return loadTasks();
      if (loadFailures > 0) { loadFailures -= 1; throw Error('local read failed'); }
      return tasks;
    } },
    '@/features/tasks/task-types': {},
    '@/features/planning/plan-storage': {
      loadActivePlan: async () => null,
      saveConfirmedPlan: async () => { if (savePlanFailures > 0) { savePlanFailures -= 1; throw Error('plan save failed'); } },
      cancelActivePlan: async () => false,
    },
    '@/features/planning/plan-types': {},
    '@/features/planning/planning-config': { getConfiguredPlanningModel: () => 'local-heuristic-v1' },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ copy: { planner: { back: 'Home', eyebrow: 'PLAN MY DAY', title: 'Start with what matters.', subtitle: 'Choose the tasks and time you have. We will suggest a simple starting point for your day.', timeAvailable: 'TIME AVAILABLE', availableMinutes: 'Available minutes', minutes: 'minutes', minError: 'Enter at least 25 minutes to plan.', numberError: 'Enter a smaller whole number of minutes.', breakHint: 'Each suggestion leaves space for a short break.', chooseTasks: 'CHOOSE TASKS', loading: 'Loading your tasks…', loadError: 'We could not load your tasks. Your saved tasks have not been changed.', retry: 'Retry loading tasks', empty: 'Add a task first, then come back to build a plan.', addTask: 'Add a task', selected: 'selected', notSelected: 'not selected', suggest: 'Suggest a plan', suggestion: 'YOUR SUGGESTION', included: 'Included in your suggestion', startingPoint: 'A clear starting point.', blockDuration: '25 min focus · 5 min break', moveEarlier: 'Move', moveEarlierSuffix: 'earlier', moveLater: 'Move', moveLaterSuffix: 'later', start: 'Start', proposalNote: 'This is a proposal only. Your tasks and schedule have not been changed.', confirmed: 'You confirmed this exact selection. Starting a task still uses the normal focus flow.', confirm: 'Confirm this proposal', adjust: 'Adjust selection' } } }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/hooks/use-theme': { useTheme: () => ({}) },
    '@/theme/tokens': { Palette: { deepNavy: '#0e1c36', homeLightBackground: '#f5f7fb', homeLightSurface: '#fff', homeLightBorder: '#dce3ef', homeLightAction: '#426fba', homeLightActionSoft: '#eaf0fb', mintPrimary: '#8ed8c5' }, Radius: { card: 16 }, Spacing: { lg: 20, md: 12, sm: 8, xs: 4 } },
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
  const app = {
    render() { cursor = 0; tree = exports.default(); if (!mounted) { mounted = true; cleanup = effect(); } return app; },
    async settle() { await new Promise(setImmediate); return app.render(); },
    find(label) { return nodes(tree).find(node => node.props.label === label || node.props.accessibilityLabel === label); },
    status() { return nodes(tree).filter(node => node.props.accessibilityLiveRegion === 'polite' || node.props.accessibilityRole === 'alert'); },
    blur() { cleanup?.(); cleanup = undefined; },
  };
  return app;
}

const task = { id: 'task-1', title: 'Study chapter', status: 'pending' };

test('Plan My Day distinguishes loading and read failure from an empty task list, then retries', async () => {
  const app = fixture({ tasks: [task], loadFailures: 1 }); app.render();
  assert.equal(app.find('Suggest a plan').props.disabled, true);
  assert.equal(app.status()[0].props.accessibilityLiveRegion, 'polite');
  await app.settle();
  assert.equal(app.find('Add a task'), undefined);
  assert.equal(app.status()[0].props.accessibilityRole, 'alert');
  assert.equal(app.find('Suggest a plan').props.disabled, true);
  app.find('Retry loading tasks').props.onPress(); await app.settle();
  assert.ok(app.find('Study chapter, selected'));
  assert.equal(app.status().length, 0);
  assert.equal(app.find('Suggest a plan').props.disabled, false);
});

test('Plan My Day shows its empty state only after a successful empty read', async () => {
  const app = fixture(); app.render();
  assert.equal(app.find('Add a task'), undefined);
  await app.settle();
  assert.ok(app.find('Add a task'));
  assert.equal(app.find('Retry loading tasks'), undefined);
});

test('Plan My Day ignores a task read that resolves after the route loses focus', async () => {
  let resolve;
  const app = fixture({ loadTasks: () => new Promise(done => { resolve = done; }) });
  app.render(); app.blur(); resolve([task]); await app.settle();
  assert.equal(app.find('Study chapter, selected'), undefined);
  assert.equal(app.status()[0].props.accessibilityLiveRegion, 'polite');
});

test('Plan My Day lets the user reorder the preview without changing stored tasks', async () => {
  const tasks = [task, { id: 'task-2', title: 'Read notes', status: 'pending' }];
  const app = fixture({ tasks }); app.render(); await app.settle();
  app.find('Suggest a plan').props.onPress(); app.render();
  assert.equal(app.find('Move Study chapter earlier').props.accessibilityState.disabled, true);
  assert.equal(app.find('Move Study chapter later').props.accessibilityState.disabled, false);
  app.find('Move Read notes earlier').props.onPress(); app.render();
  assert.equal(app.find('Move Read notes earlier').props.accessibilityState.disabled, true);
  assert.equal(app.find('Move Study chapter earlier').props.accessibilityState.disabled, false);
  assert.equal(app.find('Start').props.disabled, true, 'a proposed task cannot start before exact confirmation');
  app.find('Confirm this proposal').props.onPress(); await app.settle();
  assert.equal(app.find('Start').props.disabled, false, 'exact confirmation enables the normal focus action');
  assert.deepEqual(tasks.map(item => item.id), ['task-1', 'task-2']);
});

test('reordering a visible plan block does not promote a task hidden by the time limit', async () => {
  const tasks = [task, { id: 'task-2', title: 'Read notes', status: 'pending' }, { id: 'task-3', title: 'Practice questions', status: 'pending' }];
  const app = fixture({ tasks }); app.render(); await app.settle();
  app.find('Available minutes').props.onChangeText('60'); app.render();
  app.find('Suggest a plan').props.onPress(); app.render();
  app.find('Move Study chapter later').props.onPress(); app.render();
  assert.equal(app.find('Move Study chapter later').props.accessibilityState.disabled, true);
  assert.equal(app.find('Move Read notes earlier').props.accessibilityState.disabled, true);
  assert.equal(app.find('Move Practice questions earlier'), undefined);
  assert.equal(app.find('Start').props.disabled, true);
  assert.deepEqual(tasks.map(item => item.id), ['task-1', 'task-2', 'task-3']);
});

test('available minutes explains the minimum and rejects integers outside the safe range', async () => {
  const app = fixture({ tasks: [task] }); app.render(); await app.settle();
  const input = app.find('Available minutes');
  input.props.onChangeText('0'); app.render();
  assert.equal(app.find('Suggest a plan').props.disabled, true);
  assert.equal(app.status()[0].props.children, 'Enter at least 25 minutes to plan.');
  app.find('Available minutes').props.onChangeText('9007199254740992'); app.render();
  assert.equal(app.find('Suggest a plan').props.disabled, true);
  assert.equal(app.status()[0].props.children, 'Enter a smaller whole number of minutes.');
  app.find('Available minutes').props.onChangeText('25'); app.render();
  assert.equal(app.status().length, 0);
  assert.equal(app.find('Suggest a plan').props.disabled, false);
});

test('confirmed plan save failure stays visible and an explicit retry can succeed', async () => {
  const app = fixture({ tasks: [task], savePlanFailures: 1 }); app.render(); await app.settle();
  app.find('Suggest a plan').props.onPress(); app.render();
  app.find('Confirm this proposal').props.onPress(); await app.settle();
  assert.ok(app.status().some(node => node.props.accessibilityRole === 'alert'));
  assert.equal(app.find('Start').props.disabled, true);
  app.find('Confirm this proposal').props.onPress(); await app.settle();
  assert.equal(app.find('Start').props.disabled, false);
});
