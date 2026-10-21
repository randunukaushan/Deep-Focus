# AI plan reader boundary evidence — 2026-10-12

## Confirmed finding

The saved Plan My Day reader factory and direct client reader did not prove
their runner or database-client dependencies before use. A malformed dependency
could therefore produce an unbounded runtime error instead of a safe boundary
result.

## Change

The factory now rejects malformed transaction runners before exposing the load
operation, and the direct reader rejects malformed clients before identity or
plan queries. Owner binding, plan/Block DTO validation, time-window ordering
and duplicate-block rejection remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-ai-plan-read-adapter.test.mjs`
- Result: 7/7 passed, including malformed dependency coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1377/1377 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`483` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
