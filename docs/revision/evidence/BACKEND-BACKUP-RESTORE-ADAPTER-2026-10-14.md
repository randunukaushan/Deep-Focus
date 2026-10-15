# Backend PostgreSQL backup/restore adapter boundary — 2026-10-14

## Scope

The local PostgreSQL backup/restore composition boundary is covered without
connecting to a database or writing remote data. Tests verify that export uses
the verified owner inside the caller transaction, restore hands only the
digest- and manifest-validated records to the writer, invalid ownership is
rejected before a transaction starts, and writer failures propagate instead of
being reported as successful restores.

The existing core backup rules remain authoritative: canonical digesting,
record limits, duplicate identity rejection, future-schema rejection and
non-empty-target overwrite confirmation.

## Evidence

- Focused PostgreSQL backup/restore adapter tests: 4/4 passed.
- Domain test command `node --test tests/domain/*.test.mjs`: 1462/1462 passed.
- The new adapter file was also run explicitly: 4/4 passed.
- TypeScript check: passed with `node node_modules/typescript/bin/tsc --noEmit`.
- Lint: passed with `npm run lint`.
- Documentation checker: passed with `node docs/revision/check-docs.mjs`.
- `git diff --check`: passed; existing line-ending notices remain in the dirty
  worktree.

## Gates

Live Supabase/Postgres execution, real
backup storage, Android device verification, independent security review,
production migration/deploy, commit and push remain `REVIEW_PENDING` or
`NOT_RUN` as applicable. This slice does not claim production readiness.
