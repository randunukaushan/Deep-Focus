-- Local candidate only. Do not run against a remote/production project without
-- the required independent review and migration authority.
-- REVIEW_PENDING: local SQL candidate; no remote execution is implied.

begin;

create table df_private.ai_apply_receipts (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  proposal_id uuid not null,
  proposal_version integer not null check (proposal_version > 0),
  review_digest text not null check (review_digest ~ '^[a-f0-9]{64}$'),
  mutation_id uuid not null,
  request_sha256 text not null check (request_sha256 ~ '^[a-f0-9]{64}$'),
  response_body jsonb not null check (jsonb_typeof(response_body) = 'object'),
  response_status integer not null check (response_status between 200 and 299),
  committed_through bigint not null check (committed_through >= 0),
  applied_at timestamptz not null,
  primary key (owner_id, mutation_id),
  unique (owner_id, proposal_id)
);

create index ai_apply_receipts_owner_applied
  on df_private.ai_apply_receipts(owner_id, applied_at, mutation_id);

alter table df_private.ai_apply_receipts enable row level security;
revoke all on table df_private.ai_apply_receipts from public, anon, authenticated;
grant select, insert on table df_private.ai_apply_receipts to service_role;
create policy ai_apply_receipts_owner_read on df_private.ai_apply_receipts
  for select to authenticated using ((select auth.uid()) = owner_id);

comment on table df_private.ai_apply_receipts is
  'Durable exact-once AI proposal apply receipts; write through reviewed server transaction only.';

commit;
