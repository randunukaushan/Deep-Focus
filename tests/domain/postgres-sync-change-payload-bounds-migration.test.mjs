import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sql = await readFile(new URL('../../supabase/migrations/20261011330000_sync_change_payload_bounds_v1.sql', import.meta.url), 'utf8');

test('sync changes bound new JSON payloads without rewriting existing rows', () => {
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /alter table df_private\.sync_changes/i);
  assert.match(sql, /octet_length\(payload::text\) <= 65536/i);
  assert.match(sql, /not valid/i);
});

test('sync payload bound is additive and non-destructive', () => {
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from|update\s+df_private\.sync_changes/i);
});
