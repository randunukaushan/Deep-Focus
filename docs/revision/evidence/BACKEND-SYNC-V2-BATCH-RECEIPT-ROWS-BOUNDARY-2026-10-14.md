# Sync V2 batch receipt result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed receipt result containers must not authorize replay or receipt publication.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or deployment.

## Change

The PostgreSQL V2 batch receipt adapter now rejects sparse or otherwise
non-plain-JSON `rows` containers before replay decisions and before writing a
receipt. Existing owner binding, duplicate handling, response validation and
idempotency assertions remain unchanged.

## Actual checks

- Focused V2 batch receipt suite: **11/11 pass** (`node --test tests/domain/postgres-sync-v2-batch-receipt-adapter.test.mjs`)
- Full domain suite: **1441/1441 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 608 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
