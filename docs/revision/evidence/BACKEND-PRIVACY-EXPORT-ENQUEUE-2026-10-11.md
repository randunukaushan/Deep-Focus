# Backend evidence: EX-21 privacy export enqueue

Date: 2026-10-11

## Implemented

- Added a local PostgreSQL adapter operation for an own-account export job.
- The adapter validates owner, job and operation UUIDs plus the request instant
  before issuing SQL.
- It inserts one `queued` export job with the owner and operation identity.
- A repeated owner/operation returns the existing job instead of creating a
  second job; the generated job ID on a replay is therefore not trusted.
- Returned rows are validated and owner/operation-bound before leaving the
  adapter.

## Evidence

- `tests/domain/postgres-privacy-job-adapter.test.mjs`: enqueue, idempotent
  replay, invalid input, foreign-row fail-closed and existing worker transition
  coverage.
- Focused result: 7/7 passing.
- Typecheck, targeted lint and `git diff --check`: passing.

## Boundaries

This is a local candidate persistence slice. It does not expose a public route,
create an export artifact, issue a download token or contact a live Supabase
database. Those operations need their own authorization, recent-auth,
expiration and delivery gates. Live RLS, integration, device and independent
security review remain `REVIEW_PENDING` or `NOT_RUN`.
