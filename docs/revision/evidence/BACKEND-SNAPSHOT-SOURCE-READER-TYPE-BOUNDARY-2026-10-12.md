# PostgreSQL snapshot source-reader type-boundary evidence — 2026-10-12

## Confirmed finding

The owner-bound snapshot source reader applied a regular expression directly
to its runtime `ownerId` input. A non-string value could throw before the
intended validation error was returned.

## Change

Owner identity now uses an explicit string UUID guard and fails before any
database query. Existing owner predicates, high-water validation, tombstone
handling and bigint normalization are unchanged. Malformed database result
shapes and non-object rows now fail as a safe dependency error before record
materialization. A malformed database client is also rejected before the head
query.

## Evidence

- Focused test: `tests/domain/postgres-sync-snapshot-source-reader.test.mjs`
- Result: 7/7 passed, including unsafe owner, client, row and result-shape
  cases.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1345/1345 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`455` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN` because local prerequisites are
  unavailable.
- Independent security review: `REVIEW_PENDING`.
