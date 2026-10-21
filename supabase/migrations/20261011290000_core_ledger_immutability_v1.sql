-- Deep Focus core receipt/change ledger immutability candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent data/authorization review.

begin;

create or replace function df_private.reject_core_ledger_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
begin
  raise exception using errcode = 'check_violation',
    message = 'core replay and sync ledgers are append-only';
end;
$$;

drop trigger if exists mutation_receipts_append_only on df_private.mutation_receipts;
create trigger mutation_receipts_append_only
before update or delete on df_private.mutation_receipts
for each row execute function df_private.reject_core_ledger_mutation();

drop trigger if exists sync_changes_append_only on df_private.sync_changes;
create trigger sync_changes_append_only
before update or delete on df_private.sync_changes
for each row execute function df_private.reject_core_ledger_mutation();

comment on function df_private.reject_core_ledger_mutation() is
  'Prevents rewriting idempotency receipts and committed sync history.';

commit;
