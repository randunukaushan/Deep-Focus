import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/localization/auth-callback-copy.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports });
const { getAuthCallbackCopy } = exports;

test('auth callback copy covers all supported locales and states', () => {
  for (const locale of ['en', 'si', 'ta']) {
    const copy = getAuthCallbackCopy(locale);
    for (const value of Object.values(copy)) assert.equal(typeof value, 'string');
    assert.ok(copy.loadingTitle.length > 0);
    assert.ok(copy.errorTitle.length > 0);
  }
  assert.match(getAuthCallbackCopy('si').errorTitle, /මෙම/);
});
