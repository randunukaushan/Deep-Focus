# PostgreSQL usage-ledger boundary evidence — 2026-10-12

## Scope

The local usage adapter now validates result containers and rejects ambiguous
allowance or reservation-receipt rows before quota reservation or settlement.
Owner binding, server entitlement admission, idempotent receipts and atomic
settlement predicates remain active.

## Automated evidence

- tests/domain/postgres-usage-adapter.test.mjs: 21/21 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local usage-ledger evidence only. No paid service or real allowance was
used; production data, deployment, Android/device verification and independent
security review remain REVIEW_PENDING or NOT_RUN.
