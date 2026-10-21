# Server sync transaction type-boundary evidence — 2026-10-12

## Confirmed finding

The sync transaction boundary passed actor IDs, cursor values and change fields
directly to regular expressions and object access. Unsafe runtime values,
including `Symbol` and `null`, could throw before the safe page/change error or
before the transaction callback was kept closed.

## Change

- UUID, decimal and cursor checks now require strings before matching.
- Null/non-object changes are rejected before field validation.
- Invalid page/change input is rejected before transaction opening.
- Existing owner matching, ordering, replay digest, concurrent-head and
  rollback behavior remains unchanged.

Focused evidence: `tests/domain/server-sync-transaction.test.mjs` —
**12/12 passed**.
Typecheck and affected lint — **passed**.

This is local candidate evidence only. Real PostgreSQL transaction locking,
RLS/account isolation, device recovery and independent security review remain
`REVIEW_PENDING` or `NOT_RUN`.
