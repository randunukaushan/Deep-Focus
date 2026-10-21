# PostgreSQL sync-snapshot worker boundary evidence — 2026-10-12

## Confirmed finding

The worker adapter validated several request fields inside transaction
callbacks. Malformed requests could therefore open a transaction before being
rejected, and malformed runner configuration was not rejected at construction.

## Change

The adapter now validates the runner and all list/claim/complete/fail request
identity, clock, lease, retry and bounded-code fields before opening a
transaction. Lease state validation, fencing predicates, owner binding and
safe retry transitions are unchanged.

## Evidence

- Focused test: `tests/domain/postgres-sync-snapshot-worker-adapter.test.mjs`
- Result: 7/7 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1379/1379 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`465` markdown files, `936` local links checked).
- Real PostgreSQL worker execution: `NOT_RUN`; Android/device verification:
  `NOT_RUN`; independent security review: `REVIEW_PENDING`.
