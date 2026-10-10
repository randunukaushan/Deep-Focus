import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const migrationPath = path.join(root, 'supabase/migrations/20261009071127_personal_core_v1.sql');
const appSessionMigrationPath = path.join(root, 'supabase/migrations/20261010130000_app_session_registry_v1.sql');
const snapshotMigrationPath = path.join(root, 'supabase/migrations/20261010140000_sync_snapshot_staging_v1.sql');
const usageMigrationPath = path.join(root, 'supabase/migrations/20261010150000_usage_allowance_ledger_v1.sql');

function migrationText() {
  return fs.readFileSync(migrationPath, 'utf8');
}

function appSessionMigrationText() {
  return fs.readFileSync(appSessionMigrationPath, 'utf8');
}

function snapshotMigrationText() {
  return fs.readFileSync(snapshotMigrationPath, 'utf8');
}

function usageMigrationText() {
  return fs.readFileSync(usageMigrationPath, 'utf8');
}

test('local backend migration is explicit, private and review-pending', () => {
  const sql = migrationText();
  const tables = [...sql.matchAll(/create table df_private\.(\w+)/gi)].map((match) => match[1]);
  assert.deepEqual(tables, [
    'profiles', 'workspaces', 'goals', 'tasks', 'focus_sessions',
    'focus_events', 'mutation_receipts', 'sync_heads', 'sync_changes',
  ]);
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /revoke all on schema df_private from public, anon, authenticated/i);
  assert.match(sql, /alter table df_private\.%I enable row level security/i);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.%I to service_role/i);
  assert.match(sql, /create policy owner_read on df_private\.%I for select to authenticated using \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.match(sql, /create policy owner_insert on df_private\.%I for insert to authenticated with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.match(sql, /create policy owner_update on df_private\.%I for update to authenticated using \(\(select auth\.uid\(\)\) = owner_id\) with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.match(sql, /create policy owner_delete on df_private\.%I for delete to authenticated using \(\(select auth\.uid\(\)\) = owner_id\)/i);
  assert.doesNotMatch(sql, /current_setting\s*\(\s*'deepfocus\.contract_sandbox'/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('local backend migration keeps cross-owner references composite', () => {
  const sql = migrationText();
  assert.match(sql, /foreign key \(owner_id, workspace_id\) references df_private\.workspaces\(owner_id, id\)/i);
  assert.match(sql, /foreign key \(owner_id, workspace_id, goal_id\) references df_private\.goals\(owner_id, workspace_id, id\)/i);
  assert.match(sql, /foreign key \(owner_id, workspace_id, task_id\) references df_private\.tasks\(owner_id, workspace_id, id\)/i);
  assert.match(sql, /foreign key \(owner_id, session_id\) references df_private\.focus_sessions\(owner_id, id\)/i);
  assert.match(sql, /create unique index one_active_personal_session/i);
  assert.match(sql, /primary key \(owner_id, operation, mutation_id\)/i);
});

test('local backend migration explicitly leaves business RPCs and client grants out', () => {
  const sql = migrationText();
  assert.match(sql, /No RPCs, triggers, service credentials or direct-client grants are created/i);
  assert.doesNotMatch(sql, /create\s+(?:or replace\s+)?function/i);
  assert.doesNotMatch(sql, /grant\s+[^;]+\s+to\s+(?:anon|authenticated)/i);
});

test('app-session registry candidate is owner-bound, expiry-constrained and review-pending', () => {
  const sql = appSessionMigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.app_sessions/i);
  assert.match(sql, /session_id uuid primary key/i);
  assert.match(sql, /references df_private\.profiles\(owner_id\) on delete restrict/i);
  assert.match(sql, /check \(expires_at > issued_at\)/i);
  assert.match(sql, /check \(\(status = 'revoked'\) = \(revoked_at is not null\)\)/i);
  assert.match(sql, /create index app_sessions_owner_state/i);
  assert.match(sql, /alter table df_private\.app_sessions enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.app_sessions from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
  assert.match(sql, /app_session_owner_update[\s\S]+with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
});

test('sync snapshot staging candidate binds pages to owned metadata and keeps clients out', () => {
  const sql = snapshotMigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.sync_snapshots/i);
  assert.match(sql, /create table df_private\.sync_snapshot_pages/i);
  assert.match(sql, /high_water bigint not null check \(high_water >= 0\)/i);
  assert.match(sql, /manifest_digest text not null/i);
  assert.match(sql, /page_digest text not null/i);
  assert.match(sql, /foreign key \(owner_id, snapshot_id\) references df_private\.sync_snapshots\(owner_id, snapshot_id\)/i);
  assert.match(sql, /check \(page_index < page_count\)/i);
  assert.match(sql, /alter table df_private\.sync_snapshots enable row level security/i);
  assert.match(sql, /alter table df_private\.sync_snapshot_pages enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.sync_snapshots, df_private\.sync_snapshot_pages from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
  assert.match(sql, /snapshot_page_owner_update[\s\S]+with check \(\(select auth\.uid\(\)\) = owner_id\)/i);
});

test('usage allowance ledger candidate is server-only, bounded and replay-safe', () => {
  const sql = usageMigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.capability_allowances/i);
  assert.match(sql, /create table df_private\.usage_reservation_receipts/i);
  assert.match(sql, /primary key \(owner_id, capability, period_key\)/i);
  assert.match(sql, /primary key \(owner_id, receipt_id\)/i);
  assert.match(sql, /check \(consumed_units \+ reserved_units <= limit_units\)/i);
  assert.match(sql, /foreign key \(owner_id, capability, period_key\)/i);
  assert.match(sql, /units integer not null check \(units between 1 and 1000\)/i);
  assert.match(sql, /alter table df_private\.capability_allowances enable row level security/i);
  assert.match(sql, /alter table df_private\.usage_reservation_receipts enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.capability_allowances, df_private\.usage_reservation_receipts from public, anon, authenticated/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
  assert.match(sql, /No authenticated-client policies are intentional/i);
});
