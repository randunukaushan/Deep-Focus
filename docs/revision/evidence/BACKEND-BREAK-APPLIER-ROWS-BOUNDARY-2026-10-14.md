# Break applier result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed session or break rows must not authorize a break record or report a stored result.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL break-record adapter now rejects sparse or otherwise
non-plain-JSON query result containers before session ownership checks,
duplicate checks or break writes. Existing timing, terminal-session,
owner-isolation, duration and duplicate assertions remain unchanged.

## Actual checks

- Focused break-applier suite: **8/8 pass** (`node --test tests/domain/postgres-break-applier.test.mjs`)
- Full domain suite: **1444/1444 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 611 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
