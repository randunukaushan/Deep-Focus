# Goal deletion — 2026-10-07

## Outcome and acceptance

The Goal detail route requires an explicit confirmation before deleting a
non-legacy-period goal. The owner-scoped SQLite transaction first checks the
goal's loaded `updatedAt`; stale, missing, or legacy-open-period goals are not
deleted. In one transaction, linked tasks are retained but unlinked, each
task's revision is advanced, and then the goal row is removed. Focus sessions
and history are not modified. Any failed operation rolls back both the task
unlink and goal deletion. Repeated requests cannot delete other owner data or
report success twice.

## Risk and gates

Risk is HIGH because this permanently removes a persisted goal definition and
changes linked task relationships. The user explicitly approved full V1
implementation, which includes goal management and preservation of tasks/history
when goals are deleted; no production data is involved. Keep the implementation
`REVIEW_PENDING` pending independent review of owner isolation, transaction
atomicity, task revision advancement and data-retention behavior. Android/native
SQLite, TalkBack, keyboard and device checks are `NOT_RUN`. This is not production
data migration or release approval.

## Changed files

- `src/app/goals/[goalId].tsx`
- `src/features/goals/goal-storage.ts`
- `src/features/storage/local-database.ts`
- `tests/components/goal-detail.test.mjs`
- `tests/domain/local-database-ownership.test.mjs`
- `tests/components/README.md`
- `docs/CHANGELOG.md`
- `docs/revision/evidence/GOAL-DELETE-2026-10-07.md`

## Actual verification

- Focused route + real SQLite ownership tests: **20/20 PASS**.
- Full domain/component/navigation/website regression suite: **135/135 PASS**.
- Root TypeScript `tsc --noEmit`: **PASS**.
- Focused ESLint: **PASS**.
- Documentation checker: **PASS**, 922 local links checked, 0 errors.
- `git diff --check`: **PASS** (line-ending notices only).
- Independent review and Android/iOS device checks: `REVIEW_PENDING` / `NOT_RUN`.
