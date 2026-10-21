# Backend reminder intent — 2026-10-11

## Implemented local candidate

- Added `task_reminders` to the versioned SQLite schema as schema version 14.
- Added server-side create, patch and soft-delete candidates for explicit
  `local_device` reminder intent. The server checks the authenticated owner and
  the owner's live task, validates IANA time-zone syntax, and uses optimistic
  versions.
- Added owner-scoped sync payload writing for reminder upserts and
  content-free delete tombstones.
- Added an authenticated owner-scoped reminder list candidate that excludes
  tombstones, orders by scheduled time and ID, bounds the result to 100 rows,
  and maps only validated reminder fields.
- Added a server-signed, owner/endpoint/limit/expiry-bound cursor for reminder
  pages. Query admission rejects unknown or repeated keys, invalid limits and
  cursors before handler dispatch; missing cursor secrets fail closed.
- Query parameters for other list candidates are rejected until those handlers
  implement their own signed cursor contract; they cannot silently ignore a
  caller-supplied cursor.
- Added SQLite upsert materialization with stale-version protection, owner/task
  binding, replay receipts and atomic cursor updates.
- Added local tombstone handling that disables delivery and prevents a later
  upsert from resurrecting the deleted reminder ID.

## Verification

- Local SQLite, reminder applier and sync-writer checks: **42/42 PASS**.
- Reminder route/read-handler checks: **21/21 PASS**.
- Cursor/query/pagination checks: **33/33 PASS**.
- Full repository suite after the AI receipt-guard slice: **723/723 PASS**.
- TypeScript, affected ESLint, documentation checks and `git diff --check`:
  **PASS**.

## Boundaries

This is a local implementation candidate only. It does not schedule an OS
notification, request device permission, apply a Supabase migration, or claim
remote delivery cancellation while a device is offline. Android/device,
remote SQL/RLS execution and independent security review remain
`REVIEW_PENDING / NOT_RUN`. Other resource lists still use their earlier
bounded-read candidates and have not been migrated to this cursor contract.
