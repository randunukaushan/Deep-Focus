# Usage reservation receipt schema reconciliation — 2026-10-11

## Implemented

The usage reservation receipt migration now includes the bounded
`remaining_units` field that the PostgreSQL adapter stores and reads for
idempotent reservation replay. The column is non-negative and remains behind
the existing service-only RLS/grant boundary.

## Actual checks

- Usage, migration, AI-boundary and backend-contract focused tests: **61/61 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **966/966 PASS**.
- Documentation check and `git diff --check`: **PASS**.

## Gates

Live Supabase SQL/RLS execution, concurrent reservation testing, provider
integration and independent security review remain `NOT_RUN`/`REVIEW_PENDING`.
