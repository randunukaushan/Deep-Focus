# Entitlement result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed entitlement rows must not grant AI or cloud-resource capability access.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or paid service.

## Change

The PostgreSQL entitlement reader now rejects sparse or otherwise non-plain
JSON result containers before mapping a server entitlement or admitting a
capability. Existing session recheck, owner binding, server-verification,
status and duplicate-row assertions remain unchanged.

## Actual checks

- Focused entitlement suite: **14/14 pass** (`node --test tests/domain/postgres-entitlement-adapter.test.mjs`)
- Full domain suite: **1446/1446 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 613 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL or payment-provider execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
