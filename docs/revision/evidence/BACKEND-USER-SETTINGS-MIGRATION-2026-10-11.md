# Backend user settings migration foundation — 2026-10-11

## Implemented

- Added a local-only versioned `df_private.user_settings` migration.
- Settings are one-per-owner, reference the server profile, use bounded
  canonical theme/locale/duration values, and carry an optimistic version.
- The table is RLS-enabled and inaccessible to `public`, `anon` and
  `authenticated`; only the trusted server role receives table privileges.
- Defaults are non-destructive (`system`, `en`, 25 minutes, 5-minute break,
  AI disabled) and do not create an account or upload data.
- Added the owner-bound `GET /v1/settings` read route. It rechecks the active
  app session inside the transaction and fails closed on a missing, foreign or
  malformed settings row.
- Added the owner/version-bound `PATCH /v1/settings` candidate with an
  allowlist, bounded values and fail-closed database metadata validation.
- Added `settings` to the canonical sync validators and server change writer;
  the settings upsert is hashed and committed through the owner sequence.
- Added the mobile SQLite settings materializer. It validates the remote
  payload, keeps the authenticated owner boundary, ignores stale versions,
  and applies the receipt, mirror row, settings row and cursor in one
  transaction so a failure rolls the whole page back.
- Raised the local SQLite schema to version 12. The migration rebuilds the
  sync receipt constraint to include `settings` and adds typed settings
  columns without deleting the legacy JSON source.

## Verification

- Settings read/patch/migration/sync focused set: **37/37 PASS**.
- Mobile SQLite ownership/materializer set: **24/24 PASS**.
- Full repository suite after this slice: **693/693 PASS**.
- TypeScript: **PASS**; affected ESLint: **PASS**; documentation checker:
  **PASS**; diff check: **PASS**.
- Unsupported local settings values fail closed rather than being silently
  coerced. The settings gateway handler, sync representation and remote
  migration remain separate dependent work.

## Boundaries

The migration, handlers and mobile materializer are local candidates only and
were not applied to Supabase or any production database. Remote runtime/RLS
execution, real cloud migration/recovery and Android device evidence remain
separate verification work. Independent security review and device
verification remain `NOT_RUN / REVIEW_PENDING`.
