# AI generation request creator boundary evidence — 2026-10-12

## Confirmed finding

The request creator factory did not validate its transaction runner, and the
transaction helper did not validate a database client after validating the
request. Valid input with a malformed dependency could therefore reach an
unbounded runtime error before request/job persistence.

## Change

Runner and client dependency guards now fail closed before SQL. Malformed
request input keeps the existing `VALIDATION_FAILED` precedence. Atomic request
and queued-job creation, duplicate replay, reservation/dispatch identity
checks and bounded snapshots remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-ai-generation-request-creator.test.mjs`
- Result: 9/9 passed, including malformed runner/client coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1378/1378 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`484` markdown files, `936` local links checked).
- Real provider-backed AI integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
