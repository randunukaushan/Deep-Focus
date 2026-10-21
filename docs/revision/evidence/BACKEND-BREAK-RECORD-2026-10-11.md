# Backend post-focus break record — 2026-10-11

## Implemented

- Added a local-only `df_private.break_records` migration candidate with an
  owner/session foreign key, one-record-per-session uniqueness, bounded planned
  and actual milliseconds, terminal verification state, history index and
  server-only grants.
- Added the owner-bound `POST /v1/breaks` candidate. It accepts only the
  canonical break fields, derives `actualMs` from validated timestamps,
  requires an owned terminal focus session, rejects reversed or inconsistent
  outcomes, and rejects duplicate IDs before insertion.
- Added gateway route, DTO admission, session ownership authorization,
  transactional handler wiring and the server sync payload writer for break
  records. The client-provided duration is not trusted for the sync payload.
- Added the SQLite schema version 13 break table and materializer. Break sync
  pages validate the linked local terminal session, preserve owner isolation,
  replay safely and roll the page/cursor back on invalid data.

## Verification

- Break, gateway, authorization, sync-writer and migration focused set:
  **49/49 PASS**.
- Mobile SQLite break materializer set: **25/25 PASS**.
- Full bundled-runtime repository suite after this slice: **702/702 PASS**.
- TypeScript: **PASS**; affected ESLint: **PASS**; documentation checker:
  **PASS**; diff check: **PASS**.

## Boundaries

This is a local candidate only. The migration was not applied to Supabase or
production. Break list pagination, OS notification scheduling, real PostgreSQL
execution, independent security review and Android/device verification remain
`NOT_RUN / REVIEW_PENDING`.
