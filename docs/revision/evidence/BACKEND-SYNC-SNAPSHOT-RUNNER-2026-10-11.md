# Backend evidence: sync snapshot worker runner

Date: 2026-10-11

## Implemented

- Added a separate owner-bound source-reader candidate for the approved
  personal snapshot entities (`goal`, `task`, `session`, `break`, `settings`,
  `reminder`). It reads through the same transaction client, validates the
  decimal sync high-water mark and row identity/version, and preserves deleted
  rows as tombstones.
- Added a composition boundary that requires a scheduler-supplied session ID
  and immutable build window before invoking the source reader and builder.
- Added a server-only executor composition for claim → materialize → complete /
  retry. It requires the scheduler context explicitly and does not create a
  scheduler or remote connection.
- Added a bounded one-job runner over the snapshot worker store.
- The runner invokes the materializer only after a successful claim and passes
  only owner, job and snapshot identity from the claimed row.
- Successful materialization is fenced through `complete`; failures map to an
  allowlisted code and bounded exponential retry time.
- Raw provider/materializer error messages are never passed to the store.
- A missing claim prevents materializer execution.

## Evidence

- Source-reader focused tests: **2/2 PASS**.
- Materializer composition focused tests: **2/2 PASS**.
- Executor composition focused tests: **2/2 PASS**.
- Runner focused tests: **3/3 PASS**.
- Full repository suite: **869/869 PASS** (latest run after adding the job executor composition).

## Boundaries

The runner does not choose a source reader, credentials, scheduler or remote
database. Actual materialization, live RLS/transaction tests, device checks and
independent review remain `REVIEW_PENDING`/`NOT_RUN`.
