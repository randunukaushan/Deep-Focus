# AI admission pre-validation evidence — 2026-10-12

## Scope

AI generation request input validation now runs before session recheck,
entitlement lookup or allowance reservation. This prevents malformed requests
from consuming quota or opening admission database work. Existing authenticated
session, server entitlement, allowance reservation and idempotent replay
ordering remains unchanged for valid input.

## Automated evidence

- tests/domain/postgres-ai-generation-admission-adapter.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local candidate evidence only. Live Supabase session/RLS/allowance
transactions, deployed Edge execution, provider integration, production
migration, Android/device verification and independent security review remain
REVIEW_PENDING or NOT_RUN.
