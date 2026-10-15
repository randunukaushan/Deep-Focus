-- Deep Focus durable sync-snapshot request job candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution, retention review and independent security review.

begin;

create table df_private.sync_snapshot_jobs (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  job_id uuid not null,
  snapshot_id uuid not null,
  operation_id uuid not null,
  state text not null default 'queued' check (state in ('queued','running','succeeded','failed','expired')),
  lease_owner uuid,
  fencing_version bigint not null default 0 check (fencing_version >= 0),
  lease_expires_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  safe_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, job_id),
  unique (owner_id, operation_id),
  check (safe_error_code is null or safe_error_code ~ '^[A-Z][A-Z0-9_]{0,79}$'),
  check (state = 'failed' or safe_error_code is null),
  check ((lease_owner is null) = (lease_expires_at is null)),
  check ((state = 'running') = (lease_owner is not null and lease_expires_at is not null))
);

create unique index sync_snapshot_jobs_owner_snapshot
  on df_private.sync_snapshot_jobs(owner_id, snapshot_id);
create index sync_snapshot_jobs_due
  on df_private.sync_snapshot_jobs(state, next_attempt_at, job_id);
create index sync_snapshot_jobs_owner_updated
  on df_private.sync_snapshot_jobs(owner_id, updated_at desc, job_id desc);

alter table df_private.sync_snapshot_jobs enable row level security;
revoke all on table df_private.sync_snapshot_jobs from public, anon, authenticated;
grant select, insert, update, delete on table df_private.sync_snapshot_jobs to service_role;

comment on table df_private.sync_snapshot_jobs is
  'Owner-bound durable snapshot request; materialization creates sync_snapshots only after a coherent read.';
comment on column df_private.sync_snapshot_jobs.snapshot_id is
  'Reserved immutable snapshot identity; no snapshot pages or ready metadata exist until the worker succeeds.';

commit;
