# Account sync coordinator — 2026-10-11

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING
RISK: HIGH — account-scoped pull/apply/push orchestration

## Outcome

Added a local coordinator that derives the SQLite `account:<UUID>` namespace,
loads the stored remote cursor, pulls one bounded page, applies it through the
atomic SQLite page boundary, and only then processes the retry-safe outbox.
Account switching is checked before and after pull/apply; an old account page is
never applied and its outbox is never acknowledged. Pull and local apply
failures leave the outbox untouched, while a push failure does not undo an
already committed pull page or acknowledge pending outbox work.

The coordinator is not activated from app startup until the gateway, provider
and device review gates are cleared.

## Verification

- Focused coordinator checks: **6/6 PASS**.
- Full regression: **1189/1189 PASS** (0 failed, 0 skipped, 0 cancelled).
- Typecheck: **PASS**.
- Affected lint: **PASS**.
- Documentation checker: **PASS** (`markdownFiles: 327`, `localLinksChecked: 936`).

## Gates

Live cloud sync, Android offline/restart testing, real account switching,
provider/RLS verification and independent security review remain
`REVIEW_PENDING` / `NOT_RUN`. No remote database, production migration,
deployment, merge or push was used.
