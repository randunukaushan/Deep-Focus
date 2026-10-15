# Backend evidence — local migration safety contracts (2026-10-10)

Local SQL migration candidates are checked for unique ordered version prefixes,
explicit transaction boundaries, absence of destructive reset statements and
absence of direct grants to client roles on private tables. The sync contract
v2 candidate also reconciles the approved nullable delete-tombstone payload and
the server settings entity kind with the PostgreSQL constraint.
These checks protect the review candidate from accidental reset-style changes;
they do not execute SQL or prove remote rollback behavior.

## Actual checks

- Migration safety and security contract checks: **12/12 PASS**.
- Full bundled runtime repository suite: **644/644 PASS**.
- Remote migration execution, PostgreSQL rollback/restart drill, Supabase
  advisors and independent security review: **NOT_RUN / REVIEW_PENDING**.

## Boundaries

No migration was applied to Supabase or production. Existing local files and
user changes were preserved.

## Service-role grant guard follow-up — 2026-10-11

Every current migration that creates a `df_private` table must now declare a
`service_role` grant while still denying `public`, `anon` and `authenticated`.
This is static SQL evidence only; it does not prove live RLS behavior.

- Migration/RLS/security focused checks: **28/28 PASS**.
- TypeScript and affected ESLint: **PASS**.
- Live Supabase execution and independent review: **NOT_RUN / REVIEW_PENDING**.
