-- Deep Focus account-session revocation request receipt candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent security review are complete.

begin;

create table df_private.app_session_revocation_receipts (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  mutation_id uuid not null,
  request_sha256 text not null check (request_sha256 ~ '^[a-f0-9]{64}$'),
  session_ids jsonb not null check (jsonb_typeof(session_ids) = 'array'),
  current_session_revoked boolean not null,
  provider_revocation_status text not null check (provider_revocation_status in ('pending','confirmed','needs_retry')),
  created_at timestamptz not null default now(),
  primary key (owner_id, mutation_id)
);

create index app_session_revocation_receipts_created
  on df_private.app_session_revocation_receipts(owner_id, created_at, mutation_id);

alter table df_private.app_session_revocation_receipts enable row level security;
revoke all on table df_private.app_session_revocation_receipts from public, anon, authenticated;
grant select, insert, update on table df_private.app_session_revocation_receipts to service_role;

comment on table df_private.app_session_revocation_receipts is
  'Server-only EX-27 idempotency receipts; session_ids freezes the original target set so replay cannot include later sessions.';

commit;
