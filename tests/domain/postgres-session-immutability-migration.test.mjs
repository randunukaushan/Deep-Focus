import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sql = await readFile(new URL('../../supabase/migrations/20261011270000_focus_session_immutability_v1.sql', import.meta.url), 'utf8');

test('terminal session migration is review-gated and rejects mutation through a trigger', () => {
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create or replace function df_private\.reject_terminal_focus_session_mutation\(\)/i);
  assert.match(sql, /if old\.status in \('completed', 'cancelled'\) then/i);
  assert.match(sql, /errcode = 'check_violation'/i);
  assert.match(sql, /before update on df_private\.focus_sessions/i);
  assert.match(sql, /for each row execute function df_private\.reject_terminal_focus_session_mutation\(\)/i);
});

test('focus event migration keeps the event ledger append-only and does not grant clients access', () => {
  assert.match(sql, /create or replace function df_private\.reject_focus_event_mutation\(\)/i);
  assert.match(sql, /create or replace function df_private\.reject_invalid_focus_event_time\(\)/i);
  assert.match(sql, /before update or delete on df_private\.focus_events/i);
  assert.match(sql, /for each row execute function df_private\.reject_focus_event_mutation\(\)/i);
  assert.match(sql, /before insert on df_private\.focus_events/i);
  assert.match(sql, /new\.occurred_at < session_started_at/i);
  assert.match(sql, /new\.occurred_at > current_timestamp/i);
  assert.match(sql, /security invoker/i);
  assert.doesNotMatch(sql, /grant .* on table/i);
  assert.doesNotMatch(sql, /grant .* on function/i);
});

test('immutability candidate remains transactional and does not contain destructive table operations', () => {
  assert.match(sql, /begin;/i);
  assert.match(sql, /commit;/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from/i);
});
