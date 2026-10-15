# Authenticated account bootstrap flow — 2026-10-11

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — provider-authenticated account and app-session creation

## Outcome

Added a local candidate flow that verifies a Supabase provider token through the
claims adapter, derives the owner and session IDs from verified claims, then
creates the app-session row plus profile, personal workspace and sync head
inside one caller-owned PostgreSQL transaction. It has no guest branch, does
not accept a client owner ID and does not decode raw JWT text.

## Verification

- Focused flow checks: **4/4 PASS**.
- Provider failure opens no database transaction.
- Issuer/audience mismatch persists nothing.
- Transaction failure is propagated rather than reported as success.
- Full regression: **1025/1025 PASS** (0 failed, 0 skipped, 0 cancelled).
- Typecheck: **PASS**.
- Affected lint: **PASS**.
- Documentation checker: **PASS** (`markdownFiles: 324`, `localLinksChecked: 936`).

## Gates

Real Supabase Auth, PostgreSQL transaction/RLS execution, app restart/account
switch verification, Android/device checks and independent security review
remain `REVIEW_PENDING` / `NOT_RUN`. No remote database, production migration,
deployment, merge or push was used.
