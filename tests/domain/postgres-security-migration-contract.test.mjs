import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../../', import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function migration(name) {
  return readFile(new URL(`supabase/migrations/${name}`, ROOT), 'utf8');
}

test('server entitlements migration keeps capability records private and bounded', async () => {
  const sql = await migration('20261010200000_server_entitlements_v1.sql');
  assert.match(sql, /server_entitlements/);
  assert.match(sql, /owner_id uuid not null references df_private\.profiles\(owner_id\) on delete restrict/i);
  assert.match(sql, /capability in \('ai','cloud_resources'\)/);
  assert.match(sql, /status in \('pending','active','grace','expired','revoked'\)/i);
  assert.match(sql, /verified_by/);
  assert.match(sql, /primary key \(owner_id, capability\)/i);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table/);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('migration receipt candidate is versioned, checksum-bound and service-role-only', async () => {
  const sql = await migration('20261011200000_schema_migration_receipts_v1.sql');
  assert.match(sql, /migration_id text primary key/i);
  assert.match(sql, /checksum_sha256 text not null check .*64/i);
  assert.match(sql, /schema_version integer not null check \(schema_version > 0\)/i);
  assert.match(sql, /alter table df_private\.schema_migration_receipts enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.schema_migration_receipts from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.schema_migration_receipts to service_role/i);
});

test('usage allowance migration binds receipts to owner and allowance identity', async () => {
  const sql = await migration('20261010150000_usage_allowance_ledger_v1.sql');
  assert.match(sql, /primary key \(owner_id, capability, period_key\)/);
  assert.match(sql, /primary key \(owner_id, receipt_id\)/);
  assert.match(sql, /foreign key \(owner_id, capability, period_key\)/);
  assert.match(sql, /consumed_units \+ reserved_units <= limit_units/);
  assert.match(sql, /units integer not null check \(units between 1 and 1000\)/);
  assert.match(sql, /remaining_units integer not null check \(remaining_units >= 0\)/);
  assert.match(sql, /revoke all on table df_private\.capability_allowances, df_private\.usage_reservation_receipts from public, anon, authenticated/i);
  assert.match(sql, /No authenticated-client policies are intentional/i);
});

test('sync change hash migration is additive and does not fabricate legacy digests', async () => {
  const sql = await migration('20261010180000_sync_change_hash_v1.sql');
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /alter table df_private\.sync_changes\s+add column change_hash text/i);
  assert.match(sql, /change_hash is null or change_hash ~ '\^\[a-f0-9\]\{64\}\$'/i);
  assert.match(sql, /create index sync_changes_owner_sequence_hash/i);
  assert.match(sql, /Existing rows intentionally remain NULL/i);
  assert.doesNotMatch(sql, /update\s+df_private\.sync_changes/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from/i);
});

test('usage receipt decision migration is additive and bounded', async () => {
  const sql = await migration('20261010190000_usage_receipt_decision_v1.sql');
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /alter table df_private\.usage_reservation_receipts\s+add column if not exists remaining_units integer/i);
  assert.match(sql, /remaining_units is null or remaining_units >= 0/i);
  assert.match(sql, /Existing rows remain NULL/i);
  assert.doesNotMatch(sql, /update\s+df_private\.usage_reservation_receipts/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table|delete\s+from/i);
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
  assert.match(sql, /foreign key \(owner_id, session_id\)\s+references df_private\.app_sessions\(owner_id, session_id\) on delete restrict/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all on table/);
  assert.match(sql, /grant select, insert, update, delete on table .* service_role/);
  assert.doesNotMatch(sql, /provider_token|raw_provider_error|secret/i);
});

test('revocation outbox lease migration requires fencing data only while processing', async () => {
  const sql = await migration('20261010170000_app_session_revocation_outbox_leases_v1.sql');
  assert.match(sql, /add column lease_id uuid/);
  assert.match(sql, /add column lease_until timestamptz/);
  assert.match(sql, /check \(\(lease_id is null\) = \(lease_until is null\)\)/);
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

test('reminder migration keeps intent owner-bound, local-only and versioned', async () => {
  const sql = await migration('20261011140000_task_reminders_v1.sql');
  assert.match(sql, /create table df_private\.task_reminders/i);
  assert.match(sql, /foreign key \(owner_id, task_id\) references df_private\.tasks/i);
  assert.match(sql, /delivery text not null default 'local_device' check \(delivery = 'local_device'\)/i);
  assert.match(sql, /deleted_at timestamptz/i);
  assert.match(sql, /version integer not null default 1 check \(version > 0\)/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.task_reminders from public, anon, authenticated/i);
  assert.match(sql, /entity_kind in \('profile', 'goal', 'task', 'focus_session', 'settings', 'break', 'reminder'\)/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('goal contribution migration is append-only, owner-bound and client-private', async () => {
  const sql = await migration('20261011160000_goal_contributions_v1.sql');
  assert.match(sql, /create table df_private\.goal_contributions/i);
  assert.match(sql, /foreign key \(owner_id, goal_id\) references df_private\.goals\(owner_id, id\)/i);
  assert.match(sql, /unique \(owner_id, goal_id, source_kind, source_id\)/i);
  assert.match(sql, /source_kind in \('focus_session', 'task_completion'\)/i);
  assert.match(sql, /alter table df_private\.goal_contributions enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.goal_contributions from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert on table df_private\.goal_contributions to service_role/i);
  assert.doesNotMatch(sql, /grant .*update|grant .*delete/i);
});

test('privacy download grants keep raw tokens out of storage and client roles denied', async () => {
  const sql = await migration('20261011180000_privacy_download_grants_v1.sql');
  assert.match(sql, /create table df_private\.privacy_download_grants/i);
  assert.match(sql, /token_digest text not null check \(token_digest ~ '\^\[a-f0-9\]\{64\}\$'\)/i);
  assert.match(sql, /foreign key \(owner_id, job_id\) references df_private\.privacy_jobs\(owner_id, job_id\)/i);
  assert.match(sql, /unique \(owner_id, job_id\)/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.privacy_download_grants from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.privacy_download_grants to service_role/i);
  assert.doesNotMatch(sql, /raw_token|token_secret|grant[^;]+to\s+(?:public|anon|authenticated)\b/i);
});

test('every private-table migration keeps created tables behind RLS and client-role denial', () => {
  const migrationFiles = fs.readdirSync(path.join(root, 'supabase/migrations'))
    .filter((name) => name.endsWith('.sql'))
    .sort();

  for (const name of migrationFiles) {
    const sql = fs.readFileSync(path.join(root, 'supabase/migrations', name), 'utf8');
    const tables = [...sql.matchAll(/create\s+table(?:\s+if\s+not\s+exists)?\s+df_private\.([a-z0-9_]+)/gi)]
      .map((match) => match[1]);
    if (tables.length === 0) continue;

    assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i, name);

    if (sql.includes('alter table df_private.%I enable row level security')) {
      assert.match(sql, /foreach table_name in array array\[/i, name);
      for (const table of tables.filter((table) => table !== 'schema_migration_receipts')) {
        assert.match(sql, new RegExp(`'${table}'`, 'i'), `${name}: ${table} is not in the dynamic RLS table list`);
      }
      continue;
    }

    for (const table of tables) {
      assert.match(sql, new RegExp(`alter\\s+table\\s+df_private\\.${table}\\s+enable\\s+row\\s+level\\s+security`, 'i'), `${name}: ${table} RLS`);
      assert.match(sql, new RegExp(`revoke\\s+all\\s+on\\s+table[^;]*df_private\\.${table}[^;]*from\\s+public,\\s*anon,\\s*authenticated`, 'i'), `${name}: ${table} client denial`);
    }
  }
});

test('owner update policies keep both read and write ownership predicates', async () => {
  const policyMigrations = [
    '20261010130000_app_session_registry_v1.sql',
    '20261010140000_sync_snapshot_staging_v1.sql',
  ];
  for (const name of policyMigrations) {
    const sql = await migration(name);
    const blocks = [...sql.matchAll(/create\s+policy[\s\S]*?(?=\ncreate\s+policy|\n--|\ncommit;|$)/gi)].map((match) => match[0]);
    assert.ok(blocks.length > 0, `${name}: expected concrete policies`);
    for (const block of blocks.filter((value) => /\bfor\s+update\b/i.test(value))) {
      assert.match(block, /\busing\s*\(/i, `${name}: update policy needs USING`);
      assert.match(block, /\bwith\s+check\s*\(/i, `${name}: update policy needs WITH CHECK`);
      assert.match(block, /auth\.uid\(\)\s*\)\s*=\s*owner_id/i, `${name}: update policy must bind auth.uid to owner_id`);
    }
  }
});
