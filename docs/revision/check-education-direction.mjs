import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Dated planning-document checks; not education, privacy or release acceptance.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = 'adebb0fdf9ade89a551c38d15ac22c4060c1b6e4';
const read = path => readFileSync(resolve(root, path), 'utf8').replace(/\r\n/g, '\n');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trimEnd();
const globalPath = 'docs/GLOBAL_EDUCATION_COUNTRY_PACK_ARCHITECTURE.md';
const backlogPath = 'docs/PROPOSED_PRODUCT_FLOWS_AND_EDUCATION_FEATURES.md';
const files = [globalPath, backlogPath, 'docs/POST_V1_FEATURE_SCOPE.md', 'docs/DOCUMENTATION_MAP.md', 'docs/CHANGELOG.md', 'docs/revision/evidence/PR17-EDUCATION-RECONCILIATION-2026-10-22.md'];
let links = 0;
let tables = 0;
for (const file of files) {
  const text = read(file);
  assert.equal((text.match(/^```/gm) ?? []).length % 2, 0, `fences: ${file}`);
  assert(!/^(<<<<<<< |=======|>>>>>>> )/m.test(text), `conflict markers: ${file}`);
  let fence = false;
  let width = 0;
  for (const line of text.split('\n')) {
    if (line.startsWith('```')) { fence = !fence; width = 0; continue; }
    if (fence || !line.startsWith('|')) { width = 0; continue; }
    const cells = line.split(/(?<!\\)\|/).length;
    if (!width) { width = cells; tables++; }
    assert.equal(cells, width, `table width: ${file}`);
  }
  for (const match of text.matchAll(/(?<!!)\[[^\]]+\]\(((?:[^()\s]|\([^()]*\))+)\)/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    assert(existsSync(resolve(root, dirname(file), decodeURIComponent(target.split('#')[0]))), `link ${file}: ${target}`);
    links++;
  }
}
for (const file of [globalPath, backlogPath, 'docs/POST_V1_FEATURE_SCOPE.md']) assert(read(file).includes(baseline), `named baseline: ${file}`);
const global = read(globalPath);
const ids = [...global.matchAll(/^\| (GP-\d+) \|/gm)].map(match => match[1]);
assert.deepEqual(ids, Array.from({ length: 10 }, (_, index) => `GP-${String(index + 1).padStart(2, '0')}`));
for (const pack of ['Country Pack', 'Curriculum Pack', 'Exam Pack', 'Language Pack', 'Compliance Pack']) assert(global.includes(pack), pack);
assert(global.includes('Home/Plan/Focus/Progress/Profile'));
assert(global.includes('real-minor pilot/release access remains disabled'));
assert(global.includes('Country/role/education collection is not added'));
assert(global.includes('optional LK ol/al/higher text context'));
const backlog = read(backlogPath);
assert(backlog.includes('Home / Plan / Focus / Progress / Profile'));
assert(backlog.includes('not an implemented') || backlog.includes('whole proposed workflow'));
assert(!backlog.includes('## 3. Proposed Sri Lanka education experience (post-V1)'));
assert(!backlog.includes('O/L / A/L / university workflows | Post-V1 proposals'));
assert(!backlog.includes('Wait for the product owner\'s explicit list of V1 inclusions/exclusions'));
assert(global.includes('Product remains NOT_READY') && backlog.includes('product remains NOT_READY'));
const post = read('docs/POST_V1_FEATURE_SCOPE.md');
const oldPost = git(['show', `${baseline}:docs/POST_V1_FEATURE_SCOPE.md`]).replace(/\r\n/g, '\n');
assert.equal(post.split('## 7.')[0], oldPost.split('## 7.')[0], 'preserve pre-existing post-V1 sections 1–6');
const protectedPaths = ['AGENTS.md', 'docs/AI_RULES.md', 'docs/ai', 'docs/V1_FEATURE_SCOPE.md', 'docs/V1_IMPLEMENTATION_PLAN.md', 'docs/revision/01-REQUIREMENTS-AND-DECISIONS.md', 'docs/revision/11-SRI-LANKA-EDUCATION-CONTRACTS.md', 'docs/revision/12-LOCAL-RESOURCES-AND-WORK-PLANNING.md', 'docs/revision/32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md', 'docs/SECURITY.md', 'docs/COLOR_SYSTEM.md', 'docs/V1_SCREEN_MAP.md', 'src', 'tests', 'web', 'app.json', 'eas.json', 'package.json', 'package-lock.json'];
assert.equal(git(['diff', '--name-only', baseline, '--', ...protectedPaths]), '', 'canonical/source/config changes');
assert.equal(git(['diff', '--name-only', baseline, '--', '.', ':!docs/**']), '', 'non-document delta');
assert(read('src/features/education/education-metadata.ts').includes("country: 'LK'"));
console.log(JSON.stringify({ status: 'PASS', scope: 'Dated planning structure/scope routing and unchanged source/governance; not runtime/security/education acceptance', markdownFiles: files.length, localLinks: links, tables, placementRows: ids.length, baseline }, null, 2));
