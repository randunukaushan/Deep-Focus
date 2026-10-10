import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const ROOT = new URL('../../', import.meta.url);

async function migration(name) {
  return readFile(new URL(`supabase/migrations/${name}`, ROOT), 'utf8');
}

test('server entitlements migration keeps capability records private and bounded', async () => {
  const sql = await migration('20261010200000_server_entitlements_v1.sql');
  assert.match(sql, /server_entitlements/);
  assert.match(sql, /owner_id uuid not null references df_private\.profiles\(owner_id\) on delete restrict/i);
  assert.match(sql, /capability in \('ai','cloud_resources'\)/);
  assert.match(sql, /verified_by/);
  assert.match(sql, /primary key \(owner_id, capability\)/i);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table/);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('usage allowance migration binds receipts to owner and allowance identity', async () => {
  const sql = await migration('20261010150000_usage_allowance_ledger_v1.sql');
  assert.match(sql, /primary key \(owner_id, capability, period_key\)/);
  assert.match(sql, /primary key \(owner_id, receipt_id\)/);
  assert.match(sql, /foreign key \(owner_id, capability, period_key\)/);
  assert.match(sql, /consumed_units \+ reserved_units <= limit_units/);
  assert.match(sql, /units integer not null check \(units between 1 and 1000\)/);
  assert.match(sql, /revoke all on table df_private\.capability_allowances, df_private\.usage_reservation_receipts from public, anon, authenticated/i);
  assert.match(sql, /No authenticated-client policies are intentional/i);
});

test('session registry migration protects session rows and revocation outbox behind service access', async () => {
  const sql = await migration('20261010130000_app_session_registry_v1.sql');
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table/);
  assert.match(sql, /grant select, insert, update, delete on table/);
  assert.match(sql, /owner_id uuid not null/);
  assert.match(sql, /session_id uuid primary key/);
});

test('entitlement migration keeps owner and status constraints explicit', async () => {
  const sql = await migration('20261010200000_server_entitlements_v1.sql');
  assert.match(sql, /owner_id uuid not null/);
  assert.match(sql, /status text not null/);
  assert.match(sql, /verified_by text not null/);
  assert.match(sql, /policy_version text not null/);
  assert.match(sql, /expires_at timestamptz/);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.server_entitlements to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('revocation outbox migration keeps owner/session identity and provider data private', async () => {
  const sql = await migration('20261010160000_app_session_revocation_outbox_v1.sql');
  assert.match(sql, /owner_id uuid not null references df_private\.profiles/);
  assert.match(sql, /session_id uuid not null references df_private\.app_sessions/);
  assert.match(sql, /unique \(owner_id, session_id\)/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table/);
  assert.match(sql, /grant select, insert, update, delete on table .* service_role/);
  assert.doesNotMatch(sql, /provider_token|raw_provider_error|secret/i);
});

test('revocation outbox lease migration requires fencing data only while processing', async () => {
  const sql = await migration('20261010170000_app_session_revocation_outbox_leases_v1.sql');
  assert.match(sql, /add column lease_id uuid/);
  assert.match(sql, /add column lease_until timestamptz/);
  assert.match(sql, /\(state = 'processing'\) = \(lease_id is not null and lease_until is not null\)/);
  assert.match(sql, /app_session_revocation_lease_due/);
});

test('rate-limit migration keeps the counter private and atomically keyable', async () => {
  const sql = await migration('20261010210000_gateway_rate_limit_v1.sql');
  assert.match(sql, /create table df_private\.gateway_rate_limit_buckets/i);
  assert.match(sql, /owner_id uuid not null references df_private\.profiles\(owner_id\) on delete restrict/i);
  assert.match(sql, /primary key \(owner_id, operation, window_start_ms\)/i);
  assert.match(sql, /request_count integer not null default 0 check \(request_count >= 0\)/i);
  assert.match(sql, /alter table df_private\.gateway_rate_limit_buckets enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.gateway_rate_limit_buckets from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.gateway_rate_limit_buckets to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('user settings migration keeps versioned preferences owner-bound and server-only', async () => {
  const sql = await migration('20261011110000_user_settings_v1.sql');
  assert.match(sql, /create table df_private\.user_settings/i);
  assert.match(sql, /owner_id uuid not null unique references df_private\.profiles\(owner_id\) on delete restrict/i);
  assert.match(sql, /theme text not null default 'system'/i);
  assert.match(sql, /ui_locale text not null default 'en'/i);
  assert.match(sql, /default_focus_duration_minutes integer not null default 25 check \(default_focus_duration_minutes between 1 and 1440\)/i);
  assert.match(sql, /default_break_duration_minutes integer not null default 5 check \(default_break_duration_minutes in \(5, 10, 15\)\)/i);
  assert.match(sql, /version integer not null default 1 check \(version >= 1\)/i);
  assert.match(sql, /alter table df_private\.user_settings enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.user_settings from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.user_settings to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('sync change contract v2 permits settings upserts and null delete tombstones', async () => {
  const sql = await migration('20261011120000_sync_change_contract_v2.sql');
  assert.match(sql, /alter table df_private\.sync_changes\s+alter column payload drop not null/i);
  assert.match(sql, /entity_kind in \('profile', 'goal', 'task', 'focus_session', 'settings', 'break'\)/i);
  assert.match(sql, /operation = 'delete' and payload is null/i);
  assert.match(sql, /operation = 'upsert' and payload is not null/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from/i);
});

test('break records migration keeps post-focus data bounded and server-only', async () => {
  const sql = await migration('20261011130000_break_records_v1.sql');
  assert.match(sql, /create table df_private\.break_records/i);
  assert.match(sql, /foreign key \(owner_id, focus_session_id\) references df_private\.focus_sessions/i);
  assert.match(sql, /unique \(owner_id, focus_session_id\)/i);
  assert.match(sql, /planned_ms bigint not null check \(planned_ms between 1 and 86400000\)/i);
  assert.match(sql, /actual_ms bigint not null check \(actual_ms between 0 and 86400000\)/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.break_records from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});
