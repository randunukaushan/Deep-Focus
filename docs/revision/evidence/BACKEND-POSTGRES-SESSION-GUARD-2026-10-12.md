# PostgreSQL session-guard evidence — 2026-10-12

## Scope

The shared local session guard now validates runtime identity types and requires
exactly one valid active, unrevoked owner-bound session row. Missing, foreign or
revoked sessions remain authentication failures; malformed database results
fail closed as dependency failures.

## Automated evidence

- tests/domain/postgres-session-guard.test.mjs: 4/4 passed.
- Typecheck: passed.
- Affected lint: passed.

## Verification boundary

This is local adapter evidence only. Live Supabase Auth/RLS/transactions,
deployed Edge execution, Android/device verification and independent security
review remain REVIEW_PENDING or NOT_RUN.
