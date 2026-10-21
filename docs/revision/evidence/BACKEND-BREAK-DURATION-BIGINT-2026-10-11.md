# Break duration PostgreSQL bigint normalization — 2026-10-11

## Implemented

The `recordBreak` PostgreSQL adapter now accepts decimal-string `bigint`
durations returned by a Node PostgreSQL driver, while keeping the bounded
0–24-hour policy. Returned planned duration, actual duration and outcome must
match the validated mutation before the record is exposed; mismatches fail
closed as a dependency failure.

## Actual checks

- Break adapter tests: **5/5 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite: **978/978 PASS**.
- Documentation checker: **PENDING**.

## Gates

Live PostgreSQL execution, RLS/account-isolation verification,
Android/device verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`. No remote database, production migration,
deployment, commit or push was performed.
