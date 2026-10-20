import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { focusDialArt } from '../../src/features/focus/focus-dial-art.ts';

test('focus ring clamps and quantizes actual progress without animations or unsafe SVG values', () => {
  assert.equal(focusDialArt(-1, '#DBE5F0', '#2165DF'), focusDialArt(0, '#DBE5F0', '#2165DF'));
  assert.equal(focusDialArt(NaN, '#DBE5F0', '#2165DF'), focusDialArt(0, '#DBE5F0', '#2165DF'));
  assert.equal(focusDialArt(2, '#DBE5F0', '#2165DF'), focusDialArt(1, '#DBE5F0', '#2165DF'));
  assert.equal(focusDialArt(0.501, '#DBE5F0', '#2165DF'), focusDialArt(0.509, '#DBE5F0', '#2165DF'));
  assert.throws(() => focusDialArt(1, 'url(evil)', '#2165DF'), /INVALID/);
  assert.doesNotMatch(focusDialArt(0.5, '#DBE5F0', '#2165DF'), /<animate|<script|NaN/);
});

test('native dial uses non-animated offline SVG and fits timer text at large font scales', () => {
  const ts = createRequire(import.meta.url)('typescript');
  const code = ts.transpileModule(readFileSync('src/components/ui/focus-dial.tsx', 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const fontScale of [1, 2, 3]) {
    const exports = {};
    const deps = {
      'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
      'expo-image': { Image: 'Image' }, react: { useMemo: fn => fn() },
      'react-native': { View: 'View', useWindowDimensions: () => ({ width: 320, fontScale }), StyleSheet: { create: value => value, absoluteFill: {} } },
      '@/components/themed-text': { ThemedText: 'Text' },
      '@/hooks/use-theme': { useTheme: () => ({ border: '#DBE5F0', primary: '#2165DF' }) },
      '@/features/focus/focus-dial-art': { focusDialArt }, '@/theme/tokens': { Spacing: { lg: 24, sm: 8 } },
    };
    runInNewContext(code, { exports, require: name => deps[name] });
    const dial = exports.FocusDial({ value: '25:00', caption: 'Remaining', progress: 0.5 });
    const [decoration, value, caption] = dial.props.children;
    const image = decoration.props.children;
    assert.equal(image.props.transition, 0); assert.equal(image.props.cachePolicy, 'none');
    assert.match(image.props.source.uri, /^data:image\/svg\+xml/);
    assert.equal(value.props.children, '25:00'); assert.equal(caption.props.children, 'Remaining');
    assert.ok(value.props.style[1].fontSize * fontScale * 5 * 0.62 <= dial.props.style[1].width - 39);
  }
});
