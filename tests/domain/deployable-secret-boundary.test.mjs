import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const ROOTS = ['src', 'web/src', 'supabase/functions'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);
const FORBIDDEN_LITERALS = [
  /sb_secret_[A-Za-z0-9_-]{12,}/,
  /(?:postgres|postgresql):\/\/[^\s:@/]+:[^\s@/]+@/i,
  /-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----/,
];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (EXTENSIONS.has(path.slice(path.lastIndexOf('.')))) files.push(path);
  }
  return files;
}

test('deployable source contains no static Supabase secret, database credential or private-key literal', async () => {
  const files = (await Promise.all(ROOTS.map((root) => sourceFiles(root)))).flat();
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const pattern of FORBIDDEN_LITERALS) assert.doesNotMatch(source, pattern, file);
  }
});
