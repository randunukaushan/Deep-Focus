import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { SETUP_QUESTIONS, setupReview } from '../../src/features/onboarding/setup-definition.ts';
const ts = createRequire(import.meta.url)('typescript');
const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const copies = {};
runInNewContext(compile('src/features/onboarding/setup-copy.ts'), { exports: copies });
const current = { defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5, appearance: 'system', reduceMotion: false };

function fixture(screen, locale = 'en', initial = {}) {
  const slots = [], effects = [], calls = [];
  let cursor = 0, tree;
  const flow = {
    status: 'ready', error: null, answers: {}, current: { ...current }, questionIndex: 0, ...initial,
    async answer(id, value) { calls.push(['answer', id, value]); this.answers = { ...this.answers, [id]: value }; return true; },
    async saveLocale(value) { calls.push(['locale', value]); return true; },
    async ensureDraft() { calls.push(['draft']); return true; },
    async retry() { calls.push(['retry']); return true; },
    async reload() { calls.push(['reload']); return true; },
    move(index) { this.questionIndex = index; return true; },
    async apply(fields) { calls.push(['apply', [...fields]]); this.status = 'applied'; return true; },
  };
  const react = {
    useRef(value) { const i = cursor++; return slots[i] ??= { current: value }; },
    useState(value) { const i = cursor++; slots[i] ??= { value }; return [slots[i].value, next => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }]; },
    useEffect(fn, deps) { const i = cursor++; if (!slots[i] || deps.some((value, n) => value !== slots[i].deps[n])) { slots[i] = { deps }; effects.push(fn); } },
  };
  const jsx = (type, props) => ({ type, props });
  const navigation = [];
  const deps = {
    react, 'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-native': { Pressable: 'Pressable', View: 'View', ScrollView: 'ScrollView', StyleSheet: { create: x => x } },
    'react-native-safe-area-context': { SafeAreaView: 'SafeAreaView' },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'expo-router': { useRouter: () => ({ replace: path => navigation.push(path) }) },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/deep-focus-scene': { DeepFocusScene: 'Scene' },
    '@/components/ui/button': { Button: 'Button' },
    '@/theme/tokens': { Palette: { deepNavy: '#123', lightSurface: '#fff' }, Radius: { card: 16 }, Spacing: { sm: 8, md: 16, lg: 24 } },
    '@/hooks/use-theme': { useTheme: () => ({ primary: '#2165df', background: '#fff', surface: '#fff', border: '#ddd' }) },
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ locale, setLocale: value => { locale = value; } }) },
    '@/features/settings/presentation-context': { usePresentation: () => ({ retry: () => calls.push(['presentation']) }) },
    './setup-copy': copies, './setup-definition': { SETUP_QUESTIONS, setupReview },
    './setup-context': { useSetup: () => flow },
    './onboarding-context': { useOnboarding: () => ({
      beginAssessment: async () => calls.push(['begin']),
      setStep: async step => calls.push(['step', step]),
      skip: async () => calls.push(['skip']),
      refresh: async () => calls.push(['refresh']),
    }) },
  };
  const ui = {};
  runInNewContext(compile('src/features/onboarding/setup-ui.tsx'), { exports: ui, require: name => { assert.ok(name in deps, name); return deps[name]; } });
  deps['./setup-ui'] = ui;
  const screens = {};
  runInNewContext(compile('src/features/onboarding/setup-screens.tsx'), { exports: screens, require: name => { assert.ok(name in deps, name); return deps[name]; } });
  function nodes(value) {
    if (Array.isArray(value)) return value.flatMap(nodes);
    if (!value || typeof value !== 'object') return [];
    if (typeof value.type === 'function') return nodes(value.type(value.props));
    return [value, ...nodes(value.props?.children)];
  }
  const app = {
    render() { cursor = 0; tree = screens[screen](); effects.splice(0).forEach(fn => fn()); return app; },
    find(label) { return nodes(tree).find(n => n.props?.label === label || n.props?.accessibilityLabel === label || n.props?.accessibilityLabel?.startsWith(label + '. ')); },
    texts() { return nodes(tree).filter(n => n.type === 'Text').map(n => n.props.children).flat(); },
    async press(label) { const node = app.find(label); assert.ok(node, label); assert.notEqual(node.props.disabled, true, label); node.props.onPress(); await new Promise(setImmediate); return app.render(); },
    flow, calls, navigation, copy: () => copies.getSetupCopy(locale),
  };
  return app.render();
}

test('language is the first of five steps, saved before draft creation and navigation', async () => {
  const app = fixture('SetupWelcomeScreen');
  assert.ok(app.texts().includes('Step 1 of 5'));
  for (const name of ['සිංහල', 'தமிழ்', 'English']) assert.ok(app.find(name));
  await app.press('Continue');
  assert.deepEqual(app.calls, [['locale', 'en'], ['draft'], ['begin']]);
  assert.deepEqual(app.navigation, ['/onboarding/assessment']);
});

test('four real preference questions retain Back choices and never auto-advance on selection', async () => {
  const app = fixture('SetupQuestionsScreen');
  assert.ok(app.texts().includes('Step 2 of 5'));
  assert.equal(app.find('Continue').props.disabled, true);
  await app.press(app.copy().questions.focus_duration.options['60']);
  assert.equal(app.flow.questionIndex, 0);
  await app.press('Continue');
  assert.equal(app.flow.questionIndex, 1);
  await app.press('Skip this question');
  assert.equal(app.flow.answers.break_duration, 'keep');
  assert.equal(app.flow.questionIndex, 2);
  await app.press('Back');
  assert.equal(app.flow.questionIndex, 1);
  await app.press('Back');
  assert.equal(app.flow.answers.focus_duration, '60');
  assert.equal(app.flow.questionIndex, 0);
});

test('save/load failures disable progression and expose Retry without losing the shown answers', async () => {
  const app = fixture('SetupQuestionsScreen', 'en', { status: 'error', error: 'save', answers: { focus_duration: '60' } });
  assert.equal(app.find('Continue').props.disabled, true);
  assert.ok(app.texts().some(text => typeof text === 'string' && text.includes('Could not save')));
  await app.press('Retry');
  assert.deepEqual(app.flow.answers, { focus_duration: '60' });
  assert.ok(app.calls.some(call => call[0] === 'retry'));
});

test('review starts unchecked and applies only explicitly selected fields', async () => {
  const app = fixture('SetupReviewScreen', 'en', { answers: { focus_duration: '60', appearance: 'dark' } });
  assert.equal(app.find('Apply selected changes').props.disabled, true);
  const focus = app.find('Focus duration');
  assert.ok(focus.props.accessibilityLabel.includes('25 minutes'));
  assert.ok(focus.props.accessibilityLabel.includes('60 minutes'));
  assert.equal(focus.props.accessibilityRole, 'checkbox');
  assert.equal(focus.props.accessibilityState.checked, false);
  await app.press('Appearance');
  await app.press('Apply selected changes');
  assert.deepEqual(app.calls.find(call => call[0] === 'apply'), ['apply', ['appearance']]);
  assert.ok(app.calls.some(call => call[0] === 'presentation'));
  assert.ok(app.calls.some(call => call[0] === 'refresh'));
  assert.deepEqual(app.navigation, ['/(tabs)/home']);
});

test('skip keeps the draft; unchanged review completes with an empty patch, not defaults', async () => {
  const app = fixture('SetupQuestionsScreen', 'en', { answers: { focus_duration: '60' } });
  await app.press('Set up later · keep my draft');
  assert.equal(app.flow.answers.focus_duration, '60');
  assert.ok(app.calls.some(call => call[0] === 'skip'));
  const review = fixture('SetupReviewScreen');
  assert.ok(review.texts().includes('No settings need to change.'));
  await review.press('Continue without changes');
  assert.deepEqual(review.calls.find(call => call[0] === 'apply'), ['apply', []]);
});

test('localized copy covers all four questions, review labels and the five-step counter', () => {
  for (const locale of ['en', 'si', 'ta']) {
    const copy = copies.getSetupCopy(locale);
    for (const question of SETUP_QUESTIONS) {
      const app = fixture('SetupQuestionsScreen', locale, { questionIndex: SETUP_QUESTIONS.indexOf(question) });
      assert.ok(app.texts().includes(copy.questions[question.id].title));
      assert.ok(app.texts().includes(copy.step.replace('{current}', String(SETUP_QUESTIONS.indexOf(question) + 2))));
      for (const option of question.options) assert.ok(app.find(option === 'keep' ? copy.keep : copy.questions[question.id].options[option]));
    }
  }
});

test('actual routes export the new screens and owner-keyed layout no longer mounts the legacy flow', () => {
  for (const [file, name] of [['index', 'SetupWelcomeScreen'], ['assessment', 'SetupQuestionsScreen'], ['productivity-profile', 'SetupReviewScreen']]) {
    assert.match(readFileSync('src/app/onboarding/' + file + '.tsx', 'utf8'), new RegExp(name + ' as default'));
  }
  const layout = readFileSync('src/app/onboarding/_layout.tsx', 'utf8');
  assert.match(layout, /SetupProvider key=/);
  assert.doesNotMatch(layout, /AssessmentFlowProvider/);
});
