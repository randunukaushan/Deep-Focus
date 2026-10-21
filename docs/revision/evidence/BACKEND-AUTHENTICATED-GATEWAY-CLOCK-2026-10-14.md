# Authenticated gateway per-request clock boundary — 2026-10-14

## Scope

The local authenticated PostgreSQL gateway runtime is covered for sampling
both the authentication clock and rate-limit clock on every request. This
prevents a long-lived runtime instance from reusing setup-time timestamps when
checking session and rate-limit boundaries. Provider verification, app-session
lookup, ownership and handler behavior remain unchanged.

## Evidence

- Focused authenticated gateway runtime tests: 5/5 passed.
- Domain test command `node --test tests/domain/*.test.mjs`: 1463/1463 passed.
- TypeScript check: passed with `node node_modules/typescript/bin/tsc --noEmit`.
- Lint: passed with `npm run lint`.
- Documentation checker: passed with `node docs/revision/check-docs.mjs`.
- `git diff --check`: passed; existing line-ending notices remain in the dirty
  worktree.

## Gates

Live Supabase Auth/Postgres execution, Android/device verification, Deno/Docker
Edge Runtime execution, independent security review, production migration or
deployment, commit and push remain `REVIEW_PENDING` or `NOT_RUN` as applicable.
This is local composition evidence only and does not claim production
readiness.
