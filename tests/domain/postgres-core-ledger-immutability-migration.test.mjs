import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sql = await readFile(new URL('../../supabase/migrations/20261011290000_core_ledger_immutability_v1.sql', import.meta.url), 'utf8');

test('core receipt and sync ledgers reject mutation through server-owned triggers', () => {
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create or replace function df_private\.reject_core_ledger_mutation\(\)/i);
  assert.match(sql, /before update or delete on df_private\.mutation_receipts/i);
  assert.match(sql, /before update or delete on df_private\.sync_changes/i);
  assert.equal((sql.match(/execute function df_private\.reject_core_ledger_mutation\(\)/gi) ?? []).length, 2);
  assert.match(sql, /errcode = 'check_violation'/i);
});

test('core ledger immutability has no client grants or destructive table operation', () => {
  assert.match(sql, /security invoker/i);
  assert.doesNotMatch(sql, /grant .* on table/i);
  assert.doesNotMatch(sql, /grant .* on function/i);
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from/i);
});
