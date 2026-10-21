# PostgreSQL entitlement type-boundary evidence — 2026-10-12

## Scope

The local entitlement reader now validates runtime owner identity types, rejects
null or malformed rows, and refuses duplicate capability results. Session
rechecking and server-verification markers remain required before a capability
is returned.

## Automated evidence

- tests/domain/postgres-entitlement-adapter.test.mjs: 10/10 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transactions, deployed
Edge execution, provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
