import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../../src/components/ui/button.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const dependencies = {
  'react/jsx-runtime': {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
  },
  'react-native': {
    ActivityIndicator: 'ActivityIndicator',
    Pressable: 'Pressable',
    StyleSheet: { create: (styles) => styles },
    Text: 'Text',
  },
  '@/hooks/use-theme': { useTheme: () => ({ backgroundElement: '#ddd', text: '#222', textSecondary: '#555' }) },
  '@/theme/tokens': {
    LetterSpacingEm: { button: 0 },
    LineHeightRatio: { body: 1.5 },
    Palette: { deepNavy: '#001', error: '#f00', lightSurface: '#fff', mintPrimary: '#0af' },
    Radius: { card: 8 },
    Spacing: { md: 12, sm: 8 },
    Typography: { button: { fontSize: 16, fontWeight: '600' } },
  },
};
const exports = {};
runInNewContext(outputText, {
  exports,
  require(name) {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  },
});
const { Button } = exports;

test('loading button keeps its action context and exposes one accessible loading name', () => {
  const element = Button({ label: 'Save changes', loading: true, onPress() {} });
  assert.equal(element.type, 'Pressable');
  assert.equal(element.props.accessibilityLabel, 'Save changes, loading');
  assert.equal(element.props.accessibilityState.busy, true);
  assert.equal(element.props.accessibilityState.disabled, true);
  assert.equal(element.props.disabled, true);
  assert.equal(element.props.children[0].type, 'ActivityIndicator');
  assert.equal(element.props.children[0].props.accessibilityElementsHidden, true);
  assert.equal(element.props.children[1].props.children, 'Save changes');
});

test('loading button accepts localized accessibility copy and custom action labels', () => {
  const element = Button({ label: 'Save', accessibilityLabel: 'Save preferences', loadingAccessibilityLabel: 'Preferencias guardándose', loading: true });
  assert.equal(element.props.accessibilityLabel, 'Preferencias guardándose');
  assert.equal(element.props.accessibilityState.busy, true);
});

test('idle button keeps its normal accessible name and enabled state', () => {
  const element = Button({ label: 'Save changes', onPress() {} });
  assert.equal(element.props.accessibilityLabel, 'Save changes');
  assert.equal(element.props.accessibilityState.busy, false);
  assert.equal(element.props.accessibilityState.disabled, false);
  assert.equal(element.props.disabled, false);
});
