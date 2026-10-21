# PostgreSQL sync-change resource-ID boundary evidence — 2026-10-12

## Confirmed finding

The sync-change writer selected a resource ID and passed any truthy runtime
value directly to a UUID regular expression. A malformed resource ID could
therefore escape the intended dependency-failure path before the committed
entity read.

## Change

Resource IDs now require a string UUID before entity reads, payload materializing
or sync-ledger writes. Verified actor ownership, payload limits and head
advancement remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-sync-change-writer.test.mjs`
- Result: 18/18 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1430/1430 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`471` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
