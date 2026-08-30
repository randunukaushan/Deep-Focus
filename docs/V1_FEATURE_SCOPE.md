# Deep Focus V1 Feature Scope

This document is the canonical user-facing feature list for Deep Focus V1.

It records the additive scope decision approved on 2026-08-29: the existing V1
scope remains intact, `Plan My Day` is added as a required V1 AI feature, and
`Break Down This Task` plus `Review My Day Lite` are protected by the release
checkpoint described below.

This file defines product scope. Architecture, security, data, API, UI, testing,
and implementation details remain governed by their dedicated specifications.

---

## 1. Scope Rules

- Existing approved V1 functionality is not removed or reduced by this update.
- Core focus, task, goal, recovery, progress, and account functionality must not
  depend on AI availability.
- AI output remains a proposal until the user explicitly confirms an action.
- AI may not directly control XP, streaks, authorization, ownership, account
  permissions, or other trusted progression and security state.
- Future features listed in `POST_V1_FEATURE_SCOPE.md` are not silently pulled
  into V1.

---

## 2. Launch, Account, and Onboarding

V1 includes:

- branded Splash Screen;
- Welcome Screen;
- sign up, sign in, sign out, and session restoration;
- password recovery where the selected authentication flow supports it;
- email verification where required by the selected authentication flow;
- protected navigation and user-owned data boundaries;
- concise onboarding introduction;
- resumable Personal Assessment;
- assessment results and a basic assessment-based Productivity Profile.

The branded opening experience remains part of V1. Development builds may route
directly to an incomplete Home screen while startup routing is still being built,
but that temporary implementation state does not remove Splash or Welcome from
the release scope.

---

## 3. Home Dashboard

V1 includes a calm daily dashboard that can present, when supported by available
data:

- personalized welcome;
- a primary Start Focus Session action;
- today's focus goal and progress;
- recommended starting session;
- current streak;
- recent session summary;
- quick actions;
- active or recoverable session state.

---

## 4. Core Focus Sessions

V1 includes:

- configurable focus duration;
- default focus duration from user settings;
- optional task association;
- accurate timestamp-based timer behavior;
- visible remaining time and session progress;
- pause and resume;
- intentional completion and cancellation;
- planned, focused, and paused duration handling;
- background and foreground accuracy;
- app-restart recovery;
- temporary offline continuity;
- persisted session history;
- optional sound controls where implemented;
- duplicate-completion protection.

---

## 5. True Zen Break and Session Summary

V1 includes a basic, optional recovery experience with:

- configurable break duration;
- break timer;
- approved non-medical recovery suggestions;
- skip and end-early actions;
- break-completion behavior;
- continued operation without AI.

The V1 Session Summary can present verified:

- planned and completed focus duration;
- session status;
- associated task or goal;
- daily goal progress;
- streak progress;
- eligible XP and achievements;
- completed break information;
- actions to return Home or begin another session.

---

## 6. Tasks and Goals

V1 task functionality includes:

- create, list, edit, complete, and delete/archive supported tasks;
- supported title, description, priority, and due-date information;
- task-to-goal association;
- task-to-focus-session association;
- preservation of historical session records when a task changes or is deleted;
- required offline and synchronization behavior.

V1 goal functionality includes:

- create and manage supported goals;
- validated targets and time boundaries;
- progress from verified completed sessions or tasks;
- duplicate-safe goal completion;
- goal-to-task relationships;
- preservation of tasks and history when a goal changes or is deleted.

---

## 7. Streaks, XP, Rewards, and Achievements

V1 includes:

- current streak;
- longest streak;
- user-local calendar-day processing;
- same-day duplicate protection;
- XP from verified qualifying activity;
- level progression;
- approved V1 achievements;
- milestone progress;
- reward history where supported;
- recently unlocked reward presentation;
- duplicate XP and achievement protection.

No real-money reward, gambling, cash stake, or cash-based focus bet belongs to
V1.

---

## 8. Analytics and Progress

V1 analytics may present the approved interface metrics supported by reliable
data, including:

- daily, weekly, and monthly summaries;
- total focus time;
- completed focus sessions;
- average focus duration;
- daily and weekly focus activity;
- task completion;
- goal progress;
- current and longest streak;
- XP and level progress;
- focus-session history;
- recovery-break information where supported;
- time-period filters;
- accessible loading, empty, offline, and error states.

---

## 9. Profile, Settings, Notifications, and Accessibility

V1 includes supported controls for:

- basic profile information;
- productivity and focus preferences;
- default focus and break durations;
- Light, Dark, and System appearance;
- focus, break, and achievement notifications;
- sound and haptic preferences;
- reduced motion;
- AI feature preference;
- relevant privacy and account controls;
- secure sign out.

V1 accessibility includes:

- meaningful screen-reader labels;
- logical reading and focus order;
- adequate touch targets;
- readable text and contrast;
- dynamic text support where required;
- reduced-motion behavior;
- accessible loading, empty, validation, and error communication.

---

## 10. Offline, Synchronization, Security, and Quality

V1 includes the reliability work required to:

- continue core focus timing during temporary network loss;
- recover active sessions after normal interruption;
- preserve pending synchronization through restart where required;
- retry safely without duplicating trusted side effects;
- isolate cached data during account switching;
- fail safely when recovery state is invalid;
- validate authentication, ownership, input, and external responses;
- preserve private provider credentials on trusted infrastructure;
- pass required regression, accessibility, security, compatibility, and
  performance checks before release.

---

## 11. Approved V1 AI Features

### 11.1 Assessment-Based Productivity Profile

The existing V1 personalization experience may produce a basic profile and
starting recommendations from validated assessment answers. It must distinguish
user-provided facts from generated suggestions and must not present onboarding
answers as proven long-term behavioral patterns.

### 11.2 Plan My Day — Required

`Plan My Day` is a required V1 AI feature.

It may:

- use the user's submitted tasks, available time, supported preferences, and
  relevant approved context;
- propose an ordered daily plan with focus blocks, breaks, and reminders;
- explain important scheduling choices briefly;
- allow the user to edit, reject, retry, or confirm the proposal.

The proposal must not create or change tasks, reminders, goals, or settings until
the user explicitly confirms it. Confirmation must apply only the items shown to
the user and still pass ordinary validation and authorization rules.

### 11.3 Break Down This Task — Conditional V1 Target

`Break Down This Task` may turn one selected task into smaller, actionable steps
and propose an order or estimated focus-session structure.

It enters V1 only after the core application is stable. The user must be able to
edit, reject, retry, or confirm the proposed steps before any supported subtasks
are saved.

### 11.4 Review My Day Lite — Conditional V1 Target

`Review My Day Lite` may summarize verified daily activity such as completed
tasks, completed focus sessions, focus time, goal progress, streaks, and rewards,
then offer one concise, practical suggestion for the next day.

It must not diagnose burnout, fatigue, attention disorders, mental-health states,
or other medical or psychological conditions. It enters V1 only if time remains
after core stability and higher-priority release work.

---

## 12. AI Access and Rewarded Unlock

- The first five eligible AI actions are introductory free actions.
- After those actions are exhausted, additional AI access may be unlocked only
  after a rewarded-ad completion is verified by trusted infrastructure.
- A client claim that an advertisement completed is not sufficient by itself.
- The number and validity period of actions granted by one verified advertisement
  remain server-configured until the product owner approves exact values.
- Advertisements must never interrupt an active focus session or True Zen Break.
- AI access rules must be visible before the user starts an action that may be
  unavailable.
- AI provider failure, quota exhaustion, advertisement failure, or network loss
  must not block core Deep Focus functionality.

---

## 13. Release Guardrails and Milestones

The planning baseline is five Deep Focus development hours per weekday.

The approved release targets are:

| Checkpoint | Target |
| --- | --- |
| V1 scope and stability checkpoint | 2026-11-15 |
| Beta target | 2026-11-30 |
| Store submission target | 2026-12-15 |
| Public V1 release target | 2027-01-01 |

At the 2026-11-15 checkpoint:

1. `Plan My Day` remains required.
2. `Break Down This Task` remains in V1 only if the core is stable.
3. `Review My Day Lite` remains in V1 only if time and release quality permit.
4. If a conditional AI feature threatens the public release or core reliability,
   it moves to V1.1 without reducing the existing non-AI V1 scope.

Release quality, security, accessibility, testing, and store readiness must not be
traded away to fit a conditional AI feature.

---

## 14. V1 Scope Summary

Deep Focus V1 is not merely a countdown timer. It is a tested focus and
productivity system combining reliable sessions, intentional recovery, tasks,
goals, progress, analytics, personalization, and user-controlled AI assistance.

The protected minimum AI release scope is `Plan My Day`. The full target AI scope
also includes `Break Down This Task` and `Review My Day Lite` when the release
guardrails above are satisfied.
