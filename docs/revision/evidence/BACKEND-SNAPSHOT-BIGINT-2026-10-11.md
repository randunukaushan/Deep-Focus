# Sync snapshot PostgreSQL bigint normalization — 2026-10-11

## Implemented

The PostgreSQL snapshot source reader now converts database `bigint` strings
for goal targets, session durations/sequences and break durations into bounded
safe integers before creating upsert payloads. Malformed or unsafe values fail
closed, while tombstones remain unchanged.

## Actual checks

- Snapshot source-reader focused tests: **4/4 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **986/986 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL snapshot execution, RLS/account-isolation verification,
Android/device verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
