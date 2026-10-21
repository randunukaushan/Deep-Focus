# PostgreSQL focus-session input boundary evidence — 2026-10-12

## Confirmed finding

The start-session and session-event appliers read operation, body, actor or
resource fields before proving the client and outer request shape. Malformed
runtime values could therefore take an unclassified path before the intended
validation result.

## Change

Both operations now validate the client, operation, request body, actor UUID
and (for events) session resource UUID before SQL. Owner/workspace checks,
ordered event sequencing, optimistic versions and focused/paused millisecond
calculations remain unchanged.

## Evidence

- Focused tests: `tests/domain/postgres-session-applier.test.mjs` and
  `tests/domain/postgres-session-event-applier.test.mjs`
- Result: 19/19 passed, including malformed-boundary coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1376/1376 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`482` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
