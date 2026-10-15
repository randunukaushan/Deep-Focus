# Backend AI apply-receipt result-row boundary — 2026-10-14

## Scope

The local PostgreSQL AI apply-receipt adapter now validates lookup and insert
result-row containers as plain JSON arrays before replaying an apply receipt or
writing a new one. Sparse, symbol-bearing, cyclic, or custom-prototype
containers fail closed with `DEPENDENCY_UNAVAILABLE`. Owner binding, proposal
digest/version checks, idempotency, SQL, and response contracts are unchanged.

## Evidence

- Focused AI apply-receipt tests: 9/9 passed.
- Full domain suite: 1460/1460 passed.
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
