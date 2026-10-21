import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { loadPersistedFinalizedSession } from '../../src/features/focus/session-summary-data.ts';
import { checkSessionRecovery } from '../../src/features/focus/session-recovery-state.ts';
import { getSessionCopy } from '../../src/features/localization/session-copy.ts';
import { getSessionRecoveryCopy } from '../../src/features/localization/session-recovery-copy.ts';
import * as tokens from '../../src/theme/tokens.ts';

const ts = createRequire(import.meta.url)('typescript');
const terminal = { id: 'terminal-1', status: 'completed', focusedDurationSeconds: 1260, plannedDurationSeconds: 1500, taskName: 'Synthetic reading', taskId: 'task-1' };
const focus = Object.fromEntries(['summaryEyebrow', 'sessionComplete', 'sessionEnded', 'focusedWork', 'endedBeforePlan', 'focusSummary', 'focusTime', 'planned', 'status', 'completed', 'cancelled', 'task', 'anotherSession', 'backHome'].map(key => [key, key]));
focus.minutes = 'min';
const text = getSessionCopy('en');
const recoveryText = getSessionRecoveryCopy('en');
const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const contrast = {};
runInNewContext(compile('src/theme/action-colors.ts'), { exports: contrast, require: () => tokens });

function fixture(route, { session = terminal, readFailures = 0, taskFailures = 0, scheme = 'light', sessionId = terminal.id, active = null } = {}) {
  const slots = [], pending = [], replacements = [], dismissals = [], pushes = [];
  const counts = { reads: 0, claims: 0, clears: 0, taskWrites: 0, progressionReads: 0 };
  let cursor = 0, tree;
  const router = { replace: path => replacements.push(path), dismissTo: path => dismissals.push(path), push: path => pushes.push(path) };
  const deps = {
    react: {
      useState(initial) {
        const slot = cursor++;
        slots[slot] ??= { value: typeof initial === 'function' ? initial() : initial };
        return [slots[slot].value, next => { slots[slot].value = typeof next === 'function' ? next(slots[slot].value) : next; }];
      },
      useCallback: fn => fn,
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useEffect(fn, dependencies) {
        const slot = cursor++, previous = slots[slot];
        if (!previous || dependencies.some((value, index) => !Object.is(previous.dependencies[index], value))) {
          previous?.cleanup?.();
          slots[slot] = { dependencies };
          pending.push(() => { slots[slot].cleanup = fn(); });
        }
      },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-native': { ScrollView: 'ScrollView', View: 'View', Pressable: 'Pressable', StyleSheet: { create: value => value } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    'expo-router': { useRouter: () => router, useLocalSearchParams: () => ({ sessionId }) },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/ui/button': { Button: 'Button' },
    '@/components/ui/section-heading': { SectionHeading: ({ title, subtitle }) => ({ type: 'View', props: { children: [title, subtitle].map(children => ({ type: 'Text', props: { children } })) } }) },
    '@/theme/tokens': tokens,
    '@/constants/theme': tokens,
    '@/theme/action-colors': contrast,
    '@/hooks/use-color-scheme': { useColorScheme: () => scheme },
    '@/hooks/use-theme': { useTheme: () => ({ ...tokens.Colors[scheme], text: tokens.Colors[scheme].textPrimary, backgroundElement: tokens.Colors[scheme].surfaceElevated }) },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en', copy: { focus } }) },
    '@/features/localization/session-copy': { getSessionCopy },
    '@/features/localization/session-recovery-copy': { getSessionRecoveryCopy },
    '@/features/localization/rewards-copy': { getAchievementCopy: () => ({ title: 'Synthetic milestone' }) },
    '@/features/focus/session-summary-data': { loadPersistedFinalizedSession },
    '@/features/focus/session-recovery-state': { checkSessionRecovery },
    '@/features/focus/break-storage': { createBreakRecoveryStorage: () => ({
      isCurrent: () => true,
      async load() { counts.reads++; if (readFailures-- > 0) throw Error('PRIVATE_READ_FAILURE'); return { session: active, activeBreak: null }; },
    }) },
    '@/features/focus/session-storage': {
      async loadFinalizedSession(id) { counts.reads++; assert.equal(id, sessionId); if (readFailures-- > 0) throw Error('PRIVATE_READ_FAILURE'); return session; },
      async loadActiveSession(includePaused) { counts.reads++; assert.equal(includePaused, true); if (readFailures-- > 0) throw Error('PRIVATE_READ_FAILURE'); return active; },
      async clearPendingSummaryHandoff(id) { assert.equal(id, session.id); counts.clears++; },
      async loadTerminalProgression() { counts.progressionReads++; return { xpEarned: 21, level: 2 }; },
      async claimTerminalAchievementPresentation() { counts.claims++; return ['synthetic']; },
      async loadSessionHistory() { return []; },
    },
    '@/features/tasks/task-storage': {
      async loadTasks() { return [{ id: 'task-1', updatedAt: 'synthetic-revision', status: 'active' }]; },
      async completeTask(id, expected) { assert.equal(id, 'task-1'); assert.equal(expected, 'synthetic-revision'); counts.taskWrites++; if (taskFailures-- > 0) throw Error('PRIVATE_TASK_FAILURE'); return { task: { id, status: 'completed' } }; },
    },
    '@/features/progress/streak': { calculateStreak: () => ({ currentStreakDays: 0 }) },
  };
  const exports = {};
  runInNewContext(compile(`src/app/focus/${route}.tsx`), {
    exports, require(name) { if (!(name in deps)) throw Error(`Unexpected dependency ${name}`); return deps[name]; },
    setTimeout: fn => { pending.push(fn); return 1; }, clearTimeout() {},
  });
  function nodes(value) {
    if (Array.isArray(value)) return value.flatMap(nodes);
    if (!value || typeof value !== 'object') return [];
    if (typeof value.type === 'function') return nodes(value.type(value.props));
    return [value, ...nodes(value.props?.children)];
  }
  return {
    render() { cursor = 0; tree = exports.default(); while (pending.length) pending.shift()(); return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    ofType: type => nodes(tree).filter(node => node.type === type),
    button: label => nodes(tree).find(node => node.type === 'Button' && node.props.label === label),
    hasText: value => nodes(tree).some(node => node.props.children === value),
    labels: () => nodes(tree).map(node => node.props.accessibilityLabel).filter(Boolean).join(' '),
    counts, replacements, dismissals, pushes,
  };
}

test('summary scrolls loading/results, uses actual terminal time and makes Home primary in both themes', async () => {
  for (const scheme of ['light', 'dark']) {
    const app = fixture('summary', { scheme }); app.render();
    assert.equal(app.ofType('SafeAreaView').length, 1);
    assert.equal(app.ofType('ScrollView')[0].props.contentContainerStyle.flexGrow, 1);
    await app.settle();
    assert.ok(app.hasText('21 min'));
    assert.match(app.labels(), /focusTime: 21 min.*planned: 25 min/);
    assert.equal(app.counts.claims, 1);
    assert.equal(app.counts.taskWrites, 0);
    assert.equal(app.button('backHome').props.variant, undefined);
    assert.equal(app.button('anotherSession').props.variant, 'secondary');
    app.button('backHome').props.onPress(); assert.equal(app.dismissals[0], '/(tabs)/home');
    app.button('anotherSession').props.onPress(); assert.equal(app.replacements[0], '/focus/setup');
    app.render(); await app.settle(); assert.equal(app.counts.claims, 1);
  }
});

test('cancelled summary stays cancelled without completion rewards or a task-completion action', async () => {
  const app = fixture('summary', { session: { ...terminal, status: 'cancelled', focusedDurationSeconds: 120 } });
  app.render(); await app.settle();
  assert.ok(app.hasText('sessionEnded')); assert.ok(app.hasText('2 min'));
  assert.equal(app.counts.progressionReads, 0); assert.equal(app.counts.claims, 0);
  assert.equal(app.button(text.markTaskComplete), undefined);
});

test('failed summary read keeps scrollable safe retry/Home and reloads without synthetic completion', async () => {
  const app = fixture('summary', { readFailures: 1 }); app.render(); await app.settle();
  assert.ok(app.hasText(text.summaryUnavailable)); assert.doesNotMatch(app.labels(), /PRIVATE/);
  assert.equal(app.ofType('ScrollView').length, 1); assert.equal(app.counts.claims, 0);
  app.button(text.retryLoad).props.onPress(); app.render(); await app.settle();
  assert.ok(app.hasText('sessionComplete')); assert.equal(app.counts.reads, 2);
});

test('missing, non-terminal and blank-ID records never display a success summary', async () => {
  for (const options of [{ session: null }, { session: { ...terminal, status: 'active' } }, { sessionId: ' ' }]) {
    const app = fixture('summary', options);
    app.render(); await app.settle();
    assert.ok(app.hasText(text.summaryUnavailable)); assert.equal(app.counts.claims, 0);
    assert.equal(app.button('anotherSession'), undefined);
    app.button(text.returnHome).props.onPress(); assert.equal(app.dismissals[0], '/(tabs)/home');
  }
});

test('summary retains explicit linked-task completion, failure and retry without changing session receipts', async () => {
  const app = fixture('summary', { taskFailures: 1 }); app.render(); await app.settle();
  app.button(text.markTaskComplete).props.onPress(); app.render(); await app.settle();
  assert.ok(app.hasText(text.taskCompleteError)); assert.equal(app.counts.taskWrites, 1);
  app.button(text.markTaskComplete).props.onPress(); app.render(); await app.settle();
  assert.ok(app.hasText(text.taskCompleted)); assert.equal(app.counts.taskWrites, 2);
  assert.equal(app.button(text.markTaskComplete), undefined); assert.equal(app.counts.claims, 1);
});

test('recovery checking/error/retry/empty states scroll and never create or resume a session', async () => {
  const app = fixture('recovery', { readFailures: 1 }); app.render();
  assert.equal(app.ofType('SafeAreaView').length, 1);
  assert.ok(app.hasText(recoveryText.checkingTitle)); assert.equal(app.ofType('ScrollView').length, 1);
  await app.settle(); assert.ok(app.hasText(recoveryText.errorTitle));
  assert.equal(app.ofType('ScrollView')[0].props.contentContainerStyle.flexGrow, 1);
  app.button(recoveryText.retry).props.onPress(); app.render(); await app.settle();
  assert.ok(app.hasText(recoveryText.readyTitle)); assert.equal(app.replacements.length, 0);
  app.button(recoveryText.newSession).props.onPress(); assert.equal(app.pushes[0], '/focus/setup');
  app.button(recoveryText.backHome).props.onPress(); assert.equal(app.replacements[0], '/(tabs)/home');
});

test('recovery opens the stored active/paused session configuration without auto-resume', async () => {
  for (const status of ['active', 'paused']) {
    const app = fixture('recovery', { active: { ...terminal, status } }); app.render(); await app.settle();
    assert.equal(app.replacements[0].pathname, '/focus/session');
    assert.equal(app.replacements[0].params.durationMinutes, '25');
    assert.equal(app.replacements[0].params.taskName, 'Synthetic reading');
    assert.equal(app.replacements[0].params.resume, undefined);
    assert.equal(app.counts.taskWrites, 0); assert.equal(app.counts.claims, 0);
  }
});
