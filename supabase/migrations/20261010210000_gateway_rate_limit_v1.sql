-- REVIEW_PENDING: local migration artifact only; do not apply remotely until
-- the shared-counter, retention and security review gates are complete.
begin;

create table df_private.gateway_rate_limit_buckets (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  operation text not null check (operation ~ '^[a-z][A-Za-z0-9.]{0,79}$'),
  window_start_ms bigint not null check (window_start_ms >= 0),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (owner_id, operation, window_start_ms)
);

create index gateway_rate_limit_retention
  on df_private.gateway_rate_limit_buckets(window_start_ms, updated_at);

alter table df_private.gateway_rate_limit_buckets enable row level security;
revoke all on table df_private.gateway_rate_limit_buckets from public, anon, authenticated;
grant select, insert, update, delete on table df_private.gateway_rate_limit_buckets to service_role;

commit;
