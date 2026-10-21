# PostgreSQL read owner-boundary hardening — 2026-10-11

## Implemented

Protected task, goal, focus-session and reminder read handlers now select and
validate the returned `owner_id` in addition to binding the SQL query to the
verified actor. A row with a valid resource ID but a foreign owner is rejected
before it is mapped into a client DTO. Existing session recheck, bounded list,
cursor and privacy-preserving not-found behavior remain unchanged.

This is a local server-candidate change only. It does not grant client table
access or imply that the Supabase database has been changed.

## Actual checks

- Gateway/read focused tests: **33/33 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Full repository suite after this slice: **957/957 PASS**.
- Documentation check and `git diff --check`: **PASS**.

## Gates

Real Supabase RLS/account-isolation execution, live API integration, Android
verification and independent security review remain `NOT_RUN` or
`REVIEW_PENDING`.
