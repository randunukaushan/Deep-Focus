# Backend privacy download-grant expiry boundary — 2026-10-14

## Scope

Privacy export download-grant creation now validates the expiry timestamp
returned by the database before reporting a newly created grant. A returned
grant that is already expired fails with `INVALID_TRANSITION`; the existing
replay path, recent-auth requirement, owner/job binding and raw-token digest
boundary remain unchanged.

## Evidence

- Focused privacy download-grant tests: 8/8 passed.
- Domain test command `node --test tests/domain/*.test.mjs`: 1464/1464 passed.
- TypeScript check: passed with `node node_modules/typescript/bin/tsc --noEmit`.
- Lint: passed with `npm run lint`.
- Documentation checker: passed with `node docs/revision/check-docs.mjs`.
- `git diff --check`: passed; existing line-ending notices remain in the dirty
  worktree.

## Gates

Full domain verification, TypeScript, lint, documentation checks and diff
checks are run after this slice. Live Postgres/storage execution, Android
device verification, independent security review, production migration or
deployment, commit and push remain `REVIEW_PENDING` or `NOT_RUN` as applicable.
This slice does not claim production readiness.
