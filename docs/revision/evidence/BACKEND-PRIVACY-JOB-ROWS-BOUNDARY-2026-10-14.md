# Privacy job result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed privacy-job rows must not authorize export/deletion work or alter lease state.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or export/delete operation.

## Change

The PostgreSQL privacy-job adapter now rejects sparse or otherwise
non-plain-JSON query result containers before returning due work or advancing
an owner-bound lease/state transition. Existing fencing, owner isolation,
retry, safe-error and malformed-result assertions remain unchanged.

## Actual checks

- Focused privacy-job adapter suite: **13/13 pass** (`node --test tests/domain/postgres-privacy-job-adapter.test.mjs`)
- Full domain suite: **1449/1449 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 616 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
