import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// This verifies the dated document pack, not any product security control.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = 'ecd6d348093292c27b06751815eb09694a41665a';
const original = '87e995e27df3e383a6fb646883a2adbc3ebb64cb';
const normalize = value => value.replace(/\r\n/g, '\n').trimEnd();
const read = path => readFileSync(join(root, path), 'utf8');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trimEnd();
const pack = 'docs/assurance';
const current = readdirSync(join(root, pack)).filter(name => name.endsWith('.md')).map(name => `${pack}/${name}`);
const historical = readdirSync(join(root, pack, 'historical')).map(name => `${pack}/historical/${name}`);
const files = [...current, ...historical, 'docs/revision/evidence/PR15-ASSURANCE-RECONCILIATION-2026-10-22.md', 'docs/DOCUMENTATION_MAP.md', 'docs/CHANGELOG.md'];
let links = 0;
let tables = 0;
for (const file of files) {
  const text = read(file);
  assert.equal((text.match(/^```/gm) ?? []).length % 2, 0, `fences: ${file}`);
  assert(!/^(<<<<<<< |=======|>>>>>>> )/m.test(text), `conflict: ${file}`);
  for (const match of text.matchAll(/(?<!!)\[[^\]]+\]\(((?:[^()\s]|\([^()]*\))+)\)/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const path = decodeURIComponent(target.split('#')[0]);
    assert(existsSync(resolve(root, dirname(file), path)), `broken link ${file}: ${target}`);
    links++;
  }
  // Historical table formatting is preserved, not silently rewritten.
  if (!file.startsWith(`${pack}/`) || historical.includes(file)) continue;
  let width = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('|')) { width = 0; continue; }
    const cells = line.split(/(?<!\\)\|/).length;
    if (!width) { width = cells; tables++; }
    assert.equal(cells, width, `table width: ${file}: ${line}`);
  }
}
assert.equal(current.length, 10, 'nine original documents plus pack README');
assert.equal(historical.length, 3);
for (const file of current) assert(read(file).includes(baseline), `named baseline: ${file}`);
for (const file of historical) {
  const name = file.split('/').at(-1).replace('-2026-10-06.md', '.md');
  const old = git(['show', `${original}:${pack}/${name}`]);
  // Git may check out CRLF on Windows. Normalize before locating the banner
  // boundary, then compare both checkout styles with the independent Git blob.
  const snapshot = normalize(read(file));
  for (const variant of [snapshot, snapshot.replace(/\n/g, '\r\n')]) {
    const body = normalize(variant).split('\n---\n\n').slice(1).join('\n---\n\n');
    assert.equal(normalize(body), normalize(old), `historical body changed: ${file}`);
  }
}
const unchanged = ['AGENTS.md', 'docs/AI_RULES.md', 'docs/ai', 'docs/V1_FEATURE_SCOPE.md', 'docs/V1_IMPLEMENTATION_PLAN.md', 'app.json', 'eas.json', 'package.json', 'package-lock.json', 'src', 'tests', 'web'];
assert.equal(git(['diff', '--name-only', baseline, '--', ...unchanged]), '', 'non-task source/config/governance/scope delta');
const manifest = JSON.parse(read('package.json'));
assert.equal(manifest.dependencies.expo, '~56.0.23');
assert.equal(manifest.dependencies['react-native'], '0.85.3');
const config = JSON.parse(read('app.json')).expo;
assert.equal(config.android.package, 'com.randunukaushan9.DeepFocus');
assert.equal(config.ios.bundleIdentifier, undefined);
assert(config.ios.icon);
const oldConfig = JSON.parse(git(['show', `${original}:app.json`])).expo;
assert.equal(config.extra.eas.projectId, oldConfig.extra.eas.projectId, 'historical EAS text mismatch disposition');
assert.match(read('src/features/storage/local-database.ts'), /SCHEMA_VERSION\s*=\s*21/);
assert.match(read('src/features/focus/session-engine.ts'), /if \(projection\.remainingSeconds > 0\) return session;/);
for (const [file, prefix, count] of [
  ['DEEP_FOCUS_EVIDENCE_REGISTER', 'DF-EV-', 29],
  ['DEEP_FOCUS_PRODUCT_RISK_REGISTER', 'DF-R-', 17],
  ['DEEP_FOCUS_PRIVACY_DATA_INVENTORY', 'DF-DATA-', 16],
  ['DEEP_FOCUS_TEST_DEFECT_AND_RELEASE_ASSURANCE', 'DF-T-', 24],
  ['DEEP_FOCUS_TEST_DEFECT_AND_RELEASE_ASSURANCE', 'DF-D-', 4],
  ['DEEP_FOCUS_MOBILE_SECURITY_AND_ACCESSIBILITY_ASSESSMENT', 'DF-ACC-', 10],
  ['DEEP_FOCUS_IMPLEMENTATION_AUDIT', 'DF-IMPL-', 10],
  ['DEEP_FOCUS_IMPLEMENTATION_AUDIT', 'DF-AUD-', 12],
]) {
  const ids = [...read(`${pack}/${file}.md`).matchAll(new RegExp(`^\\| (${prefix}\\d+) \\|`, 'gm'))].map(match => match[1]);
  const expected = Array.from({ length: count }, (_, index) => `${prefix}${String(index + 1).padStart(prefix === 'DF-EV-' || prefix === 'DF-R-' || prefix === 'DF-T-' || prefix === 'DF-D-' ? 3 : 2, '0')}`);
  assert.deepEqual(ids, expected, `stable, unique sequential IDs: ${file}/${prefix}`);
}
assert.match(read(`${pack}/README.md`), /real-minor access/);
assert.match(read(`${pack}/README.md`), /Five-step language-first onboarding/);
assert.match(read(`${pack}/README.md`), /Public Website \+ Account Portal/);
assert.match(read(`${pack}/OPEN_HORIZON_PROCESS_EVIDENCE_MAPPING.md`), /PROPOSED crosswalk/);
console.log(JSON.stringify({ status: 'PASS', scope: 'Dated document structure, history identity, source observations and unchanged boundaries; no runtime/security/release acceptance', markdownFiles: files.length, localLinks: links, currentPackTables: tables, historicalBodiesUnchanged: historical.length, baseline, original }, null, 2));
