# PostgreSQL reminder input boundary evidence — 2026-10-12

## Confirmed finding

Reminder create, patch and delete appliers accessed operation, body, actor or
resource fields before proving the client and outer request shape. Malformed
runtime values could therefore fail through an unclassified path before the
intended validation result.

## Change

The three reminder operations now validate the client, operation, request body,
actor UUID and (for patch/delete) resource UUID before SQL. Local-device-only
delivery, task ownership, optimistic versions, timezone validation and
tombstone behavior remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-reminder-applier.test.mjs`
- Result: 4/4 passed, including malformed-boundary coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1376/1376 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`482` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
