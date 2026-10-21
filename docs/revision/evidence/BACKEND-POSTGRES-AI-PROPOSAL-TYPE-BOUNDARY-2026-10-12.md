# PostgreSQL AI proposal type-boundary evidence — 2026-10-12

## Scope

The local proposal adapter now validates direct owner/proposal identities,
stored-row shapes, hashes, versions, dates and selected operation IDs before
read or apply state is exposed. Owner locks, live version/digest/expiry checks
and fail-closed JSON validation remain in place.

## Automated evidence

- tests/domain/postgres-ai-proposal-adapter.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transactions, deployed
Edge execution, provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
