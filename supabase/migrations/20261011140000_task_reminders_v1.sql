-- Deep Focus reminder intent candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- independent security review and isolated PostgreSQL execution evidence are complete.

begin;

create table df_private.task_reminders (
  id uuid primary key,
  owner_id uuid not null,
  task_id uuid not null,
  scheduled_for timestamptz not null,
  time_zone text not null check (char_length(time_zone) between 1 and 100),
  enabled boolean not null default true,
  delivery text not null default 'local_device' check (delivery = 'local_device'),
  version integer not null default 1 check (version > 0),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (owner_id, task_id) references df_private.tasks(owner_id, id) on delete restrict,
  unique (owner_id, id)
);

create index task_reminders_owner_schedule
  on df_private.task_reminders(owner_id, scheduled_for, id)
  where deleted_at is null;

alter table df_private.task_reminders enable row level security;
revoke all on table df_private.task_reminders from public, anon, authenticated;
grant select, insert, update, delete on table df_private.task_reminders to service_role;

alter table df_private.sync_changes
  drop constraint if exists sync_changes_entity_kind_check;
alter table df_private.sync_changes
  add constraint sync_changes_entity_kind_check
  check (entity_kind in ('profile', 'goal', 'task', 'focus_session', 'settings', 'break', 'reminder'));

commit;
