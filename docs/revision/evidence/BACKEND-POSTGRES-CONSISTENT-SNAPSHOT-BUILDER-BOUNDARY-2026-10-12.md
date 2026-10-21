# PostgreSQL consistent snapshot builder boundary evidence — 2026-10-12

## Confirmed finding

The snapshot builder validated each build request but did not validate its
transaction-runner dependency when the builder was constructed. A malformed
runner could therefore produce an unclassified runtime failure instead of a
safe boundary error.

## Change

The factory now requires a callable `withTransaction` runner and fails closed
with `VALIDATION_FAILED` before any transaction or source read. Repeatable-read
ordering, session recheck, owner binding and snapshot staging are unchanged.

## Evidence

- Focused test: `tests/domain/postgres-consistent-snapshot-builder.test.mjs`
- Result: 5/5 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1356/1356 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`461` markdown files, `936` local links checked).
- Real PostgreSQL/Auth integration: `NOT_RUN`; Android/device verification:
  `NOT_RUN`; independent security review: `REVIEW_PENDING`.
