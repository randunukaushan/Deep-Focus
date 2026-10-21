-- Local candidate only. Do not run against a remote/production project without
-- independent security review, migration authority and the V2 capability gate.
-- REVIEW_PENDING: this receipt must share the reviewed V2 push transaction
-- boundary; it is not a replacement for per-item mutation receipts.

begin;

create table df_private.sync_v2_batch_receipts (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  batch_id uuid not null,
  request_sha256 text not null check (request_sha256 ~ '^[a-f0-9]{64}$'),
  response_body jsonb not null check (jsonb_typeof(response_body) = 'object' and octet_length(response_body::text) <= 262144),
  response_status integer not null check (response_status = 200),
  created_at timestamptz not null,
  primary key (owner_id, batch_id)
);

create index sync_v2_batch_receipts_owner_created
  on df_private.sync_v2_batch_receipts(owner_id, created_at, batch_id);

alter table df_private.sync_v2_batch_receipts enable row level security;
revoke all on table df_private.sync_v2_batch_receipts from public, anon, authenticated;
grant select, insert on table df_private.sync_v2_batch_receipts to service_role;

comment on table df_private.sync_v2_batch_receipts is
  'Review-gated owner-bound V2 push envelope replay receipt; per-item mutation receipts remain authoritative for domain writes.';

commit;
