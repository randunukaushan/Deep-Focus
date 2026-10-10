-- Deep Focus personal-core schema candidate.
-- REVIEW_PENDING: local migration artifact only. Do not apply to any remote or
-- production project until independent security review and isolated execution
-- evidence are complete.
--
-- Trust boundary: clients have no table grants. A reviewed server gateway must
-- derive the actor from a verified session and perform ownership checks before
-- using its privileged database connection.

begin;

create schema if not exists df_private;
revoke all on schema df_private from public, anon, authenticated;
grant usage on schema df_private to service_role;
alter default privileges in schema df_private revoke all on tables from public, anon, authenticated;
alter default privileges in schema df_private revoke all on sequences from public, anon, authenticated;
alter default privileges in schema df_private revoke execute on functions from public, anon, authenticated;

create table df_private.profiles (
  owner_id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (char_length(display_name) between 1 and 100 and display_name ~ '[^[:space:]]'),
  account_state text not null default 'active' check (account_state in ('active','deletion_requested','disabled')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table df_private.workspaces (
  id uuid primary key,
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  kind text not null default 'personal' check (kind = 'personal'),
  created_at timestamptz not null default now(),
  unique (owner_id),
  unique (owner_id, id)
);

create table df_private.goals (
  id uuid primary key,
  owner_id uuid not null,
  workspace_id uuid not null,
  title text not null check (char_length(title) between 1 and 240 and title ~ '[^[:space:]]'),
  description text check (char_length(description) <= 4000),
  type text not null check (type in ('focus_time','session_count','task_completion')),
  period text not null check (period in ('daily','weekly','monthly','custom')),
  target_value bigint not null check (target_value between 1 and 9007199254740991),
  target_unit text not null check (target_unit in ('ms','count')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  time_zone text not null check (char_length(time_zone) between 1 and 100),
  status text not null default 'active' check (status in ('active','completed','cancelled','expired')),
  completed_at timestamptz,
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check ((type = 'focus_time' and target_unit = 'ms') or (type <> 'focus_time' and target_unit = 'count')),
  check ((status = 'completed') = (completed_at is not null)),
  foreign key (owner_id, workspace_id) references df_private.workspaces(owner_id, id) on delete restrict,
  unique (owner_id, workspace_id, id)
);

create table df_private.tasks (
  id uuid primary key,
  owner_id uuid not null,
  workspace_id uuid not null,
  goal_id uuid,
  title text not null check (char_length(title) between 1 and 240 and title ~ '[^[:space:]]'),
  description text check (char_length(description) <= 4000),
  status text not null default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  priority text check (priority in ('low','medium','high')),
  due_kind text not null default 'none' check (due_kind in ('none','date','instant')),
  due_date date,
  due_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  deleted_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'completed') = (completed_at is not null)),
  check ((due_kind = 'none' and due_date is null and due_at is null)
    or (due_kind = 'date' and due_date is not null and due_at is null)
    or (due_kind = 'instant' and due_date is null and due_at is not null)),
  foreign key (owner_id, workspace_id) references df_private.workspaces(owner_id, id) on delete restrict,
  foreign key (owner_id, workspace_id, goal_id) references df_private.goals(owner_id, workspace_id, id) on delete restrict,
  unique (owner_id, workspace_id, id)
);

create table df_private.focus_sessions (
  id uuid primary key,
  owner_id uuid not null,
  workspace_id uuid not null,
  task_id uuid,
  task_title_snapshot text check (char_length(task_title_snapshot) <= 240),
  status text not null check (status in ('active','paused','completed','cancelled')),
  contract_version integer not null check (contract_version = 2),
  planned_ms bigint not null check (planned_ms between 1 and 9007199254740991),
  focused_ms bigint not null check (focused_ms >= 0),
  paused_ms bigint not null check (paused_ms >= 0),
  started_at timestamptz not null,
  ended_at timestamptz,
  recorded_at timestamptz,
  last_event_sequence integer not null default 0 check (last_event_sequence >= 0),
  verification_state text not null default 'pending' check (verification_state in ('pending','verified','needs_review')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (focused_ms <= planned_ms),
  check (status <> 'completed' or focused_ms = planned_ms),
  check ((status in ('completed','cancelled')) = (ended_at is not null)),
  check ((ended_at is null and recorded_at is null) or (ended_at >= started_at and recorded_at is not null)),
  foreign key (owner_id, workspace_id) references df_private.workspaces(owner_id, id) on delete restrict,
  foreign key (owner_id, workspace_id, task_id) references df_private.tasks(owner_id, workspace_id, id) on delete restrict,
  unique (owner_id, id)
);

create unique index one_active_personal_session
  on df_private.focus_sessions(owner_id)
  where status in ('active', 'paused');

create table df_private.focus_events (
  id uuid primary key,
  owner_id uuid not null,
  session_id uuid not null,
  sequence integer not null check (sequence > 0),
  type text not null check (type in ('pause','resume','complete','cancel')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  foreign key (owner_id, session_id) references df_private.focus_sessions(owner_id, id) on delete restrict,
  unique (owner_id, session_id, sequence)
);

create table df_private.mutation_receipts (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  operation text not null,
  mutation_id uuid not null,
  request_sha256 text not null check (request_sha256 ~ '^[a-f0-9]{64}$'),
  response_body jsonb not null,
  response_status integer not null check (response_status between 200 and 299),
  committed_at timestamptz not null default now(),
  primary key (owner_id, operation, mutation_id)
);

create table df_private.sync_heads (
  owner_id uuid primary key references df_private.profiles(owner_id) on delete restrict,
  last_sequence bigint not null default 0 check (last_sequence >= 0)
);

create table df_private.sync_changes (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  sequence bigint not null check (sequence > 0),
  entity_kind text not null check (entity_kind in ('profile','goal','task','focus_session')),
  entity_id uuid not null,
  operation text not null check (operation in ('upsert','delete')),
  payload jsonb not null,
  committed_at timestamptz not null default now(),
  primary key (owner_id, sequence)
);

create index tasks_owner_order on df_private.tasks(owner_id, created_at, id) where deleted_at is null;
create index goals_owner_period on df_private.goals(owner_id, starts_at, ends_at) where deleted_at is null;
create index sessions_owner_history on df_private.focus_sessions(owner_id, ended_at, id)
  where status in ('completed', 'cancelled');

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','workspaces','goals','tasks','focus_sessions',
    'focus_events','mutation_receipts','sync_heads','sync_changes'
  ] loop
    execute format('alter table df_private.%I enable row level security', table_name);
    execute format('revoke all on table df_private.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table df_private.%I to service_role', table_name);
    execute format(
      'create policy owner_read on df_private.%I for select to authenticated using ((select auth.uid()) = owner_id)',
      table_name
    );
    execute format(
      'create policy owner_insert on df_private.%I for insert to authenticated with check ((select auth.uid()) = owner_id)',
      table_name
    );
    execute format(
      'create policy owner_update on df_private.%I for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id)',
      table_name
    );
    execute format(
      'create policy owner_delete on df_private.%I for delete to authenticated using ((select auth.uid()) = owner_id)',
      table_name
    );
  end loop;
end $$;

-- No RPCs, triggers, service credentials or direct-client grants are created.
-- Business mutations must lock sync_heads, validate the verified actor and write
-- receipt/change records atomically before this schema can receive traffic.

commit;
