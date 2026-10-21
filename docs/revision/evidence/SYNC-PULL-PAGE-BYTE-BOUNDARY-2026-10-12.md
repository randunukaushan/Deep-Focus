# Sync pull page byte-boundary evidence — 2026-10-12

## Scope

The local sync-pull apply boundary now rejects a page whose UTF-8 JSON exceeds
the canonical 64 KiB wire limit before invoking the atomic SQLite apply callback.
This protects the local transaction boundary from oversized remote payloads.

## Automated evidence

- `tests/domain/sync-pull-apply.test.mjs`: **7/7 passed**.
- Full repository tests: **1294/1294 passed**.
- Typecheck: **passed**.
- Affected lint: **passed**.

## Verification boundary

This is local response-boundary evidence only. Live remote sync, SQLite
corruption/restart, Supabase RLS, Android/device recovery and independent
security review remain `REVIEW_PENDING` or `NOT_RUN`.
