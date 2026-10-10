import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const { outputText } = ts.transpileModule(readFileSync(new URL('../../src/app/tasks/[taskId].tsx', import.meta.url), 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

const storedTask = { id: 'task-1', title: 'Real task', status: 'pending', createdAt: '2026-10-06T00:00:00.000Z', updatedAt: '2026-10-06T00:00:00.000Z' };

function fixture({ tasks = [storedTask], goals = [], goalLoadFailures = 0, loadFailures = 0, saveFailures = 0, editFailures = 0, editConflict = false, deleteFailures = 0, deleteConflict = false, archiveFailures = 0, archiveConflict = false, save } = {}) {
  const slots = [];
  let cursor = 0, effect, mounted = false, tree, writes = 0;
  const pushes = [], replacements = [];
  const dependencies = {
    react: {
      useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, value => { slots[i].value = value; }]; },
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useCallback(fn) { return fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': {
      useRouter: () => ({ push(...args) { pushes.push(args); }, replace(...args) { replacements.push(args); } }),
      useLocalSearchParams: () => ({ taskId: 'task-1', taskTitle: 'Untrusted route title' }),
      useFocusEffect(fn) { if (!mounted) effect = fn; },
    },
    '@expo/vector-icons': { Ionicons: 'Icon' },
      'react-native': { ActivityIndicator: 'ActivityIndicator', TextInput: 'TextInput', View: 'View', StyleSheet: { create: x => x } },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/ui/button': { Button: 'Button' },
    '@/features/tasks/task-storage': {
      async loadTasks() { if (loadFailures-- > 0) throw Error('private task storage detail'); return tasks; },
      async saveTasks(next) { writes++; if (saveFailures-- > 0) throw Error('private task write detail'); if (save) await save(); tasks = next; },
      async updateTaskDetails(id, expectedUpdatedAt, title, description, priority, goalId, dueAt) {
        writes++;
        if (editFailures-- > 0) throw Error('private title update detail');
        if (editConflict || !tasks.some(task => task.id === id && task.updatedAt === expectedUpdatedAt && ['pending', 'in_progress'].includes(task.status))) return false;
        tasks = tasks.map(task => {
          if (task.id !== id) return task;
          const updated = { ...task, title, description: description.trim() || undefined, priority, ...(goalId === undefined ? {} : { goalId: goalId || undefined }), updatedAt: '2026-10-07T01:00:00.000Z' };
          if (dueAt === null) delete updated.dueAt;
          else if (typeof dueAt === 'string') updated.dueAt = dueAt;
          return updated;
        });
        return '2026-10-07T01:00:00.000Z';
      },
      async deleteTask(id, expectedUpdatedAt) {
        writes++;
        if (deleteFailures-- > 0) throw Error('private delete failure');
        if (deleteConflict || !tasks.some(task => task.id === id && task.updatedAt === expectedUpdatedAt)) return false;
        tasks = tasks.filter(task => task.id !== id);
        return true;
      },
      async updateTaskArchive(id, expectedUpdatedAt, archivedAt) {
        writes++;
        if (archiveFailures-- > 0) throw Error('private archive failure');
        if (archiveConflict || !tasks.some(task => task.id === id && task.updatedAt === expectedUpdatedAt)) return null;
        tasks = tasks.map(task => {
          if (task.id !== id) return task;
          const updated = { ...task, updatedAt: '2026-10-07T01:00:00.000Z' };
          if (archivedAt) updated.archivedAt = archivedAt;
          else delete updated.archivedAt;
          return updated;
        });
        return '2026-10-07T01:00:00.000Z';
      },
    },
    '@/features/goals/goal-storage': {
      async loadGoals() { if (goalLoadFailures-- > 0) throw Error('private goal read detail'); return goals; },
    },
    '@/features/resources/resource-storage': {
      async loadResources() { return []; },
      async loadTaskResourceLinks() { return []; },
      async linkResourceToTask() { return false; },
      async unlinkResourceFromTask() { return false; },
    },
    '@/features/localization/app-locale': { getAppLocaleCopy: () => ({ taskDetail: { noPriority: 'No priority', low: 'Low', medium: 'Medium', high: 'High', back: 'Back to Tasks', loadErrorTitle: 'This task could not be loaded.', loadErrorDetail: 'Your saved tasks have not been changed. Try again to reload this task.', retryLoad: 'Retry loading task', unavailableTitle: 'Task unavailable', unavailableDetail: 'This task could not be found on this device.', eyebrow: 'TASK DETAIL', editTitle: 'Edit task title', descriptionPlaceholder: 'Add a note (optional)', dueDateLabel: 'Due date (UTC calendar date, optional)', blankDateHint: 'A blank date means no deadline. The date stays consistent across devices.', priorityLabel: 'Priority (optional)', goalLabel: 'Goal (optional)', loadingGoals: 'Loading your goals…', goalsLoadError: 'Your goals could not be loaded. The current goal link stays unchanged; retry to choose a different goal.', retryGoals: 'Retry loading goals', noGoal: 'No goal', createGoalFirst: 'Create a goal first to link this task.', dueDatePrefix: 'Due', priorityPrefix: 'Priority', archivedStatus: 'Archived.', completedStatus: 'Completed.', cancelledStatus: 'This task was cancelled.', readyStatus: 'Ready to become your next focus block.', pendingSave: 'This task could not be saved. It is still pending; try again.', reload: 'Reload task', deleteTitle: 'Delete this task?', deleteDetail: 'The task will be removed.', deleteConfirm: 'Delete task and keep history', keepTask: 'Keep task', saveDetails: 'Save task details', cancelEditing: 'Cancel editing', editDetails: 'Edit task details', complete: 'Complete task', focus: 'Focus on this task', restore: 'Restore task', archive: 'Archive task', delete: 'Delete task' } }) },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ copy: { resourcesPage: { loadError: 'Resources could not be loaded.', taskSection: 'Resources', taskSectionDetail: 'Keep selected local references with this task. Nothing is uploaded.', taskEmpty: 'No local resources yet. Add one from Profile → Resources.', link: 'Link', linked: 'Linked', linkChangedError: 'This resource changed or is unavailable. Reload the task.', linkUnavailableError: 'The resource link could not be changed.' } } }) },
    '@/features/tasks/task-date': {
      parseTaskDueDate(input, existingDueAt) {
        const value = input.trim();
        if (existingDueAt && value === existingDueAt.slice(0, 10)) return { valid: true };
        if (!value) return { valid: true, ...(existingDueAt ? { dueAt: null } : {}) };
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!match) return { valid: false };
        const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
        if (date.toISOString().slice(0, 10) !== value) return { valid: false };
        return { valid: true, dueAt: date.toISOString() };
      },
      formatTaskDueDate(value) { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value)); },
    },
    '@/hooks/use-theme': { useTheme: () => ({ background: '#fff', surface: '#fff', border: '#ddd', text: '#111', textMuted: '#666' }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/theme/tokens': { Palette: { homeLightBackground: '#fff', homeLightSurface: '#fff', homeLightBorder: '#ddd', homeLightAction: '#123', homeLightActionSoft: '#eee', deepNavy: '#123', mintPrimary: '#123' }, Radius: { card: 16 }, Spacing: { sm: 8, md: 16, lg: 24 } },
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
    pushes: () => pushes,
    replacements: () => replacements,
    task: () => tasks.find(item => item.id === 'task-1'),
  };
}

test('Task detail read failure offers retry rather than claiming the task is missing', async () => {
  const app = fixture({ loadFailures: 1 }); app.render(); await app.settle();
  assert.ok(app.find('Retry loading task'));
  assert.equal(app.find('Complete task'), undefined);
  app.find('Retry loading task').props.onPress(); await app.settle();
  assert.ok(app.find('Complete task'));
});

test('Task detail never creates a task from an untrusted route title', async () => {
  const app = fixture({ tasks: [] }); app.render(); await app.settle();
  assert.equal(app.find('Complete task'), undefined);
  assert.equal(app.find('Focus on this task'), undefined);
  assert.equal(app.writes(), 0);
});

test('Task detail starts focus using the stored task ID, not a route-supplied title', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.find('Focus on this task').props.onPress();
  const [route] = app.pushes()[0];
  assert.equal(route.pathname, '/focus/setup');
  assert.equal(route.params.taskId, 'task-1');
  assert.equal(route.params.taskName, undefined);
});

test('Task detail archives reversibly, preserves the task, and withholds active actions until restore', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.find('Archive task').props.onPress(); await app.settle();
  assert.ok(app.find('Restore task'));
  assert.equal(Number.isFinite(Date.parse(app.task().archivedAt)), true);
  assert.equal(app.find('Focus on this task'), undefined);
  assert.equal(app.find('Edit task details'), undefined);
  assert.equal(app.find('Complete task'), undefined);
  assert.equal(app.find('Delete task') !== undefined, true);
  app.find('Restore task').props.onPress(); await app.settle();
  assert.ok(app.find('Focus on this task'));
  assert.equal(app.task().archivedAt, undefined);
  assert.equal(app.task().id, storedTask.id);
});

test('Task archive failure preserves its active state and can be retried', async () => {
  const app = fixture({ archiveFailures: 1 }); app.render(); await app.settle();
  app.find('Archive task').props.onPress(); await app.settle();
  assert.ok(app.find('Archive task'));
  assert.equal(app.task().archivedAt, undefined);
  assert.equal(app.alerts().length, 1);
  app.find('Archive task').props.onPress(); await app.settle();
  assert.ok(app.find('Restore task'));
});

test('stale task archive asks for reload instead of changing a newer record', async () => {
  const app = fixture({ archiveConflict: true }); app.render(); await app.settle();
  app.find('Archive task').props.onPress(); await app.settle();
  assert.ok(app.find('Reload task'));
  assert.ok(app.find('Archive task'));
  assert.equal(app.task().archivedAt, undefined);
});

test('failed task completion remains pending and allows a successful retry', async () => {
  const app = fixture({ saveFailures: 1 }); app.render(); await app.settle();
  app.find('Complete task').props.onPress(); await app.settle();
  assert.ok(app.find('Complete task'));
  assert.equal(app.alerts().length, 1);
  app.find('Complete task').props.onPress(); await app.settle();
  assert.equal(app.find('Complete task'), undefined);
  assert.equal(app.writes(), 2);
});

test('Task detail rejects duplicate completion while the write is pending', async () => {
  let resolve;
  const app = fixture({ save: () => new Promise(done => { resolve = done; }) }); app.render(); await app.settle();
  const complete = app.find('Complete task').props.onPress;
  complete(); complete(); await new Promise(setImmediate); app.render();
  assert.equal(app.writes(), 1);
  assert.equal(app.find('Complete task').props.loading, true);
  assert.equal(app.find('Focus on this task').props.disabled, true);
  resolve(); await app.settle();
  assert.equal(app.find('Complete task'), undefined);
});

test('Task details edit saves optional fields atomically and keeps the stable task ID', async () => {
  const app = fixture({ goals: [{ id: 'goal-1', title: 'Weekly focus', status: 'active' }] }); app.render(); await app.settle();
  app.find('Edit task details').props.onPress(); await app.settle();
  app.find('Edit task title').props.onChangeText('A clearer title'); app.render();
  app.find('Add a note (optional)').props.onChangeText('Read the next chapter'); app.render();
  app.find('High').props.onPress(); app.render();
  app.find('Weekly focus').props.onPress(); app.render();
  app.find('Save task details').props.onPress(); await app.settle();
  assert.equal(app.task().title, 'A clearer title');
  assert.equal(app.task().id, 'task-1');
  assert.equal(app.task().description, 'Read the next chapter');
  assert.equal(app.task().priority, 'high');
  assert.equal(app.task().goalId, 'goal-1');
  assert.equal(app.writes(), 1);
});

test('task detail saves a valid due date as a stable UTC calendar date', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.find('Edit task details').props.onPress(); await app.settle();
  app.find('Due date (UTC calendar date, optional)').props.onChangeText('2026-10-20'); app.render();
  app.find('Save task details').props.onPress(); await app.settle();
  assert.equal(app.task().dueAt, '2026-10-20T00:00:00.000Z');
  const formatted = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date('2026-10-20T00:00:00.000Z'));
  assert.ok(app.find(`Due: ${formatted}`));
});

test('task detail rejects impossible dates without writing and can clear a deadline', async () => {
  const task = { ...storedTask, dueAt: '2026-10-20T12:34:56.000Z' };
  const app = fixture({ tasks: [task] }); app.render(); await app.settle();
  app.find('Edit task details').props.onPress(); await app.settle();
  app.find('Due date (UTC calendar date, optional)').props.onChangeText('2026-02-29'); app.render();
  app.find('Save task details').props.onPress(); await app.settle();
  assert.equal(app.task().dueAt, task.dueAt);
  assert.equal(app.writes(), 0);
  assert.equal(app.find('Due date (UTC calendar date, optional)').props.value, '2026-02-29');
  app.find('Due date (UTC calendar date, optional)').props.onChangeText(''); app.render();
  app.find('Save task details').props.onPress(); await app.settle();
  assert.equal(app.task().dueAt, undefined);
  assert.equal(app.writes(), 1);
});

test('failed task title edit keeps the stored title and draft available for retry', async () => {
  const app = fixture({ editFailures: 1 }); app.render(); await app.settle();
  app.find('Edit task details').props.onPress(); app.render();
  app.find('Edit task title').props.onChangeText('Retry this title'); app.render();
  app.find('Save task details').props.onPress(); await app.settle();
  assert.equal(app.task().title, 'Real task');
  assert.equal(app.find('Edit task title').props.value, 'Retry this title');
  assert.equal(app.alerts().length, 1);
});

test('stale task title edit requires a reload rather than overwriting newer data', async () => {
  const app = fixture({ editConflict: true }); app.render(); await app.settle();
  app.find('Edit task details').props.onPress(); app.render();
  app.find('Edit task title').props.onChangeText('Stale title'); app.render();
  app.find('Save task details').props.onPress(); await app.settle();
  assert.equal(app.task().title, 'Real task');
  assert.ok(app.find('Reload task'));
  assert.equal(app.alerts().length, 1);
});

test('task deletion requires confirmation and keeps the task when cancelled', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.find('Delete task').props.onPress(); app.render();
  assert.ok(app.find('Delete task and keep history'));
  assert.equal(app.writes(), 0);
  app.find('Keep task').props.onPress(); await app.settle();
  assert.equal(app.task().title, 'Real task');
  assert.equal(app.writes(), 0);
});

test('confirmed task deletion removes only after success and returns to task list', async () => {
  const app = fixture(); app.render(); await app.settle();
  app.find('Delete task').props.onPress(); app.render();
  app.find('Delete task and keep history').props.onPress(); await app.settle();
  assert.equal(app.task(), undefined);
  assert.deepEqual(app.replacements(), [['/tasks']]);
});

test('failed task deletion retains task and exposes a recoverable error', async () => {
  const app = fixture({ deleteFailures: 1 }); app.render(); await app.settle();
  app.find('Delete task').props.onPress(); app.render();
  app.find('Delete task and keep history').props.onPress(); await app.settle();
  assert.equal(app.task().title, 'Real task');
  assert.equal(app.replacements().length, 0);
  assert.equal(app.alerts().length, 2);
});

test('stale task deletion asks for reload and a fresh confirmation', async () => {
  const app = fixture({ deleteConflict: true }); app.render(); await app.settle();
  app.find('Delete task').props.onPress(); app.render();
  app.find('Delete task and keep history').props.onPress(); await app.settle();
  assert.equal(app.task().title, 'Real task');
  assert.ok(app.find('Reload task'));
  app.find('Reload task').props.onPress(); await app.settle();
  assert.equal(app.find('Delete task and keep history'), undefined);
  assert.equal(app.find('Delete task').props.disabled, false);
  assert.equal(app.replacements().length, 0);
});

test('goal-load failure is visible and retry restores owner-scoped selection', async () => {
  const app = fixture({ goals: [{ id: 'goal-1', title: 'Weekly focus', status: 'active' }], goalLoadFailures: 1 }); app.render(); await app.settle();
  app.find('Edit task details').props.onPress(); await app.settle();
  assert.ok(app.find('Retry loading goals'));
  assert.equal(app.task().goalId, undefined);
  app.find('Retry loading goals').props.onPress(); await app.settle();
  assert.ok(app.find('Weekly focus'));
});

test('task editor can explicitly clear its optional goal association', async () => {
  const app = fixture({
    tasks: [{ ...storedTask, goalId: 'goal-1' }],
    goals: [{ id: 'goal-1', title: 'Weekly focus', status: 'active' }],
  });
  app.render(); await app.settle();
  app.find('Edit task details').props.onPress(); await app.settle();
  app.find('No goal').props.onPress(); app.render();
  app.find('Save task details').props.onPress(); await app.settle();
  assert.equal(app.task().goalId, undefined);
});
