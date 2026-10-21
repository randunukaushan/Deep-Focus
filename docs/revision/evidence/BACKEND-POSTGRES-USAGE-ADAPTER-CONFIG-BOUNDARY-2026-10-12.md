# PostgreSQL usage adapter configuration evidence — 2026-10-12

## Confirmed finding

The server-authoritative usage adapter assumed its transaction runner and
database client dependencies were callable. Malformed configuration could
therefore reach quota reservation or settlement with an unclassified runtime
failure.

## Change

Usage transaction stores, entitlement/usage services, capability readers and
the underlying database store now validate their injected runner/client before
quota work. Transaction stores also validate the operation callback before
opening a transaction. Existing entitlement, account-session, allowance,
receipt and replay checks remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-usage-adapter.test.mjs`
- Result: 24/24 passed, including malformed dependencies.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1340/1340 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`452` markdown files, `936` local links checked).
- Real PostgreSQL/entitlement integration: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
