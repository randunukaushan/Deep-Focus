import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const sql = await readFile(new URL('../../supabase/migrations/20261011240000_plan_persistence_v1.sql', import.meta.url), 'utf8');

test('plan persistence candidate is transactional, private and review-pending', () => {
  assert.match(sql, /begin;[\s\S]*commit;/i);
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.ai_plans/i);
  assert.match(sql, /create table df_private\.ai_plan_blocks/i);
  assert.match(sql, /state text not null check \(state in \('active', 'archived'\)\)/i);
  assert.match(sql, /deleted_at timestamptz/);
  assert.match(sql, /alter table df_private\.ai_plans enable row level security/i);
  assert.match(sql, /alter table df_private\.ai_plan_blocks enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.ai_plans, df_private\.ai_plan_blocks from public, anon, authenticated/i);
});

test('plan schema keeps ownership and proposal/request relationships composite', () => {
  assert.match(sql, /foreign key \(owner_id, proposal_id\)[\s\S]*references df_private\.ai_proposals\(owner_id, id\)/i);
  assert.match(sql, /foreign key \(owner_id, workspace_id\)[\s\S]*references df_private\.workspaces\(owner_id, id\)/i);
  assert.match(sql, /foreign key \(owner_id, generation_request_id\)[\s\S]*references df_private\.ai_generation_requests\(owner_id, request_id\)/i);
  assert.match(sql, /foreign key \(owner_id, task_id\)[\s\S]*references df_private\.tasks\(owner_id, id\)/i);
  assert.match(sql, /foreign key \(owner_id, reminder_id\)[\s\S]*references df_private\.task_reminders\(owner_id, id\)/i);
  assert.match(sql, /create unique index ai_plans_owner_proposal[\s\S]*on df_private\.ai_plans\(owner_id, proposal_id\)/i);
});

test('plan blocks enforce typed focus/break edges and do not reuse completed-event tables', () => {
  assert.match(sql, /kind text not null check \(kind in \('focus', 'break'\)\)/i);
  assert.match(sql, /kind = 'focus' and task_id is not null and after_block_id is null/i);
  assert.match(sql, /kind = 'break' and task_id is null and after_block_id is not null/i);
  assert.match(sql, /not a completed focus session or break record/i);
  assert.doesNotMatch(sql, /insert into df_private\.sync_changes/i);
});
