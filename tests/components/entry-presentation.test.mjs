import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { getAppLocaleCopy } from '../../src/features/localization/app-locale.ts';
import { getAuthCallbackCopy } from '../../src/features/localization/auth-callback-copy.ts';
import * as tokens from '../../src/theme/tokens.ts';

const ts = createRequire(import.meta.url)('typescript');
const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function fixture(route, { locale = 'en', scheme = 'light', platform = 'android', snapshot = { status: 'booting' } } = {}) {
  const pushes = [], replacements = [];
  const theme = { ...tokens.Colors[scheme], text: tokens.Colors[scheme].textPrimary };
  const dependencies = {
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-native': { ActivityIndicator: 'Indicator', KeyboardAvoidingView: 'KeyboardAvoidingView', Platform: { OS: platform }, Pressable: 'Pressable', ScrollView: 'ScrollView', View: 'View', StyleSheet: { create: value => value } },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    'expo-router': { useRouter: () => ({ push: path => pushes.push(path), replace: path => replacements.push(path) }) },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/deep-focus-scene': { DeepFocusScene: 'Scene' },
    '@/components/ui/button': { Button: 'Button' },
    '@/hooks/use-theme': { useTheme: () => theme },
    '@/hooks/use-color-scheme': { useColorScheme: () => scheme },
    '@/theme/tokens': tokens,
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale, copy: getAppLocaleCopy(locale) }) },
    '@/features/localization/auth-callback-copy': { getAuthCallbackCopy },
    // No Auth mutation/provider method is available to these presentation routes.
    '@/features/auth/auth-context': { useAuth: () => ({ snapshot }) },
  };
  function load(path) {
    const exports = {};
    runInNewContext(compile(path), { exports, require(name) { assert.ok(name in dependencies, `Unexpected dependency ${name}`); return dependencies[name]; } });
    return exports;
  }
  dependencies['@/components/ui/auth-frame'] = load('src/components/ui/auth-frame.tsx');
  const tree = load(`src/app/${route}.tsx`).default();
  function nodes(value) {
    if (Array.isArray(value)) return value.flatMap(nodes);
    if (!value || typeof value !== 'object') return [];
    if (typeof value.type === 'function') return nodes(value.type(value.props));
    return [value, ...nodes(value.props?.children)];
  }
  const all = nodes(tree);
  return {
    ofType: type => all.filter(node => node.type === type),
    text: value => all.find(node => node.type === 'Text' && node.props.children === value),
    button: value => all.find(node => node.type === 'Button' && node.props.label === value),
    pushes, replacements,
  };
}

test('Welcome reuses the original-scene Auth frame and preserves all localized promises/routes', () => {
  for (const locale of ['en', 'si', 'ta']) for (const scheme of ['light', 'dark']) {
    const app = fixture('welcome', { locale, scheme });
    const copy = getAppLocaleCopy(locale).welcome;
    assert.equal(app.ofType('SafeAreaView').length, 1);
    assert.equal(app.ofType('ScrollView')[0].props.contentContainerStyle.flexGrow, 1);
    assert.equal(app.ofType('Scene')[0].props.dark, scheme === 'dark');
    assert.equal(app.text(copy.title).props.accessibilityRole, 'header');
    for (const key of ['subtitle', 'promiseSessions', 'promisePrivacy', 'promisePace']) assert.ok(app.text(copy[key]));
    assert.equal(app.pushes.length, 0);
    app.button(copy.createAccount).props.onPress(); app.button(copy.signIn).props.onPress();
    assert.deepEqual(app.pushes, ['/auth/sign-up', '/auth/sign-in']);
  }
});

test('callback loading remains localized, polite and scrollable with no premature navigation', () => {
  for (const locale of ['en', 'si', 'ta']) {
    const app = fixture('auth/callback', { locale, platform: 'ios' });
    const copy = getAuthCallbackCopy(locale);
    assert.equal(app.ofType('Indicator')[0].props.accessibilityLabel, copy.loadingTitle);
    assert.equal(app.text(copy.loadingDetail).props.accessibilityLiveRegion, 'polite');
    assert.equal(app.ofType('KeyboardAvoidingView')[0].props.behavior, 'padding');
    assert.equal(app.ofType('ScrollView').length, 1);
    assert.equal(app.replacements.length, 0); assert.equal(app.button(copy.backToSignIn), undefined);
  }
});

test('callback failure preserves the safe service message/fallback and assertive alert in the actual frame', () => {
  for (const locale of ['en', 'si', 'ta']) for (const message of [undefined, 'SAFE_SYNTHETIC_OUTCOME']) {
    const app = fixture('auth/callback', { locale, snapshot: { status: 'error', message } });
    const copy = getAuthCallbackCopy(locale);
    const alert = app.text(message ?? copy.errorDetail);
    assert.equal(alert.props.accessibilityRole, 'alert');
    assert.equal(alert.props.accessibilityLiveRegion, 'assertive');
    assert.equal(app.ofType('Indicator').length, 0);
    assert.equal(app.replacements.length, 0);
    app.button(copy.backToSignIn).props.onPress();
    assert.deepEqual(app.replacements, ['/auth/sign-in']);
  }
});
