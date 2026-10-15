# Account-session list row validation — 2026-10-11

## Implemented

The PostgreSQL account-session list boundary now validates registry row
semantics before mapping a response: `expires_at` must follow `issued_at`,
revoked status must agree with `revoked_at`, and a revocation timestamp cannot
precede issuance. This complements the persistence-adapter checks and fails
closed if storage returns an inconsistent row.

## Actual checks

- Gateway/read focused tests: **25/25 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **963/963 PASS**.
- Documentation check and `git diff --check`: **PASS**.

## Gates

Real Supabase RLS/account-isolation execution, live Auth/session revocation,
Android verification and independent security review remain
`NOT_RUN`/`REVIEW_PENDING`.
