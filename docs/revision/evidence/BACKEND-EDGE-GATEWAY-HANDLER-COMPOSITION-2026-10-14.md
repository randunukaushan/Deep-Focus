# Edge gateway handler composition — 2026-10-14

## Scope

The Edge entrypoint previously supplied only sync pull/push handlers to the
authenticated runtime even though the existing PostgreSQL gateway handler
catalog also covered personal mutations, reads, privacy jobs, sessions,
reminders and snapshot routes. The entrypoint now composes that existing
catalog. It does not add a new route, provider or database operation.

Cursor signing secrets are separate for sync, ordinary list cursors and
snapshot page cursors. Missing or weak values fail closed in the local gateway
configuration boundary.

## Actual evidence

- Gateway configuration/composition tests: pass, including required secret and
  handler-wiring assertions.
- Full domain suite after the composition change: `1471/1471 pass`.
- TypeScript check: pass.
- Lint: pass.
- Documentation checker: pass.
- `git diff --check`: pass; existing line-ending notices remain in the dirty
  worktree.

## Gates

This is local source-composition evidence only. Deno execution, hosted
Supabase Auth/PostgreSQL, real RLS, Android/device verification, independent
security review, production migration/deployment, commit and push remain
`REVIEW_PENDING` or `NOT_RUN` as applicable.
