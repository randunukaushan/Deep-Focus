-- Deep Focus sync snapshot page payload bound.
-- REVIEW_PENDING: additive candidate only; validate existing rows separately
-- before accepting this constraint in a deployed environment.

begin;

alter table df_private.sync_snapshot_pages
  add constraint sync_snapshot_pages_payload_size_check
  check (octet_length(payload::text) <= 262144)
  not valid;

commit;
