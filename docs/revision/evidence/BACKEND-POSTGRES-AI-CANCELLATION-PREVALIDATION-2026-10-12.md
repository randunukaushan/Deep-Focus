# PostgreSQL AI cancellation pre-validation evidence — 2026-10-12

## Scope

The local cancellation adapter now validates owner/request/mutation identities,
request hash and clock before opening its transaction. Malformed stored request
or receipt rows still fail closed. Valid pending cancellation preserves the
existing reservation release, request update and durable receipt order.

## Automated evidence

- tests/domain/postgres-ai-generation-cancellation-adapter.test.mjs: 6/6 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase RLS/transaction rollback,
allowance settlement, deployed Edge execution, Android/device verification and
independent security review remain REVIEW_PENDING or NOT_RUN.
