# Rate-limit result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed rate counters must not produce an unsafe admission decision.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL rate-limit adapter now rejects sparse or otherwise non-plain
JSON counter result containers before calculating an allow/deny decision.
Existing atomic bucket, owner/operation key, retry-window, concurrency and
malformed-result assertions remain unchanged.

## Actual checks

- Focused rate-limit adapter suite: **10/10 pass** (`node --test tests/domain/postgres-rate-limit-adapter.test.mjs`)
- Full domain suite: **1450/1450 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 617 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
