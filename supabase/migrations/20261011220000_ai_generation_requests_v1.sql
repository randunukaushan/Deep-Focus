-- Local candidate only. Do not run against a remote/production project without
-- the unresolved request-retention/deadline policy and independent review.
-- REVIEW_PENDING: this migration stores lifecycle state and a bounded worker
-- identity; it does not select provider, retry, lease or retention durations.

begin;

create table df_private.ai_generation_requests (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  request_id uuid not null,
  action_type text not null check (action_type = 'plan_my_day'),
  intent_sha256 text not null check (intent_sha256 ~ '^[a-f0-9]{64}$'),
  input_snapshot jsonb not null check (jsonb_typeof(input_snapshot) = 'object'),
  input_versions jsonb not null check (jsonb_typeof(input_versions) = 'array'),
  reservation_id uuid not null,
  status text not null check (status in ('pending', 'completed', 'failed', 'cancelled')),
  version integer not null check (version > 0),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deadline_at timestamptz not null,
  completed_at timestamptz,
  failure_code text check (failure_code in ('PROVIDER_UNAVAILABLE', 'INVALID_OUTPUT', 'DEADLINE_EXCEEDED', 'ACCESS_REVOKED', 'INTERNAL_FAILURE', 'INPUT_STALE')),
  reserved_actions integer not null check (reserved_actions >= 0),
  consumed_actions integer not null check (consumed_actions >= 0),
  proposal_id uuid,
  proposal_contract_version integer,
  primary key (owner_id, request_id),
  foreign key (owner_id, reservation_id)
    references df_private.usage_reservation_receipts(owner_id, receipt_id)
    on delete restrict,
  foreign key (owner_id, proposal_id)
    references df_private.ai_proposals(owner_id, id)
    on delete restrict,
  check (updated_at >= created_at),
  check (deadline_at > created_at),
  check ((status = 'pending' and completed_at is null and failure_code is null and proposal_id is null and proposal_contract_version is null and reserved_actions = 1 and consumed_actions = 0)
    or (status = 'completed' and completed_at is not null and failure_code is null and proposal_id is not null and proposal_contract_version = 2 and reserved_actions = 0 and consumed_actions = 1)
    or (status = 'failed' and completed_at is not null and failure_code is not null and proposal_id is null and proposal_contract_version is null and reserved_actions = 0 and consumed_actions = 0)
    or (status = 'cancelled' and completed_at is not null and failure_code is null and proposal_id is null and proposal_contract_version is null and reserved_actions = 0 and consumed_actions = 0))
);

create unique index ai_generation_requests_owner_intent
  on df_private.ai_generation_requests(owner_id, intent_sha256);
create index ai_generation_requests_owner_status_deadline
  on df_private.ai_generation_requests(owner_id, status, deadline_at, request_id);

create table df_private.ai_generation_jobs (
  owner_id uuid not null,
  request_id uuid not null,
  state text not null check (state in ('queued', 'running', 'reconciling')),
  dispatch_key uuid not null,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  fence bigint not null default 1 check (fence > 0),
  lease_id uuid,
  lease_until timestamptz,
  last_error_code text check (last_error_code in ('PROVIDER_UNAVAILABLE', 'INVALID_OUTPUT', 'DEADLINE_EXCEEDED', 'ACCESS_REVOKED', 'INTERNAL_FAILURE', 'INPUT_STALE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, request_id),
  foreign key (owner_id, request_id)
    references df_private.ai_generation_requests(owner_id, request_id)
    on delete cascade,
  check ((lease_id is null and lease_until is null) or (lease_id is not null and lease_until is not null)),
  check (state = 'reconciling' or last_error_code is null)
);

create unique index ai_generation_jobs_owner_dispatch
  on df_private.ai_generation_jobs(owner_id, dispatch_key);
create index ai_generation_jobs_due
  on df_private.ai_generation_jobs(state, lease_until, updated_at, owner_id, request_id);

alter table df_private.ai_generation_requests enable row level security;
alter table df_private.ai_generation_jobs enable row level security;
revoke all on table df_private.ai_generation_requests, df_private.ai_generation_jobs from public, anon, authenticated;
grant select, insert, update on table df_private.ai_generation_requests, df_private.ai_generation_jobs to service_role;

comment on table df_private.ai_generation_requests is
  'Owner-bound Plan My Day lifecycle candidate; retention, deadline and provider policy remain review-gated.';
comment on table df_private.ai_generation_jobs is
  'Owner-bound fenced work identity candidate; no provider payload or credential is stored.';

commit;
