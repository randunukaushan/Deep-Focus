import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('../../supabase/migrations/20261011170000_privacy_jobs_v1.sql', import.meta.url), 'utf8').toLowerCase();

test('privacy jobs migration is transaction-bound and non-destructive', () => {
  assert.match(sql, /begin;/);
  assert.match(sql, /commit;/);
  assert.doesNotMatch(sql, /\b(drop|truncate)\b/);
  assert.doesNotMatch(sql, /\bdelete\s+from\b/);
});

test('privacy jobs migration keeps owner identity and retry fencing in the schema', () => {
  assert.match(sql, /primary key\s*\(owner_id, job_id\)/);
  assert.match(sql, /unique\s*\(owner_id, operation_id\)/);
  assert.match(sql, /lease_owner\s+uuid/);
  assert.match(sql, /fencing_version\s+bigint/);
  assert.match(sql, /check \(\(lease_owner is null\) = \(lease_expires_at is null\)\)/);
  assert.match(sql, /next_attempt_at\s+timestamptz/);
  assert.match(sql, /safe_error_code\s+text/);
  assert.match(sql, /artifact_locator\s+text/);
});

test('privacy jobs migration fails closed for public roles and enables RLS', () => {
  assert.match(sql, /alter table df_private\.privacy_jobs enable row level security/);
  assert.match(sql, /revoke all on table df_private\.privacy_jobs from public, anon, authenticated/);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.privacy_jobs to service_role/);
  assert.doesNotMatch(sql, /grant .* to (public|anon|authenticated)/);
});
