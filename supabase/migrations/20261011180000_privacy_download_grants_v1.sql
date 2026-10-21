-- Deep Focus private export download-grant candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- retention/TTL review, isolated SQL execution and independent security review.

begin;

create table df_private.privacy_download_grants (
  owner_id uuid not null,
  grant_id uuid not null,
  job_id uuid not null,
  token_digest text not null check (token_digest ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  primary key (owner_id, grant_id),
  unique (owner_id, job_id),
  foreign key (owner_id, job_id) references df_private.privacy_jobs(owner_id, job_id) on delete restrict,
  check (consumed_at is null or consumed_at >= created_at)
);

create index privacy_download_grants_expiry
  on df_private.privacy_download_grants(owner_id, expires_at, grant_id);

alter table df_private.privacy_download_grants enable row level security;
revoke all on table df_private.privacy_download_grants from public, anon, authenticated;
grant select, insert, update, delete on table df_private.privacy_download_grants to service_role;

comment on column df_private.privacy_download_grants.token_digest is
  'Digest of the short-lived grant secret; raw secrets are never persisted.';

commit;
