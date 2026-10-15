# PostgreSQL goal-contribution input boundary evidence — 2026-10-12

## Confirmed finding

The goal-contribution adapter applied regular-expression and date validation
inside the transaction callback without first proving that the request was an
object. Runtime values such as `Symbol` could therefore take the wrong error
path, and malformed requests could open a transaction before rejection.

## Change

Contribution request validation now proves the outer object, owner/goal/session
and contribution UUIDs, and clock value before opening the transaction. The
method remains Promise-based for callers. Actual focused-time attribution stays
in milliseconds, cancelled sessions remain excluded from session-count goals,
and the existing idempotent insert/replay rules are unchanged.

## Evidence

- Focused test: `tests/domain/postgres-goal-contribution-applier.test.mjs`
- Result: 8/8 passed, including no-transaction malformed-input coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1376/1376 PASS** across **237** test files, run in
  six bounded batches; no existing test regression was observed.
- Docs checker: **PASS** (`482` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
