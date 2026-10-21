# PostgreSQL entitlement input boundary evidence — 2026-10-12

## Confirmed finding

Entitlement reads validated the owner but allowed capability and session
identity validation to occur after transaction/session access. The reader
factory also passed malformed identity values into the transaction callback.

## Change

Owner, capability and session identity validation now runs before transaction
and active-session checks. Server verification markers, entitlement states
including `grace`, owner scoping and capability admission behavior remain
unchanged.

## Evidence

- Focused test: `tests/domain/postgres-entitlement-adapter.test.mjs`
- Result: 13/13 passed, including no-transaction malformed-identity coverage.
- Typecheck and affected lint: passed after the change.
- Full repository suite: **1382/1382 PASS** across **237** test files, run in
  six bounded batches.
- Docs checker: **PASS** (`488` markdown files, `936` local links checked).
- Real Supabase entitlement/RLS integration: `NOT_RUN`; independent security
  review: `REVIEW_PENDING`.
