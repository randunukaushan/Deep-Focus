-- Deep Focus sync snapshot staging candidate.
-- REVIEW_PENDING: local migration artifact only. Do not apply remotely until
-- isolated execution, retention review and independent security review.

begin;

create table df_private.sync_snapshots (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  snapshot_id uuid not null,
  contract_version integer not null check (contract_version = 1),
  high_water bigint not null check (high_water >= 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  page_count integer not null check (page_count > 0),
  manifest_digest text not null check (manifest_digest ~ '^[a-f0-9]{64}$'),
  status text not null default 'building' check (status in ('building','ready','expired','failed')),
  primary key (owner_id, snapshot_id),
  check (expires_at > created_at)
);

create table df_private.sync_snapshot_pages (
  owner_id uuid not null,
  snapshot_id uuid not null,
  page_index integer not null check (page_index >= 0),
  page_count integer not null check (page_count > 0),
  high_water bigint not null check (high_water >= 0),
  page_digest text not null check (page_digest ~ '^[a-f0-9]{64}$'),
  payload jsonb not null,
  next_cursor text,
  created_at timestamptz not null default now(),
  primary key (owner_id, snapshot_id, page_index),
  foreign key (owner_id, snapshot_id) references df_private.sync_snapshots(owner_id, snapshot_id) on delete restrict,
  check (page_index < page_count),
  check (next_cursor is null or (char_length(next_cursor) between 1 and 2048 and next_cursor !~ '[[:cntrl:]]')),
  unique (owner_id, snapshot_id, page_index)
);

create index sync_snapshots_owner_state on df_private.sync_snapshots(owner_id, status, expires_at, snapshot_id);
create index sync_snapshot_pages_owner_snapshot on df_private.sync_snapshot_pages(owner_id, snapshot_id, page_index);

alter table df_private.sync_snapshots enable row level security;
alter table df_private.sync_snapshot_pages enable row level security;
revoke all on table df_private.sync_snapshots, df_private.sync_snapshot_pages from public, anon, authenticated;
grant select, insert, update, delete on table df_private.sync_snapshots, df_private.sync_snapshot_pages to service_role;

create policy snapshot_owner_read on df_private.sync_snapshots
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy snapshot_owner_insert on df_private.sync_snapshots
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy snapshot_owner_update on df_private.sync_snapshots
  for update to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy snapshot_owner_delete on df_private.sync_snapshots
  for delete to authenticated using ((select auth.uid()) = owner_id);

create policy snapshot_page_owner_read on df_private.sync_snapshot_pages
  for select to authenticated using ((select auth.uid()) = owner_id);
create policy snapshot_page_owner_insert on df_private.sync_snapshot_pages
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy snapshot_page_owner_update on df_private.sync_snapshot_pages
  for update to authenticated using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);
create policy snapshot_page_owner_delete on df_private.sync_snapshot_pages
  for delete to authenticated using ((select auth.uid()) = owner_id);

-- Page count/digest completeness, expiry cleanup and ready-state transitions
-- remain server transaction responsibilities; no client RPC is exposed here.

commit;
