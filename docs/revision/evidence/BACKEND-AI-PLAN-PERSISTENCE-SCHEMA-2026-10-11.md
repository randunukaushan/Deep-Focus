# Backend evidence — Plan My Day persistence schema candidate (2026-10-11)

Added a local, review-gated migration candidate for exact confirmed Plan My
Day v2 persistence. It follows the canonical SavedPlan shape for workspace,
local date, active/archived state, bounded explanation and versioned timestamps.
It keeps plan metadata and typed focus/break blocks owner-bound, links the plan
to its generation request and proposal, links blocks to owned tasks/local
reminders, and grants table access only to the server role. The block
constraints keep planned schedule edges separate from completed focus sessions
and break records.

The migration intentionally does not add `plan` to the current sync feed,
snapshot/export schemas, client grants or live project. Those are the explicit
activation gates in the canonical wire contract.

## Actual checks

- Plan migration contract and private-migration security checks: **8/8 PASS**.
- Plan gateway route, contract-header, owner-authorization and canonical read
  handler checks: **80/80 PASS** (combined focused group).
- Owner-bound Plan My Day read adapter checks: **5/5 PASS**. Missing plans
  return `null`; foreign, malformed, duplicate, or out-of-window data fails
  closed before it can become a client record.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository regression: **1131/1131 PASS**.
- Documentation checker: **PASS** — 346 Markdown files, 80/80 requirements,
  936 local links checked.

## Gates

- Live PostgreSQL execution/RLS, plan sync/pull/snapshot/export/deletion and
  capability negotiation: **REVIEW_PENDING / NOT_RUN**.
- Independent security review and Android/device verification:
  **REVIEW_PENDING / NOT_RUN**.
