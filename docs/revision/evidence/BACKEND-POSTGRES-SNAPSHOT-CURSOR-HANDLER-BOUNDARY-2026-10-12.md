# PostgreSQL snapshot cursor-handler boundary evidence — 2026-10-12

## Confirmed finding

The cursor handler trusted construction-time dependency shapes and used regular
expression checks directly on request identity values. Malformed dependencies or
runtime values could therefore produce an unclassified exception before the
intended safe boundary response.

## Change

The handler now validates the transaction runner, cursor secret and request
object/UUID types before cursor verification or page access. Existing signed
owner/snapshot scope checks, session recheck and privacy-preserving not-found
behavior remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-snapshot-cursor-handlers.test.mjs`
- Result: 7/7 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1368/1368 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`463` markdown files, `936` local links checked).
- Real PostgreSQL/Auth integration: `NOT_RUN`; Android/device verification:
  `NOT_RUN`; independent security review: `REVIEW_PENDING`.
