# AI proposal apply type-boundary evidence — 2026-10-12

## Scope

The local AI proposal apply candidate now validates runtime intent and receipt
field types before regular-expression, date or transaction use. Exact durable
replay and proposal-consumption behavior is preserved.

## Automated evidence

- tests/domain/ai-apply-receipt-guard.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local candidate evidence only. A live Supabase transaction, deployed
Edge function, real provider integration, production migration, Android/device
verification and independent security review remain REVIEW_PENDING or NOT_RUN.
