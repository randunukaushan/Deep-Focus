# PostgreSQL sync-pull row-integrity evidence — 2026-10-12

## Scope

The local sync-pull adapter now validates result containers, requires one
high-water row, rejects malformed change rows, and enforces strictly
increasing change sequences within the requested bound.

## Automated evidence

- tests/domain/postgres-sync-pull-adapter.test.mjs: 12/12 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transactions, deployed
Edge execution, provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
