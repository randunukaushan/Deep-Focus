# Sync-snapshot error-state validation — 2026-10-11

## Implemented

The sync-snapshot enqueue adapter now rejects a returned row that carries a
`safe_error_code` while still in `queued`, `running`, `succeeded` or `expired`
state. This mirrors the versioned migration invariant and keeps malformed
storage responses fail-closed.

## Actual checks

- Snapshot job adapter and migration focused tests: **6/6 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **973/973 PASS**.
- Documentation checker after this slice: **PENDING**.

## Gates

Live PostgreSQL/Supabase execution, concurrent storage-race testing, Android
verification and independent security review remain `NOT_RUN`/`REVIEW_PENDING`.
