# Localized persisted status and duration accessibility — 2026-10-16

## Scope

Verify and correct only user-visible internal status values and an activity-chart
screen-reader duration label. No storage, analytics calculation, progression,
ownership or navigation behavior is changed.

## Findings and correction

- A non-active persisted goal could be rendered as its internal identifier
  (`completed`, `cancelled` or `expired`) in Goal detail and Task goal-link
  selection. `getGoalStatusLabel` now supplies the corresponding `en`/`si`/`ta`
  label from the locale layer.
- A persisted task priority could be rendered as `low`, `medium` or `high` in
  Task detail. The existing translated priority labels are now used.
- The weekly Progress activity chart used raw seconds in its accessibility label
  while its visible value used the localized duration formatter. The label now
  uses that same formatter.

## Verification

- `tests/components/progress.test.mjs` and
  `tests/domain/localization-consistency.test.mjs`: **8/8 PASS**.
- TypeScript `node node_modules/typescript/bin/tsc --noEmit`: **PASS**.
- Affected-file ESLint with `--max-warnings=0`: **PASS**.
- `git diff --check`: **PASS**.

## Remaining gates

- Human Sinhala/Tamil translation review: `REVIEW_PENDING`.
- TalkBack/VoiceOver, text scaling and contrast checks on Android/iOS devices:
  `NOT_RUN`.
- This evidence does not claim a device or independent accessibility review.
