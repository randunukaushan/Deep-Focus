import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/policy/age-eligibility.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports });
const { decideAgeSensitiveAccess } = exports;

test('15–17 features remain development-only until legal review and pilot approval', () => {
  const pending = decideAgeSensitiveAccess('minor_15_17', false, false);
  assert.equal(pending.developmentAllowed, true);
  assert.equal(pending.releaseAllowed, false);
  assert.equal(pending.reason, 'legal_review_required');
  assert.equal(decideAgeSensitiveAccess('minor_15_17', true, true).releaseAllowed, true);
});

test('unknown and under-15 age states fail closed', () => {
  assert.equal(decideAgeSensitiveAccess('unknown', true, true).developmentAllowed, false);
  assert.equal(decideAgeSensitiveAccess('minor_under_15', true, true).releaseAllowed, false);
});
