-- Local candidate only. Do not run against a remote/production project without
-- the required independent review and migration authority.
-- REVIEW_PENDING: cancellation settlement must remain one reviewed transaction
-- with the request and usage-reservation locks.

begin;

create table df_private.ai_generation_cancel_receipts (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  request_id uuid not null,
  mutation_id uuid not null,
  request_sha256 text not null check (request_sha256 ~ '^[a-f0-9]{64}$'),
  outcome text not null check (outcome in ('cancelled', 'already_cancelled', 'already_terminal')),
  response_body jsonb not null check (jsonb_typeof(response_body) = 'object'),
  response_status integer not null check (response_status between 200 and 299),
  applied_at timestamptz not null,
  primary key (owner_id, mutation_id),
  unique (owner_id, request_id),
  foreign key (owner_id, request_id)
    references df_private.ai_generation_requests(owner_id, request_id)
    on delete restrict
);

create index ai_generation_cancel_receipts_owner_applied
  on df_private.ai_generation_cancel_receipts(owner_id, applied_at, mutation_id);

alter table df_private.ai_generation_cancel_receipts enable row level security;
revoke all on table df_private.ai_generation_cancel_receipts from public, anon, authenticated;
grant select, insert on table df_private.ai_generation_cancel_receipts to service_role;

comment on table df_private.ai_generation_cancel_receipts is
  'Owner-bound exact-once cancellation response; request cancellation and reservation release remain one server transaction.';

commit;
