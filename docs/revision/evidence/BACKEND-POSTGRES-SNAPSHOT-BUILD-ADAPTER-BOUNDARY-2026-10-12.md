# PostgreSQL snapshot build adapter boundary evidence — 2026-10-12

## Confirmed finding

The snapshot build adapter validated cursor configuration during `build`, but
did not validate its transaction-runner dependency when constructed. A malformed
runner could therefore fail as an unclassified runtime error before staging.

## Change

The factory now requires a callable `withTransaction` runner and fails closed
with `VALIDATION_FAILED` before cursor materialization or staging. Existing
owner binding, cursor signing, page materialization and atomic staging remain
unchanged.

## Evidence

- Focused test: `tests/domain/postgres-snapshot-build-adapter.test.mjs`
- Result: 5/5 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1361/1361 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`462` markdown files, `936` local links checked).
- Real PostgreSQL/Auth integration: `NOT_RUN`; Android/device verification:
  `NOT_RUN`; independent security review: `REVIEW_PENDING`.
