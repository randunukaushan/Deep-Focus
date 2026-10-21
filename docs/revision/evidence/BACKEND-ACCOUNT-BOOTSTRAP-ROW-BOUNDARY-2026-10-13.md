# Account bootstrap row-boundary evidence — 2026-10-13

## Implemented

The PostgreSQL account bootstrap adapter now validates every returned row in a
result container before mapping profile, personal workspace or sync-head data.
Null, array and other malformed row values fail closed as a dependency error;
duplicate retry and owner checks remain unchanged.

## Actual verification

- Focused test: `tests/domain/postgres-account-bootstrap-adapter.test.mjs`
- Typecheck: **PASS**
- Affected lint: **PASS**
- Full repository suite: **1458 tests: 1452 PASS, 0 FAIL, 6 SKIPPED** across
  **258** test files.
- Docs checker: **PASS** (`531` markdown files, `936` local links checked)

## Boundaries

- Local account bootstrap candidate only; no provider or live database was contacted.
- No guest account, automatic claim/upload or production migration was performed.
- Independent security review and device verification: `REVIEW_PENDING / NOT_RUN`.
