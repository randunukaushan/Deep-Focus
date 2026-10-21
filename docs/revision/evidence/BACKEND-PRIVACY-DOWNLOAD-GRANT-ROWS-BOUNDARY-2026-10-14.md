# Privacy download-grant result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed export-job rows must not authorize artifact access.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or export download.

## Change

The PostgreSQL download-grant adapter now rejects sparse or otherwise
non-plain-JSON query result containers before checking a succeeded export job
or issuing a download grant. Existing recent-auth, owner, expiry, digest and
idempotent replay assertions remain unchanged.

## Actual checks

- Focused download-grant suite: **7/7 pass** (`node --test tests/domain/postgres-privacy-download-grant-adapter.test.mjs`)
- Full domain suite: **1452/1452 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 619 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL or artifact-storage execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
