# Usage allowance result-row boundary — 2026-10-14

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — malformed allowance or receipt rows must not grant, consume or release server-authoritative usage.
REVIEW_STATUS: independent security review `REVIEW_PENDING`.
RELEASE_STATUS: `NOT_READY` — no live database or paid service.

## Change

The PostgreSQL usage adapter now rejects sparse or otherwise non-plain-JSON
result containers before allowance reads, reservation decisions or settlement
state changes. Existing owner, capability, period, receipt, quota and
transaction assertions remain unchanged.

## Actual checks

- Focused usage adapter suite: **28/28 pass** (`node --test tests/domain/postgres-usage-adapter.test.mjs`)
- Full domain suite: **1451/1451 pass** (`node --test tests/domain/*.test.mjs`)
- TypeScript: **PASS** (`node node_modules/typescript/bin/tsc --noEmit`)
- Lint: **PASS** (`npm run lint`)
- Documentation checker: **PASS** (`node docs/revision/check-docs.mjs`; 618 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (existing LF-to-CRLF notices only)

## Limits

- Live Supabase/PostgreSQL or payment-provider execution: `REVIEW_PENDING`.
- Android/device verification: `NOT_RUN`.
- Production migration, deployment, commit and push: `NOT_RUN`.
