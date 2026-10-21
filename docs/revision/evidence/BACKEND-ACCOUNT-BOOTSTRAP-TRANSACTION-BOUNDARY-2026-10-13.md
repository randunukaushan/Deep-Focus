# Account bootstrap transaction callback evidence — 2026-10-13

## Implemented

The PostgreSQL account bootstrap transaction store now validates that its
operation callback is callable before invoking the injected transaction
runner. Invalid composition fails with `VALIDATION_FAILED`; client, owner,
duplicate-retry and rollback behavior remain unchanged.

## Actual verification

- Focused tests: `tests/domain/postgres-account-bootstrap-adapter.test.mjs`
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1458 tests: 1452 PASS, 0 FAIL, 6 SKIPPED** across
  **258** test files.
- Docs checker: **PASS** (`533` markdown files, `936` local links checked)

## Boundaries

- Local account bootstrap candidate only; no provider or live database was contacted.
- No guest account, production migration, deployment, merge, push or commit was performed.
- Independent security review and device verification: `REVIEW_PENDING / NOT_RUN`.
