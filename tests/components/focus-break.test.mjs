import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

import * as breakEngine from '../../src/features/focus/break-engine.ts';
import { getBreakCopy } from '../../src/features/localization/break-copy.ts';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/app/focus/break.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });

function fixture({ failure = false, duration = 10, retryFailure = false } = {}) {
  const slots = [];
  let cursor = 0, effects = [], mounted = false, tree, reads = 0, replaced = null;
  const dependencies = {
    react: {
      useState(value) { const index = cursor++; slots[index] ??= { value: typeof value === 'function' ? value() : value }; return [slots[index].value, next => { slots[index].value = typeof next === 'function' ? next(slots[index].value) : next; }]; },
      useRef(value) { return slots[cursor++] ??= { current: value }; },
      useEffect(fn) { if (!mounted) effects.push(fn); },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ back() {}, replace(value) { replaced = value; } }) },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    'react-native': { AppState: { addEventListener: () => ({ remove() {} }) }, Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: value => value }, View: 'View' },
    '@/components/themed-text': { ThemedText: 'Text' }, '@/components/themed-view': { ThemedView: 'View' }, '@/components/ui/button': { Button: 'Button' },
    '@/components/ui/section-heading': { SectionHeading: 'SectionHeading' },
    '@/components/ui/focus-dial': { FocusDial: 'FocusDial' },
    '@/theme/action-colors': { accentTextColor: () => '#FFFFFF' },
    '@/features/settings/settings-storage': { async loadSettings() { reads++; if (failure || (retryFailure && reads > 1)) throw Error('private settings details'); return { defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: duration }; } },
    '@/features/focus/break-engine': breakEngine,
    '@/features/focus/use-break-recovery': {
      useBreakRecovery() {
        const [activeBreak, setBreak] = dependencies.react.useState(null);
        return {
          record: { session: { status: 'paused' }, activeBreak }, loading: false, saving: false,
          failed: false, clockError: false, ready: true,
          projection: activeBreak ? breakEngine.projectBreakTimer(activeBreak, Date.parse(activeBreak.startedAt)) : null,
          start: value => setBreak(breakEngine.createBreakTimer(value)), retry() {},
        };
      },
    },
    '@/features/localization/break-copy': { getBreakCopy },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale: 'en' }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/hooks/use-theme': { useTheme: () => ({ primary: '#2165DF', background: '#fff', surface: '#fff', border: '#ddd' }) },
    '@/constants/theme': { Palette: { homeLightBackground: '#fff', homeLightSurface: '#fff', homeLightBorder: '#ddd', homeLightAction: '#123', homeLightActionSoft: '#eee', navySurfaceElevated: '#eee', deepNavy: '#123', mintPrimary: '#123' }, Radius: { card: 16 }, Spacing: { xs: 4, sm: 8, md: 16, lg: 24 }, Typography: { body: { fontSize: 16 } } },
  };
  const exports = {};
  runInNewContext(outputText, { exports, require(name) { if (!(name in dependencies)) throw Error(`Unexpected dependency ${name}`); return dependencies[name]; }, setInterval, clearInterval });
  function nodes(value) { if (Array.isArray(value)) return value.flatMap(nodes); if (!value || typeof value !== 'object') return []; if (typeof value.type === 'function') return nodes(value.type(value.props)); return [value, ...nodes(value.props?.children)]; }
  return {
    render() { cursor = 0; tree = exports.default(); if (!mounted) { mounted = true; for (const effect of effects) effect(); } return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    find(label) { return nodes(tree).find(node => node.props.accessibilityLabel === label || node.props.label === label || node.props.children === label); },
    hasText(text) { return nodes(tree).some(node => node.props.children === text); },
    replaced: () => replaced,
    ofType: type => nodes(tree).filter(node => node.type === type),
  };
}

test('break uses the saved local default and starts that duration', async () => {
  const app = fixture(); app.render(); await app.settle();
  assert.equal(app.find('10 minute break').props.accessibilityState.selected, true);
  assert.equal(app.find('10 minute break').props.accessibilityState.checked, true);
  assert.equal(app.find('10 minute break').props.children.props.style.color, '#FFFFFF');
  assert.equal(app.find('Start 10-minute break').props.disabled, false);
  app.find('Start 10-minute break').props.onPress(); app.render();
  assert.ok(app.find('Resume Focus'));
  assert.equal(app.ofType('FocusDial')[0].props.value, '10:00');
  assert.equal(app.ofType('FocusDial')[0].props.caption, 'remaining in break');
  assert.equal(app.ofType('FocusDial')[0].props.progress, 0);
  app.find('Resume Focus').props.onPress();
  assert.equal(app.replaced().pathname, '/focus/session');
  assert.equal(app.replaced().params.resume, '1');
});

test('settings read failure is recoverable and allows a clearly manual unsaved choice', async () => {
  const app = fixture({ failure: true }); app.render(); await app.settle();
  assert.ok(app.hasText('Your saved break choice couldn’t be read. Try again, or choose a length below; choosing here won’t overwrite your saved preference.'));
  assert.equal(app.find('Start 5-minute break').props.disabled, true);
  assert.equal(app.find('5 minute break').props.accessibilityState.selected, false);
  app.find('15 minute break').props.onPress(); app.render();
  assert.equal(app.find('15 minute break').props.accessibilityState.selected, true);
  assert.equal(app.find('Start 15-minute break').props.disabled, false);
  app.find('Start 15-minute break').props.onPress(); app.render();
  assert.ok(app.find('Resume Focus'));
});

test('retry clears the read error and never replaces a manual selection', async () => {
  const app = fixture({ failure: true }); app.render(); await app.settle();
  app.find('5 minute break').props.onPress(); app.render();
  app.find('Retry saved choice').props.onPress(); await app.settle();
  assert.equal(app.find('5 minute break').props.accessibilityState.selected, true);
  assert.equal(app.find('10 minute break').props.accessibilityState.selected, false);
});
