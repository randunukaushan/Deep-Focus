import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const routes = {
  list: ts.transpileModule(readFileSync(new URL('../../src/app/(tabs)/progress/history.tsx', import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
  detail: ts.transpileModule(readFileSync(new URL('../../src/app/(tabs)/progress/history/[sessionId].tsx', import.meta.url), 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
};

const session = { id: 'session-1', status: 'completed', taskName: 'Read chapter', plannedDurationSeconds: 1500, focusedDurationSeconds: 1200, pausedDurationSeconds: 0, createdAt: '2026-10-06T00:00:00.000Z', startedAt: '2026-10-06T00:00:00.000Z', completedAt: '2026-10-06T00:20:00.000Z' };

function fixture(route, { sessions = [session], readFailures = 0 } = {}) {
  const slots = [];
  let cursor = 0, effect, mounted = false, tree;
  const dependencies = {
    react: {
      useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, value => { slots[i].value = value; }]; },
      useRef(initial) { return slots[cursor++] ??= { current: initial }; },
      useCallback(fn) { return fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ push() {}, replace() {} }), useLocalSearchParams: () => ({ sessionId: 'session-1' }), useFocusEffect(fn) { if (!mounted) effect = fn; } },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { ActivityIndicator: 'ActivityIndicator', Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: x => x }, View: 'View' },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/ui/button': { Button: 'Button' },
    '@/constants/theme': { MaxContentWidth: 600 },
    '@/features/focus/session-storage': { async loadSessionHistory() { if (readFailures-- > 0) throw Error('private history detail'); return sessions; } },
    '@/features/focus/session-history': {
      getHistoricalSessions: values => values.filter(item => ['completed', 'cancelled'].includes(item.status)),
      formatSessionDate: () => 'Oct 6, 2026',
      formatSessionDuration: seconds => `${Math.floor(seconds / 60)} min`,
    },
    '@/features/progress/progress-state': { async readProgressHistory(read) { try { return { status: 'ready', sessions: await read() }; } catch { return { status: 'error' }; } } },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ copy: { historyPage: { back: 'Back to Session History', title: 'Session History', subtitle: 'A quiet record of the time you chose to protect.', loading: 'Loading session history', loadErrorTitle: 'Session history could not be loaded.', loadErrorDetail: 'Your saved sessions have not been changed. Try again to reload them.', retry: 'Retry loading session history', noSessionsLabel: 'No focus sessions recorded yet', noSessionsTitle: 'NO SESSIONS YET', noSessionsDetail: 'Completed focus sessions will appear here.', startFocus: 'Start Focus Session', focusTime: 'FOCUS TIME', completed: 'COMPLETED', allSessions: 'All sessions', completedFilter: 'Completed', cancelledFilter: 'Cancelled', noMatchingTitle: 'NO MATCHING SESSIONS', noMatchingDetail: 'Try another filter to review your focus history.', recent: 'RECENT SESSIONS', openDetailsHint: 'Open session details', focusSession: 'Focus session', cancelled: 'CANCELLED', completedStatus: 'COMPLETED', focused: 'focused', of: 'of', detailLoading: 'Loading session details', detailLoadErrorTitle: 'Session details could not be loaded.', detailLoadErrorDetail: 'Your saved history has not been changed. Try again to reload this session.', detailRetry: 'Retry loading session', detailEyebrow: 'SESSION DETAIL', detailCompletedTitle: 'A block worth remembering.', detailCancelledTitle: 'A block completed your way.', detailSubtitle: 'A quiet record of one protected focus block.', detailUnavailableTitle: 'Session unavailable', detailUnavailableDetail: 'This session could not be found in local history.', focusedLabel: 'FOCUSED', plannedLabel: 'PLANNED', progressLabel: 'PROGRESS', progressAccessibility: 'percent of planned focus completed' } } }) },
    '@/hooks/use-theme': { useTheme: () => ({ background: '#fff', surface: '#fff', border: '#ddd', text: '#111' }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/theme/tokens': { Palette: { homeLightBackground: '#fff', homeLightSurface: '#fff', homeLightBorder: '#ddd', homeLightAction: '#123', homeLightActionSoft: '#eee', deepNavy: '#123', mintPrimary: '#123', warning: '#900' }, Radius: { card: 16 }, Spacing: { xs: 4, sm: 8, md: 16, lg: 24 } },
  };
  const exports = {};
  runInNewContext(routes[route], { exports, require: name => {
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

test('Session History distinguishes read failure from empty and retries', async () => {
  const app = fixture('list', { readFailures: 1 }); app.render(); await app.settle();
  assert.ok(app.find('Retry loading session history'));
  assert.equal(app.find('No focus sessions recorded yet'), undefined);
  app.find('Retry loading session history').props.onPress(); await app.settle();
  assert.ok(app.find('Read chapter, 20 min, completed'));
});

test('Session History retains its real empty state after a successful empty read', async () => {
  const app = fixture('list', { sessions: [] }); app.render(); await app.settle();
  assert.ok(app.find('No focus sessions recorded yet'));
  assert.equal(app.alerts().length, 0);
});

test('Session Detail read failure has retry, then shows the stored record', async () => {
  const app = fixture('detail', { readFailures: 1 }); app.render(); await app.settle();
  assert.ok(app.find('Retry loading session'));
  app.find('Retry loading session').props.onPress(); await app.settle();
  assert.ok(app.find('COMPLETED Focus session: Read chapter'));
});

test('Session Detail reports a missing ID only after a successful history read', async () => {
  const app = fixture('detail', { sessions: [] }); app.render(); await app.settle();
  assert.equal(app.find('Retry loading session'), undefined);
  assert.ok(app.find('Back to Session History'));
});
