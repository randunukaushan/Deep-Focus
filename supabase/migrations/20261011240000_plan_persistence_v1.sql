-- Local candidate only. Do not run against a remote/production project without
-- the plan sync/export/deletion capability gate and independent review.
-- REVIEW_PENDING: this stores the exact confirmed v2 plan edge, but deliberately
-- does not add plan to the current sync feed or client-facing table grants.

begin;

create table df_private.ai_plans (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  id uuid not null,
  workspace_id uuid not null,
  generation_request_id uuid not null,
  proposal_id uuid not null,
  contract_version integer not null check (contract_version = 2),
  version integer not null default 1 check (version > 0),
  local_date date not null,
  time_zone text not null check (char_length(time_zone) between 1 and 100),
  available_start timestamptz not null,
  available_end timestamptz not null,
  explanation text check (explanation is null or char_length(explanation) between 1 and 500),
  state text not null check (state in ('active', 'archived')),
  deleted_at timestamptz,
  confirmed_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  primary key (owner_id, id),
  foreign key (owner_id, workspace_id)
    references df_private.workspaces(owner_id, id) on delete restrict,
  foreign key (owner_id, proposal_id)
    references df_private.ai_proposals(owner_id, id) on delete restrict,
  foreign key (owner_id, generation_request_id)
    references df_private.ai_generation_requests(owner_id, request_id) on delete restrict,
  check (available_end > available_start),
  check (updated_at >= created_at),
  check (confirmed_at >= created_at)
);

create table df_private.ai_plan_blocks (
  owner_id uuid not null,
  plan_id uuid not null,
  id uuid not null,
  kind text not null check (kind in ('focus', 'break')),
  task_id uuid,
  after_block_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reminder_id uuid,
  version integer not null default 1 check (version > 0),
  primary key (owner_id, plan_id, id),
  foreign key (owner_id, plan_id)
    references df_private.ai_plans(owner_id, id) on delete cascade,
  foreign key (owner_id, task_id)
    references df_private.tasks(owner_id, id) on delete restrict,
  foreign key (owner_id, reminder_id)
    references df_private.task_reminders(owner_id, id) on delete restrict,
  check (ends_at > starts_at),
  check ((kind = 'focus' and task_id is not null and after_block_id is null)
    or (kind = 'break' and task_id is null and after_block_id is not null)),
  check (reminder_id is null or kind = 'focus')
);

create index ai_plans_owner_state_updated
  on df_private.ai_plans(owner_id, state, updated_at desc, id);
create index ai_plan_blocks_owner_plan_time
  on df_private.ai_plan_blocks(owner_id, plan_id, starts_at, id);
create unique index ai_plans_owner_proposal
  on df_private.ai_plans(owner_id, proposal_id);

alter table df_private.ai_plans enable row level security;
alter table df_private.ai_plan_blocks enable row level security;
revoke all on table df_private.ai_plans, df_private.ai_plan_blocks from public, anon, authenticated;
grant select, insert, update, delete on table df_private.ai_plans, df_private.ai_plan_blocks to service_role;

comment on table df_private.ai_plans is
  'Owner-bound exact confirmed Plan My Day v2 candidate; sync/export/deletion activation remains review-gated.';
comment on table df_private.ai_plan_blocks is
  'Typed owner-bound focus/break schedule edges; not a completed focus session or break record.';

commit;
