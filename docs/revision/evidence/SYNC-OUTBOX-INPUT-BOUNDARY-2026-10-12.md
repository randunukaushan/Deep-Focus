# Sync outbox input-boundary evidence — 2026-10-12

## Scope

The sync coordinator now validates the complete local outbox row shape before
selecting due mutations or calling the remote push adapter. A malformed row
fails as `SYNC_OUTBOX_INVALID`; it is neither acknowledged, quarantined by
assumption nor sent to another account.

## Automated evidence

- `tests/domain/sync-service.test.mjs`: **14/14 passed**.
- Full repository tests: **1293/1293 passed**.
- Typecheck: **passed**.
- Affected lint: **passed**.

## Verification boundary

This is local sync-coordinator evidence only. Real SQLite corruption/restart,
remote Supabase sync, two-account RLS, Android/device recovery and independent
security review remain `REVIEW_PENDING` or `NOT_RUN`.
