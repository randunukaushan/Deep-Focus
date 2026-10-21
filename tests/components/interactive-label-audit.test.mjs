import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return fullPath.endsWith('.tsx') ? [fullPath] : [];
  });
}

function unlabeledControls(source) {
  const root = ts.createSourceFile('screen.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const missing = [];
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(root);
      if (['Pressable', 'TextInput'].includes(tag)) {
        const label = node.attributes.properties.find(attribute => ts.isJsxAttribute(attribute) && attribute.name.getText(root) === 'accessibilityLabel');
        if (!label?.initializer || (ts.isStringLiteral(label.initializer) && !label.initializer.text.trim())) missing.push(tag);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(root);
  return missing;
}

test('interactive Pressable and TextInput controls expose accessible names', () => {
  const files = sourceFiles(path.resolve('src/app'));
  const missing = files.flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    return unlabeledControls(source).map(tag => `${file}:${tag}`);
  });

  assert.deepEqual(missing, []);
});

test('label audit checks real JSX, not type arguments or an arbitrary source-length window', () => {
  assert.deepEqual(unlabeledControls('const ref = useRef<TextInput>(null); const view = <TextInput accessibilityLabel={copy.email} />;'), []);
  assert.deepEqual(unlabeledControls(`<TextInput placeholder="${'x'.repeat(800)}" accessibilityLabel="Email" />`), []);
  assert.deepEqual(unlabeledControls('<><TextInput /><Pressable accessibilityLabel="" /><TextInput accessibilityLabel="Email" /></>'), ['TextInput', 'Pressable']);
});
