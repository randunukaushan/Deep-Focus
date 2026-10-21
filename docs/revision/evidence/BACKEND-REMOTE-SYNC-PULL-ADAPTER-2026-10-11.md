# Remote sync pull adapter — 2026-10-11

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — authenticated cloud-to-local sync transport

## Outcome

Added a local remote pull adapter for `GET /v1/sync/pull`. It sends only the
bounded cursor and limit, never sends an owner ID, requires the canonical
`account:<UUID>` local owner namespace, validates the `{data}` page through the
existing atomic-apply boundary, and preserves transport failures for retry.
The adapter itself does not write SQLite; the caller must apply the returned
page and cursor atomically.

## Verification

- Focused adapter checks: **4/4 PASS**.
- Invalid owner/cursor/limit and malformed pages are rejected before local apply.
- Continuation cursors are preserved without an owner query parameter.
- Full regression: **1030/1030 PASS** (0 failed, 0 skipped, 0 cancelled).
- Typecheck: **PASS**.
- Affected lint: **PASS**.
- Documentation checker: **PASS** (`markdownFiles: 326`, `localLinksChecked: 936`).

## Gates

App-startup wiring, live Supabase sync, Android offline/restart verification,
real account switching and independent security review remain
`REVIEW_PENDING` / `NOT_RUN`. No remote database, production migration,
deployment, merge or push was used.
