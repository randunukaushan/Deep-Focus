import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const { outputText } = ts.transpileModule(readFileSync(new URL('../../src/app/goals/[goalId].tsx', import.meta.url), 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

const storedGoal = { id: 'goal-1', title: 'Read more', type: 'session_count', period: 'weekly', status: 'active', targetValue: 5, createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' };

function fixture({ goals = [storedGoal], goalReadFailures = 0, historyReadFailures = 0, saveFailures = 0, updateConflict = false, deleteFailures = 0, deleteConflict = false } = {}) {
  const slots = [];
  let cursor = 0, effect, mounted = false, tree;
  let writes = 0;
  let deletions = 0;
  const replacements = [];
  const dependencies = {
    react: {
      useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, value => { slots[i].value = value; }]; },
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useCallback(fn) { return fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ push() {}, replace(path) { replacements.push(path); } }), useLocalSearchParams: () => ({ goalId: 'goal-1' }), useFocusEffect(fn) { if (!mounted) effect = fn; } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { ActivityIndicator: 'ActivityIndicator', TextInput: 'TextInput', View: 'View', StyleSheet: { create: x => x } },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/ui/button': { Button: 'Button' },
    '@/features/focus/session-storage': { async loadSessionHistory() { if (historyReadFailures-- > 0) throw Error('private history detail'); return []; } },
    '@/features/goals/goal-progress': { formatGoalValue: (_goal, value) => String(value), getGoalProgress: () => ({ progress: 0.4, currentValue: 2 }) },
    '@/features/goals/goal-read-state': { async readGoalData(readGoals, readSessions) { try { const [resultGoals, sessions] = await Promise.all([readGoals(), readSessions()]); return { status: 'ready', goals: resultGoals, sessions }; } catch { return { status: 'error' }; } } },
    '@/features/goals/goal-storage': {
      async loadGoals() { if (goalReadFailures-- > 0) throw Error('private goal detail'); return goals; },
      async updateGoalDefinition(id, expectedUpdatedAt, title, targetValue) {
        writes += 1;
        if (saveFailures-- > 0) throw Error('private goal write');
        if (updateConflict) return null;
        const index = goals.findIndex(goal => goal.id === id && goal.updatedAt === expectedUpdatedAt);
        if (index < 0) return null;
        goals[index] = { ...goals[index], title, targetValue, updatedAt: '2026-10-07T01:00:00.000Z' };
        return goals[index];
      },
      async deleteGoal(id, expectedUpdatedAt) {
        deletions += 1;
        if (deleteFailures-- > 0) throw Error('private delete failure');
        if (deleteConflict || !goals.some(goal => goal.id === id && goal.updatedAt === expectedUpdatedAt)) return false;
        goals = goals.filter(goal => goal.id !== id);
        return true;
      },
    },
    '@/features/localization/goal-detail-copy': { getGoalDetailCopy: () => ({ back: 'Back to Goals', loading: 'Loading goal', loadErrorTitle: 'This goal could not be loaded.', loadErrorDetail: 'Your saved goals have not been changed. Try again to reload this goal.', retryLoad: 'Retry loading goal', goalSuffix: 'GOAL', titleLabel: 'Goal title', sessionTarget: 'Session target', focusTarget: 'Focus target in minutes', targetSessions: 'Target sessions', targetMinutes: 'Target focus minutes', save: 'Save goal changes', cancel: 'Cancel editing', reload: 'Reload goal', completed: 'Goal complete', completedDetail: 'You reached this goal. Your recorded focus and session history remain part of your progress.', statusDetail: 'This goal is', progress: 'PROGRESS', target: 'TARGET', completion: 'COMPLETION', progressDetail: 'Progress updates from completed focus sessions saved on this device.', edit: 'Edit goal', deleteConfirmTitle: 'Delete this goal?', deleteDetail: 'Linked tasks will remain and become unlinked. Focus sessions and history will remain unchanged.', deleteAndKeepTasks: 'Delete goal and keep tasks', keepGoal: 'Keep goal', delete: 'Delete goal', startFocus: 'Start a focus session', unavailable: 'Goal unavailable', unavailableDetail: 'This goal could not be found on this device.', invalidSessions: 'Enter a whole number of sessions.', invalidMinutes: 'Enter a valid focus-time target in minutes.', conflictSave: 'This goal changed elsewhere. Reload it before editing so newer progress settings are not overwritten.', saveError: 'This goal could not be saved. Your saved goal is unchanged; try again.', conflictDelete: 'This goal changed elsewhere. Reload it before deleting so newer data is not removed.', deleteError: 'This goal could not be deleted. The goal, linked tasks and focus history are unchanged; try again.' }) },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en' }) },
    '@/hooks/use-theme': { useTheme: () => ({ background: '#fff', surface: '#fff', border: '#ddd' }) },
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
    get goal() { return goals.find(item => item.id === 'goal-1'); },
    get writes() { return writes; },
    get deletions() { return deletions; },
    get replacements() { return replacements; },
  };
}

test('Goal detail distinguishes a failed read from a missing goal and retries', async () => {
  const app = fixture({ goalReadFailures: 1 }); app.render(); await app.settle();
  assert.ok(app.find('Retry loading goal'));
  assert.equal(app.find('Start a focus session'), undefined);
  app.find('Retry loading goal').props.onPress(); await app.settle();
  assert.ok(app.find('Start a focus session'));
});

test('Goal detail exposes retry when supporting session history cannot be read', async () => {
  const app = fixture({ historyReadFailures: 1 }); app.render(); await app.settle();
  assert.ok(app.find('Retry loading goal'));
  assert.equal(app.find('Start a focus session'), undefined);
});

test('Goal detail reports genuinely absent goals without offering false progress', async () => {
  const app = fixture({ goals: [] }); app.render(); await app.settle();
  assert.equal(app.find('Retry loading goal'), undefined);
  assert.equal(app.find('Start a focus session'), undefined);
  assert.equal(app.alerts().length, 1);
});

test('Goal detail presents completed status without offering active-goal editing', async () => {
  const completedGoal = { ...storedGoal, status: 'completed', completedAt: '2026-10-07T00:00:00.000Z' };
  const app = fixture({ goals: [completedGoal] }); app.render(); await app.settle();
  assert.ok(app.find('Goal complete'));
  assert.equal(app.find('Edit goal'), undefined);
  assert.ok(app.find('Delete goal'));
});

test('Goal detail edits title and count target without changing goal period or identity', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.find('Edit goal').props.onPress(); app.render();
  app.find('Goal title').props.onChangeText('Read consistently');
  app.find('Target sessions').props.onChangeText('7');
  app.render(); app.find('Save goal changes').props.onPress(); await app.settle();
  assert.equal(app.writes, 1);
  assert.equal(app.goal.title, 'Read consistently');
  assert.equal(app.goal.targetValue, 7);
  assert.equal(app.goal.id, storedGoal.id);
  assert.equal(app.goal.type, storedGoal.type);
  assert.equal(app.goal.period, storedGoal.period);
  assert.equal(app.goal.status, storedGoal.status);
  assert.ok(app.find('Edit goal'));
});

test('Goal detail retains edit draft after a failed write and allows retry', async () => {
  const app = fixture({ saveFailures: 1 }); app.render(); await app.settle();
  app.find('Edit goal').props.onPress(); app.render();
  app.find('Goal title').props.onChangeText('A careful draft');
  app.find('Target sessions').props.onChangeText('8');
  app.render(); app.find('Save goal changes').props.onPress(); await app.settle();
  assert.equal(app.goal.title, storedGoal.title);
  assert.equal(app.find('Goal title').props.value, 'A careful draft');
  assert.equal(app.find('Target sessions').props.value, '8');
  assert.equal(app.alerts().length, 1);
  app.find('Save goal changes').props.onPress(); await app.settle();
  assert.equal(app.goal.title, 'A careful draft');
  assert.equal(app.writes, 2);
});

test('Goal detail refuses a stale edit and offers a reload', async () => {
  const app = fixture({ updateConflict: true }); app.render(); await app.settle();
  app.find('Edit goal').props.onPress(); app.render();
  app.find('Goal title').props.onChangeText('Stale title');
  app.render(); app.find('Save goal changes').props.onPress(); await app.settle();
  assert.equal(app.goal.title, storedGoal.title);
  assert.ok(app.find('Reload goal'));
  assert.equal(app.alerts().length, 1);
});

test('Goal detail converts edited focus-time minutes to stored seconds', async () => {
  const goal = { ...storedGoal, type: 'focus_time', targetValue: 3600 };
  const app = fixture({ goals: [goal] }); app.render(); await app.settle();
  app.find('Edit goal').props.onPress(); app.render();
  assert.equal(app.find('Target focus minutes').props.value, '60');
  app.find('Target focus minutes').props.onChangeText('90');
  app.render(); app.find('Save goal changes').props.onPress(); await app.settle();
  assert.equal(app.goal.targetValue, 5400);
});

test('Goal detail requires confirmation before deleting and preserves on cancel', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.find('Delete goal').props.onPress(); app.render();
  assert.ok(app.find('Delete goal and keep tasks'));
  app.find('Keep goal').props.onPress(); app.render();
  assert.equal(app.deletions, 0);
  assert.equal(app.goal.title, storedGoal.title);
});

test('Goal detail deletes only after confirmation and returns to Goals', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.find('Delete goal').props.onPress(); app.render();
  app.find('Delete goal and keep tasks').props.onPress(); await app.settle();
  assert.equal(app.goal, undefined);
  assert.deepEqual(app.replacements, ['/goals']);
  assert.equal(app.deletions, 1);
});

test('Goal detail retains the goal on deletion failure and offers retry', async () => {
  const app = fixture({ deleteFailures: 1 }); app.render(); await app.settle();
  app.find('Delete goal').props.onPress(); app.render();
  app.find('Delete goal and keep tasks').props.onPress(); await app.settle();
  assert.equal(app.goal.title, storedGoal.title);
  assert.equal(app.replacements.length, 0);
  assert.ok(app.alerts().some(node => String(node.props.children).includes('could not be deleted')));
  app.find('Delete goal and keep tasks').props.onPress(); await app.settle();
  assert.equal(app.goal, undefined);
});

test('Goal detail refuses stale deletion and provides a reload action', async () => {
  const app = fixture({ deleteConflict: true }); app.render(); await app.settle();
  app.find('Delete goal').props.onPress(); app.render();
  app.find('Delete goal and keep tasks').props.onPress(); await app.settle();
  assert.equal(app.goal.title, storedGoal.title);
  assert.ok(app.find('Reload goal'));
  assert.equal(app.replacements.length, 0);
});
