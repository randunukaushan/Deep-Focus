# PostgreSQL usage-service input boundary evidence — 2026-10-12

## Confirmed finding

Usage service `reserve`, `settle` and capability `read` methods entered the
transaction before validating their service-level request identities,
capability, period, units and clock. Malformed requests could therefore reach
session or entitlement queries.

## Change

Service-level validation now runs before the transaction boundary. The methods
remain Promise-based, so malformed requests use rejected Promises as before.
Server-authoritative entitlement/quota decisions, allowance locking, replay
receipts and settlement transitions remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-usage-adapter.test.mjs`
- Result: 25/25 passed, including no-transaction malformed-input coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1381/1381 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`487` markdown files, `936` local links checked).
- Real entitlement/allowance integration: `NOT_RUN`; independent security
  review: `REVIEW_PENDING`.
