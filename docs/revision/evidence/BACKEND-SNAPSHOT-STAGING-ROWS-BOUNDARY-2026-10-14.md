# Snapshot staging result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed database result containers must not reach snapshot staging or publication.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL snapshot staging adapter now rejects sparse or otherwise
non-plain-JSON `rows` containers before metadata/page retry comparison and
before ready publication. Existing staging, idempotency, ownership, rollback
and payload-boundary assertions remain unchanged.

## Actual checks

- Focused snapshot staging suite: **17/17 pass** (`node --test tests/domain/postgres-snapshot-staging-adapter.test.mjs`)
- Full domain suite: **1440/1440 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 607 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
