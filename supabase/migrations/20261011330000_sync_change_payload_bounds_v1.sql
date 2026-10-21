-- Deep Focus bounded sync-change payload candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- existing-data review and independent sync/security review.

begin;

alter table df_private.sync_changes
  add constraint sync_changes_payload_size_check
  check (payload is null or octet_length(payload::text) <= 65536)
  not valid;

comment on constraint sync_changes_payload_size_check
  on df_private.sync_changes is
  'New sync upserts are bounded to 64 KiB; existing rows require separate validation.';

commit;
