# Backend evidence: consistent snapshot builder boundary

Date: 2026-10-11

## Implemented

- Added a local composition boundary that starts `REPEATABLE READ` before any
  source read, rechecks the owner session, calls the injected source reader and
  stages all materialized pages through the same database client/transaction.
- Existing page/materialization validation remains active: duplicate entities,
  invalid digests, unsafe cursors and incomplete pages fail closed.
- Source failure occurs before staging, so an incomplete source cannot publish
  snapshot metadata or pages.
- Job claim, lease/retry transitions and the concrete source-table reader are
  intentionally not guessed in this slice.

## Evidence

- Consistent-builder and staging focused tests: **13/13 PASS**.
- Full repository test suite: **854/854 PASS**.
- Documentation check: **PASS, 80/80 requirements covered**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- `git diff --check`: **PASS**.

## Boundaries

This is a local candidate only. No remote SQL, live database isolation test,
worker execution, device verification or independent review was performed.
Those remain `REVIEW_PENDING`/`NOT_RUN`.
