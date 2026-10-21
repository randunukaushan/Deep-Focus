import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sql = await readFile(new URL('../../supabase/migrations/20261011300000_ai_sync_receipt_immutability_v1.sql', import.meta.url), 'utf8');

test('AI and V2 replay receipts reject mutation through one server-owned trigger', () => {
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create or replace function df_private\.reject_ai_sync_receipt_mutation\(\)/i);
  assert.match(sql, /before update or delete on df_private\.ai_apply_receipts/i);
  assert.match(sql, /before update or delete on df_private\.sync_v2_batch_receipts/i);
  assert.equal((sql.match(/execute function df_private\.reject_ai_sync_receipt_mutation\(\)/gi) ?? []).length, 2);
  assert.match(sql, /errcode = 'check_violation'/i);
});

test('AI and V2 receipt immutability remains transactional and client-denied', () => {
  assert.match(sql, /security invoker/i);
  assert.doesNotMatch(sql, /grant .* on table/i);
  assert.doesNotMatch(sql, /grant .* on function/i);
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from/i);
});
