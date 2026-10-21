# Snapshot metadata result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed snapshot metadata must not be exposed as a ready owner-scoped snapshot.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL snapshot metadata reader now rejects sparse or otherwise
non-plain-JSON result containers before mapping ready metadata. Existing
session recheck, owner binding, expiry, digest and bigint-preservation
assertions remain unchanged.

## Actual checks

- Focused snapshot-metadata suite: **8/8 pass** (`node --test tests/domain/postgres-snapshot-metadata-adapter.test.mjs`)
- Full domain suite: **1453/1453 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 620 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
