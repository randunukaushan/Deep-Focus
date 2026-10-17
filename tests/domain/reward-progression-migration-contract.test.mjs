import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import test from 'node:test';

const migrations = new URL('../../supabase/migrations/', import.meta.url);
const migrationName = (await readdir(migrations)).find((name) => name.endsWith('_reward_progression_v1.sql'));
const source = migrationName ? await readFile(new URL(migrationName, migrations), 'utf8') : '';

test('reward progression migration preserves the V1 owner, replay and receipt invariants', () => {
  assert.ok(migrationName, 'the additive reward progression migration must exist');
  assert.match(source, /create table df_private\.reward_progress/i);
  assert.match(source, /create table df_private\.progression_events/i);
  assert.match(source, /create table df_private\.user_achievements/i);
  assert.match(source, /owner_id uuid primary key references df_private\.profiles\(owner_id\) on delete restrict/i);
  assert.match(source, /primary key \(owner_id, consumer, source_operation_key\)/i);
  assert.match(source, /foreign key \(owner_id, source_id\) references df_private\.focus_sessions\(owner_id, id\) on delete restrict/i);
  assert.match(source, /source_operation_key = 'terminal:' \|\| source_id::text/i);
  assert.match(source, /session_status is distinct from 'completed'/i);
  assert.match(source, /achievement_id in \([\s\S]*first_focus_session[\s\S]*first_goal_completed/i);
  assert.match(source, /check \(not backfill_marker or summary_presented_at is not null\)/i);
  assert.match(source, /achievement unlock may only receive one presentation receipt/i);
  assert.match(source, /alter table df_private\.%I enable row level security/i);
  assert.match(source, /revoke all on table df_private\.%I from public, anon, authenticated/i);
  assert.doesNotMatch(source, /grant[^;]*\b(?:anon|authenticated)\b/i);
});
