# PostgreSQL AI proposal-apply configuration evidence — 2026-10-12

## Confirmed finding

The proposal-apply store assumed a valid transaction runner and operation
callback. Malformed dependencies could reach the confirmation/apply transaction
and surface as an unclassified runtime failure.

## Change

The store now validates runner configuration, owner identity and operation
callback before opening the transaction. Replay, proposal ownership, explicit
confirmation, domain application and receipt-write semantics remain unchanged.

## Evidence

- Focused test: `tests/domain/postgres-ai-proposal-apply-adapter.test.mjs`
- Result: 5/5 passed, including malformed dependencies.
- Typecheck and affected lint: passed after the change.
- Real PostgreSQL/AI integration: `NOT_RUN`; independent review:
  `REVIEW_PENDING`.
