-- Deep Focus server-authoritative usage allowance candidate.
-- REVIEW_PENDING: local migration artifact only. Do not apply remotely until
-- isolated execution, transaction tests and independent security review.

begin;

create table df_private.capability_allowances (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  capability text not null check (capability in ('ai','cloud_resources')),
  period_key text not null check (period_key ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  limit_units integer not null check (limit_units >= 0),
  consumed_units integer not null default 0 check (consumed_units >= 0),
  reserved_units integer not null default 0 check (reserved_units >= 0),
  policy_version text not null check (char_length(policy_version) between 1 and 64),
  updated_at timestamptz not null default now(),
  primary key (owner_id, capability, period_key),
  check (consumed_units + reserved_units <= limit_units)
);

create table df_private.usage_reservation_receipts (
  owner_id uuid not null,
  receipt_id uuid not null,
  capability text not null check (capability in ('ai','cloud_resources')),
  period_key text not null,
  units integer not null check (units between 1 and 1000),
  policy_version text not null check (char_length(policy_version) between 1 and 64),
  status text not null default 'reserved' check (status in ('reserved','consumed','released')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, receipt_id),
  foreign key (owner_id, capability, period_key)
    references df_private.capability_allowances(owner_id, capability, period_key)
    on delete restrict
);

create index capability_allowances_owner_period
  on df_private.capability_allowances(owner_id, period_key, capability);
create index usage_receipts_owner_period
  on df_private.usage_reservation_receipts(owner_id, period_key, capability, created_at);

alter table df_private.capability_allowances enable row level security;
alter table df_private.usage_reservation_receipts enable row level security;
revoke all on table df_private.capability_allowances, df_private.usage_reservation_receipts from public, anon, authenticated;
grant select, insert, update on table df_private.capability_allowances, df_private.usage_reservation_receipts to service_role;

-- No authenticated-client policies are intentional: allowance and receipt
-- mutation must stay behind verified server authorization and one transaction.

commit;
