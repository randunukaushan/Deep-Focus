import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const { DEEP_FOCUS_HOSTED_GATEWAY_ENV_NAMES } = await import('../../supabase/functions/deep-focus-gateway/config.ts');

const template = await readFile(new URL('../../supabase/functions/.env.example', import.meta.url), 'utf8');
const ignored = await readFile(new URL('../../.gitignore', import.meta.url), 'utf8');
const variables = Object.fromEntries(template
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/=(.*)/s)));

test('Edge environment template lists each required server variable without a privileged key', () => {
  assert.deepEqual(Object.keys(variables), DEEP_FOCUS_HOSTED_GATEWAY_ENV_NAMES);
  assert.match(variables.SUPABASE_PUBLISHABLE_KEYS, /^\{"default":"sb_publishable_replace_with_project_key"\}$/);
  assert.match(variables.DEEP_FOCUS_LIST_CURSOR_SECRET, /different-random-server-only-secret/);
  assert.match(variables.DEEP_FOCUS_SNAPSHOT_CURSOR_SECRET, /another-random-server-only-secret/);
  assert.doesNotMatch(template, /(?:service_role|sb_secret_|eyJ[a-zA-Z0-9_-]{20,})/i);
  assert.match(ignored, /^supabase\/functions\/\.env$/m);
  assert.match(ignored, /^supabase\/functions\/\*\*\/\.env$/m);
});
