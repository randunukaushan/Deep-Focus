# Worker fencing PostgreSQL bigint normalization — 2026-10-11

## Implemented

The sync-snapshot and privacy-job PostgreSQL worker adapters now normalize
`fencing_version bigint` values returned as decimal strings by a PostgreSQL
driver. Non-negative safe values are accepted for lease fencing; malformed or
unsafe values fail closed before worker state transitions continue.

## Actual checks

- Worker adapter focused tests: **15/15 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **991/991 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL worker concurrency, RLS/account-isolation verification,
Android/device verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
