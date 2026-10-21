# Sync-snapshot enqueue idempotency — 2026-10-11

## Implemented

Snapshot enqueue now binds an owner-scoped `operationId` to the original
`jobId` and `snapshotId`. An exact retry replays the existing job; reusing the
same operation key with a different identity fails with
`IDEMPOTENCY_CONFLICT` instead of silently returning the old job.

## Actual checks

- Snapshot enqueue, worker and migration focused tests: **15/15 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **972/972 PASS**.
- Documentation checker after this slice: **PENDING**.

## Gates

Live PostgreSQL/Supabase execution, concurrent idempotency race testing,
Android verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`.
