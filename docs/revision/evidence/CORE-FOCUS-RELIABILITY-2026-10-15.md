# Core Focus reliability hardening — 2026-10-15

## Scope

This slice hardens existing V1 Core Focus behavior only. It does not add a
product feature, change the seconds-based session format, redesign the UI, or
change storage schema/return types.

## Implemented

- Startup, root layout, recovery, and Home now use strict active-session
  loading and surface both `active` and `paused` recovery states.
- True Zen Break now stores a start timestamp and deadline, projects elapsed
  time from timestamps after background gaps, refreshes on foreground, and
  rejects a clock that moves before the break start.
- Existing terminal persistence behavior remains history-first, retryable, and
  idempotent; no destructive cleanup change was made.
- A linked task now keeps its stable `taskId` as a historical snapshot when the
  task is deleted. Legacy name-only records remain valid and no missing ID is
  invented.
- Terminal processing has one durable idempotency identity, `terminal:<session
  id>`. The SQLite terminal transaction stores that same identity in the outbox
  and goal reconciliation; future analytics, streak, and reward consumers must
  use this identity before applying a non-derived side effect.
- Session Summary receives only `sessionId` and loads the owner-scoped,
  persisted finalized record. Route duration, status, and task parameters are
  no longer trusted as summary data.

## Actual verification

Command:

```text
node --test tests/domain/session-engine.test.mjs tests/domain/session-recovery-state.test.mjs tests/domain/session-boundaries.test.mjs tests/domain/break-engine.test.mjs tests/components/focus-break.test.mjs tests/components/home-session-recovery.test.mjs
```

Result: **49 passed, 0 failed**.

Extended boundary command:

```text
node --test tests/domain/completion-processing.test.mjs tests/domain/session-summary-data.test.mjs tests/components/session-summary-source.test.mjs tests/domain/session-boundaries.test.mjs tests/domain/local-database-ownership.test.mjs
```

Result: **64 passed, 0 failed**.

Consolidated current run, including timer, recovery, persistence, task-link,
summary, and SQLite ownership cases: **88 passed, 0 failed**.

Additional checks:

- TypeScript no-emit check: **passed** (`TSC_EXIT=0`).
- Targeted ESLint with `--max-warnings=0`: **passed** (`ESLINT_EXIT=0`).
- `git diff --check`: **passed**; existing line-ending warnings only.
- Break start now captures one timestamp for both the displayed clock and the
  persisted break timer, preventing a `CLOCK_UNCERTAIN` race if the device
  clock moves backwards between adjacent `Date.now()` calls. The focused break
  component test passed 20 repeated runs after this fix.

## Device lifecycle execution protocol — NOT_RUN

Run each scenario on a real Android device and a real iOS device using a local,
non-production account. Record the device/OS/build, exact timestamps, observed
screen, stored terminal-history count, and terminal outbox count. Do not use a
simulator result as physical-device evidence.

1. Start a task-linked focus session, force-stop/kill the app, relaunch, and
   confirm Home/recovery finds the active session. Confirm the remaining time is
   calculated from timestamps, the same `taskId` and task-name snapshot remain,
   and no second active session is created.
2. Pause a focus session, force-stop/kill the app, relaunch, and confirm recovery
   remains paused. Wait while backgrounded and verify focused time does not grow
   until the person explicitly resumes.
3. Start an active session, background for a measured interval, foreground it,
   and confirm focus elapsed/remaining time reflects the interval without relying
   on interval ticks. Repeat with a break: the focus session must remain paused,
   while break remaining time follows its deadline after foregrounding.
4. At completion, trigger the completion action twice and repeat after a forced
   restart or lost-response retry. Verify exactly one terminal history row and
   one `terminal:<session id>` outbox mutation exist, with no duplicate goal,
   analytics, streak, or reward side effect.

## Not established by this slice

- Android and iOS device lifecycle evidence: `NOT_RUN`.
- Independent security review: `REVIEW_PENDING`.
- Analytics, streak, and XP/reward consumers are not activated by this slice;
  their server-authoritative rules and independent review remain separate work.
- Live Supabase/Auth verification, production migration, deployment, commit,
  and push: not performed.

The passing local tests do not by themselves establish production readiness.

## Android offline build check — 2026-10-16

- `android\\gradlew.bat assembleDebug --offline` completed successfully in
  11m 44s: 662 actionable tasks, 55 executed and 607 up-to-date. The offline
  flag prevented dependency download; no source or production-data change was
  made by this verification.
- Gradle reported an Android SDK XML tooling-version warning and deprecated
  Gradle-feature warning. Neither failed the build. They remain maintenance
  observations, not a substitute for platform validation.
- ADB was available locally but reported no attached Android device or emulator.
  Therefore active-session restart, paused-session restart, background focus and
  break timing, duplicate completion, TalkBack and real rendering remain
  **NOT_RUN** on Android. iOS remains **NOT_RUN**.
- Fresh current-tree verification: `android\\gradlew.bat assembleDebug --offline`
  completed successfully on 2026-10-16 (662 actionable tasks; 55 executed,
  607 up-to-date). This confirms the debug Android package builds locally; it
  does not establish device lifecycle or accessibility behavior.
- Local analytics, streak and XP/reward consumers are covered separately by
  `STREAK-XP-REWARDS-V1-RELIABILITY-2026-10-15.md`; this build check neither
  proves live Supabase synchronization nor replaces its review gates.
- Direct source lint verification completed after the Expo wrapper's bounded
  invocation had remained unfinished: `node node_modules/eslint/bin/eslint.js
  src --max-warnings=0` exited **0**. This verifies the current application
  source; it does not replace device, backend, or independent-review evidence.
