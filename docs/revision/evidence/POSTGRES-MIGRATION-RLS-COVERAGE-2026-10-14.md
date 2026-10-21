# PostgreSQL migration RLS coverage — 2026-10-14

## Scope

Added a repository-wide static regression check for Supabase migration
artifacts. Every migration-created `df_private` table must explicitly enable
row-level security and deny direct grants to `public`, `anon` and
`authenticated`. The personal-core migration is checked through its reviewed
dynamic table loop, with the service-only migration-receipts table remaining
explicitly covered.

## Evidence

- Focused test: `tests/domain/postgres-security-migration-contract.test.mjs` —
  `17 passed, 0 failed`.
- The check inspected all SQL files under `supabase/migrations` without
  executing or applying them.
- Typecheck: passed with `tsc --noEmit --pretty false`.
- Affected lint: passed for the migration-contract test.
- Full suite: `1479 tests: 1470 passed, 0 failed, 9 skipped`.
- Documentation checker: `PASS`; `549` Markdown files, `936` local links
  checked, `80/80` requirements covered, `0` errors.

## Boundaries

- This is static migration-contract evidence; it is not live PostgreSQL or
  Supabase RLS execution evidence.
- No remote database, production migration, deployment, merge, push or commit
  was performed.
- Independent security review and Android/device verification remain
  `REVIEW_PENDING` / `NOT_RUN`.
