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
