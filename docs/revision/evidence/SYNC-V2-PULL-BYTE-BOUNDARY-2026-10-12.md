# V2 sync-pull byte-boundary evidence — 2026-10-12

## Scope

V2 pull validation now rejects a page whose UTF-8 JSON exceeds 64 KiB before
calling the local atomic apply callback. The oversized test uses a valid group
digest, so rejection is based on the page bound rather than a digest shortcut.

## Automated evidence

- `tests/domain/sync-v2-pull-apply.test.mjs`: **5/5 passed**.
- Full repository tests: **1295/1295 passed**.
- Typecheck: **passed**.
- Affected lint: **passed**.

## Verification boundary

This is local V2 validation evidence only. Real device SQLite recovery, remote
Supabase sync/RLS, production migration and independent security review remain
`REVIEW_PENDING` or `NOT_RUN`.
