# SQLite V2 foreign-key boundary evidence — 2026-10-12

## Scope

The V2 SQLite storage adapter explicitly enables `PRAGMA foreign_keys = ON`
before creating and using its owner-bound sync schema. This prevents relying on
SQLite connection defaults for the group/change relationship.

## Automated evidence

- `tests/domain/sqlite-v2-sync-storage.test.mjs`: **2/2 passed**.
- Full repository tests: **1294/1294 passed**.
- Typecheck: **passed**.
- Affected lint: **passed**.

## Verification boundary

This is disposable local SQLite evidence only. Real device restart/corruption
recovery, remote Supabase RLS, production migration and independent security
review remain `REVIEW_PENDING` or `NOT_RUN`.
