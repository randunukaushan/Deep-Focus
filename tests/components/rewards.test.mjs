import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const source = ts.transpileModule(readFileSync(new URL('../../src/app/(tabs)/progress/rewards.tsx', import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const completed = { id: 'session-1', status: 'completed', taskName: 'Read chapter', plannedDurationSeconds: 1500, focusedDurationSeconds: 1200, pausedDurationSeconds: 0, createdAt: '2026-10-06T00:00:00.000Z', startedAt: '2026-10-06T00:00:00.000Z', completedAt: '2026-10-06T00:20:00.000Z' };

function fixture({ reads = [Promise.resolve([completed])], sessions = [completed] } = {}) {
  const slots = [];
  const replacements = [];
  let cursor = 0, focusEffect, cleanup, mounted = false, tree, readIndex = 0;
  const dependencies = {
    react: {
      useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, value => { slots[i].value = value; }]; },
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useCallback(fn) { return fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ push() {}, replace(path) { replacements.push(path); } }), useFocusEffect(fn) { if (!mounted) focusEffect = fn; } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { ActivityIndicator: 'ActivityIndicator', Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: value => value }, View: 'View' },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'ThemedView' },
    '@/components/ui/button': { Button: 'Button' },
    '@/components/ui/section-heading': { SectionHeading: ({ title, subtitle }) => ({ type: 'View', props: { children: [title, subtitle].map(children => ({ type: 'Text', props: { children } })) } }) },
    '@/theme/action-colors': { accentTextColor: () => '#FFFFFF' },
    '@/features/focus/session-storage': { loadSessionHistory() { return reads[readIndex++] ?? Promise.resolve(sessions); } },
    '@/features/focus/session-history': { getHistoricalSessions: value => value, formatSessionDuration: seconds => `${Math.floor(seconds / 60)} min`, getSessionTimestamp: () => 'Oct 6, 2026' },
    '@/features/localization/rewards-copy': { getRewardsCopy: () => ({ eyebrow: 'REWARDS', title: 'Notice the work you protect.', subtitle: 'Small milestones for sustainable focus, without pressure.', loading: 'Loading rewards', errorTitle: 'Rewards could not be loaded.', errorDetail: 'Your saved session history has not been changed. Try again to reload rewards.', retry: 'Retry loading rewards', tryAgain: 'Try again', yourMilestones: 'YOUR MILESTONES', unlockedSummary: 'unlocked', completedSession: 'completed session', completedSessions: 'completed sessions', focused: 'focused', milestones: 'MILESTONES', emptyLabel: 'No rewards unlocked yet', emptyTitle: 'YOUR FIRST MILESTONE IS CLOSE', emptyDetail: 'Start one calm focus session to begin your progress.', startFocus: 'Start Focus Session', latestDetail: 'Milestones are based on completed sessions saved locally.', unlocked: 'Unlocked', unlockedDetail: 'Unlocked · a meaningful step forward.', firstTitle: 'First protected block', firstDetail: 'Complete your first focus session.', fiveTitle: 'Five steady blocks', fiveDetail: 'Complete five focus sessions.', hourTitle: 'One hour of focus', hourDetail: 'Protect 60 minutes of focused time.', hoursUnit: 'h', minutesUnit: 'min' }) , getAchievementCopy: () => ({ title: 'Milestone', detail: 'Detail' }) },
    '@/features/progress/progression-rules': { ACHIEVEMENT_IDS: ['first_focus_session', 'focus_sessions_5', 'focus_minutes_60'], calculateLevelProgress: totalXp => ({ totalXp, level: 1, xpToNextLevel: 100 }) },
    '@/features/storage/local-database': { async loadAchievementUnlocks() { return sessions.length ? [{ achievementId: 'first_focus_session', unlockedAt: '2026-10-06T00:20:00.000Z' }] : []; } },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en', copy: { historyPage: { back: 'Back to Progress' } } }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/hooks/use-theme': { useTheme: () => ({ primary: '#2165DF', background: '#fff', surface: '#fff', border: '#ddd' }) },
    '@/theme/tokens': { Palette: { homeLightBackground: '#fff', homeLightSurface: '#fff', homeLightBorder: '#ddd', homeLightAction: '#123', homeLightActionSoft: '#eee', deepNavy: '#123', mintPrimary: '#123' }, Radius: { card: 16 }, Spacing: { xs: 4, sm: 8, md: 16, lg: 24 } },
  };
  const exports = {};
  runInNewContext(source, { exports, require: name => {
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
    render() { cursor = 0; tree = exports.default(); if (!mounted) { mounted = true; cleanup = focusEffect(); } return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    blur() { cleanup?.(); },
    find(label) { return nodes(tree).find(node => node.props.accessibilityLabel === label || node.props.label === label); },
    text() { return nodes(tree).filter(node => node.type === 'Text').map(node => node.props.children).flat(Infinity).join(' ').replace(/\s+/g, ' '); },
    ofType: type => nodes(tree).filter(node => node.type === type),
    replacements,
  };
}

test('Rewards keeps readable locked milestones and shared navigation/actions without nested safe-area padding', async () => {
  const app = fixture(); app.render(); await app.settle();
  assert.ok(app.find('Back to Progress'));
  app.find('Back to Progress').props.onPress();
  assert.equal(app.replacements[0], '/progress');
  assert.equal(app.ofType('SafeAreaView').length, 0);
  assert.equal(app.ofType('ScrollView')[0].props.contentContainerStyle.flexGrow, 1);
  const milestones = app.ofType('ThemedView').filter(node => node.props.accessibilityLabel?.startsWith('Milestone.'));
  assert.equal(milestones.length, 3);
  for (const milestone of milestones) assert.equal(milestone.props.style[1].opacity, undefined);
  assert.match(milestones[0].props.accessibilityLabel, /Unlocked/);
  assert.match(milestones[1].props.accessibilityLabel, /Detail/);
  assert.equal(app.ofType('Icon').find(node => node.props.name === 'checkmark').props.color, '#FFFFFF');
});

test('Rewards shows an error instead of false zero milestones and retries the local read', async () => {
  const app = fixture({ reads: [Promise.reject(Error('private storage detail')), Promise.resolve([completed])] });
  app.render();
  await app.settle();
  assert.ok(app.find('Retry loading rewards'));
  assert.match(app.text(), /could not be loaded/);
  assert.doesNotMatch(app.text(), /0 \/ 3 unlocked|No rewards unlocked yet/);
  app.find('Retry loading rewards').props.onPress(); await app.settle();
  assert.match(app.text(), /1 \/ 3 unlocked/);
});

test('Rewards shows the empty state only after a successful empty read', async () => {
  const app = fixture({ reads: [Promise.resolve([])], sessions: [] });
  app.render(); await app.settle();
  assert.match(app.text(), /0 \/ 3 unlocked/);
  assert.ok(app.find('No rewards unlocked yet'));
  assert.equal(app.find('Retry loading rewards'), undefined);
});

test('Rewards ignores a history read that resolves after the route loses focus', async () => {
  let resolveRead;
  const pendingRead = new Promise(resolve => { resolveRead = resolve; });
  const app = fixture({ reads: [pendingRead] });
  app.render();
  app.blur();
  resolveRead([completed]);
  await app.settle();
  assert.ok(app.find('Loading rewards'));
  assert.doesNotMatch(app.text(), /YOUR MILESTONES/);
});
