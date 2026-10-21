-- Deep Focus v2 transaction-group sync foundation for saved plans.
-- REVIEW_PENDING: local candidate only. It is deliberately separate from the
-- current v1 sync feed and must not be applied remotely before independent
-- review, runtime RLS evidence and the v2 capability gate.

begin;

create table df_private.sync_v2_heads (
  owner_id uuid primary key references df_private.profiles(owner_id) on delete restrict,
  last_sequence bigint not null default 0 check (last_sequence >= 0),
  privacy_epoch bigint not null default 1 check (privacy_epoch > 0),
  updated_at timestamptz not null default now()
);

create table df_private.sync_v2_transaction_groups (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  transaction_id uuid not null,
  contract_version integer not null check (contract_version = 2),
  privacy_epoch bigint not null check (privacy_epoch > 0),
  committed_through bigint not null check (committed_through > 0),
  change_count integer not null check (change_count between 1 and 500),
  group_digest text not null check (group_digest ~ '^[a-f0-9]{64}$'),
  committed_at timestamptz not null default now(),
  primary key (owner_id, transaction_id),
  unique (owner_id, committed_through)
);

create table df_private.sync_v2_changes (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  sequence bigint not null check (sequence > 0),
  transaction_id uuid not null,
  entity_kind text not null check (entity_kind in ('profile','goal','task','focus_session','settings','break','reminder','plan')),
  entity_id uuid not null,
  operation text not null check (operation in ('upsert','delete')),
  payload jsonb,
  change_hash text not null check (change_hash ~ '^[a-f0-9]{64}$'),
  primary key (owner_id, sequence),
  unique (owner_id, transaction_id, sequence),
  foreign key (owner_id, transaction_id)
    references df_private.sync_v2_transaction_groups(owner_id, transaction_id)
    on delete restrict,
  check ((operation = 'delete' and payload is null) or (operation = 'upsert' and payload is not null))
);

create index sync_v2_changes_owner_transaction
  on df_private.sync_v2_changes(owner_id, transaction_id, sequence);
create index sync_v2_changes_owner_sequence
  on df_private.sync_v2_changes(owner_id, sequence);

alter table df_private.sync_v2_heads enable row level security;
alter table df_private.sync_v2_transaction_groups enable row level security;
alter table df_private.sync_v2_changes enable row level security;
revoke all on table df_private.sync_v2_heads, df_private.sync_v2_transaction_groups, df_private.sync_v2_changes from public, anon, authenticated;
grant select, insert, update, delete on table df_private.sync_v2_heads, df_private.sync_v2_transaction_groups, df_private.sync_v2_changes to service_role;

comment on table df_private.sync_v2_heads is
  'Review-gated v2 sync cursor and privacy epoch; does not alter the v1 sync head.';
comment on table df_private.sync_v2_transaction_groups is
  'Review-gated atomic group commitments for complete plan/reminder replication.';
comment on table df_private.sync_v2_changes is
  'Review-gated v2 changes including plan tombstones; server-only until capability admission.';

commit;
