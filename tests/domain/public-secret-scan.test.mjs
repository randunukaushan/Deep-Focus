import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const ROOTS = ['src', 'web/src'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const FORBIDDEN = [
  /service_role/i,
  /sb_secret_/i,
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /DEEP_FOCUS_CURSOR_SIGNING_KEY/i,
  /DEEP_FOCUS_API_SECRET/i,
];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await sourceFiles(path));
    else if (EXTENSIONS.has(path.slice(path.lastIndexOf('.')))) result.push(path);
  }
  return result;
}

test('public mobile and web source contains no server secret identifiers', async () => {
  const files = (await Promise.all(ROOTS.map((root) => sourceFiles(root)))).flat();
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const pattern of FORBIDDEN) assert.doesNotMatch(source, pattern, file);
  }
});
