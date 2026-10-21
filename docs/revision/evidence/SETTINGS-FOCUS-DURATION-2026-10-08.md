# Default focus duration persistence — 2026-10-08

```text
TASK: V1 settings / default focus duration
STATE: IMPLEMENTED CANDIDATE; REVIEW_PENDING for persisted storage and native verification
DELIVERABLE: owner-scoped default focus duration in local SQLite, Settings controls,
  and Focus Session Setup loading the saved value
RISK: HIGH — additive local schema migration and persisted account/device setting
REVIEW GATE: independent storage/ownership review and installed Android verification
  remain pending. No cloud write, production migration, deployment or commit was run.
```

The existing break setting is preserved. `user_settings` now carries
`default_focus_duration_minutes` with the supported values 25, 45 and 60, and
schema version 3 adds the column transactionally with a safe default of 25.
Older version-2 databases are upgraded only when the column is absent; legacy
JSON import also normalizes a missing focus default to 25 without deleting or
claiming the source file.

The Settings screen saves focus and break values together, updates the selected
radio choice only after a successful write, and keeps the previous values on a
failure. New Focus Session Setup routes load the saved focus default before
starting; a failed read is visible and prevents a misleading start.

Verification:

- Focused settings, break-recovery and real-SQLite ownership/migration tests:
  **24/24 PASS** with the bundled Node 24 runtime.
- TypeScript check: `node_modules\\.bin\\tsc.cmd --noEmit` — exit 0.
- The first focused run with the system Node 20 runtime could not load
  `node:sqlite`; this is a runtime limitation, not a hidden or weakened test.
- Android debug APK build passed previously, but installed runtime verification
  remains `NOT_RUN` because no device or emulator is attached.
