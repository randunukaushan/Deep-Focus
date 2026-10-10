import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

import { ASSESSMENT_QUESTIONS, buildAssessmentProfile } from '../../src/features/assessment/assessment-definition.ts';

const ts = createRequire(import.meta.url)('typescript');
const theme = {
  Palette: { deepNavy: '#123', homeLightBackground: '#fff', homeLightSurface: '#fff', homeLightBorder: '#ddd', homeLightAction: '#123', homeLightActionSoft: '#eee', navySurfaceElevated: '#eee', mintPrimary: '#123' },
  Radius: { card: 16 }, Spacing: { xs: 4, sm: 8, md: 16, lg: 24 }, Typography: { body: { fontSize: 16 } },
};

function fixture(routePath, initialAnswers = {}) {
  const source = readFileSync(new URL(routePath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const slots = [];
  let cursor = 0, tree, answers = initialAnswers;
  const navigation = [];
  const router = { push: path => navigation.push(['push', path]), replace: path => navigation.push(['replace', path]), back: () => navigation.push(['back']) };
  const dependencies = {
    react: {
      useState(initial) { const index = cursor++; slots[index] ??= { value: initial }; return [slots[index].value, next => { slots[index].value = typeof next === 'function' ? next(slots[index].value) : next; }]; },
      useMemo(create) { return create(); },
    },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'expo-router': { useRouter: () => router },
    '@expo/vector-icons': { Ionicons: 'Icon' },
    'react-native': { Pressable: 'Pressable', ScrollView: 'ScrollView', View: 'View', StyleSheet: { create: value => value } },
    '@/components/themed-text': { ThemedText: 'Text' },
    '@/components/themed-view': { ThemedView: 'View' },
    '@/components/ui/button': { Button: 'Button' },
    '@/constants/theme': theme,
    '@/hooks/use-color-scheme': { useColorScheme: () => 'light' },
    '@/hooks/use-theme': { useTheme: () => ({ background: '#fff', surface: '#fff', border: '#ddd', text: '#123' }) },
    '@/features/assessment/assessment-flow-context': { useAssessmentFlow: () => ({ answers, setAnswers: value => { answers = value; }, clearAnswers: () => { answers = {}; }, flowState: 'ready', errorMessage: null, retryPersistence: () => {} }) },
    '@/features/assessment/assessment-definition': { ASSESSMENT_QUESTIONS, buildAssessmentProfile },
    '@/features/assessment/assessment-personalization': { buildAssessmentSettingsSuggestion: () => ({ defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5 }) },
    '@/features/assessment/assessment-settings-application': { applyAssessmentSettings: async () => ({ defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5 }) },
    '@/features/localization/app-locale': { getAppLocaleCopy: () => ({ onboarding: { assessment: { backOnboarding: 'Onboarding', previous: 'Previous question', eyebrow: 'PERSONAL ASSESSMENT', title: 'A few questions, at your pace.', subtitle: 'There are no wrong answers. Choose what feels closest, or go back and change it.', loading: 'Loading your saved answers…', error: 'We could not save your answer. Your choice is still shown. Retry when ready.', choices: 'Answer choices', viewProfile: 'View My Profile', next: 'Next question', retry: 'Retry saving answer', skip: 'Skip assessment', privacy: 'Your answers are used to prepare suggestions for your review.' }, profile: { back: 'Assessment', eyebrow: 'YOUR PROFILE', title: 'Your starting point.', noAnswers: 'Your preferences have not been collected.', noAnswersDetail: 'You can start the optional assessment, or continue with the app’s standard settings.', start: 'Start Personal Assessment', continueDefaults: 'Continue with defaults', subtitle: 'These are the choices you shared for this assessment. They are not long-term conclusions.', shared: 'WHAT YOU SHARED', sharedDetail: 'Your choice for this assessment', suggestions: 'SUGGESTIONS TO REVIEW', suggestionDetail: 'Optional starting idea; nothing is applied', saved: 'Saved on this device', savedDetail: 'Your answers are saved in the local app database so this flow can be restored. Suggestions are only applied after you confirm.', saving: 'Saving your latest choice…', saveError: 'Your latest choice could not be saved. The saved version is kept. You can retry.', retry: 'Retry saving answer', review: 'Review before applying', reviewDetail: 'This would set future focus blocks to {focus} minutes and breaks to {break} minutes. It will not change existing tasks or a running session.', applied: 'Applied to your local settings.', applyError: 'Could not apply the suggestion. Your previous settings are unchanged. Try again.', apply: 'Apply suggestions to my settings', appliedButton: 'Settings applied', startFocus: 'Start a Focus Session', useDefaults: 'Use the app’s standard settings' } } }) },
    '@/features/localization/app-locale-context': { useAppLocale: () => ({ copy: {} }) },
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
  const app = {
    render() { cursor = 0; tree = exports.default(); return app; },
    find(name) { return nodes(tree).find(node => node.props.label === name || node.props.accessibilityLabel === name); },
    texts() { return nodes(tree).filter(node => node.type === 'Text').map(node => node.props.children).filter(value => typeof value === 'string'); },
    get answers() { return answers; },
    navigation,
  };
  return app;
}

test('assessment route requires each answer, preserves choices when going back, and offers seven questions', () => {
  const app = fixture('../../src/app/onboarding/assessment.tsx').render();
  assert.ok(app.texts().includes('1 of 7'));
  assert.equal(app.find('Next question').props.disabled, true);
  const first = ASSESSMENT_QUESTIONS[0].options[0];
  app.find(first.label).props.onPress(); app.render();
  assert.equal(app.find('Next question').props.disabled, false);
  app.find('Next question').props.onPress(); app.render();
  assert.ok(app.texts().includes('2 of 7'));
  app.find('Onboarding').props.onPress(); app.render();
  assert.equal(app.find(first.label).props.accessibilityState.selected, true);
  assert.ok(app.texts().includes('1 of 7'));

  for (let index = 0; index < ASSESSMENT_QUESTIONS.length; index += 1) {
    const choice = ASSESSMENT_QUESTIONS[index].options[0];
    app.find(choice.label).props.onPress(); app.render();
    const button = index === ASSESSMENT_QUESTIONS.length - 1 ? 'View My Profile' : 'Next question';
    assert.equal(app.find(button).props.disabled, false);
    app.find(button).props.onPress(); app.render();
  }
  assert.deepEqual(app.navigation.at(-1), ['push', '/onboarding/productivity-profile']);
  assert.equal(Object.keys(app.answers).length, 7);
});

test('assessment skip discards transient answers and returns to default app use', () => {
  const app = fixture('../../src/app/onboarding/assessment.tsx').render();
  app.find(ASSESSMENT_QUESTIONS[0].options[0].label).props.onPress(); app.render();
  app.find('Skip assessment').props.onPress(); app.render();
  assert.equal(Object.keys(app.answers).length, 0);
  assert.deepEqual(app.navigation.at(-1), ['replace', '/(tabs)/home']);
});

test('profile route is honest when no answers exist and only renders a preview for valid answers', () => {
  const empty = fixture('../../src/app/onboarding/productivity-profile.tsx').render();
  assert.ok(empty.find('Start Personal Assessment'));
  assert.ok(empty.find('Continue with defaults'));

  const answers = Object.fromEntries(ASSESSMENT_QUESTIONS.map(question => [question.id, question.options[0].id]));
  const completed = fixture('../../src/app/onboarding/productivity-profile.tsx', answers).render();
  assert.ok(completed.texts().includes('Saved on this device'));
  assert.ok(completed.find('Use the app’s standard settings'));
  assert.equal(completed.texts().includes('A steady, flexible rhythm.'), false);
});

test('profile route requires explicit confirmation before applying bounded settings suggestions', async () => {
  const answers = Object.fromEntries(ASSESSMENT_QUESTIONS.map(question => [question.id, question.options[0].id]));
  const app = fixture('../../src/app/onboarding/productivity-profile.tsx', answers).render();
  assert.ok(app.find('Apply suggestions to my settings'));
  assert.equal(app.texts().includes('Applied to your local settings.'), false);
  await app.find('Apply suggestions to my settings').props.onPress();
  app.render();
  assert.ok(app.find('Settings applied'));
});
