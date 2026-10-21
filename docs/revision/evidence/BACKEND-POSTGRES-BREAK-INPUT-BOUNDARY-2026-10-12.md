# PostgreSQL break-record input boundary evidence — 2026-10-12

## Confirmed finding

The `recordBreak` applier checked the operation and body shape but did not
validate the database client, outer request container or actor identity before
accessing request fields and storage.

## Change

The applier now rejects malformed clients with `DEPENDENCY_UNAVAILABLE` and
malformed requests or actor identities with `VALIDATION_FAILED` before SQL.
Existing actual-duration calculation, terminal focus-session ownership,
duplicate protection and millisecond units are unchanged.

## Evidence

- Focused test: `tests/domain/postgres-break-applier.test.mjs`
- Result: 6/6 passed, including malformed-boundary coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1376/1376 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`482` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
