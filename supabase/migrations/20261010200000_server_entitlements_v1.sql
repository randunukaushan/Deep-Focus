-- Deep Focus server-authoritative capability entitlement candidate.
-- REVIEW_PENDING: local migration artifact only; provider/catalog writes and
-- production activation require separate approved integration and review.

begin;

create table df_private.server_entitlements (
  owner_id uuid not null references df_private.profiles(owner_id) on delete restrict,
  capability text not null check (capability in ('ai','cloud_resources')),
  status text not null check (status in ('pending','active','expired','revoked')),
  verified_by text not null check (verified_by = 'server'),
  policy_version text not null check (char_length(policy_version) between 1 and 64),
  expires_at timestamptz,
  offer_id text,
  updated_at timestamptz not null default now(),
  primary key (owner_id, capability)
);

alter table df_private.server_entitlements enable row level security;
revoke all on table df_private.server_entitlements from public, anon, authenticated;
grant select, insert, update, delete on table df_private.server_entitlements to service_role;

create index server_entitlements_active_expiry
  on df_private.server_entitlements(capability, status, expires_at, owner_id);

commit;
