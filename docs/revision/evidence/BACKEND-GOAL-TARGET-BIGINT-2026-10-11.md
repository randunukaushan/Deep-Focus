# Goal target PostgreSQL bigint normalization — 2026-10-11

## Implemented

Goal gateway reads now normalize the `target_value bigint` column into a
positive safe integer before returning a DTO. Malformed, negative or unsafe
values fail closed, while owner-bound reads and progress validation remain
unchanged.

## Actual checks

- Gateway read-handler focused tests: **29/29 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **984/984 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL execution, RLS/account-isolation verification,
Android/device verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
