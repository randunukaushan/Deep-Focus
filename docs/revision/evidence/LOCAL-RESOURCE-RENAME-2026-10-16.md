# Local resource rename — 2026-10-16

## Scope

Add the narrow, documented local metadata action: rename a user-owned resource
without changing its identity, resource revision, reference value or task links.
No file import, viewing, cloud storage, sync or paid service is included.

## Implementation

- `renameResource` validates the title, scopes the update to the active owner
  and requires the expected `updated_at` value.
- A stale or cross-owner write returns no update. A successful rename obtains a
  new timestamp but keeps the stable resource ID and revision unchanged.
- Resources UI provides localized `en`/`si`/`ta` rename, save and cancel actions
  and shows the existing safe error copy if persistence fails.

## Verification

- Focused resource, locale and UI tests: **17/17 PASS**.
- TypeScript `node node_modules/typescript/bin/tsc --noEmit`: **PASS**.
- Affected ESLint with `--max-warnings=0`: **PASS**.
- `git diff --check`: **PASS**.

## Follow-up integrity correction

`saveResource` is only used for a new resource in the current UI. Its former
upsert could overwrite an existing same-owner record if a generated ID collided.
It now uses insert-only persistence, so the collision fails and preserves the
original record. Focused resource and local-ownership checks after the change:
**46/46 PASS**.

## Remaining gates

- File import/replacement, native viewing, removal cleanup, cloud storage and
  paid entitlement flows remain outside this slice.
- Android/iOS device, backup/restore, human translation and independent resource
  security review remain `NOT_RUN` or `REVIEW_PENDING`.
