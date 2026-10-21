-- Deep Focus AI and V2 replay receipt immutability candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent data/authorization review.

begin;

create or replace function df_private.reject_ai_sync_receipt_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
begin
  raise exception using errcode = 'check_violation',
    message = 'AI and sync replay receipts are append-only';
end;
$$;

drop trigger if exists ai_apply_receipts_append_only on df_private.ai_apply_receipts;
create trigger ai_apply_receipts_append_only
before update or delete on df_private.ai_apply_receipts
for each row execute function df_private.reject_ai_sync_receipt_mutation();

drop trigger if exists sync_v2_batch_receipts_append_only on df_private.sync_v2_batch_receipts;
create trigger sync_v2_batch_receipts_append_only
before update or delete on df_private.sync_v2_batch_receipts
for each row execute function df_private.reject_ai_sync_receipt_mutation();

comment on function df_private.reject_ai_sync_receipt_mutation() is
  'Prevents rewriting exact-once AI apply and V2 batch replay evidence.';

commit;
