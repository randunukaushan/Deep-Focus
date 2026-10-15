# PostgreSQL sync-transaction row-integrity evidence — 2026-10-12

## Scope

The local sync transaction adapter now rejects malformed result containers and
ambiguous replay, head, insert or advance rows before reporting sync success.
Existing owner binding, hash verification, idempotent replay and transaction
ordering remain active.

## Automated evidence

- tests/domain/postgres-sync-transaction-adapter.test.mjs: 10/10 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transactions, deployed
Edge execution, provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
