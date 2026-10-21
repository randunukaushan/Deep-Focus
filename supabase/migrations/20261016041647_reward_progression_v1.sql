-- Deep Focus V1 reward-progression schema candidate.
-- REVIEW_PENDING: local migration artifact only. It must not be applied to a
-- remote project until isolated execution, gateway authorization and an
-- independent security/data review have been completed.
--
-- Clients receive no table privileges. A future trusted gateway must derive the
-- actor from a verified session, validate the terminal focus record, and apply
-- the event, summary and achievement writes atomically. This migration does not
-- install that gateway path or claim live Supabase verification.

begin;

create table df_private.reward_progress (
  owner_id uuid primary key references df_private.profiles(owner_id) on delete restrict,
  total_xp bigint not null default 0 check (total_xp >= 0),
  rules_version text not null default 'v1' check (rules_version = 'v1'),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table df_private.progression_events (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  consumer text not null check (consumer = 'rewards:v1'),
  source_operation_key text not null check (char_length(source_operation_key) between 10 and 128),
  source_type text not null check (source_type = 'focus_session'),
  source_id uuid not null,
  xp_delta bigint not null check (xp_delta >= 0),
  rules_version text not null check (rules_version = 'v1'),
  created_at timestamptz not null default now(),
  primary key (owner_id, consumer, source_operation_key),
  foreign key (owner_id, source_id) references df_private.focus_sessions(owner_id, id) on delete restrict,
  check (source_operation_key = 'terminal:' || source_id::text)
);

create index progression_events_owner_source
  on df_private.progression_events(owner_id, source_type, source_id);

create table df_private.user_achievements (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  achievement_id text not null check (achievement_id in (
    'first_focus_session',
    'focus_sessions_5',
    'focus_minutes_60',
    'focus_sessions_25',
    'focus_minutes_600',
    'streak_3_days',
    'streak_7_days',
    'first_goal_completed'
  )),
  unlocked_at timestamptz not null,
  source_operation_key text,
  rules_version text not null check (rules_version = 'v1'),
  backfill_marker boolean not null default false,
  summary_presented_at timestamptz,
  primary key (owner_id, achievement_id),
  check (summary_presented_at is null or summary_presented_at >= unlocked_at),
  check (not backfill_marker or summary_presented_at is not null)
);

create index user_achievements_owner_unlocked
  on df_private.user_achievements(owner_id, unlocked_at desc, achievement_id);

create or replace function df_private.reject_progression_event_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
begin
  raise exception using errcode = 'check_violation',
    message = 'progression event ledger is append-only';
end;
$$;

create or replace function df_private.reject_ineligible_progression_event()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
declare session_status text;
begin
  select status into session_status
    from df_private.focus_sessions
   where owner_id = new.owner_id and id = new.source_id;
  if session_status is distinct from 'completed' then
    raise exception using errcode = 'check_violation',
      message = 'progression event requires a completed owner-bound focus session';
  end if;
  return new;
end;
$$;

create or replace function df_private.reject_invalid_achievement_mutation()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, df_private
as $$
begin
  if tg_op = 'DELETE' then
    raise exception using errcode = 'check_violation',
      message = 'achievement unlock is immutable';
  end if;

  if old.owner_id is distinct from new.owner_id
     or old.achievement_id is distinct from new.achievement_id
     or old.unlocked_at is distinct from new.unlocked_at
     or old.source_operation_key is distinct from new.source_operation_key
     or old.rules_version is distinct from new.rules_version
     or old.backfill_marker is distinct from new.backfill_marker
     or old.summary_presented_at is not null
     or new.summary_presented_at is null then
    raise exception using errcode = 'check_violation',
      message = 'achievement unlock may only receive one presentation receipt';
  end if;
  return new;
end;
$$;

drop trigger if exists progression_events_append_only on df_private.progression_events;
create trigger progression_events_append_only
before update or delete on df_private.progression_events
for each row execute function df_private.reject_progression_event_mutation();

drop trigger if exists progression_events_completed_session on df_private.progression_events;
create trigger progression_events_completed_session
before insert on df_private.progression_events
for each row execute function df_private.reject_ineligible_progression_event();

drop trigger if exists user_achievements_mutation_guard on df_private.user_achievements;
create trigger user_achievements_mutation_guard
before update or delete on df_private.user_achievements
for each row execute function df_private.reject_invalid_achievement_mutation();

do $$
declare table_name text;
begin
  foreach table_name in array array['reward_progress', 'progression_events', 'user_achievements'] loop
    execute format('alter table df_private.%I enable row level security', table_name);
    execute format('revoke all on table df_private.%I from public, anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on table df_private.%I to service_role', table_name);
  end loop;
end $$;

comment on table df_private.reward_progress is
  'Owner-scoped V1 XP summary. Level is derived from total_xp by the canonical progression rules.';
comment on table df_private.progression_events is
  'Append-only, owner-bound V1 reward ledger. terminal:<sessionId> is unique per owner and consumer.';
comment on table df_private.user_achievements is
  'One immutable V1 achievement unlock per owner and achievement; only the one-time Summary receipt may be added.';

commit;
