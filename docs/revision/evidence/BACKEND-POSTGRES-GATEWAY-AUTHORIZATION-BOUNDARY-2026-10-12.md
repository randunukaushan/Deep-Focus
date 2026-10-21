# PostgreSQL gateway authorization boundary evidence — 2026-10-12

## Scope

The local gateway owner lookup now rejects malformed database result
containers. The resource table allowlist, parameterized IDs, duplicate-row
check and repeated in-transaction ownership checks remain active.

## Automated evidence

- tests/domain/postgres-gateway-authorization-adapter.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transactions, deployed
Edge execution, provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
