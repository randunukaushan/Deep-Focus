-- Deep Focus revocation outbox lease/fencing candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent security review are complete.

begin;

alter table df_private.app_session_revocation_outbox
  add column lease_id uuid,
  add column lease_until timestamptz;

alter table df_private.app_session_revocation_outbox
  add constraint app_session_revocation_lease_state_check
  check ((state = 'processing') = (lease_id is not null and lease_until is not null));

create index app_session_revocation_lease_due
  on df_private.app_session_revocation_outbox(state, lease_until, next_attempt_at, revocation_id);

commit;
