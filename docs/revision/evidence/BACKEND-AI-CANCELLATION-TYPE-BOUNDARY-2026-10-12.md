# AI generation cancellation type-boundary evidence — 2026-10-12

## Scope

The local cancellation transition now rejects malformed runtime reservation and
clock values before UUID/date parsing. A malformed stored request remains a
dependency failure, and valid pending, cancelled, completed and failed
transitions keep their existing reservation and replay semantics.

## Automated evidence

- tests/domain/ai-generation-cancellation.test.mjs: 7/7 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local candidate evidence only. Live Supabase transaction locking,
allowance settlement, deployed Edge execution, production migration,
Android/device verification and independent security review remain
REVIEW_PENDING or NOT_RUN.
