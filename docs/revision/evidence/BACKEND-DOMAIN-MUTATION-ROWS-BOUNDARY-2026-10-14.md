# Backend domain mutation result-row boundary — 2026-10-14

## Scope

The local PostgreSQL domain mutation store now validates database result-row
containers as plain JSON arrays before owner-head locking, receipt replay,
mutation receipt insertion, or other transaction decisions. Sparse,
symbol-bearing, cyclic, or custom-prototype containers fail closed with
`DEPENDENCY_UNAVAILABLE`. Session recheck, ownership, idempotency, sync
sequence, receipt, SQL, and response contracts are unchanged.

## Evidence

- Focused domain mutation adapter tests: 18/18 passed.
- Full domain suite: 1455/1455 passed.
- TypeScript check: passed with `node node_modules/typescript/bin/tsc --noEmit`.
- Lint: passed with `npm run lint`.
- Documentation checker: passed with `node docs/revision/check-docs.mjs`.
- `git diff --check`: passed; existing line-ending notices remain in the dirty
  worktree.

## Gates

Live Supabase/Postgres execution, real Auth/provider verification, Android
device verification, Deno/Docker Edge Runtime execution, independent security
review, production migration/deployment, commit, and push remain
`REVIEW_PENDING` or `NOT_RUN` as applicable. This slice does not claim
production readiness.
