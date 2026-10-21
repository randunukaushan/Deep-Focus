# PostgreSQL V2 sync-transaction input boundary evidence — 2026-10-12

## Confirmed finding

V2 group construction and append admission used regex checks before proving
runtime identity types, and the composition adapter could open a transaction
before rejecting a malformed append request.

## Change

The builder now validates its input and entity identity types before hashing.
The append adapter validates owner, transaction and change-container types
before opening a transaction. Replay comparison, ordered sequences, owner
predicates and atomic head advancement remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-sync-v2-transaction-adapter.test.mjs`
- Result: 6/6 passed.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1393/1393 PASS** across **237** test files, run in
  six bounded batches to avoid Windows command-line argument truncation.
- Docs checker: **PASS** (`467` markdown files, `936` local links checked).
- Real PostgreSQL/RLS integration: `NOT_RUN`; independent security review:
  `REVIEW_PENDING`.
