// Plan now renders the real task-backed preview screen, not two navigation cards.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
const ts = createRequire(import.meta.url)('typescript');
function compile(file) { return ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText; }
const screenCode = compile('src/features/tasks/task-plan-screen.tsx');
const planning = {}; runInNewContext(compile('src/features/tasks/task-planning.ts'), { exports: planning, Date });
const copyModule = {}; runInNewContext(compile('src/features/localization/task-plan-copy.ts'), { exports: copyModule });
const tokens = {}; runInNewContext(compile('src/theme/tokens.ts'), { exports: tokens });
const text = copyModule.getTaskPlanCopy('en');

function fixture({ tasks = [], readFailures = 0, saveFailures = 0, failCompletion = false, waitForSave, scheme = 'light', platform = 'android' } = {}) {
  const slots = []; const writes = []; const pushes = [];
  let cursor = 0, tree, pendingEffect, lastEffect, cleanup;
  const dependencies = {
    react: {
      useState(initial) { const i = cursor++; slots[i] ??= { value: typeof initial === 'function' ? initial() : initial }; return [slots[i].value, value => { slots[i].value = typeof value === 'function' ? value(slots[i].value) : value; }]; },
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useCallback(fn, deps) { const i = cursor++; if (!slots[i] || deps.some((dep, index) => dep !== slots[i].deps[index])) slots[i] = { fn, deps }; return slots[i].fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'Fragment' },
    'expo-router': { useRouter: () => ({ push: route => pushes.push(route) }), useFocusEffect(fn) { if (fn !== lastEffect) pendingEffect = fn; } },
    'expo-image': { Image: 'Image' }, '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { Modal: 'Modal', Platform: { OS: platform }, Pressable: 'Pressable', ScrollView: 'ScrollView', TextInput: 'TextInput', View: 'View', StyleSheet: { create: value => value } },
    '@/components/themed-text': { ThemedText: 'Text' }, '@/components/themed-view': { ThemedView: 'View' }, '@/components/ui/button': { Button: 'Button' },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en', copy: { plan: { tasks: 'Tasks', goals: 'Goals' }, tasks: { loading: 'Loading tasks', loadError: 'Cannot load tasks', retry: 'Retry', saveError: 'Cannot save task', complete: 'Complete', completedState: 'Completed', ready: 'Ready for focus', saving: 'Saving' } } }) },
    '@/features/localization/task-plan-copy': copyModule,
    '@/features/identity/stable-ids': { createStableId: () => 'new-task' },
    '@/hooks/use-color-scheme': { useColorScheme: () => scheme },
    '@/hooks/use-theme': { useTheme: () => ({ ...tokens.Colors[scheme], text: tokens.Colors[scheme].textPrimary }) },
    '@/theme/tokens': tokens, '@/assets/branding/deep-focus-logo.png': 1,
    './task-planning': planning,
    './task-storage': {
      async loadTasks() { if (readFailures-- > 0) throw Error('private read detail'); return tasks; },
      async saveTasks(next) { writes.push(next); if (waitForSave) await waitForSave(); if (saveFailures-- > 0) throw Error('private write detail'); tasks = [...next, ...tasks.filter(task => !next.some(item => item.id === task.id))]; },
      async completeTask(id, revision) { if (failCompletion) return null; const item = tasks.find(task => task.id === id && task.updatedAt === revision); if (!item) return null; const result = { ...item, status: 'completed' }; tasks = tasks.map(task => task.id === id ? result : task); return { task: result }; },
    },
  };
  const exports = {}; runInNewContext(screenCode, { exports, Date, require(name) { assert.ok(name in dependencies, name); return dependencies[name]; } });
  function nodes(node) {
    if (Array.isArray(node)) return node.flatMap(nodes);
    if (!node || typeof node !== 'object' || (node.type === 'Modal' && !node.props.visible)) return [];
    return [node, ...nodes(node.props.children)];
  }
  return {
    render() { cursor = 0; tree = exports.TaskPlanScreen(); if (pendingEffect) { cleanup?.(); lastEffect = pendingEffect; pendingEffect = undefined; cleanup = lastEffect(); } return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    find(label, role) { return nodes(tree).find(node => (node.props.label === label || node.props.accessibilityLabel === label) && (!role || node.props.accessibilityRole === role)); },
    nodes: () => nodes(tree), writes, pushes,
  };
}

test('Plan route mounts preview-backed native screen and retains task/goal access in both themes', async () => {
  assert.match(readFileSync('src/app/(tabs)/plan.tsx', 'utf8'), /TaskPlanScreen as default/);
  for (const scheme of ['light', 'dark']) {
    const app = fixture({ scheme }); app.render(); await app.settle();
    assert.equal(app.find(text.today).props.accessibilityState.selected, true);
    assert.equal(app.find(text.upcoming).props.accessibilityRole, 'tab');
    assert.ok(app.nodes().some(node => node.props.children === text.empty));
    app.find('Tasks').props.onPress(); app.find('Goals').props.onPress();
    assert.deepEqual(app.pushes, ['/tasks', '/goals']);
    app.find(text.add).props.onPress(); app.render();
    assert.ok(app.find(text.titleField));
    assert.equal(app.nodes().find(node => node.type === 'Modal').props.animationType, 'none');
  }
});

test('real task periods and completion states match the preview without fabricating estimates', async () => {
  const today = planning.localPlanningDate(); const tomorrow = planning.nextPlanningDate(today);
  const app = fixture({ tasks: [{ id: 'a', title: 'Real work', status: 'pending', updatedAt: 'revision', plannedDate: today, estimatedMinutes: 25 }, { id: 'b', title: 'Later', status: 'pending', plannedDate: tomorrow }] });
  app.render(); await app.settle();
  assert.ok(app.find('Real work. Ready for focus')); assert.equal(app.find('Later. Ready for focus'), undefined);
  app.find('Real work. Ready for focus').props.onPress();
  assert.equal(app.pushes[0].pathname, '/focus/setup');
  app.find('Complete Real work').props.onPress(); await app.settle();
  assert.equal(app.find('Complete Real work').props.accessibilityState.checked, true);
  app.find(text.upcoming).props.onPress(); app.render();
  assert.ok(app.find('Later. Ready for focus')); assert.ok(app.nodes().some(node => Array.isArray(node.props.children) && node.props.children.includes(text.noEstimate)));
});

test('Plan validates input and preserves draft after failed save, then retries only the new task', async () => {
  const app = fixture({ saveFailures: 1 }); app.render(); await app.settle();
  app.find(text.add).props.onPress(); app.render();
  app.find(text.titleField).props.onChangeText('Keep draft'); app.find(text.minutesField).props.onChangeText('0'); app.render();
  app.find(text.save).props.onPress(); await app.settle(); assert.equal(app.writes.length, 0);
  app.find(text.minutesField).props.onChangeText('45'); app.render(); app.find(text.save).props.onPress(); await app.settle();
  assert.equal(app.find(text.titleField).props.value, 'Keep draft');
  assert.ok(app.nodes().some(node => node.props.accessibilityRole === 'alert' && node.props.children === 'Cannot save task'));
  app.find(text.save).props.onPress(); await app.settle();
  assert.equal(app.writes.length, 2); assert.equal(app.writes[1].length, 1);
  assert.equal(app.writes[1][0].estimatedMinutes, 45); assert.ok(app.writes[1][0].plannedDate);
  assert.ok(app.find('Keep draft. Ready for focus')); assert.equal(app.find(text.titleField), undefined);
});

test('pending Plan saves reject duplicate taps and prevent modal dismissal until settled', async () => {
  let release; const app = fixture({ waitForSave: () => new Promise(resolve => { release = resolve; }) });
  app.render(); await app.settle(); app.find(text.add).props.onPress(); app.render(); app.find(text.titleField).props.onChangeText('Only once'); app.render();
  const submit = app.find(text.save).props.onPress; submit(); submit(); app.render();
  assert.equal(app.writes.length, 1); assert.equal(app.find(text.save).props.loading, true);
  app.nodes().find(node => node.type === 'Modal').props.onRequestClose(); app.render(); assert.ok(app.find(text.titleField));
  release(); await app.settle(); assert.ok(app.find('Only once. Ready for focus'));
});

test('Plan distinguishes failed reads from empty and never pretends web SQLite saves succeeded', async () => {
  const app = fixture({ readFailures: 1 }); app.render(); await app.settle();
  assert.equal(app.find(text.add).props.disabled, true); assert.ok(app.find('Retry'));
  app.find('Retry').props.onPress(); app.render(); await app.settle(); assert.equal(app.find(text.add).props.disabled, false);
  const web = fixture({ platform: 'web' }); web.render(); await web.settle(); assert.ok(web.find('Retry')); assert.equal(web.writes.length, 0);
});
