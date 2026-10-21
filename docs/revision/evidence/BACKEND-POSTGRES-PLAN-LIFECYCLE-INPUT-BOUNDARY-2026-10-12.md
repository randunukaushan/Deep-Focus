# PostgreSQL plan-lifecycle input boundary evidence — 2026-10-12

## Confirmed finding

The plan lifecycle adapter accepted malformed runner/client configuration and
used direct UUID/instant checks on runtime request values. Invalid composition
or request input could therefore reach an unclassified runtime failure before
the intended safe boundary response.

## Change

Lifecycle apply, adapter construction and action-candidate construction now
validate client, runner, owner/plan identity and clock values before storage
access. Plan/reminder locking, optimistic versions, owner predicates and
tombstone behavior remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-plan-lifecycle-adapter.test.mjs`
- Result: 5/5 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1412/1412 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`470` markdown files, `936` local links checked).
- Real PostgreSQL integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
