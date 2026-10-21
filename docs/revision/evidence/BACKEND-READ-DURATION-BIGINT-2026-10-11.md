# Read-side duration PostgreSQL bigint normalization — 2026-10-11

## Implemented

Session and break history read handlers now normalize PostgreSQL `bigint`
duration strings into bounded safe integers before constructing API DTOs.
Malformed, unsafe, negative or out-of-range values fail closed, preserving the
existing owner-bound read checks and keeping the client contract numeric.

## Actual checks

- Gateway read-handler focused tests: **27/27 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **982/982 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL execution, RLS/account-isolation verification,
Android/device verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
