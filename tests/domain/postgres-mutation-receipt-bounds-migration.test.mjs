import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sql = await readFile(new URL('../../supabase/migrations/20261011320000_mutation_receipt_bounds_v1.sql', import.meta.url), 'utf8');

test('mutation receipts require bounded JSON object responses for new writes', () => {
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /alter table df_private\.mutation_receipts/i);
  assert.match(sql, /jsonb_typeof\(response_body\) = 'object'/i);
  assert.match(sql, /octet_length\(response_body::text\) <= 262144/i);
  assert.match(sql, /not valid/i);
});

test('receipt bounds are additive and do not erase existing data', () => {
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from/i);
  assert.doesNotMatch(sql, /update\s+df_private\.mutation_receipts/i);
});
