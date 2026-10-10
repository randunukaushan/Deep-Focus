import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/localization/auth-runtime-copy.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports });
const { getAuthRuntimeCopy } = exports;

test('auth runtime copy covers every supported locale and has a safe fallback', () => {
  for (const locale of ['en', 'si', 'ta']) {
    const copy = getAuthRuntimeCopy(locale);
    for (const value of Object.values(copy)) assert.equal(typeof value, 'string');
    assert.ok(copy.sessionRestoreFailed.length > 0);
  }
  assert.equal(getAuthRuntimeCopy('invalid').configurationUnavailable, getAuthRuntimeCopy('en').configurationUnavailable);
  assert.match(getAuthRuntimeCopy('si').invalidLink, /ඇතුල්වීමේ/);
});
