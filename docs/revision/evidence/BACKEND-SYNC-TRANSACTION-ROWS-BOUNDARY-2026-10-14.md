# Backend sync transaction result-row boundary — 2026-10-14

## Scope

The local PostgreSQL sync transaction adapter now validates singleton and list
result-row containers as plain JSON arrays before reading the owner head,
replaying stored changes, appending a change, or advancing the head. Sparse,
symbol-bearing, cyclic, or custom-prototype containers fail closed with
`DEPENDENCY_UNAVAILABLE`. Sync ordering, replay hashing, ownership keys,
transaction behavior, schema, and response contracts are unchanged.

## Evidence

- Focused sync transaction tests: 14/14 passed.
- Full domain suite: 1453/1453 passed.
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
