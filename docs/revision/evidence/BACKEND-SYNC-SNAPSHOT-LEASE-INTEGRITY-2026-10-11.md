# Sync-snapshot lease integrity — 2026-10-11

## Implemented

Sync-snapshot jobs now reject partial lease state. The database candidate,
worker state machine and PostgreSQL adapter require `lease_owner` and
`lease_expires_at` to be set together, preventing malformed queued/running rows
from bypassing fencing and retry invariants.

## Actual checks

- Snapshot worker/adapter/migration focused tests: **14/14 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **964/964 PASS**.
- Documentation check and `git diff --check`: **PASS**.

## Gates

Live Supabase SQL/RLS execution, actual snapshot interruption/restart testing,
Android verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`.
