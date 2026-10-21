# Session-revocation adapter validation — 2026-10-11

## Implemented

The revocation outbox worker adapter now validates request identity, lease
expiry, retry time, attempt bounds and allowlisted provider error codes before
opening a database query. Returned transition rows must retain the requested
`revocation_id`; foreign rows fail closed.

## Actual checks

- Revocation worker, adapter and migration focused tests: **27/27 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **971/971 PASS**.
- Documentation checker after this slice: **PENDING**.

## Gates

Live PostgreSQL/Supabase execution, provider revocation, concurrent lease-race
testing, Android verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`.
