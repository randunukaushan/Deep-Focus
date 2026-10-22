import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash, patches, transform } from './sdk56-backports.mjs';

const args = process.argv.slice(2);
if (args.some(arg => !['--web', '--check'].includes(arg))) throw new Error('Unknown option');
const web = args.includes('--web');
const check = args.includes('--check');
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const root = resolve(repository, web ? 'web' : '.');
const modules = resolve(root, 'node_modules');
const selected = patches.filter(patch => !web || patch.name === 'braces');
const manifest = JSON.parse(readFileSync(resolve(repository, 'scripts/security/backport-hashes.json'), 'utf8'));
const pending = [];

for (const patch of selected) {
  const target = resolve(modules, patch.name, patch.file);
  if (web && !existsSync(target) && !existsSync(resolve(modules, 'eslint-config-next/package.json'))) {
    if (!existsSync(resolve(modules, 'next/package.json'))) throw new Error('Web dependency tree is missing');
    console.log('Web production-only tree: no development braces target');
    break;
  }
  // Never follow an install-time symlink outside this dependency tree.
  const inside = relative(realpathSync(modules), realpathSync(target));
  if (inside.startsWith('..') || isAbsolute(inside)) throw new Error('Dependency target escapes node_modules');
  const pkg = JSON.parse(readFileSync(resolve(modules, patch.name, 'package.json'), 'utf8'));
  if (pkg.version !== patch.version) throw new Error(`Version drift: ${patch.name}@${pkg.version}`);
  const original = readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
  const current = hash(original);
  const expected = manifest[`${patch.name}/${patch.file}`];
  if (!expected || !/^[a-f0-9]{64}$/.test(expected)) throw new Error('Missing patched hash');
  if (current === expected) continue;
  if (check) throw new Error(`Required backport missing/drifted: ${patch.name}/${patch.file}`);
  const output = transform(original, patch);
  if (hash(output) !== expected) throw new Error('Unexpected backport output');
  pending.push({ target, output });
}
// Preflight every target before any write. Re-running after interruption is safe.
for (const { target, output } of pending) writeFileSync(target, output);
console.log(`SDK56 security backports ${check ? 'verified' : 'applied'} (${pending.length} writes, ${web ? 'web' : 'mobile'})`);
