# PostgreSQL AI plan-reader type-boundary evidence — 2026-10-12

## Scope

The local PostgreSQL AI plan reader now rejects coerced UUID values, malformed
rows and non-string runtime identities. Existing owner binding, time-window,
ordering and duplicate-block checks remain active.

## Automated evidence

- tests/domain/postgres-ai-plan-read-adapter.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transactions, deployed
Edge execution, provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
