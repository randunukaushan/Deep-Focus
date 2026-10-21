-- Deep Focus versioned migration receipt candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated PostgreSQL execution and independent security review.

begin;

-- Fresh installs already create this table in personal_core, atomically with
-- the first runner receipt. Keep this migration compatible with that path.
create table if not exists df_private.schema_migration_receipts (
  migration_id text primary key check (migration_id ~ '^[0-9]{14}_[a-z0-9_]{1,96}$'),
  checksum_sha256 text not null check (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  schema_version integer not null check (schema_version > 0),
  applied_at timestamptz not null default now(),
  applied_by text not null check (applied_by in ('migration_runner','manual_review'))
);

alter table df_private.schema_migration_receipts enable row level security;
revoke all on table df_private.schema_migration_receipts from public, anon, authenticated;
grant select, insert, update, delete on table df_private.schema_migration_receipts to service_role;

comment on table df_private.schema_migration_receipts is
  'Server-only migration identity/checksum receipts; no client or automatic production runner is implied.';

commit;
