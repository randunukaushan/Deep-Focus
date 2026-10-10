import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/app/profile/settings.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });

function fixture({ initial = 10, loadFailures = 0, saveFailures = 0, saveGate } = {}) {
  const slots = [];
  let cursor = 0, effect, mounted = false, tree, stored = { focus: 25, break: initial, locale: 'en' }, writes = 0;
  const dependencies = {
    react: {
      useState(value) { const index = cursor++; slots[index] ??= { value: typeof value === 'function' ? value() : value }; return [slots[index].value, next => { slots[index].value = typeof next === 'function' ? next(slots[index].value) : next; }]; },
      useRef(value) { return slots[cursor++] ??= { current: value }; },
      useEffect(fn) { if (!mounted) effect = fn; },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => ({ back() {}, push() {} }) },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { Pressable: 'Pressable', ScrollView: 'ScrollView', StyleSheet: { create: value => value }, View: 'View' },
    '@/components/themed-text': { ThemedText: 'Text' }, '@/components/themed-view': { ThemedView: 'View' },
    '@/features/settings/settings-storage': {
      async loadSettings() { if (loadFailures-- > 0) throw Error('private settings detail'); return { defaultFocusDurationMinutes: stored.focus, defaultBreakDurationMinutes: stored.break, uiLocale: stored.locale }; },
      async saveSettings(value) { writes++; if (saveGate) await saveGate(); if (saveFailures-- > 0) throw Error('private settings detail'); stored = { focus: value.defaultFocusDurationMinutes, break: value.defaultBreakDurationMinutes, locale: value.uiLocale }; },
    },
    '@/features/localization/app-locale': { getAppLocaleCopy: () => ({ settingsPage: { back: 'Profile', eyebrow: 'SETTINGS', title: 'Set a calmer default.', subtitle: 'Choose how Deep Focus should support your attention.', loading: 'Loading your saved settings…', loadErrorTitle: 'Your settings are unchanged.', loadErrorDetail: 'Saved preferences could not be read. No default was saved over them.', retry: 'Try again', focusSection: 'FOCUS', focusDuration: 'Default focus duration', focusHint: 'Used for new focus sessions. Changes are confirmed after they save.', saving: 'Saving your choice…', breakDuration: 'Default break duration', breakHint: 'Used for future breaks. Changes are confirmed after they save.', saveError: 'Your change wasn’t saved. Your previous choice is still selected. Try again.', appearanceSection: 'APPEARANCE & ACCESSIBILITY', appearance: 'Appearance', systemTheme: 'System · follows your device theme', reducedMotion: 'Reduced motion', reducedMotionDetail: 'Follows your device accessibility preference', languageDetailSuffix: 'Full translation and accessibility review are still pending.', notificationsSection: 'NOTIFICATIONS & FEEDBACK', notifications: 'Notifications', notificationsDetail: 'Notification scheduling is not configured yet', sound: 'Sound & haptics', soundDetail: 'Feedback controls will be available with session feedback', privacySection: 'PRIVACY & ACCOUNT', localFirst: 'Local-first data', localFirstDetail: 'Your focus sessions remain on this device while sync is not configured.', account: 'Account', accountDetail: 'Sign in when account access is available' } }) },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ setLocale() {}, copy: { settings: { language: 'App language', languageHint: 'Choose a saved interface preference.' } } }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/hooks/use-theme': { useTheme: () => ({ background: '#fff', surface: '#fff', border: '#ddd' }) },
    '@/theme/tokens': { Palette: { homeLightBackground: '#fff', homeLightSurface: '#fff', homeLightBorder: '#ddd', homeLightAction: '#123', homeLightActionSoft: '#eee', deepNavy: '#123', mintPrimary: '#123', error: '#f00' }, Radius: { card: 16 }, Spacing: { xs: 4, sm: 8, md: 16, lg: 24 } },
  };
  const exports = {};
  runInNewContext(outputText, { exports, require(name) { if (!(name in dependencies)) throw Error(`Unexpected dependency ${name}`); return dependencies[name]; } });
  function nodes(value) { if (Array.isArray(value)) return value.flatMap(nodes); if (!value || typeof value !== 'object') return []; if (typeof value.type === 'function') return nodes(value.type(value.props)); return [value, ...nodes(value.props?.children)]; }
  return {
    render() { cursor = 0; tree = exports.default(); if (!mounted) { mounted = true; effect(); } return this; },
    async settle() { await new Promise(setImmediate); return this.render(); },
    find(label) { return nodes(tree).find(node => node.props.accessibilityLabel === label || node.props.children === label); },
    hasText(text) { return nodes(tree).some(node => node.props.children === text); },
    writes: () => writes,
    stored: () => stored.break,
  focusStored: () => stored.focus,
    localeStored: () => stored.locale,
  };
}

test('Settings loads the saved choice and saves a new choice before marking it selected', async () => {
  const app = fixture(); app.render();
  assert.ok(app.find('Loading your saved settings…'));
  await app.settle();
  assert.equal(app.find('Default break duration: 10m').props.accessibilityState.selected, true);
  app.find('Default break duration: 15m').props.onPress(); await app.settle();
  assert.equal(app.stored(), 15);
  assert.equal(app.focusStored(), 25);
  assert.equal(app.find('Default break duration: 15m').props.accessibilityState.selected, true);
  assert.equal(app.writes(), 1);
});

test('Settings write failure keeps the prior value selected and permits an explicit retry', async () => {
  const app = fixture({ saveFailures: 1 }); app.render(); await app.settle();
  app.find('Default break duration: 5m').props.onPress(); await app.settle();
  assert.equal(app.stored(), 10);
  assert.equal(app.find('Default break duration: 10m').props.accessibilityState.selected, true);
  assert.ok(app.hasText('Your change wasn’t saved. Your previous choice is still selected. Try again.'));
  app.find('Default break duration: 5m').props.onPress(); await app.settle();
  assert.equal(app.stored(), 5);
  assert.equal(app.find('Default break duration: 5m').props.accessibilityState.selected, true);
  assert.equal(app.writes(), 2);
});

test('Settings read failure does not show a fabricated default and retries safely', async () => {
  const app = fixture({ loadFailures: 1 }); app.render(); await app.settle();
  assert.ok(app.find('Your settings are unchanged.'));
  assert.equal(app.find('Default break duration: 5m'), undefined);
  app.find('Try again').props.onPress(); await app.settle();
  assert.equal(app.find('Default break duration: 10m').props.accessibilityState.selected, true);
});

test('duplicate setting writes are ignored while the first save remains pending', async () => {
  let resolve;
  const app = fixture({ saveGate: () => new Promise(done => { resolve = done; }) }); app.render(); await app.settle();
  const choose = app.find('Default break duration: 15m').props.onPress;
  const first = choose(); const second = choose();
  assert.equal(app.writes(), 1);
  resolve(); await Promise.all([first, second]); app.render();
  assert.equal(app.stored(), 15);
});

test('Settings saves the default focus duration without changing the break duration', async () => {
  const app = fixture({ initial: 10 }); app.render(); await app.settle();
  assert.equal(app.find('Default focus duration: 25m').props.accessibilityState.selected, true);
  app.find('Default focus duration: 45m').props.onPress(); await app.settle();
  assert.equal(app.focusStored(), 45);
  assert.equal(app.stored(), 10);
  assert.equal(app.find('Default focus duration: 45m').props.accessibilityState.selected, true);
});

test('Settings saves the selected interface locale without changing timer defaults', async () => {
  const app = fixture({ initial: 10 }); app.render(); await app.settle();
  assert.equal(app.find('App language: සිංහල').props.accessibilityState.selected, false);
  app.find('App language: සිංහල').props.onPress(); await app.settle();
  assert.equal(app.localeStored(), 'si');
  assert.equal(app.focusStored(), 25);
  assert.equal(app.stored(), 10);
  assert.equal(app.find('App language: සිංහල').props.accessibilityState.selected, true);
});
