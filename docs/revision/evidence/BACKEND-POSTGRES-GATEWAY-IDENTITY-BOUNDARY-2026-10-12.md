# PostgreSQL gateway identity-boundary evidence — 2026-10-12

## Scope

The local gateway now validates generated privacy-export and sync-snapshot job
and snapshot IDs as UUID strings before opening protected database work.

## Automated evidence

- tests/domain/postgres-gateway-handlers.test.mjs: 20/20 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local gateway evidence only. Live Edge execution, Supabase RLS,
Android/device verification and independent security review remain
REVIEW_PENDING or NOT_RUN.
