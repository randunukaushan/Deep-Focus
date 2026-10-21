-- Deep Focus privacy export/deletion job candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution, retention review and independent security review.

begin;

create table df_private.privacy_jobs (
  job_id uuid not null,
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  kind text not null check (kind in ('export', 'deletion')),
  state text not null default 'queued' check (state in ('queued', 'running', 'succeeded', 'failed', 'expired')),
  operation_id uuid not null,
  lease_owner uuid,
  fencing_version bigint not null default 0 check (fencing_version >= 0),
  lease_expires_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  progress_checkpoint jsonb,
  safe_error_code text,
  artifact_locator text,
  artifact_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, job_id),
  unique (owner_id, operation_id),
  check (safe_error_code is null or safe_error_code ~ '^[A-Z][A-Z0-9_]{0,79}$'),
  check (state = 'failed' or safe_error_code is null),
  check ((lease_owner is null) = (lease_expires_at is null)),
  check (artifact_expires_at is null or artifact_expires_at > created_at),
  check ((state = 'succeeded') or (artifact_locator is null and artifact_expires_at is null))
);

create index privacy_jobs_due
  on df_private.privacy_jobs(state, next_attempt_at, job_id);
create index privacy_jobs_owner_updated
  on df_private.privacy_jobs(owner_id, updated_at desc, job_id desc);

alter table df_private.privacy_jobs enable row level security;
revoke all on table df_private.privacy_jobs from public, anon, authenticated;
grant select, insert, update, delete on table df_private.privacy_jobs to service_role;

comment on table df_private.privacy_jobs is
  'Owner-bound durable privacy job candidate; raw artifacts and provider errors never belong in the public response.';
comment on column df_private.privacy_jobs.artifact_locator is
  'Private server-side locator only; never return it from a job status response or log it.';

commit;
