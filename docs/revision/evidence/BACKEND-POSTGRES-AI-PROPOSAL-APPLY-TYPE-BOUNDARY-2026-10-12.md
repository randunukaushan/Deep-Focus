# PostgreSQL AI proposal-apply type-boundary evidence — 2026-10-12

## Scope

The proposal-apply adapter now rejects non-string owner identities before it
opens a PostgreSQL transaction. Existing replay, single-client transaction and
malformed-proposal checks remain unchanged.

## Automated evidence

- tests/domain/postgres-ai-proposal-apply-adapter.test.mjs: 4/4 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transactions, deployed
Edge execution, provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
