import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/accessibility/reduced-motion.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports });
const { animationMode } = exports;

test('reduced motion never requires animation while the preference is unknown or enabled', () => {
  assert.equal(animationMode(null), 'static');
  assert.equal(animationMode(true), 'static');
  assert.equal(animationMode(false), 'animated');
});
