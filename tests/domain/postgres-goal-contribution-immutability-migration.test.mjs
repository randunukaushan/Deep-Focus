import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sql = await readFile(new URL('../../supabase/migrations/20261011280000_goal_contribution_immutability_v1.sql', import.meta.url), 'utf8');

test('goal contribution ledger migration is review-gated and append-only', () => {
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create or replace function df_private\.reject_goal_contribution_mutation\(\)/i);
  assert.match(sql, /before update or delete on df_private\.goal_contributions/i);
  assert.match(sql, /for each row execute function df_private\.reject_goal_contribution_mutation\(\)/i);
  assert.match(sql, /errcode = 'check_violation'/i);
});

test('goal contribution immutability stays server-owned and transactional', () => {
  assert.match(sql, /security invoker/i);
  assert.doesNotMatch(sql, /grant .* on table/i);
  assert.doesNotMatch(sql, /grant .* on function/i);
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from/i);
});
