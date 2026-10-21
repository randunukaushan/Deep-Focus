# Snapshot page result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed snapshot page rows must not expose sync payloads.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL snapshot page reader now rejects sparse or otherwise
non-plain-JSON result containers before mapping a ready page payload. Existing
session recheck, owner/snapshot binding, page metadata, digest, cursor and
payload-boundary assertions remain unchanged.

## Actual checks

- Focused snapshot-page suite: **12/12 pass** (`node --test tests/domain/postgres-snapshot-page-adapter.test.mjs`)
- Full domain suite: **1454/1454 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 621 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
