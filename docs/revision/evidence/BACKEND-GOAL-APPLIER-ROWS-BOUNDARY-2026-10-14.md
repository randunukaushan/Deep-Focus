# Goal applier result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed goal and workspace result containers must not authorize or report a goal mutation.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL goal applier now rejects sparse or otherwise non-plain-JSON
query result containers before goal create, patch or delete decisions. Existing
owner checks, optimistic versions, status validation, tombstones and conflict
assertions remain unchanged.

## Actual checks

- Focused goal-applier suite: **13/13 pass** (`node --test tests/domain/postgres-goal-applier.test.mjs`)
- Full domain suite: **1443/1443 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 610 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
