# Task applier result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed workspace, goal or task rows must not authorize or report a task mutation.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL task applier now rejects sparse or otherwise non-plain-JSON
query result containers before workspace/goal ownership checks and before task
create, patch, delete or action writes. Existing cross-owner, optimistic
version, lifecycle and duplicate assertions remain unchanged.

## Actual checks

- Focused task-applier suite: **11/11 pass** (`node --test tests/domain/postgres-task-applier.test.mjs`)
- Full domain suite: **1445/1445 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 612 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
