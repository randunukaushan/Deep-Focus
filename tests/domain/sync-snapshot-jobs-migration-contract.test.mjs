import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const path = new URL('../../supabase/migrations/20261011190000_sync_snapshot_jobs_v1.sql', import.meta.url);

test('sync snapshot jobs migration is transactional, owner-bound and non-public', async () => {
  const sql = await readFile(path, 'utf8');
  assert.match(sql, /begin;[\s\S]*commit;/i);
  assert.match(sql, /create table df_private\.sync_snapshot_jobs/i);
  assert.match(sql, /unique \(owner_id, operation_id\)/i);
  assert.match(sql, /create unique index sync_snapshot_jobs_owner_snapshot/i);
  assert.match(sql, /alter table df_private\.sync_snapshot_jobs enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.sync_snapshot_jobs from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table df_private\.sync_snapshot_jobs to service_role/i);
  assert.match(sql, /check \(\(lease_owner is null\) = \(lease_expires_at is null\)\)/i);
  assert.doesNotMatch(sql, /drop table|truncate table|delete from/i);
});
