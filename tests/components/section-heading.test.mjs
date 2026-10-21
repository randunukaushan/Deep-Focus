import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync('src/components/ui/section-heading.tsx', 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

test('section headings preserve translated content, hide decoration and allow text scaling', () => {
  for (const primary of ['#3B82F6', '#60A5FA']) {
    const exports = {};
    const dependencies = {
      'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
      '@expo/vector-icons': { Ionicons: 'Icon' },
      'react-native': { View: 'View', StyleSheet: { create: styles => styles } },
      '@/components/themed-text': { ThemedText: 'Text' },
      '@/hooks/use-theme': { useTheme: () => ({ primary, surfaceElevated: '#eee', border: '#ddd', textSecondary: '#555' }) },
      '@/theme/tokens': { Radius: { card: 16 }, Spacing: { xs: 4, sm: 8, md: 16 }, Typography: { heading1: { fontSize: 32 } } },
    };
    runInNewContext(outputText, { exports, require(name) {
      assert.ok(name in dependencies, name);
      return dependencies[name];
    } });
    for (const title of ['Make room for what matters.', 'වැදගත් දේ සඳහා ඉඩ සාදන්න.', 'முக்கியமானவற்றுக்கு இடமளிக்கவும்.']) {
      const tree = exports.SectionHeading({ eyebrow: 'Plan', title, subtitle: 'Details', icon: 'calendar-outline' });
      const [kicker, heading, detail] = tree.props.children;
      assert.equal(heading.props.accessibilityRole, 'header');
      assert.equal(heading.props.children, title);
      assert.equal(heading.props.numberOfLines, undefined);
      assert.equal(heading.props.allowFontScaling, undefined);
      assert.equal(detail.props.children, 'Details');
      const decoration = kicker.props.children[0];
      assert.equal(decoration.props.importantForAccessibility, 'no-hide-descendants');
      assert.equal(decoration.props.children.props.color, primary);
    }
  }
  assert.doesNotMatch(source, /height:\s*\d+.*title|allowFontScaling=\{false\}/);
});
