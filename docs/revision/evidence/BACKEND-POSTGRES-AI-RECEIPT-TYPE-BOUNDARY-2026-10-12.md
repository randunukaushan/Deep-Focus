# PostgreSQL AI apply-receipt adapter type-boundary evidence — 2026-10-12

## Scope

The local PostgreSQL adapter now validates direct owner, receipt identity,
hash, decimal and stored-row values before SQL lookup or receipt write. The
existing owner-bound row locks, exact replay and foreign-return rejection
behavior remains in place.

## Automated evidence

- tests/domain/postgres-ai-apply-receipt-adapter.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase database execution, RLS,
transaction isolation, deployed Edge execution, production migration,
Android/device verification and independent security review remain
REVIEW_PENDING or NOT_RUN.
