# Streak, XP and Rewards V1 reliability — 2026-10-15

## Scope and outcome

This slice preserves the existing Core Focus, Tasks/Goals and Analytics/Summary
work. It adds the dependency-safe trusted streak projection and moves the
existing three Rewards milestones out of the React component into a pure domain
projection. It does not add cash rewards, gambling, focus betting, XP penalties,
or a new gamification system.

Overall status: **PARTIAL / REVIEW_PENDING**.

## Canonical rules and unresolved decisions

- The durable terminal boundary remains `terminal:<sessionId>` from Core Focus.
- A qualifying streak day is a completed eligible focus session. Cancelled
  sessions and paused-only records do not qualify. Multiple sessions on one
  local calendar day count once.
- Local calendar dates use the device IANA timezone. Future terminal timestamps
  are ignored. Current streak is the consecutive run ending today, or yesterday
  when today has no activity; longest streak is preserved from all accepted
  qualifying dates.
- Existing V1 documents explicitly say numeric XP examples are not an approved
  formula, the level curve is not frozen, and the canonical achievement catalog
  is incomplete. Therefore no XP amount, threshold or new achievement has been
  invented or granted.
- The Rewards route's existing one-session, five-session and one-hour
  milestones are retained as a read-only local projection with stable IDs. They
  are not claimed to be a server-authoritative reward ledger or approved future
  catalog.

## Files changed

- `src/features/progress/streak.ts` — pure local-calendar streak calculation.
- `src/features/progress/reward-projection.ts` — pure projection for existing
  milestone IDs with duplicate/conflict protection.
- `src/features/progress/progress-analytics.ts` — consumes streak data without
  duplicating streak calculations in the screen.
- `src/app/(tabs)/progress/index.tsx` — displays current/longest streak from the
  analytics domain result.
- `src/app/(tabs)/progress/rewards.tsx` — consumes the domain milestone
  projection rather than calculating authority in React.
- `src/app/focus/summary.tsx` — reads the persisted terminal history and shows
  current streak only when the trusted local derivation succeeds.
- `src/features/localization/progress-copy.ts` and `session-copy.ts` — labels.
- `tests/domain/streak.test.mjs` and `tests/domain/reward-projection.test.mjs`.
- Existing Analytics component/domain tests updated for the new projection data.
- This evidence report and `docs/CHANGELOG.md`.

## Persistence, schema and idempotency

- No database migration was added. The source of truth is the already durable,
  owner-scoped finalized focus-session history; streak dates are derived
  deterministically and are not separately incremented on screen render.
- Identical terminal session IDs are deduplicated. Conflicting snapshots fail
  closed. Replaying a session therefore cannot create a second qualifying day
  or a second milestone result.
- Existing `terminal:<sessionId>` processing remains the boundary for future
  materialized streak/XP/achievement consumers. No new consumer grants an XP
  or writes a reward ledger in this slice.
- No client-controlled award endpoint, arbitrary XP input or cross-owner state
  was introduced.

## Verification

Focused progression, Analytics and Summary command:

```text
node --test tests/domain/streak.test.mjs tests/domain/reward-projection.test.mjs tests/domain/progress-analytics.test.mjs tests/components/progress.test.mjs tests/components/session-summary-source.test.mjs
```

Result: **16 passed, 0 failed, 0 skipped, 0 todo**.

Core Focus + Tasks + Goals + Analytics + Summary + progression regression:

```text
node --test tests/domain/goal-progress.test.mjs tests/domain/local-database-ownership.test.mjs tests/domain/task-date.test.mjs tests/components/tasks.test.mjs tests/components/task-detail.test.mjs tests/components/goals.test.mjs tests/components/goal-detail.test.mjs tests/domain/session-boundaries.test.mjs tests/domain/completion-processing.test.mjs tests/domain/session-summary-data.test.mjs tests/components/session-summary-source.test.mjs tests/domain/progress-analytics.test.mjs tests/components/progress.test.mjs tests/components/session-history.test.mjs tests/components/session-history-accessibility.test.mjs tests/domain/streak.test.mjs tests/domain/reward-projection.test.mjs
```

Result: **136 passed, 0 failed, 0 skipped, 0 todo**.

Additional checks:

- `node node_modules/typescript/bin/tsc --noEmit`: **VERIFIED**, exit 0.
- `node node_modules/expo/bin/cli lint`: **VERIFIED**, exit 0. The first run
  had two import-duplication warnings in Summary; the imports were consolidated
  and the warning-causing duplication was removed. Existing environment-load
  output is not a lint finding.
- `git diff --check`: **VERIFIED**, exit 0; existing LF/CRLF normalization
  warnings only.

## Status by requested area

- Streak current/longest: **VERIFIED locally**, real device pending.
- Same-day, consecutive-day, missed-day, restart/replay and local-midnight
  logic: **VERIFIED by pure tests**; native lifecycle evidence pending.
- XP total and per-session award: **BLOCKED / REVIEW_PENDING** because exact
  XP rules, eligible sources, caps and rule version are not canonically frozen.
- Level and next-level threshold: **BLOCKED / REVIEW_PENDING** for the same
  missing product decision; no misleading values are shown.
- Achievements: existing three milestone projections are **PARTIAL** and
  derived from persisted history; a persisted unlock ledger and approved V1
  catalog remain pending.
- Reward history: **PARTIAL**; no immutable reward history writes were added
  without an approved catalog/XP rule.
- Analytics integration: streak is **VERIFIED locally** as a consumer of the
  domain calculation. XP/level remain unavailable rather than fabricated.
- Session Summary integration: current streak is **VERIFIED locally** when
  history loads; XP and newly unlocked achievements are omitted unless trusted
  persisted processors exist.
- Account isolation: local owner-scoped history and prior SQLite tests remain
  **VERIFIED locally**; live Supabase Auth/RLS is **REVIEW_PENDING**.

## Remaining gates

- `NOT_RUN`: Android/iOS real-device lifecycle, restart, timezone, accessibility,
  dynamic text and rendering checks.
- `REVIEW_PENDING`: independent security/persistence review of progression
  consumers and any future materialized ledger.
- `REVIEW_PENDING`: canonical XP amounts, level thresholds, qualifying-source
  policy, late-arrival/timezone policy and approved achievement catalog.
- `NOT_RUN`: live Supabase Auth/RLS/remote synchronization verification.
- No production migration, deployment, commit or push was performed.

Streak: **Green Candidate locally, not Release Ready**.

XP/Levels: **Partial / Blocked on product decisions**.

Achievements/Rewards: **Partial**.

## Progression persistence continuation — 2026-10-15

Status: **IMPLEMENTED_AND_LOCALLY_TESTED** for the local SQLite candidate only.
The owner-approved V1 rules now live in `docs/PROGRESSION_RULES.md`.

- SQLite schema version 15 adds owner-scoped `reward_progress`, immutable
  `progression_events`, and `user_achievements`. The operation ledger has the
  composite primary key `(owner_id, consumer, source_operation_key)`; completed
  focus uses `rewards:v1` and `terminal:<sessionId>`.
- Terminal persistence inserts the event, updates XP, derives level and inserts
  first-time unlocks inside the existing `BEGIN IMMEDIATE` transaction. A replay
  reads the existing event and does not increment the summary.
- Completed historical local sessions are backfilled in deterministic terminal
  order. Because this local schema had no pre-existing XP or achievement tables,
  no total was reconciled or overwritten. Backfilled unlocks have
  `backfill_marker = 1` and are not new-unlock events.
- XP is one per whole completed focused minute; cancelled sessions receive no
  event or XP. Zero-XP valid completed sessions still participate in the session
  achievement facts. Task, goal, streak and achievement actions grant no XP.
- The current app UI has not yet been connected to persisted XP/level/unlock
  reads. Analytics, Summary and Rewards integration remain **PARTIAL**.

Actual checks:

- `node --test tests/domain/progression-rules.test.mjs tests/domain/local-database-ownership.test.mjs tests/domain/session-boundaries.test.mjs` — **67/67 pass**.
- `node node_modules/typescript/bin/tsc --noEmit` — **pass**.
- `node node_modules/expo/bin/cli lint` — **NOT_RUN / INCONCLUSIVE**: the command
  loaded ignored local Expo configuration but emitted no completion result in the
  bounded execution window; no configuration values are recorded here.
- `git diff --check` — **NOT_RUN** after the final evidence edit.

Remaining gates: Android/iOS lifecycle testing, TalkBack/VoiceOver, live
Supabase Auth/RLS, server-side recomputation/reconciliation, independent
security/persistence review and UI integration are **REVIEW_PENDING**. No live
database, migration, deployment or production data operation was performed.

## Local UI integration continuation — 2026-10-15

- Session Summary now reads the owner-scoped persisted terminal progression
  result. It displays a positive XP award only when the persisted award is
  greater than zero, and displays the persisted level. Cancelled sessions and
  zero-XP completions do not receive an artificial XP celebration.
- Analytics reads the persisted reward summary and uses the centralized level
  helper for total XP, current level and XP-to-next-level; the screen contains
  no independent level formula.
- Rewards reads `user_achievements` rather than the former three-item local UI
  projection. It lists all eight canonical achievement IDs with persisted
  locked/unlocked state and unlock date. Backfilled records remain stored as
  backfills; they are not introduced as a new Summary celebration.
- After persisted goal lifecycle reconciliation, `first_goal_completed` is
  inserted with `INSERT OR IGNORE` in the same SQLite transaction. This has no
  XP side effect and is safe across terminal retries and later goal completions.
- Summary does not yet have a durable per-screen acknowledgement receipt for
  a one-time achievement celebration. Therefore unlock-list presentation in
  Summary is **PARTIAL** and intentionally omitted rather than replaying a
  historical unlock as new.

Actual checks after this continuation:

- `node --test tests/domain/progression-rules.test.mjs tests/domain/local-database-ownership.test.mjs tests/domain/session-boundaries.test.mjs` — **68/68 pass**.
- `node node_modules/typescript/bin/tsc --noEmit` — **NOT_RUN / INCONCLUSIVE** in this bounded run: no diagnostic was emitted, but the command did not return a reportable completion status.
- `node node_modules/expo/bin/cli lint` — **INCONCLUSIVE**; not rerun because the prior bounded command did not return a completion status.
- `git diff --check` — **PASS**; LF/CRLF conversion warnings only.
- Broad local command `node --test tests/domain/*.test.mjs tests/components/*.test.mjs` — **PARTIAL / not a clean baseline**. The receipt-focused and selected regression suites above passed, but the broad run exposed pre-existing/unrelated component-harness gaps: four onboarding route checks failed and `tests/components/button.test.mjs` aborted because its VM dependency map lacks `@/constants/theme`. These are not progression receipt failures and were not changed in this slice.

Cloud/server progression sync, server-side recomputation, live Auth/RLS,
Android/iOS device behavior, TalkBack/VoiceOver and independent review remain
**REVIEW_PENDING**. No live database or production operation was performed.

## Achievement presentation receipt continuation — 2026-10-16

Status: **IMPLEMENTED_AND_LOCALLY_TESTED** for the owner-scoped local SQLite
store. This is not live backend or device evidence.

- Schema version 18 adds nullable `summary_presented_at` to
  `user_achievements`. It is a receipt only; it does not alter XP, levels,
  terminal records, unlock eligibility or the progression ledger.
- The migration marks records which existed before version 18 as presented at
  their existing unlock time. This fail-closed migration prevents an app update
  from treating old non-backfilled unlocks as a new Summary celebration.
- `claimTerminalAchievementPresentation(sessionId)` verifies the owner-scoped
  `rewards:v1` terminal event, selects only matching non-backfilled and
  unpresented unlocks, and updates all of their receipts in one local SQLite
  transaction. A retry returns no already-consumed IDs.
- Summary loads the persisted terminal progression first, then claims the
  presentation receipt. It renders only the IDs successfully claimed by this
  Summary load. Receipt-write failure leaves XP/level visible but renders no
  achievement celebration; the receipt remains retryable.
- Backfilled rows are excluded from receipt claiming. Multiple IDs from one
  terminal operation are selected in deterministic ID order and consumed
  together. Owner-scoped queries prevent an account switch from consuming
  another account's receipt.

Actual checks:

- `node --test tests/domain/progression-rules.test.mjs tests/domain/local-database-ownership.test.mjs tests/domain/session-boundaries.test.mjs` — **70/70 pass**.
- `node --test tests/components/session-summary-source.test.mjs tests/components/rewards.test.mjs tests/components/progress.test.mjs tests/domain/goal-progress.test.mjs tests/domain/session-summary-data.test.mjs tests/domain/progress-analytics.test.mjs tests/domain/app-locale.test.mjs tests/domain/auth-routing.test.mjs` — **29/29 pass**.
- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- `node node_modules/expo/bin/cli lint` — **INCONCLUSIVE**: bounded at 30 seconds after only Expo environment-load output; it did not emit a completion status.
- `git diff --check` — pending final worktree check.

Remaining verification gates: Android/iOS lifecycle and restart behavior,
TalkBack/VoiceOver, real device rendering, live Supabase Auth/RLS and server
recomputation/sync are **REVIEW_PENDING**. Independent security/persistence
review remains **REVIEW_PENDING**. No commit, push, deployment or production
data operation was performed.

## Local broad-regression correction — 2026-10-16

- The four onboarding route component failures were test-harness failures, not
  an onboarding routing regression. The test directly imported a TypeScript
  definition under a Node test runtime which does not load `.ts` files by
  default. The harness now transpiles that definition through the existing
  TypeScript dependency, matching the route-test loader already used by the
  same test file. The approved signed-out, recovery, resumable-onboarding and
  Home routing behavior was not changed.
- The Button implementation correctly consumes the canonical `Fonts` contract
  from `@/constants/theme`. The required faithful test mock was already
  present in the working tree; no Button production or test behavior change was
  necessary. Its three checks now pass.

Actual checks using the local Node 24 runtime required by the SQLite tests:

- `node --test tests/components/assessment.test.mjs tests/components/button.test.mjs` — **7/7 pass**.
- `node --test --test-concurrency=16 tests/domain/*.test.mjs tests/components/*.test.mjs` — **1595/1595 pass**, 0 fail, 0 skipped, 0 aborted.
- `node --test tests/domain/progression-rules.test.mjs tests/domain/local-database-ownership.test.mjs tests/domain/session-boundaries.test.mjs tests/components/session-summary-source.test.mjs` — **71/71 pass**.
- `node node_modules/typescript/bin/tsc --noEmit` — **PASS**.
- `git diff --check` — **PASS**; LF/CRLF conversion warnings only.
- `node node_modules/expo/bin/cli lint` — **INCONCLUSIVE**: stopped after 40 seconds with only Expo environment-load output and no completion status.

The broad local Node suite is now **IMPLEMENTED_AND_LOCALLY_TESTED**. This
does not replace the remaining Android/iOS, accessibility-device, live
Supabase Auth/RLS, server recomputation/sync or independent security review
gates, which remain **REVIEW_PENDING**.

## Local lint completion — 2026-10-16

- The Expo lint wrapper did not return within its earlier bounded run, so it
  remains unsuitable as a completed-check record for that invocation. Direct
  ESLint against the real application source completed successfully:
  `node node_modules/eslint/bin/eslint.js src --max-warnings=0` exited **0**.
  This is a local source-quality result only and does not establish device,
  cloud, accessibility-device, or independent security verification.

## Current authoritative local status — 2026-10-16

The earlier continuation notes above are historical checkpoints. The later
local UI integration and achievement-presentation receipt work supersede the
earlier statements that Summary, Analytics and Rewards were not connected.
The current implementation reads persisted owner-scoped progression results;
Summary achievement presentation is protected by a persisted receipt and does
not replay an already-presented unlock.

Current local verification:

- Domain/component/navigation suite: **1606/1606 pass**, 0 failed, 0 skipped,
  0 aborted.
- `node node_modules/typescript/bin/tsc --noEmit`: **PASS**.
- `node node_modules/expo/bin/cli lint`: **PASS**, exit 0.
- Focused ESLint on `src/app/focus/break.tsx`: **PASS**.
- `git diff --check`: **PASS**; line-ending normalization warnings only.
- Break start clock-rollback regression: **20/20 repeated component runs pass**.

The remaining limitations are unchanged: Android/iOS device lifecycle and
accessibility checks, live Supabase Auth/RLS and server recomputation/sync, and
independent security/persistence review remain **REVIEW_PENDING**.

## Latest broad local regression evidence — 2026-10-16

The prior broad-suite count above is retained as historical evidence. The
current working tree was rechecked after the onboarding route-harness and
Button mock investigation, and after the subsequent local resource integrity
work. The all-at-once Node invocation exceeds the desktop runner's bounded
execution window, so the complete suite was run in non-overlapping,
reproducible groups instead of treating a truncated run as a pass.

- Components: 37 files, **110/110 pass**.
- Domain: 228 files in six non-overlapping ordered groups,
  **1506/1506 pass**.
- Integration: 1 file, **0 pass, 0 fail, 10 skipped**. Those cases are
  explicitly skipped by their own test harness; they are not execution
  failures and do not establish live integration evidence.
- Combined local Node total: **1616 pass, 0 fail, 0 cancelled, 10 skipped**
  out of **1626 tests**.
- Rechecked onboarding/Button focus set: **20/20 pass**. The onboarding issue
  remains a Node TypeScript-loader harness issue, not a change to the approved
  signed-out/recovery/onboarding/Home routing contract. Button continues to
  use the canonical `@/constants/theme` contract.
- Progression smoke set (progression rules, reward migration contract,
  SQLite ownership, session boundaries, Summary, Rewards, Progress and Goals):
  **86/86 pass**.
- `node node_modules/typescript/bin/tsc --noEmit`: **PASS**, exit 0.
- `node node_modules/expo/bin/cli lint`: **PASS**, exit 0 in 17.2 seconds.
- `git diff --check`: **PASS**, exit 0.

This is local automated evidence only. Android/iOS lifecycle and
accessibility-device checks, live Supabase Auth/RLS and server
recomputation/sync, and independent security/persistence review remain
**REVIEW_PENDING**. No commit, push, deployment, production migration or live
database operation was performed.
