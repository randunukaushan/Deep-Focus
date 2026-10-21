-- Deep Focus immutable goal-attribution ledger candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent data/authorization review.

begin;

create or replace function df_private.reject_goal_contribution_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
begin
  raise exception using errcode = 'check_violation',
    message = 'goal contribution ledger is append-only';
end;
$$;

drop trigger if exists goal_contributions_append_only on df_private.goal_contributions;
create trigger goal_contributions_append_only
before update or delete on df_private.goal_contributions
for each row execute function df_private.reject_goal_contribution_mutation();

comment on function df_private.reject_goal_contribution_mutation() is
  'Prevents rewriting or removing immutable goal attribution history.';

commit;
