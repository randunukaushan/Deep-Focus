-- Deep Focus immutable goal-contribution ledger candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent data/authorization review.

begin;

create table df_private.goal_contributions (
  id uuid not null,
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  goal_id uuid not null,
  source_kind text not null check (source_kind in ('focus_session', 'task_completion')),
  source_id uuid not null,
  value_unit text not null check (value_unit in ('ms', 'count')),
  value bigint not null check (value >= 0),
  rule_version text not null check (char_length(rule_version) between 1 and 64),
  source_version integer not null check (source_version > 0),
  attributed_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (owner_id, id),
  foreign key (owner_id, goal_id) references df_private.goals(owner_id, id) on delete restrict,
  check ((source_kind = 'focus_session' and value_unit = 'ms')
    or (source_kind = 'task_completion' and value_unit = 'count')),
  unique (owner_id, goal_id, source_kind, source_id)
);

create index goal_contributions_owner_goal_time
  on df_private.goal_contributions(owner_id, goal_id, attributed_at, id);

alter table df_private.goal_contributions enable row level security;
revoke all on table df_private.goal_contributions from public, anon, authenticated;
grant select, insert on table df_private.goal_contributions to service_role;

comment on table df_private.goal_contributions is
  'Append-only owner-bound goal attribution; no client reward/progress writes.';

commit;
