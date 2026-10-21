# Backend evidence: EX-22 privacy-job status read

Date: 2026-10-11

## Implemented

- Added `GET /v1/privacy/jobs/{id}` to the gateway route allowlist.
- The read handler rechecks the authenticated application session inside the
  transaction before accessing the job row.
- The SQL predicate binds both `owner_id` and `job_id`; missing or foreign jobs
  return the same privacy-preserving not-found result.
- The response is validated through the privacy-job response contract and
  contains only `id`, `kind`, `state`, `updatedAt` and a safe error code when
  the job is failed. Private artifact metadata and locators are not selected
  or returned.

## Evidence

- `tests/domain/gateway-router.test.mjs`: route allowlist coverage.
- `tests/domain/postgres-gateway-read-handlers.test.mjs`: owner binding,
  coarse DTO omission, missing/foreign-job privacy behavior and fail-closed
  malformed-row handling.
- Focused result: 32/32 passing.
- Typecheck, targeted lint and `git diff --check`: passing.

## Boundaries

This is a local candidate only. No live Supabase database was contacted and
the migration was not applied. Live RLS/account-isolation evidence, Android
verification and independent security review remain `REVIEW_PENDING` or
`NOT_RUN`.
