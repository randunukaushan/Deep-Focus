# Sync change writer PostgreSQL bigint normalization — 2026-10-11

## Implemented

The committed sync-change writer now normalizes goal targets, session timer
durations and break durations before hashing and persisting JSON change
payloads. Malformed, unsafe or out-of-range values fail closed, preventing
driver-specific `bigint` strings from entering the local sync contract.

## Actual checks

- Sync-change writer focused tests: **13/13 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **987/987 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL sync execution, RLS/account-isolation verification,
Android/device verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
