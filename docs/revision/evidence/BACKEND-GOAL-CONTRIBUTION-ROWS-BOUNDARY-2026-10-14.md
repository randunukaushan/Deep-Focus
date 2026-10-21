# Goal contribution result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed goal or session rows must not produce an attribution or alter contribution history.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL goal-contribution adapter now rejects sparse or otherwise
non-plain-JSON query result containers before selecting a goal/session and
before inserting or replaying an immutable contribution. Existing owner,
time-window, cancellation, idempotency and goal-calculation assertions remain
unchanged.

## Actual checks

- Focused goal-contribution suite: **10/10 pass** (`node --test tests/domain/postgres-goal-contribution-applier.test.mjs`)
- Full domain suite: **1442/1442 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 609 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
