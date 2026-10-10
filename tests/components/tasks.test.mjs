import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const { outputText } = ts.transpileModule(readFileSync(new URL('../../src/app/tasks/index.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

// Actual route handlers with a bounded hook/JSX model; not a native renderer.
function fixture({ tasks = [], loadFailures = 0, saveFailures = 0, save } = {}) {
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
    'react-native': { Pressable: 'Pressable', ScrollView: 'ScrollView', TextInput: 'TextInput', View: 'View', StyleSheet: { create: x => x } },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/ui/button': { Button: 'Button' },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ copy: { tasks: { eyebrow: 'TASKS', title: 'Choose what matters next.', subtitle: 'Keep your next steps clear and ready for focus.', add: 'Add a task', newTask: 'NEW TASK', titleLabel: 'Task title', placeholder: 'What needs your attention?', save: 'Save task', cancel: 'Cancel', upNext: 'UP NEXT', completed: 'COMPLETED', archived: 'ARCHIVED', showArchived: 'View archived tasks', hideArchived: 'Hide archived tasks', loading: 'Loading tasks…', loadError: 'Your tasks could not be loaded. Your saved data has not been reset.', retry: 'Retry loading tasks', saving: 'Saving changes…', saveError: 'Your changes could not be saved. Your task list and draft were kept. Try the action again.', noActive: 'No active tasks. Add one whenever you are ready.', cleared: 'You have cleared your task list.', archivedState: 'Archived', completedState: 'Completed', ready: 'Ready for focus', complete: 'Complete' } } }) },
    '@/features/identity/stable-ids': { createStableId: () => '10000000-0000-4000-8000-000000000001' },
    '@/hooks/use-theme': { useTheme: () => ({}) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/theme/tokens': { Palette: {}, Radius: {}, Spacing: {} },
    '@/features/tasks/task-storage': {
      async loadTasks() { if (loadFailures-- > 0) throw Error('read failed'); return tasks; },
      async saveTasks(next) { writes++; if (saveFailures-- > 0) throw Error('write failed'); if (save) await save(); tasks = next; },
    },
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
    find(label) { return nodes(tree).find(n => n.props.label === label || n.props.accessibilityLabel === label); },
    alerts() { return nodes(tree).filter(n => n.props.accessibilityRole === 'alert'); },
    writes: () => writes,
  };
}

test('Tasks keeps draft and list unchanged after failed add, then explicit retry saves', async () => {
  const app = fixture({ saveFailures: 1 }); app.render(); await app.settle();
  app.find('Add a task').props.onPress(); app.render();
  app.find('Task title').props.onChangeText('Keep my draft'); app.render();
  app.find('Save task').props.onPress(); await app.settle();
  assert.equal(app.find('Task title').props.value, 'Keep my draft');
  assert.equal(app.find('Keep my draft, ready for focus'), undefined);
  assert.equal(app.alerts().length, 1);
  app.find('Save task').props.onPress(); await app.settle();
  assert.ok(app.find('Keep my draft, ready for focus'));
  assert.equal(app.find('Task title'), undefined);
  assert.equal(app.writes(), 2);
});

test('Tasks failed completion does not show a completed task', async () => {
  const app = fixture({ tasks: [{ id: 'a', title: 'Existing', status: 'pending' }], saveFailures: 1 });
  app.render(); await app.settle();
  app.find('Complete Existing').props.onPress(); await app.settle();
  assert.ok(app.find('Existing, ready for focus'));
  assert.equal(app.find('Existing, completed'), undefined);
  assert.equal(app.alerts().length, 1);
});

test('Tasks failed load has retry instead of a false empty list', async () => {
  const app = fixture({ loadFailures: 1 }); app.render(); await app.settle();
  assert.equal(app.find('Add a task'), undefined);
  assert.equal(app.alerts().length, 1);
  app.find('Retry loading tasks').props.onPress(); await app.settle();
  assert.ok(app.find('Add a task'));
  assert.equal(app.alerts().length, 0);
});

test('Tasks keep archived records out of active sections and reveal them on request', async () => {
  const archived = { id: 'archived', title: 'Past task', status: 'completed', archivedAt: '2026-10-07T01:00:00.000Z' };
  const active = { id: 'active', title: 'Current task', status: 'pending' };
  const app = fixture({ tasks: [archived, active] }); app.render(); await app.settle();
  assert.ok(app.find('Current task, ready for focus'));
  assert.equal(app.find('Past task, archived'), undefined);
  app.find('View archived tasks (1)').props.onPress(); app.render();
  assert.ok(app.find('Past task, archived'));
  assert.ok(app.find('Hide archived tasks (1)'));
});

test('Tasks pending save rejects duplicate submits and protects the draft', async () => {
  let resolve;
  const app = fixture({ save: () => new Promise(done => { resolve = done; }) });
  app.render(); await app.settle(); app.find('Add a task').props.onPress(); app.render();
  app.find('Task title').props.onChangeText('One task'); app.render();
  const submit = app.find('Save task').props.onPress;
  submit(); submit(); app.render();
  assert.equal(app.writes(), 1);
  assert.equal(app.find('Task title').props.editable, false);
  assert.equal(app.find('Save task').props.loading, true);
  resolve(); await app.settle();
  assert.ok(app.find('One task, ready for focus'));
});
