-- Deep Focus sync change replay metadata candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- independent review and isolated PostgreSQL execution evidence are complete.

begin;

alter table df_private.sync_changes
  add column change_hash text
  check (change_hash is null or change_hash ~ '^[a-f0-9]{64}$');

create index sync_changes_owner_sequence_hash
  on df_private.sync_changes(owner_id, sequence, change_hash);

-- Existing rows intentionally remain NULL rather than receiving a fabricated
-- digest. A reviewed, separately verified backfill is required before those
-- rows can participate in replay validation.

commit;
