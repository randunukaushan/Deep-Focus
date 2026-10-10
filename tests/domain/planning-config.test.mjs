import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/planning/planning-config.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports });
const { DEFAULT_PLANNING_MODEL, resolvePlanningModel, getConfiguredPlanningModel } = exports;

test('planning model is configurable but defaults safely to the local mock', () => {
  assert.equal(resolvePlanningModel(undefined), DEFAULT_PLANNING_MODEL);
  assert.equal(resolvePlanningModel('  approved-test-model  '), 'approved-test-model');
  assert.throws(() => resolvePlanningModel('x'.repeat(121)), /INVALID_PLANNING_MODEL/);
  assert.throws(() => resolvePlanningModel('unsafe\nmodel'), /INVALID_PLANNING_MODEL/);
  assert.equal(getConfiguredPlanningModel(), DEFAULT_PLANNING_MODEL);
});
