-- Deep Focus terminal focus-session and event immutability candidate.
-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- isolated SQL execution and independent data/authorization review.

begin;

create or replace function df_private.reject_terminal_focus_session_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
begin
  if old.status in ('completed', 'cancelled') then
    raise exception using errcode = 'check_violation',
      message = 'terminal focus session is immutable';
  end if;
  return new;
end;
$$;

create or replace function df_private.reject_focus_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
begin
  raise exception using errcode = 'check_violation',
    message = 'focus event ledger is append-only';
end;
$$;

create or replace function df_private.reject_invalid_focus_event_time()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
declare
  session_started_at timestamptz;
begin
  select started_at into session_started_at
    from df_private.focus_sessions
   where owner_id = new.owner_id and id = new.session_id;
  if session_started_at is null
     or new.occurred_at < session_started_at
     or new.occurred_at > current_timestamp then
    raise exception using errcode = 'check_violation',
      message = 'focus event timestamp is outside the session time window';
  end if;
  return new;
end;
$$;

drop trigger if exists focus_sessions_terminal_immutable on df_private.focus_sessions;
create trigger focus_sessions_terminal_immutable
before update on df_private.focus_sessions
for each row execute function df_private.reject_terminal_focus_session_mutation();

drop trigger if exists focus_events_append_only on df_private.focus_events;
create trigger focus_events_append_only
before update or delete on df_private.focus_events
for each row execute function df_private.reject_focus_event_mutation();

drop trigger if exists focus_events_time_window on df_private.focus_events;
create trigger focus_events_time_window
before insert on df_private.focus_events
for each row execute function df_private.reject_invalid_focus_event_time();

comment on function df_private.reject_terminal_focus_session_mutation() is
  'Prevents post-terminal focus-session mutation; application transitions remain owner-checked.';

comment on function df_private.reject_focus_event_mutation() is
  'Keeps the focus event ledger append-only; corrections use a new reviewed event contract.';

comment on function df_private.reject_invalid_focus_event_time() is
  'Rejects event timestamps before session start or after database current time.';

commit;
