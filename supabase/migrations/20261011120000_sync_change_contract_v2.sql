-- Deep Focus sync change contract v2.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- independent security review and isolated PostgreSQL execution evidence are complete.

begin;

-- Delete tombstones are intentionally represented by a NULL payload. The
-- original prototype's NOT NULL constraint was incompatible with the approved
-- delete/sync contract and with the existing server change writer.
alter table df_private.sync_changes
  alter column payload drop not null;

alter table df_private.sync_changes
  drop constraint if exists sync_changes_entity_kind_check;

alter table df_private.sync_changes
  add constraint sync_changes_entity_kind_check
  check (entity_kind in ('profile', 'goal', 'task', 'focus_session', 'settings', 'break'));

alter table df_private.sync_changes
  add constraint sync_changes_payload_operation_check
  check ((operation = 'delete' and payload is null)
    or (operation = 'upsert' and payload is not null));

commit;
