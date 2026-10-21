# Goal contribution PostgreSQL bigint normalization — 2026-10-11

## Implemented

The goal-contribution adapter now accepts PostgreSQL `bigint` values returned
as decimal strings by a Node PostgreSQL driver. Focus-session `focused_ms` and
stored contribution `value` are normalized only when they are non-negative
safe integers. Invalid, negative, malformed or unsafe values fail closed, and
the existing owner, unit, version and idempotency checks remain enforced.

## Actual checks

- Goal-contribution and progress focused tests: **10/10 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **976/976 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live Supabase/PostgreSQL execution, RLS/account-isolation verification,
Android/device verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
