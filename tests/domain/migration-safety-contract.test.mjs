import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationsUrl = new URL('../../supabase/migrations/', import.meta.url);

async function files() {
  return (await readdir(migrationsUrl)).filter((name) => name.endsWith('.sql')).sort();
}

test('local SQL migrations have unique ordered version prefixes', async () => {
  const names = await files();
  const versions = names.map((name) => name.split('_', 1)[0]);
  assert.ok(names.length > 0);
  assert.equal(new Set(versions).size, versions.length);
  assert.ok(versions.every((version) => /^\d{14}$/.test(version)));
  assert.deepEqual([...versions].sort(), versions);
});

test('local SQL migrations are transaction-bound and contain no destructive reset', async () => {
  for (const name of await files()) {
    const sql = await readFile(new URL(name, migrationsUrl), 'utf8');
    assert.match(sql, /\bbegin\s*;/i, name);
    assert.match(sql, /commit\s*;\s*$/i, name);
    assert.doesNotMatch(sql, /\b(drop\s+table|truncate\s+table|delete\s+from)\b/i, name);
  }
});

test('every migration that creates a private table enables RLS and revokes client table access', async () => {
  for (const name of await files()) {
    const sql = await readFile(new URL(name, migrationsUrl), 'utf8');
    if (!/create\s+table(?:\s+if\s+not\s+exists)?\s+df_private\./i.test(sql)) continue;
    assert.match(sql, /enable\s+row\s+level\s+security/i, name);
    assert.match(sql, /revoke\s+all\s+on\s+table[\s\S]+from\s+public,\s*anon,\s*authenticated/i, name);
    assert.doesNotMatch(sql, /grant\s+[^;]+\s+to\s+(?:public|anon|authenticated)\b/i, name);
  }
});
