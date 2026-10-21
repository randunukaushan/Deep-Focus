// Read-only diagnostic of current pure source, not the application's test harness.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePath = 'src/features/focus/session-engine.ts';

try {
  const requireLocal = createRequire(path.join(repo, 'package.json'));
  const ts = requireLocal('typescript');
  const source = fs.readFileSync(path.join(repo, sourcePath), 'utf8');
  const compiled = ts.transpileModule(source, {
    fileName: sourcePath,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  if (compiled.diagnostics?.some((d) => d.category === ts.DiagnosticCategory.Error)) {
    throw new Error('Engine transpilation failed; run the project type check separately.');
  }
  const module = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    module, exports: module.exports,
    require() { throw new Error('Diagnostic only supports the inspected import-free pure engine.'); },
  }, { filename: sourcePath, timeout: 1000 });
  const engine = module.exports;
  for (const name of ['createFocusSession', 'completeFocusSession', 'pauseFocusSession',
    'resumeFocusSession', 'cancelFocusSession', 'projectFocusSession']) {
    if (typeof engine[name] !== 'function') throw new Error(`Missing current engine export: ${name}`);
  }
  const make = () => engine.createFocusSession(25, 'Synthetic task', 0);
  const projection = (session, now, focused, paused, remaining) => {
    const actual = engine.projectFocusSession(session, now);
    assert.equal(actual.focusedSeconds, focused, 'focusedSeconds');
    assert.equal(actual.pausedSeconds, paused, 'pausedSeconds');
    assert.equal(actual.remainingSeconds, remaining, 'remainingSeconds');
  };
  const checks = [
    ['CR-T01', 'full-duration completion', () => {
      const session = engine.completeFocusSession(make(), 1500000);
      assert.equal(session.status, 'completed');
      projection(session, 1500000, 1500, 0, 0);
    }],
    ['CR-T02', 'early completion rejected', () => {
      const session = engine.completeFocusSession(make(), 60000);
      assert.equal(session.status, 'active', 'early request must not complete');
    }],
    ['CR-T03', 'pause/resume arithmetic', () => {
      const paused = engine.pauseFocusSession(make(), 300000);
      const resumed = engine.resumeFocusSession(paused, 420000);
      projection(resumed, 1320000, 1200, 120, 300);
    }],
    ['CR-T04', 'cancelled projection frozen', () => {
      const session = engine.cancelFocusSession(make(), 60000);
      assert.equal(session.status, 'cancelled');
      projection(session, 120000, 60, 0, 1440);
    }],
    ['CR-T05', 'epoch-zero pause preserved', () => {
      const session = engine.pauseFocusSession(make(), 0);
      projection(session, 60000, 0, 60, 1500);
    }],
    ['CR-T06', 'zero duration rejected', () => {
      let rejected = false;
      try {
        const result = engine.createFocusSession(0, undefined, 0);
        rejected = result?.ok === false;
      } catch (error) {
        // Recognize an explicit validation error, not an arbitrary crash.
        rejected = error?.name === 'RangeError' || error?.code === 'INVALID_INPUT';
        if (!rejected) throw error;
      }
      assert.equal(rejected, true, 'zero duration must be validated');
    }],
    ['CR-T07', 'terminal transition immutability', () => {
      const session = engine.completeFocusSession(make(), 1500000);
      const snapshot = JSON.stringify(session);
      const replayed = engine.completeFocusSession(session, 3000000);
      assert.equal(JSON.stringify(replayed), snapshot);
      assert.equal(JSON.stringify(engine.cancelFocusSession(replayed, 3600000)), snapshot);
    }],
    ['CR-T08', 'malformed timestamp rejected', () => {
      let rejected = false;
      try {
        const result = engine.projectFocusSession({ ...make(), startedAt: 'invalid-date' }, 60000);
        rejected = result?.ok === false;
      } catch (error) {
        rejected = error?.code === 'INVALID_RECORD' || error?.name === 'RangeError';
        if (!rejected) throw error;
      }
      assert.equal(rejected, true, 'invalid timestamp must not return a successful projection');
    }],
  ];
  const results = checks.map(([id, name, check]) => {
    try {
      check();
      return { id, name, result: 'PASS' };
    } catch (error) {
      if (!(error instanceof assert.AssertionError)) throw error;
      return { id, name, result: 'CONTRACT_GAP', detail: error.message };
    }
  });
  const gaps = results.filter((item) => item.result === 'CONTRACT_GAP').length;
  console.log(JSON.stringify({
    diagnosticOnly: true, executedAt: new Date().toISOString(), sourcePath,
    nodeVersion: process.version, typescriptVersion: ts.version,
    sourceSha256: createHash('sha256').update(source).digest('hex'),
    scope: 'Eight synthetic pure-engine checks; no React, storage, device, goal, server or reward tests.',
    status: gaps ? 'CONTRACT_GAPS_FOUND' : 'LISTED_CHECKS_PASS',
    checks: results.length, passed: results.length - gaps, gaps, results,
  }, null, 2));
  process.exitCode = gaps ? 1 : 0;
} catch (error) {
  console.error(JSON.stringify({ status: 'DIAGNOSTIC_ERROR', message: error.message }));
  process.exitCode = 2;
}
