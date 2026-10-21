# Safety, Commitment and Claim Boundaries

2026-09-17 — **approved product constraints + proposed build detail**.

මෙහි අරමුණ userට තමන් තෝරාගත් commitment එක රැකගන්න උදව් කිරීමයි. සාමාන්‍ය
End early එක අක්‍රිය කළ හැකි වුණත් Emergency exit එක තිබෙනවා. XP අහිමි කිරීම,
health prediction හෝ app එකෙන් පිටවෙන්න බැරි කරන පොරොන්දු මේ design එකේ නැහැ.
පහත UI/data proposals තවම implementation හෝ සියල්ලටම owner approval ලැබුණු බවක් නොවේ.

Requirements: DF-027–029/033/058/076–080. ADR-004 owns safety choices; ADR-003/006/
008/012 gate detailed UI, release placement, translations and storage/tooling.
[01](01-REQUIREMENTS-AND-DECISIONS.md) is the approval record,
[03](03-PRODUCT-AND-EXPERIENCE.md) the product owner,
[13](13-CORE-RELIABILITY-CONTRACTS.md) the lifecycle/persistence contract and
[15](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md) the navigation/accessibility
contract. This file refines them; it does not add a fifth session status or a
new mandatory backend, permission or paid module.

## 1. Fixed decisions versus design proposals

| Area | Confirmed constraint | Proposed detail, not yet a frozen contract |
| --- | --- | --- |
| Progress | No missed-work/early-exit XP penalty; no stakes/forfeiture | Normal approved reward formula remains separate; no new commitment bonus |
| Ordinary exit | User chooses ordinary End early availability in Settings before focus | A clearly explained switch, initially enabled for new/legacy users |
| Emergency exit | Separate exit remains available when ordinary exit is disabled | Visible text action with a single accessible confirmation, no PIN/delay/reason collection |
| Active-mode changes | No exact new policy was selected by the owner's reply | Snapshot exit policy at Start; edits affect the next session only, never remove Emergency exit |
| Claims | No unverified burnout/health predictions or unbreakable-lock promises | Observed work patterns and voluntary self-report, if their feature is admitted |
| Release | These constraints apply to any admitted commitment feature | Exact shielding capabilities, mode names and January inclusion remain ADR-006/platform gates |

Do not re-ask whether Emergency exit should exist. Review the proposed interaction
as a bounded design, not a series of invented product approvals. The default,
snapshot/migration and confirmation proposals must be accepted in the task's
frozen contract before a card becomes READY. Existing users must not silently
enter a more restrictive mode after update or onboarding recomputation.

## 2. Current implementation, not future promises

Inspected [session route](../../src/app/focus/session.tsx),
[session types](../../src/features/focus/session-types.ts),
[engine](../../src/features/focus/session-engine.ts) and current package metadata.
The route presents End Session with confirmation for active/paused sessions and
calls cancellation. The type has no exit-policy snapshot or separate emergency
path. Complete Session is also exposed before the target; prior CR diagnostics
record the early-completion gap. None of those bugs is fixed by this document.

The route clears the active record before history append; therefore implementing
an emergency button alone would not meet durable-exit requirements. Finish the
approved CR storage/lifecycle foundation first. No production shield, OS
restriction or emergency-access behavior was tested here.

## 3. Proposed preferences and controls

Suggested preference: `ordinaryEarlyExitEnabled: boolean`, scoped to the current
permitted owner namespace. Absence in a legacy record maps to the less-restrictive
default only through an approved migration. Unknown future schema versions use
honest recovery, not an assumed restrictive default. Never reset historical work.

Proposed session snapshot: `{ exitPolicyVersion, ordinaryEarlyExitEnabled }`.
No configurable `emergencyExitEnabled` flag: retaining the emergency path is a
product invariant. These are conceptual fields, not additions to the shipped
TypeScript/SQL/API. Version the data contract and adapters before using them;
do not auto-add them to cloud-settings/sync allowlists.

| Session/UI state | Ordinary End early | Emergency path | Data rule |
| --- | --- | --- | --- |
| Setup | Show selected policy and explanation | Explain availability before Start | No active record changed until Start commits |
| Active or paused, ordinary exit enabled | Available | Available | Same serialized cancellation command boundary |
| Active or paused, ordinary exit disabled | Not actionable; explain in session details | Discoverable and actionable | Do not disable cancellation at the domain level |
| Terminal save pending | Prevent duplicate terminal commands | Safe navigation remains; show pending outcome | Resolve original command identity, not a second cancel |
| Save failure/uncertain commit | Retry original intent and allow leaving | Must not trap user behind a save or network dependency | Do not show Saved; retain/recover only real durable state |
| Already completed/cancelled | No new End early | No new session terminal command | Return immutable existing outcome |

Opening the emergency confirmation does not silently pause, cancel or complete.
Suggested actions: Continue focusing / Exit focus. Dismissing it returns to the
unchanged active/paused session. Confirming freezes one intent time and command
ID. Back/navigation away alone is not cancellation. Do not change Pause/Resume,
break availability or task state merely because the ordinary-exit switch changes.

Suggested English copy, pending locale/accessibility review:

- Setting: “Allow End early”; explanation: “Changes apply to your next session.
  Emergency exit remains available.”
- Setup with switch off: “End early is off for this session. Emergency exit is
  still available.”
- Confirmation: “Exit this focus session? Ending early does not remove earned XP.
  This session will not earn a completion reward.”
- Save failure: “Your exit could not be saved. You can leave now or retry. If the
  app closes, the last saved session may appear again.”

Do not promise saved progress in pre-commit copy. Essential controls must work
with screen readers, large text, keyboard where relevant, reduced motion and
approved touch targets; no gesture-only or colour-only emergency action.
Do not add an ad, purchase, login, AI check, network call, multi-step guilt
dialogue or required personal explanation to the exit path. Existing privacy
and no-focus-ad boundaries apply regardless of the user's subscription.

## 4. Lifecycle, failure and recovery

1. Verify the locally permitted account/session identity; never render or mutate
   another account's cached session. Auth refresh is not an emergency prerequisite.
2. Route ordinary and emergency intents to the same serialized repository
   finalization boundary in 13. An early emergency stop is `cancelled`, with
   measured focus and pause totals, not “completed for safety” or an XP loss.
3. Atomically save terminal result, command receipt and eligible outbox event
   before clearing that session's active pointer. No automatic new task status,
   break, AI suggestion, ad or compulsory summary survey follows exit.
4. On explicit rollback retain the old durable record and honest save-failure
   UI. Allow safe navigation even when disk failure prevents durable cancellation.
   On unknown commit outcome, query/retry the same command ID; never credit twice.
5. Across process death recover only durably recorded intent. An in-memory exit
   cannot be reconstructed as if saved. Retain the emergency path on recovery;
   mode restoration must not invent a stricter setting or a completed session.
6. Completion/cancel races use 13's serialized terminal-winner rule. A completion
   already committed stays complete; a committed cancel stays cancelled. Do not
   award or subtract XP to reconcile a UI race.

Emergency exit is an app workflow, not a replacement for device emergency
services. This contract does not promise OS-level blocking, interruption capture,
reboot resistance or an exception after exactly three phone calls. Any external
shield needs capability/permission/cleanup proof on each admitted platform. If
that proof fails, the affected shield cannot be marketed or released as working.

Suggested data-minimization rule: no mandatory reason text, emergency frequency
score, guardian/employer alert or emergency event for ad targeting. If a minimal
exit-kind field is later necessary, define purpose, local/cloud scope, retention
and export behavior before adding it. Do not invent a health condition from exit.

## 5. Rewards and factual claims

Not earning a completion-only reward is not a penalty. Never debit previously
earned XP for an unfinished task, early exit, missed day or emergency. A streak
may reflect the separately approved qualifying-day rules; this does not authorize
XP subtraction, shame copy or a new streak-freeze purchase. Deduplicating an
invalid/duplicated grant is a separate trusted integrity contract, not a user-
behavior penalty and not authority for arbitrary negative balances.

Allowed only with real underlying evidence: “Two completed sessions today” or
“You reported low energy.” Missing self-report is Unknown, not low/high energy.
Do not infer mental-energy percentages, burnout probability, ADHD diagnosis,
recovery efficacy or employee/student ability from timer history. A personal
reflection is not clinical assessment; a descriptive count is not a health model.

AI summaries must follow the same boundaries. Invalid/unsupported health output
is not shown as a diagnosis; use a truthful unavailable/manual fallback. Required
backend output validation and safe error handling belong to the admitted AI
contract. A keyword filter is not proof that all misleading claims are blocked.
No automated health score may force a break, block work or alter commitment mode.

Historical “Burnout Risk Card” and Focus Bet examples are not implementation
permission. Negative examples explicitly labelled Avoid remain useful tests;
do not delete them merely to make a keyword scan pass. New future health claims
require a separate owner scope decision and appropriate evidence/privacy/safety
review, not only a model named “validated.”

## 6. Bounded build cards — DRAFT, not executed

Common prerequisite: 07 READY gate, approved release placement and test harness,
current source inspection and exact schema/interaction contract. Preserve dirty
Home/theme edits. No new major dependency, provider, OS capability or deployment
is authorized here. Each card must receive exact allowed paths and real commands
at READY; intended boundaries below are not permission to rewrite whole folders.

| ID | Outcome / intended boundary | Dependencies and acceptance |
| --- | --- | --- |
| SC-01 | Preference, migration and session snapshot; settings adapter/session types and focused tests | CR persistence foundation, agreed default/snapshot fields; SC-T01–04/11/17 |
| SC-02 | Ordinary/emergency UI through existing cancellation repository; session route/controller and approved components | SC-01, CR terminal correctness, approved interaction/locales; SC-T05–10/12/18–20 |
| SC-03 | Non-punitive reward and truthful insight boundaries; selected reward/AI adapters and fixtures | Approved reward rules and any admitted AI contract; SC-T10/13–16, no new health module |
| SC-04 | Real-build accessibility/recovery evidence and any separately admitted shielding probe | SC-01–03, platform/permission and release gates; all applicable SC cases plus G-01/02/03/07/10/15 |

## 7. Acceptance cases — all NOT RUN

| ID | Given / action | Required result |
| --- | --- | --- |
| SC-T01 | New or supported legacy settings; open proposed policy UI | Less-restrictive proposed default; no silent strict opt-in; real migration version recorded |
| SC-T02 | User disables ordinary exit before Start | Setup explains policy; start captures agreed snapshot; Emergency exit remains |
| SC-T03 | Active session; change next-session default | Under proposed snapshot rule active mode/history unchanged; next Start uses new default |
| SC-T04 | Restart with valid policy snapshot | Same active/paused mode restored; no second timer; Emergency exit available |
| SC-T05 | Ordinary exit enabled; select End early | Explicit confirmation then one cancellation command; no completion-only reward |
| SC-T06 | Ordinary exit disabled; trigger stale UI/deep-link ordinary command | Controller respects snapshot; returns safe unavailable outcome; emergency remains possible |
| SC-T07 | Active or paused strict session; confirm Emergency exit offline | No AI/ad/payment/network prerequisite; cancellation uses actual elapsed focus excluding pauses |
| SC-T08 | Open then dismiss emergency confirmation | Session lifecycle unchanged; no reward, message or private reason record |
| SC-T09 | Double tap / retry after lost commit response | One terminal record and result; same command ID; no duplicate outbox/reward |
| SC-T10 | Exit before planned duration with existing earned XP | Existing earned XP unchanged; no stake/loss ledger; no fabricated completion |
| SC-T11 | Unsupported schema or owner mismatch | Honest recovery/unavailable state without foreign data, guessed defaults or fabricated completion |
| SC-T12 | Storage full or unknown commit during exit; leave/restart | Safe navigation and truthful unsaved warning; resolve real durable record/receipt, no invented saved exit |
| SC-T13 | Missed task/day and valid prior XP balance | No behavioral XP debit or shame copy; separately approved streak calculation only |
| SC-T14 | Sparse data or missing reflection | Unknown/insufficient evidence, not health score or inferred low energy |
| SC-T15 | AI response includes unsupported burnout/mental-energy claim | Invalid result not surfaced as assessment; safe fallback; manual core remains usable |
| SC-T16 | Completed sessions and explicit self-report | Counts reflect verified records; self-report labelled as such; no health or ability inference |
| SC-T17 | Personalization redo/reset | Does not silently enable restrictive exit or overwrite active snapshot/history |
| SC-T18 | Screen reader, large text, keyboard where supported | Emergency action and confirmation reachable/announced; no clipping, gesture-only control or focus trap |
| SC-T19 | Completion and emergency cancellation race | Serialized durable winner immutable; no double completion, cancellation rewrite or XP debit |
| SC-T20 | Any selected shield fails to release or essential-access proof fails | Stop affected shield release, preserve available safe fallback, no advertised unbreakable/verified protection |

## 8. Remaining boundary

Next safe document work is to freeze admitted January scope and finish exact
contracts/defaults across settings, lifecycle and AI usage. This safety contract
does not resolve all ADR-004/006 choices or expand every enterprise feature.
Documentation checking validates links/IDs, not screen-reader behavior, AI safety,
OS restrictions, privacy compliance or reliable emergency exit on a real device.
