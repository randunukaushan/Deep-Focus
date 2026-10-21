# Backend evidence — Plan lifecycle command candidate (2026-10-11)

Added a local, review-gated lifecycle boundary and PostgreSQL adapter for plan
archive, restore and delete commands. It requires exact fields, bounded
UUID/version inputs, owner-bound plan identity, current plan version, exact
bound-reminder versions, and valid state transitions. Archive/delete return the
reminders to disable; restore never re-enables reminders. The adapter locks the
active owner/head, updates reminders and plan state in one injected transaction,
and persists a read-suppressed `deleted_at` tombstone. No remote integration is
performed by this candidate.

The lifecycle candidate now has a direct `POST /v1/plans/{id}/actions` gateway
boundary. It validates the exact command, requires an owned route plan and
idempotency key, and delegates only when an explicit reviewed mutation callback
is supplied; otherwise it fails closed without claiming a database write.
The matching `PATCH /v1/plans/{id}` boundary validates the canonical editable
plan identity and delegates only through an explicit callback as well. Neither
route is wired into the current v1 sync writer; plan sync remains a separate
v2/review gate.

## Actual checks

- Lifecycle validation tests: **5/5 PASS**.
- PostgreSQL lifecycle adapter and tombstone-read checks: **12/12 PASS**.
- Plan action idempotency candidate checks: **2/2 PASS**. Same-key replay is
  read-only; changed intent is rejected as an idempotency conflict.
- Gateway lifecycle admission, ownership and candidate delegation: **54/54
  PASS** focused checks.
- Plan edit route admission and candidate delegation are included in that
  focused gateway run.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository regression: **1178/1178 PASS** (all discovered test files).
- Documentation checker: **PASS** — 348 Markdown files, 80/80 requirements,
  936 local links checked.

## Gates

- One-transaction PostgreSQL plan/reminder mutation, tombstone and sync epoch
  persistence: **REVIEW_PENDING / NOT_RUN**.
- Independent security review, live RLS and Android/device verification:
  **REVIEW_PENDING / NOT_RUN**.
