-- Deep Focus schema migration receipt immutability candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent data/authorization review.

begin;

create or replace function df_private.reject_schema_receipt_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
begin
  raise exception using errcode = 'check_violation',
    message = 'schema migration receipts are append-only';
end;
$$;

drop trigger if exists schema_migration_receipts_append_only on df_private.schema_migration_receipts;
create trigger schema_migration_receipts_append_only
before update or delete on df_private.schema_migration_receipts
for each row execute function df_private.reject_schema_receipt_mutation();

comment on function df_private.reject_schema_receipt_mutation() is
  'Prevents changing or removing applied migration identity and checksum evidence.';

commit;
