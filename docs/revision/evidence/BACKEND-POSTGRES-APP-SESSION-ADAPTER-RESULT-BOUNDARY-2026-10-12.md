# PostgreSQL app-session adapter result-boundary evidence — 2026-10-12

## Confirmed finding

The app-session persistence adapter assumed callable transaction runners and
well-formed `{ rows }` query results. Malformed containers or rows could cause
raw property-access failures in session persistence and revocation paths, or
allow ambiguous singleton state to be trusted.

## Change

The adapter now validates runner configuration, database clients, result
containers and returned row objects before using them. Owner/session identity,
revocation and outbox checks remain bound to the verified account and
transaction. Duplicate singleton rows are rejected, and transaction
operations must be callable.

## Evidence

- Focused test: `tests/domain/postgres-app-session-adapter.test.mjs`
- Result: 15/15 passed, including malformed runner, duplicate rows and query
  results.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1351/1351 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`460` markdown files, `936` local links checked).
- Real PostgreSQL/Auth integration: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
