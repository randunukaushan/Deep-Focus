# Backend evidence — terminal session immutability candidate (2026-10-11)

Added a local, review-gated PostgreSQL migration candidate that prevents
updates to completed or cancelled focus sessions and prevents updates/deletes
of the focus-event ledger. It also rejects event timestamps before the session
start or after database current time. The trigger functions are `security invoker`, do
not grant client access, and remain separate from the current runtime until
SQL execution and independent authorization review.

## Actual checks

- Migration contract checks: **3/3 PASS**.
- Full repository regression: **1197/1197 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Documentation checker: **PASS** — 348 Markdown files, 80/80 requirements,
  936 local links.
- Remote PostgreSQL execution: **NOT_RUN**.
- Live RLS/two-account isolation: **REVIEW_PENDING / NOT_RUN**.
- Independent security review and device verification: **REVIEW_PENDING / NOT_RUN**.

This candidate does not claim that all temporal/session policies are complete;
the existing server session-event adapter remains responsible for ordered
event validation and the approved seconds-based timer behavior is unchanged.
