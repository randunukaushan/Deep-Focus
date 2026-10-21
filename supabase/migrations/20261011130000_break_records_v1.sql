-- Deep Focus post-focus break records candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- independent security review and isolated PostgreSQL execution evidence are complete.

begin;

create table df_private.break_records (
  id uuid primary key,
  owner_id uuid not null,
  focus_session_id uuid not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  planned_ms bigint not null check (planned_ms between 1 and 86400000),
  actual_ms bigint not null check (actual_ms between 0 and 86400000),
  outcome text not null check (outcome in ('completed', 'ended_early')),
  version integer not null default 1 check (version > 0),
  verification_state text not null default 'pending' check (verification_state in ('pending', 'verified', 'needs_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_at >= started_at),
  foreign key (owner_id, focus_session_id) references df_private.focus_sessions(owner_id, id) on delete restrict,
  unique (owner_id, focus_session_id)
);

create index break_records_owner_history
  on df_private.break_records(owner_id, ended_at desc, id desc);

alter table df_private.break_records enable row level security;
revoke all on table df_private.break_records from public, anon, authenticated;
grant select, insert, update, delete on table df_private.break_records to service_role;

commit;
