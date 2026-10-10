# Automatic goal completion — 2026-10-07

## Outcome

An active goal transitions to `completed` when its qualifying source events first
reach the target. `completedAt` is the terminal timestamp of the first event to
reach the target (stable ID order breaks equal-time ties). `updatedAt` advances
monotonically. Focus-time goals sum actual focused seconds from completed and
cancelled sessions; session-count goals count completed sessions only. Events
remain constrained to the saved half-open goal interval. Duplicate session IDs
are de-duplicated and conflicting duplicates fail safely.

Elapsed bounded goals without a qualifying event are marked `expired` during a
goal read. A later-arriving verified event whose terminal timestamp is inside
the saved interval can reconcile that goal to `completed`; activity outside the
interval cannot. This preserves event-time attribution for offline arrivals.

The transition runs in the same SQLite transaction as terminal session writes,
goal definition updates, goal saves and the authorized legacy JSON import. A
failure to update the goal rolls back the source-session write. Existing JSON
files remain unchanged. No XP, achievement, ad, or other reward is granted here;
trusted reward processing remains a separate backend-gated feature.

## Risk and review

Risk is HIGH because this transition changes persistent goal lifecycle state and
is coupled to session persistence. The change remains `REVIEW_PENDING` pending
independent review of transaction boundaries, owner isolation, session-to-goal
attribution, legacy import and duplicate handling. Android/native SQLite,
background/foreground behavior, screen reader and other device checks are
`NOT_RUN`. This is not remote sync or production-ready behavior.

## Changed files

- `src/features/goals/goal-progress.ts`
- `src/features/storage/local-database.ts`
- `src/features/goals/goal-storage.ts`
- `src/app/goals/[goalId].tsx`
- `src/app/goals/index.tsx`
- `tests/domain/goal-progress.test.mjs`
- `tests/domain/local-database-ownership.test.mjs`
- `tests/domain/session-boundaries.test.mjs`
- `tests/components/goal-detail.test.mjs`
- `tests/components/goals.test.mjs`
- `tests/helpers/local-database-loader.mjs`
- `tests/domain/session-boundaries.test.mjs`
- `tests/components/README.md`
- `docs/CHANGELOG.md`
- `docs/revision/evidence/GOAL-AUTO-COMPLETION-2026-10-07.md`

## Actual verification

- Focused goal routes, progress and SQLite ownership tests: **33/33 PASS**.
- Session boundary and persistence regression tests: **26/26 PASS**.
- The first combined run after adding a new storage import was **119/134**; all
  15 failures came from the synthetic session-boundary harness not substituting
  the newly imported goal-progress module. The harness was updated; no app
  assertions were removed or weakened.
- Final combined domain/component/navigation/website suite: **135/135 PASS**.
- Root TypeScript `tsc --noEmit`: **PASS**.
- Focused ESLint: **PASS**.
- Documentation checker: **PASS**, 924 local links checked, 0 errors.
- `git diff --check`: **PASS** (line-ending notices only).
- Independent review/device checks: `REVIEW_PENDING` / `NOT_RUN`.
