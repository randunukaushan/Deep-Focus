# Deep Focus V1 Feature Matrix

This document tracks the implementation state of the approved Deep Focus V1 scope.

It exists to prevent confusion between **documented target scope** and **currently implemented behavior**. A feature may be approved for V1 without being fully implemented yet.

`V1_FEATURE_SCOPE.md` remains the canonical source for **what belongs in V1**. This matrix tracks **how far each V1 area has been implemented and verified**.

---

## Status Legend

| Status | Meaning |
| --- | --- |
| ✅ Complete | Implemented for the tracked layer and evidence exists |
| 🟡 Partial | Some implementation exists, but the tracked layer is incomplete |
| ⚪ Planned | Approved/documented, but implementation evidence is not yet sufficient |
| 🔴 Blocked | Cannot progress because of a known dependency or unresolved decision |
| ❓ Unverified | May exist, but has not yet been confirmed in code/tests |

A row may only become **Release Ready = ✅** after applicable UI, business logic, persistence/synchronization, accessibility, security, and test requirements are verified.

---

## V1 Feature Matrix

| V1 Area | Required for V1 | Designed / Documented | UI | Logic | Persistence / Sync | Tests | Release Ready | Current Evidence / Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Splash / Welcome / startup routing | Yes | ✅ | 🟡 | 🟡 | N/A | ❓ | ❌ | Welcome/startup routes exist; full release routing still requires verification. |
| Home / daily dashboard | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Home route exists, but full V1 dashboard coverage and verified data wiring need review. |
| Core Focus Session | Yes — highest priority | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Focus UI and focus feature modules exist. V1 still requires full lifecycle, recovery, background/foreground, idempotent completion, and persistence verification. |
| True Zen Break / recovery | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Approved in V1 docs; implementation coverage requires a focused audit. |
| Session Summary / Done | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Session-history and completion data exist; final V1 summary behavior and task-completion separation need verification. |
| Tasks | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Task routes exist. Full create/edit/complete/archive, due date, priority, goal/session links, offline/sync coverage need verification. |
| Goals | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Goal routes exist. Full goal lifecycle and progress-from-verified-activity need verification. |
| Streaks | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | V1 scope requires current/longest streak and duplicate-safe local-day handling; implementation completeness not yet confirmed. |
| XP / Levels / Achievements / Rewards | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Rewards route exists. Duplicate-safe reward processing and complete V1 achievement rules need verification. |
| Analytics / Progress | **Yes — mandatory** | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Existing Analytics screen already shows total focus time, completed sessions, Focus/Plan %, a progress summary, and session history access. Full V1 scope still needs daily/weekly/monthly summaries, average duration, task completion, goal progress, streak/XP/level integration, period filters, and robust offline/error states. |
| Session History | Yes | ✅ | ✅/🟡 | 🟡 | 🟡 | ❓ | ❌ | Dedicated `analytics/history` route exists and reads persisted session history. Full filtering/state coverage still needs verification. |
| Profile | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Profile route exists; complete V1 account/profile behaviors require audit. |
| Settings | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | V1 requires focus/break defaults, appearance, notifications, sound/haptics, reduced motion, AI preference, privacy/account controls. Complete implementation not yet verified. |
| Notifications | Yes | ✅ | ⚪/🟡 | ⚪/🟡 | 🟡 | ❓ | ❌ | Required by scope; implementation coverage must be audited. |
| Accessibility | Yes — release blocker | ✅ | 🟡 | N/A | N/A | ❓ | ❌ | Existing screens include some accessibility labels/roles. Full screen-reader, dynamic type, contrast, focus order, reduced motion, and touch-target verification is still required. |
| Authentication / account foundation | Yes | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | Auth routes exist; secure storage, ownership boundaries, sign-out/account switching, and full authorization need verification. |
| Offline / synchronization / recovery | Yes — release blocker | ✅ | N/A | 🟡 | 🟡 | ❓ | ❌ | Session storage/history exists. Full pending-sync persistence, retries, restart recovery, conflict/duplicate safety, and account-isolation must be verified. |
| Security / privacy hardening | Yes — release blocker | ✅ | N/A | 🟡 | 🟡 | ❓ | ❌ | Strong documented requirements exist; code-level and backend verification remains required. |
| `Plan My Day` AI | **Yes — required AI feature** | ✅ | 🟡 | 🟡 | 🟡 | ❓ | ❌ | `src/app/plan-my-day.tsx` exists. V1 requires proposal → review → explicit confirmation, minimum context, validation, graceful failure, and no silent state changes. |
| `Break Down This Task` AI | Conditional V1 | ✅ | ⚪/🟡 | ⚪/🟡 | ⚪/🟡 | ❓ | ❌ | Only stays in V1 if core stability and release quality allow. |
| `Review My Day Lite` AI | Conditional V1 | ✅ | ⚪/🟡 | ⚪/🟡 | ⚪/🟡 | ❓ | ❌ | Only stays in V1 if time and quality permit after higher-priority work. |
| AI access / rewarded unlock | Yes if V1 AI access model is used | ✅ | ⚪/🟡 | ⚪/🟡 | ⚪/🟡 | ❓ | ❌ | Must be server-authoritative; client-only ad completion cannot grant trusted usage. Needs implementation verification. |
| Android release readiness | Yes | ✅ | N/A | N/A | N/A | ❓ | ❌ | Requires final build, device regression, store configuration, privacy/security checks, and release QA. |
| iOS release readiness | Yes | ✅ | N/A | N/A | N/A | ❓ | ❌ | Requires iOS build/test path, store configuration, privacy/security checks, and release QA. |

---

## Analytics / Progress — Mandatory V1 Completion Checklist

Analytics is confirmed as a **mandatory V1 feature**, not an optional enhancement.

The existing screen already provides a useful partial slice. V1 completion should cover:

- [x] total focus time from completed saved sessions;
- [x] completed focus-session count;
- [x] Focus / Plan percentage based on saved session data;
- [x] basic progress summary;
- [x] link to session history;
- [ ] daily summary;
- [ ] weekly summary;
- [ ] monthly summary;
- [ ] average focus duration;
- [ ] daily / weekly activity visualization or equivalent accessible presentation;
- [ ] task-completion analytics;
- [ ] goal-progress analytics;
- [ ] current and longest streak integration;
- [ ] XP and level progress integration;
- [ ] recovery-break information where supported;
- [ ] time-period filters;
- [ ] loading-state verification;
- [ ] empty-state verification;
- [ ] offline-state behavior;
- [ ] error and retry behavior;
- [ ] accessibility verification;
- [ ] automated/integration tests for analytics calculations and update flow;
- [ ] regression check that completed focus sessions update analytics exactly once.

### Analytics principle

The Progress / Analytics screen should be the single V1 analytics center. Do not create duplicate progress systems elsewhere unless a small summary is contextually useful on Home or Session Summary.

---

## Current Implementation Tracking Rules

1. **Do not mark a feature complete because it appears in documentation.**
2. **Do not mark a feature complete because a screen file exists.** UI, logic, persistence, failure states, accessibility, and tests may still be incomplete.
3. Update this matrix only from repository evidence, executed tests, or explicitly recorded manual verification.
4. When a feature is partially implemented, note the missing layer rather than using a single misleading percentage.
5. `CHANGELOG.md` should only record completed user-visible changes; this matrix may record partial work.
6. A feature becomes **Release Ready** only after the applicable Definition of Done in `AGENTS.md`, `TESTING_STRATEGY.md`, and `V1_IMPLEMENTATION_PLAN.md` is satisfied.
7. This matrix does not add or remove V1 features. Scope changes still require explicit product-owner approval and updates to `V1_FEATURE_SCOPE.md`.

---

## Immediate Next Audit Order

To turn the current yellow/unknown states into verified status, audit in this order:

1. Core Focus Session lifecycle and persistence.
2. Tasks and Goals end-to-end behavior.
3. Analytics / Progress full V1 gap list.
4. Streak / XP / rewards update path from verified completion.
5. Settings, notifications, profile, and accessibility.
6. `Plan My Day` proposal/confirmation and failure behavior.
7. Offline/sync/recovery and account-isolation hardening.
8. Android + iOS release verification.

This order follows V1 dependency risk rather than visual polish.
