import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const path = 'supabase/migrations/20261011230000_ai_generation_cancel_receipts_v1.sql';
const sql = await readFile(path, 'utf8');
const executableSql = sql.replace(/--[^\n]*\n/g, '').trim();

test('AI generation cancellation receipt migration is transactional and owner-bound', () => {
  assert.match(executableSql, /^begin;[\s\S]*commit;\s*$/i);
  assert.match(sql, /create table df_private\.ai_generation_cancel_receipts/i);
  assert.match(sql, /owner_id uuid not null references df_private\.profiles\(owner_id\)/i);
  assert.match(sql, /foreign key \(owner_id, request_id\)\s+references df_private\.ai_generation_requests\(owner_id, request_id\)/i);
  assert.match(sql, /primary key \(owner_id, mutation_id\)/i);
  assert.match(sql, /unique \(owner_id, request_id\)/i);
});

test('cancellation receipts constrain replay identity, outcome and safe response shape', () => {
  assert.match(sql, /request_sha256 text not null check \(request_sha256 ~ '\^\[a-f0-9\]\{64\}\$'/i);
  assert.match(sql, /outcome text not null check \(outcome in \('cancelled', 'already_cancelled', 'already_terminal'\)\)/i);
  assert.match(sql, /response_body jsonb not null check \(jsonb_typeof\(response_body\) = 'object'\)/i);
  assert.match(sql, /response_status integer not null check \(response_status between 200 and 299\)/i);
  assert.match(sql, /applied_at timestamptz not null/i);
});

test('cancellation receipt migration denies client roles and grants only server access', () => {
  assert.match(sql, /alter table df_private\.ai_generation_cancel_receipts enable row level security/i);
  assert.match(sql, /revoke all on table df_private\.ai_generation_cancel_receipts from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert on table df_private\.ai_generation_cancel_receipts to service_role/i);
  assert.doesNotMatch(sql, /create policy .*ai_generation_cancel_receipts/i);
  assert.doesNotMatch(sql, /drop table|truncate table|delete from/i);
});
