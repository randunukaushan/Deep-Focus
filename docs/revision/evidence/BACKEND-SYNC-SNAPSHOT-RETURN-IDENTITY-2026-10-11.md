# Sync-snapshot returned-row identity — 2026-10-11

## Implemented

The PostgreSQL sync-snapshot worker adapter now validates the owner and job
identity on rows returned from claim, completion and failure queries. A row
that does not match the requested owner/job is rejected as a dependency
failure, even when the SQL predicate was expected to exclude it.

## Actual checks

- Snapshot worker, adapter and migration focused tests: **11/11 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **968/968 PASS**.
- Documentation checker after this slice: **PENDING**.

## Gates

Live PostgreSQL/Supabase execution, concurrent lease-race testing, Android
verification and independent security review remain `NOT_RUN`/`REVIEW_PENDING`.
