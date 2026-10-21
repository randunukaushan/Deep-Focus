# PostgreSQL mutation-receipt boundary evidence — 2026-10-12

## Scope

The local mutation adapter now validates owner/head/receipt result containers
and committed sync sequence types before reporting apply or replay success.
Owner-scoped idempotency, session recheck, head locking and durable receipt
ordering remain active.

## Automated evidence

- tests/domain/postgres-domain-mutation-adapter.test.mjs: 14/14 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local mutation-adapter evidence only. Live Supabase transactions/RLS,
deployed Edge execution, Android/device verification and independent security
review remain REVIEW_PENDING or NOT_RUN.
