# Task due-date editing — 2026-10-07

## Outcome and choice

Task detail can display and edit an optional deadline. Since the canonical task
field is an ISO-8601 UTC timestamp and has no separate timezone column, date-only
input (`YYYY-MM-DD`) is stored at midnight UTC. This keeps the selected calendar
date identical across devices; display uses the user's locale while explicitly
formatting the UTC calendar date. An unchanged existing timestamp is preserved
exactly. Blank input clears the date; malformed or impossible dates are rejected
without writing. No SQLite schema changes or dependencies were added.

## Data integrity and risk

The edit is an owner-scoped conditional update against the loaded task revision.
Typed SQLite `due_at` is canonical over duplicate fields in legacy JSON, both
when set and cleared. The update preserves task ID, description, priority, goal
association, and history. This persisted task write is HIGH risk provisionally
and remains `REVIEW_PENDING` for independent review. Android keyboard, locale,
screen-reader and device SQLite checks are `NOT_RUN`.

## Changed files

- `src/app/tasks/[taskId].tsx`
- `src/features/tasks/task-date.ts`
- `src/features/tasks/task-storage.ts`
- `src/features/storage/local-database.ts`
- `tests/components/task-detail.test.mjs`
- `tests/domain/task-date.test.mjs`
- `tests/domain/local-database-ownership.test.mjs`
- `tests/components/README.md`
- `docs/CHANGELOG.md`
- `docs/revision/evidence/TASK-DUE-DATE-2026-10-07.md`

## Actual verification

- Route, date-helper and real-SQLite regressions are included in the combined
  suite: **135/135 PASS**.
- Root TypeScript `tsc --noEmit`: **PASS**.
- Focused ESLint: **PASS**.
- Documentation checker: **PASS**, 923 local links checked, 0 errors.
- `git diff --check`: **PASS** (line-ending notices only).
- Independent review/device checks: `REVIEW_PENDING` / `NOT_RUN`.
