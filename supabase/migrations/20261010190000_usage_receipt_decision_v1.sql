-- Deep Focus usage replay decision metadata candidate.
-- REVIEW_PENDING: local migration artifact only. Existing rows remain NULL and
-- must be reviewed/backfilled before replay can be treated as authoritative.

begin;

alter table df_private.usage_reservation_receipts
  add column remaining_units integer
  check (remaining_units is null or remaining_units >= 0);

commit;
