# Backend evidence — PostgreSQL sync change writer acknowledgement (2026-10-10)

## Implemented

The local sync change writer now requires the `sync_changes` insert to return
the expected next sequence and exact change hash before it advances the locked
owner head. A missing or mismatched acknowledgement fails closed with
`DEPENDENCY_UNAVAILABLE`, so a no-op change insert cannot create a head gap.

## Verification

- `postgres-sync-change-writer.test.mjs`: **4/4 PASS**.
- Full bundled-runtime repository suite after this slice: **596/596 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS**.

## Boundaries

This is a local candidate only. No SQL was sent to Supabase, no remote or
production data was touched, and no deployment was performed. Real PostgreSQL
concurrency/RLS execution, independent security review and Android/device
verification remain **NOT_RUN / REVIEW_PENDING**.
