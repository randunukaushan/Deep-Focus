-- Local candidate only. Do not run against a remote/production project without
-- independent review and migration authority.
-- REVIEW_PENDING: proposal validation and atomic apply integration remain gated.

begin;

create table df_private.ai_proposals (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  id uuid not null,
  contract_version integer not null check (contract_version in (1, 2)),
  version integer not null check (version > 0),
  generation_request_id uuid not null,
  action_type text not null check (action_type in ('plan_my_day', 'break_down_task')),
  expires_at timestamptz not null,
  review_digest text not null check (review_digest ~ '^[a-f0-9]{64}$'),
  state text not null check (state in ('ready', 'applied', 'expired')),
  input_versions jsonb not null check (jsonb_typeof(input_versions) = 'array'),
  operations jsonb not null check (jsonb_typeof(operations) = 'array' and jsonb_array_length(operations) between 1 and 25),
  selected_operation_ids jsonb,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, id),
  check ((state = 'ready' and selected_operation_ids is null and applied_at is null)
    or (state = 'applied' and jsonb_typeof(selected_operation_ids) = 'array' and jsonb_array_length(selected_operation_ids) between 1 and 25 and applied_at is not null)
    or (state = 'expired' and applied_at is null)),
  check (contract_version <> 2 or action_type = 'plan_my_day')
);

create unique index ai_proposals_owner_generation_request
  on df_private.ai_proposals(owner_id, generation_request_id, version);
create index ai_proposals_owner_state_expiry
  on df_private.ai_proposals(owner_id, state, expires_at, id);

alter table df_private.ai_proposals enable row level security;
revoke all on table df_private.ai_proposals from public, anon, authenticated;
grant select, insert, update on table df_private.ai_proposals to service_role;

comment on table df_private.ai_proposals is
  'Owner-bound, short-lived, reviewed AI proposal state; provider prompts are not stored here.';

commit;
