-- Deep Focus bounded core mutation receipt candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- existing-data review and independent authorization/security review.

begin;

alter table df_private.mutation_receipts
  add constraint mutation_receipts_response_shape_check
  check (jsonb_typeof(response_body) = 'object'
    and octet_length(response_body::text) <= 262144)
  not valid;

comment on constraint mutation_receipts_response_shape_check
  on df_private.mutation_receipts is
  'New replay receipts are bounded JSON objects; existing rows require separate validation.';

commit;
