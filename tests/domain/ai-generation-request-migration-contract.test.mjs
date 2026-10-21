import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'supabase/migrations/20261011220000_ai_generation_requests_v1.sql');
const sql = fs.readFileSync(file, 'utf8');

test('generation request migration is transactional, owner-bound and review-pending', () => {
  assert.match(sql, /begin;[\s\S]*commit;/i);
  assert.match(sql, /REVIEW_PENDING/);
  assert.match(sql, /create table df_private\.ai_generation_requests/i);
  assert.match(sql, /create table df_private\.ai_generation_jobs/i);
  assert.match(sql, /primary key \(owner_id, request_id\)/i);
  assert.match(sql, /foreign key \(owner_id, request_id\)[\s\S]*ai_generation_requests/i);
});

test('generation lifecycle accounting is fail-closed in SQL', () => {
  assert.match(sql, /status = 'pending'[\s\S]*reserved_actions = 1 and consumed_actions = 0/i);
  assert.match(sql, /status = 'completed'[\s\S]*proposal_contract_version = 2[\s\S]*reserved_actions = 0 and consumed_actions = 1/i);
  assert.match(sql, /status = 'failed'[\s\S]*failure_code is not null[\s\S]*reserved_actions = 0 and consumed_actions = 0/i);
  assert.match(sql, /status = 'cancelled'[\s\S]*failure_code is null[\s\S]*reserved_actions = 0 and consumed_actions = 0/i);
  assert.match(sql, /intent_sha256 text not null check \(intent_sha256 ~ '\^\[a-f0-9\]\{64\}\$'/i);
});

test('generation tables deny client roles and do not store provider payload fields', () => {
  assert.match(sql, /alter table df_private\.ai_generation_requests enable row level security/i);
  assert.match(sql, /alter table df_private\.ai_generation_jobs enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.ai_generation_requests, df_private\.ai_generation_jobs from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update on table df_private\.ai_generation_requests, df_private\.ai_generation_jobs to service_role/i);
  assert.doesNotMatch(sql, /prompt|provider_response|api_key|secret/i);
});
