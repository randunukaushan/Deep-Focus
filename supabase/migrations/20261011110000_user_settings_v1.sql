-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- settings RPC, sync representation and independent security review are complete.

begin;

create table df_private.user_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references df_private.profiles(owner_id) on delete restrict,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  ui_locale text not null default 'en' check (ui_locale ~ '^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$'),
  default_focus_duration_minutes integer not null default 25 check (default_focus_duration_minutes between 1 and 1440),
  default_break_duration_minutes integer not null default 5 check (default_break_duration_minutes in (5, 10, 15)),
  ai_features_enabled boolean not null default false,
  version integer not null default 1 check (version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table df_private.user_settings enable row level security;
revoke all on table df_private.user_settings from public, anon, authenticated;
grant select, insert, update, delete on table df_private.user_settings to service_role;

commit;
