-- Deep Focus app-session provider-revocation outbox candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent security review are complete.

begin;

create table df_private.app_session_revocation_outbox (
  revocation_id uuid primary key,
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  session_id uuid not null references df_private.app_sessions(session_id) on delete restrict,
  state text not null default 'pending' check (state in ('pending','processing','succeeded','failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  provider_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, session_id)
);

create index app_session_revocation_due
  on df_private.app_session_revocation_outbox(state, next_attempt_at, revocation_id);

alter table df_private.app_session_revocation_outbox enable row level security;
revoke all on table df_private.app_session_revocation_outbox from public, anon, authenticated;
grant select, insert, update, delete on table df_private.app_session_revocation_outbox to service_role;

-- Provider revocation credentials and raw provider errors are intentionally absent.
-- Only the server worker may claim or update this durable retry record.

commit;
