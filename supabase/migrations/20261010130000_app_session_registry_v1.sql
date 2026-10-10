-- Deep Focus app-session registry candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent security review are complete.
-- The registry supplements provider refresh-session revocation with an app/API
-- admission check. It does not replace verified JWT signature validation.

begin;

create table df_private.app_sessions (
  session_id uuid primary key,
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  status text not null default 'active' check (status in ('active','revoked')),
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > issued_at),
  check ((status = 'revoked') = (revoked_at is not null)),
  check (revoked_at is null or revoked_at >= issued_at),
  unique (owner_id, session_id)
);

create index app_sessions_owner_state
  on df_private.app_sessions(owner_id, status, expires_at, session_id);

alter table df_private.app_sessions enable row level security;
revoke all on table df_private.app_sessions from public, anon, authenticated;
grant select, insert, update, delete on table df_private.app_sessions to service_role;

create policy app_session_owner_read on df_private.app_sessions
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy app_session_owner_insert on df_private.app_sessions
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy app_session_owner_update on df_private.app_sessions
  for update to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy app_session_owner_delete on df_private.app_sessions
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- No client-facing grants, RPCs, triggers or automatic expiry job are created.
-- Server code must verify JWT claims and recheck this row in its transaction.

commit;
