# Session revocation receipt write boundary — 2026-10-12

## Implemented

The PostgreSQL account-session revocation adapter now validates receipt values
before writing JSONB. It rejects duplicate session IDs, non-boolean current
session state and provider statuses outside `pending`, `confirmed` and
`needs_retry`, while preserving owner, mutation and hash validation.

## Actual checks

- Session revocation plan and PostgreSQL adapter focused suites: **20/20 PASS**.
- Malformed receipt writes: rejected before the SQL insert in all three cases.
- No remote database, provider call or production migration was run.

## Gates

Live Supabase Auth/provider revocation, RLS, concurrent database execution,
Android restart/account-switch verification and independent security review
remain `NOT_RUN` / `REVIEW_PENDING`.
