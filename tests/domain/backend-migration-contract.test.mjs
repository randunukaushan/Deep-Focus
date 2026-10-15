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
const snapshotPayloadBoundsMigrationPath = path.join(root, 'supabase/migrations/20261011340000_sync_snapshot_page_payload_bounds_v1.sql');
const usageMigrationPath = path.join(root, 'supabase/migrations/20261010150000_usage_allowance_ledger_v1.sql');
const aiReceiptMigrationPath = path.join(root, 'supabase/migrations/20261011150000_ai_apply_receipts_v1.sql');
const aiProposalMigrationPath = path.join(root, 'supabase/migrations/20261011151000_ai_proposals_v1.sql');
const sessionRevocationReceiptMigrationPath = path.join(root, 'supabase/migrations/20261011210000_app_session_revocation_receipts_v1.sql');
const planSyncV2MigrationPath = path.join(root, 'supabase/migrations/20261011250000_plan_sync_v2_wire.sql');
const syncV2BatchReceiptMigrationPath = path.join(root, 'supabase/migrations/20261011260000_sync_v2_batch_receipts_v1.sql');

function migrationText() {
  return fs.readFileSync(migrationPath, 'utf8');
}

function appSessionMigrationText() {
  return fs.readFileSync(appSessionMigrationPath, 'utf8');
}


function snapshotMigrationText() {
  return fs.readFileSync(snapshotMigrationPath, 'utf8');
}

function snapshotPayloadBoundsMigrationText() {
  return fs.readFileSync(snapshotPayloadBoundsMigrationPath, 'utf8');
}

function usageMigrationText() {
  return fs.readFileSync(usageMigrationPath, 'utf8');
}

function aiReceiptMigrationText() {
  return fs.readFileSync(aiReceiptMigrationPath, 'utf8');
}

function aiProposalMigrationText() {
  return fs.readFileSync(aiProposalMigrationPath, 'utf8');
}

function sessionRevocationReceiptMigrationText() {
  return fs.readFileSync(sessionRevocationReceiptMigrationPath, 'utf8');
}

function planSyncV2MigrationText() {
  return fs.readFileSync(planSyncV2MigrationPath, 'utf8');
}

function syncV2BatchReceiptMigrationText() {
  return fs.readFileSync(syncV2BatchReceiptMigrationPath, 'utf8');
}

test('v2 plan sync foundation is separate, owner-bound and server-only', () => {
  const sql = planSyncV2MigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.sync_v2_heads/i);
  assert.match(sql, /create table df_private\.sync_v2_transaction_groups/i);
  assert.match(sql, /create table df_private\.sync_v2_changes/i);
  assert.match(sql, /contract_version integer not null check \(contract_version = 2\)/i);
  assert.match(sql, /entity_kind text not null check \(entity_kind in \([^)]*'plan'\)/i);
  assert.match(sql, /check \(\(operation = 'delete' and payload is null\) or \(operation = 'upsert' and payload is not null\)\)/i);
  assert.match(sql, /foreign key \(owner_id, transaction_id\)\s+references df_private\.sync_v2_transaction_groups/i);
  assert.match(sql, /alter table df_private\.sync_v2_heads enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.sync_v2_heads, df_private\.sync_v2_transaction_groups, df_private\.sync_v2_changes from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.sync_v2_heads, df_private\.sync_v2_transaction_groups, df_private\.sync_v2_changes to service_role/i);
  assert.doesNotMatch(sql, /alter table df_private\.sync_changes/i);
});

test('v2 batch receipts are owner-bound, bounded and service-only', () => {
  const sql = syncV2BatchReceiptMigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.sync_v2_batch_receipts/i);
  assert.match(sql, /references df_private\.profiles\(owner_id\) on delete restrict/i);
  assert.match(sql, /primary key \(owner_id, batch_id\)/i);
  assert.match(sql, /request_sha256 text not null check \(request_sha256 ~ '\^\[a-f0-9\]\{64\}\$'\)/i);
  assert.match(sql, /jsonb_typeof\(response_body\) = 'object'/i);
  assert.match(sql, /octet_length\(response_body::text\) <= 262144/i);
  assert.match(sql, /response_status integer not null check \(response_status = 200\)/i);
  assert.match(sql, /alter table df_private\.sync_v2_batch_receipts enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.sync_v2_batch_receipts from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert on table df_private\.sync_v2_batch_receipts to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
  assert.doesNotMatch(sql, /drop\s+table|truncate\s+table/i);
});

test('local backend migration is explicit, private and review-pending', () => {
  const sql = migrationText();
  const tables = [...sql.matchAll(/create table df_private\.(\w+)/gi)].map((match) => match[1]);
  assert.deepEqual(tables, [
    'profiles', 'workspaces', 'goals', 'tasks', 'focus_sessions',
    'focus_events', 'mutation_receipts', 'sync_heads', 'sync_changes', 'schema_migration_receipts',
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
  for (const table of ['goals', 'tasks']) {
    const body = sql.split(`create table df_private.${table} (`)[1].split(/\r?\n\);/)[0];
    assert.match(body, /unique \(owner_id, id\)/i);
    assert.match(body, /unique \(owner_id, workspace_id, id\)/i);
  }
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

test('sync snapshot page payload bound is additive and review-pending', () => {
  const sql = snapshotPayloadBoundsMigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /alter table df_private\.sync_snapshot_pages/i);
  assert.match(sql, /octet_length\(payload::text\) <= 262144/i);
  assert.match(sql, /not valid/i);
  assert.doesNotMatch(sql, /drop\s+(?:table|column|schema)/i);
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

test('AI apply receipt migration is owner-bound, exact-once and client-denied', () => {
  const sql = aiReceiptMigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.ai_apply_receipts/i);
  assert.match(sql, /primary key \(owner_id, mutation_id\)/i);
  assert.match(sql, /unique \(owner_id, proposal_id\)/i);
  assert.match(sql, /response_body jsonb not null check \(jsonb_typeof\(response_body\) = 'object'\)/i);
  assert.match(sql, /committed_through bigint not null check \(committed_through >= 0\)/i);
  assert.match(sql, /foreign key|references df_private\.profiles\(owner_id\) on delete restrict/i);
  assert.match(sql, /alter table df_private\.ai_apply_receipts enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.ai_apply_receipts from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert on table df_private\.ai_apply_receipts to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('AI proposal migration preserves reviewed versions and fail-closed state transitions', () => {
  const sql = aiProposalMigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.ai_proposals/i);
  assert.match(sql, /contract_version integer not null check \(contract_version in \(1, 2\)\)/i);
  assert.match(sql, /state text not null check \(state in \('ready', 'applied', 'expired'\)\)/i);
  assert.match(sql, /primary key \(owner_id, id\)/i);
  assert.match(sql, /jsonb_array_length\(operations\) between 1 and 25/i);
  assert.match(sql, /contract_version <> 2 or action_type = 'plan_my_day'/i);
  assert.match(sql, /alter table df_private\.ai_proposals enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.ai_proposals from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update on table df_private\.ai_proposals to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});

test('session revocation receipt migration freezes targets and denies direct clients', () => {
  const sql = sessionRevocationReceiptMigrationText();
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.app_session_revocation_receipts/i);
  assert.match(sql, /primary key \(owner_id, mutation_id\)/i);
  assert.match(sql, /request_sha256 text not null check \(request_sha256 ~ '\^\[a-f0-9\]\{64\}\$'\)/i);
  assert.match(sql, /session_ids jsonb not null check \(jsonb_typeof\(session_ids\) = 'array'\)/i);
  assert.match(sql, /provider_revocation_status text not null check \(provider_revocation_status in \('pending','confirmed','needs_retry'\)\)/i);
  assert.match(sql, /alter table df_private\.app_session_revocation_receipts enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.app_session_revocation_receipts from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update on table df_private\.app_session_revocation_receipts to service_role/i);
  assert.doesNotMatch(sql, /grant[^;]+\bto\s+(?:public|anon|authenticated)\b/i);
});
