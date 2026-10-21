import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function load(path, dependencies) {
  const exports = {};
  runInNewContext(compile(path), { exports, require(name) { assert.ok(name in dependencies, `Unexpected dependency ${name}`); return dependencies[name]; } });
  return exports;
}
const tokens = load('src/theme/tokens.ts', {});
const constants = load('src/constants/theme.ts', {
  '@/global.css': {}, '@/theme/tokens': tokens,
  'react-native': { Platform: { select: values => values.default } },
});
const tabs = { home: 'මුල් පිටුව', plan: 'සැලැස්ම', focus: 'අවධානය', progress: 'ප්‍රගතිය', profile: 'පැතිකඩ' };

function render({ appearance, system }) {
  const hook = load('src/hooks/use-color-scheme.ts', {
    'react-native': { useColorScheme: () => system },
    '@/features/settings/presentation-context': { usePresentation: () => ({ preferences: { appearance } }) },
  });
  const NativeTabs = Object.assign(function NativeTabs() {}, {
    Trigger: Object.assign(function Trigger() {}, { Label: 'Label', Icon: 'Icon', VectorIcon: 'VectorIcon' }),
  });
  const layout = load('src/app/(tabs)/_layout.tsx', {
    'expo-router/unstable-native-tabs': { NativeTabs },
    '@expo/vector-icons': { Ionicons: 'Ionicons' },
    '@/hooks/use-color-scheme': hook,
    '@/constants/theme': constants,
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ copy: { tabs } }) },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    // Any direct OS appearance import in this layout must fail the test.
  });
  return layout.default();
}

test('native tab chrome honors saved appearance even when OS theme is the opposite', () => {
  for (const [appearance, system] of [['light', 'dark'], ['dark', 'light']]) {
    const tree = render({ appearance, system });
    assert.equal(tree.props.backgroundColor, tokens.Colors[appearance].background);
    assert.equal(tree.props.indicatorColor, tokens.Colors[appearance].surface);
    assert.equal(tree.props.labelStyle.selected.color, tokens.Colors[appearance].primary);
    assert.equal(tree.props.labelStyle.default.color, tokens.Colors[appearance].textSecondary);
    assert.equal(tree.props.iconColor.selected, tokens.Colors[appearance].primary);
    assert.equal(tree.props.iconColor.default, tokens.Colors[appearance].textSecondary);
    assert.equal(tree.props.tintColor, tokens.Colors[appearance].primary);
    assert.deepEqual(Array.from(tree.props.children, node => node.props.name), Object.keys(tabs));
    assert.deepEqual(Array.from(tree.props.children, node => node.props.children[0].props.children), Object.values(tabs));
  }
});

test('System tab appearance follows OS changes and unspecified falls back to light', () => {
  for (const system of ['dark', 'light', 'unspecified']) {
    const tree = render({ appearance: 'system', system });
    assert.equal(tree.props.backgroundColor, tokens.Colors[system === 'dark' ? 'dark' : 'light'].background);
  }
});

test('root status bar follows app appearance in normal, blocked and preference-error branches', () => {
  for (const scheme of ['light', 'dark']) for (const state of ['normal', 'blocked', 'preference-error']) {
    const dependencies = {
      'expo-router': { DarkTheme: {}, DefaultTheme: {}, Stack: Object.assign(function Stack() {}, { Screen: 'Screen' }), ThemeProvider: 'ThemeProvider', useRouter: () => ({}), useSegments: () => [] },
      'expo-status-bar': { StatusBar: 'StatusBar' },
      'react-native': { ActivityIndicator: 'Indicator', StyleSheet: { create: value => value } },
      react: { useEffect() {}, useRef: initial => ({ current: initial }), useState: initial => [initial, () => {}] },
      '@/hooks/use-color-scheme': { useColorScheme: () => scheme },
      '@/features/settings/presentation-context': { PresentationProvider: 'PresentationProvider' },
      '@/components/animated-icon': { AnimatedSplashOverlay: 'Splash' },
      '@/components/ui/button': { Button: 'Button' },
      '@/components/themed-text': { ThemedText: 'Text' }, '@/components/themed-view': { ThemedView: 'View' },
      '@/constants/theme': constants,
      '@/features/auth/auth-context': { AuthProvider: 'AuthProvider', useAuth: () => ({ snapshot: { status: 'signed_in', userId: 'synthetic' } }) },
      '@/features/focus/session-storage': {},
      '@/features/auth/auth-routing': { authRouteDecision: () => ({ blocked: state === 'blocked' }) },
      '@/features/localization/app-locale-context': { AppLocaleProvider: 'LocaleProvider', useAppLocale: () => ({ copy: { settingsPage: {}, signIn: {} } }) },
      '@/features/localization/app-locale': {},
      '@/features/onboarding/onboarding-context': { OnboardingProvider: 'OnboardingProvider', useOnboarding: () => ({ state: {}, loading: false, error: state === 'preference-error' }) },
      'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    };
    const exports = {};
    // Expose the private render function only inside this VM; production exports stay unchanged.
    runInNewContext(compile('src/app/_layout.tsx') + '\nexports.testNavigator = RootNavigator;', {
      exports, require(name) { assert.ok(name in dependencies, `Unexpected dependency ${name}`); return dependencies[name]; },
    });
    const tree = exports.testNavigator();
    const bar = tree.props.children.find(node => node.type === 'StatusBar');
    assert.equal(bar.props.style, scheme === 'dark' ? 'light' : 'dark');
  }
});
