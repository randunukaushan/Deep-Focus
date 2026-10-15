# PostgreSQL V2 batch-receipt input boundary evidence — 2026-10-12

## Confirmed finding

The batch-receipt adapter passed runtime identity, hash and timestamp values to
regular-expression checks without first proving they were strings. A direct
transaction operation with malformed values could therefore escape the intended
safe validation path.

## Change

Receipt identity, stored-row identity and write hash/timestamp fields now use
explicit runtime type guards before validation or SQL. Replay locking,
owner-bound receipt writes and immutable response semantics remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-sync-v2-batch-receipt-adapter.test.mjs`
- Result: 8/8 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1401/1401 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`468` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
