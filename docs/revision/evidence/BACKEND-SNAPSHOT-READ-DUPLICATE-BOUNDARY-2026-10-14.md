# Backend snapshot read duplicate-row boundary — 2026-10-14

## Scope

Ready snapshot page and metadata readers now reject more than one database row
for a single owner-bound request. They continue to return `null` for a missing
row and retain the existing session, ownership, digest, payload, expiry and
bigint validation rules. The readers no longer silently select the first row
when the storage result is ambiguous.

## Evidence

- Focused snapshot page and metadata tests: 22/22 passed.
- Regression coverage includes duplicate page rows and duplicate metadata
  rows, in addition to the existing sparse-row cases.
- Full domain suite: 1466/1466 passed.
- TypeScript check: passed with `node node_modules/typescript/bin/tsc --noEmit`.
- Lint: passed with `npm run lint`.
- Documentation checker: passed with `node docs/revision/check-docs.mjs`.
- `git diff --check`: passed; existing line-ending notices remain in the dirty
  worktree.

## Gates

Live Supabase/Postgres execution, real
Auth/provider verification, Android device verification, Deno/Docker Edge
Runtime execution, independent security review, production migration/deploy,
commit and push remain `REVIEW_PENDING` or `NOT_RUN` as applicable. This slice
does not claim production readiness.
