# Backend evidence: sync snapshot enqueue candidate

Date: 2026-10-11

## Implemented

- Added the local `sync_snapshot_jobs` migration with owner identity,
  operation-id deduplication, reserved snapshot identity, retry/lease fields,
  RLS enabled and no public/anonymous/authenticated table grants.
- Added `POST /v1/sync/snapshots`, which requires an authenticated app session,
  UUID idempotency key and an exactly empty request body.
- The handler returns HTTP 202 with only job/snapshot identity and coarse state;
  it never claims that pages are ready.
- Repeated requests for the same owner and operation replay the existing job.

## Evidence

- Enqueue, gateway and validation focused tests: **35/35 PASS**.
- Migration contract test: included and passing.
- TypeScript: **PASS**.

## Boundaries

This is a local candidate. No snapshot worker, materialization, remote SQL
execution, live RLS test, Android verification or independent review was run.
Those remain `REVIEW_PENDING`/`NOT_RUN`.
