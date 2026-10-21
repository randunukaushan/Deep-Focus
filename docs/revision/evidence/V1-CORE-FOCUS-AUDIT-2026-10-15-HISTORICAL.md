# Historical V1 core focus audit — retained 2026-10-22

Status: HISTORICAL / SUPERSEDED FOR CURRENT STATUS. The original audit below
was dated 2026-10-15 and is preserved without changing its body. It was taken
from PR #19 head `8e944d59b0ac8996bc56e1d8918d3209267122fd`.
That identifies the document revision, not the original code SHA audited: the
original did not record an immutable inspected-code baseline or executed test
log. Its old claims are not recertified as historically accurate.

Use [the current core audit](../../V1_CORE_FOCUS_AUDIT.md) and
[current matrix](../../V1_FEATURE_MATRIX.md) for main 7916d81 status.
The following text, including its old recommendations and questions, is evidence,
not current instructions, approvals, live defects or release readiness.

---

# Deep Focus V1 — Core Focus Session Audit

**Audit date:** 2026-10-15  
**Scope:** `setup → start → pause/resume → complete/cancel → persist → restart/recover → history/progress exactly once`  
**Source of truth for required behavior:** `V1_FEATURE_SCOPE.md`, `V1_IMPLEMENTATION_PLAN.md`, `DATA_MODEL.md`, `TESTING_STRATEGY.md`, and `AGENTS.md`.

This audit describes repository evidence on `main`. It does not claim runtime/device verification where only static code inspection was performed.

---

## 1. Executive status

**Overall status: PARTIAL — NOT RELEASE READY.**

The current implementation has a solid local vertical slice: timestamp-based focus timing, pause/resume state, completion/cancellation, local active-session persistence, duplicate-resistant history append, break and summary routes, and a Home recovery card for paused sessions.

However, the V1 contract is not yet satisfied because restart recovery is incomplete for active sessions, persistence failures are silently swallowed, True Zen Break timing is interval-based rather than lifecycle-safe, task association is name-only rather than a durable task identifier, progress/reward side effects are not yet a trusted exactly-once pipeline, and automated tests for the focus engine were not found in the audit search.

---

## 2. Requirement-by-requirement audit

| Requirement | Status | Evidence / gap |
| --- | --- | --- |
| Configure focus duration | ✅ Implemented | Setup supports presets 25/45/60 and custom 5–180 minutes. |
| Default focus duration from settings | 🟡 Partial | Core hook accepts duration; setup currently initializes to hard-coded 25 rather than loading default focus duration from settings. |
| Optional task association | 🟡 Partial | Setup/session accept `taskName`; session model stores a task name snapshot, not a durable task ID. |
| Timestamp-based focus timing | ✅ Implemented | Projection derives elapsed focus from `startedAt`, paused duration, and current timestamp. |
| Visible remaining time and progress | ✅ Implemented | Active session displays remaining time and percentage. |
| Pause / resume | ✅ Implemented locally | State transitions guard active↔paused and account for pause duration. |
| Intentional completion | 🟡 Partial | Completion works, including early completion, but early-complete confirmation/semantics should be verified against UX requirements. |
| Cancellation | ✅ Implemented locally | End Session requires destructive confirmation and stores cancelled state. |
| Planned / focused / paused durations | ✅ Implemented locally | Session model and projection track all three. |
| Background / foreground focus accuracy | 🟡 Strong partial | Focus projection is timestamp-based and refreshes on foreground. Runtime/device verification still required. |
| App-restart recovery | 🔴 Blocker | Active-session state is persisted, but normal app startup routes directly to Home and Home exposes only **paused** sessions. An interrupted **active** session can therefore become invisible after restart. |
| Temporary offline continuity | 🟡 Partial | Local file persistence allows local use; full offline/sync contract is not implemented/verified. |
| Persisted session history | 🟡 Strong partial | Completed/cancelled sessions append to a local history file. Cloud/user-scoped persistence is not present yet. |
| Duplicate completion/history protection | 🟡 Partial | Engine ignores completion/cancel after terminal state; history append skips duplicate session IDs. There is no full trusted exactly-once progress/reward transaction yet. |
| True Zen Break | 🟡 Partial / risk | Break route exists and pauses the focus session, but the break timer decrements an in-memory counter each second and is not timestamp/lifecycle based. |
| Session Summary | 🟡 Partial | Summary shows status, focused/planned time, and task name. V1 goal/streak/XP/achievement/break data is not yet integrated. |
| Progress update exactly once | 🔴 Not complete | Analytics reads history, which limits duplicate counting by session ID, but V1 streak/XP/goal/reward side effects are not yet an exactly-once completion pipeline. |
| Automated focus-engine tests | 🔴 Missing / not found | Repository code search did not find tests targeting the focus-session transition functions. |

---

## 3. Confirmed strengths

### 3.1 Timestamp-based focus engine

`session-engine.ts` computes focused time from authoritative timestamps and accumulated pause duration instead of trusting UI ticks. This is the correct architectural direction for background/foreground accuracy.

### 3.2 Guarded lifecycle transitions

- Pause only changes an active session.
- Resume only changes a paused session with `lastPausedAt`.
- Complete/cancel do not reprocess a session already terminal.

These guards reduce state corruption from repeated UI actions.

### 3.3 Active-session persistence

The implementation writes active/paused session state to a dedicated local file and can deserialize only valid active/paused session records.

### 3.4 Duplicate-resistant local history

`appendSessionHistory()` checks the session ID and does not append a second history record with the same ID.

### 3.5 Home progress derives from completed history

Home computes today's focus time and completed blocks from completed persisted sessions rather than incrementing an independent UI-only counter.

---

## 4. High-priority defects / gaps

### CF-01 — Active session is not recoverable from normal app restart

**Severity:** Critical / V1 release blocker

Current startup behavior redirects directly to Home. Home loads the active-session file but stores a recovery card only when `session.status === 'paused'`. A persisted `active` session is ignored.

**Failure example:**

```text
Start 60-minute session
→ 20 minutes pass
→ app/process closes unexpectedly
→ reopen app
→ startup goes to Home
→ persisted session status = active
→ Home does not surface it
→ user has no normal-path recovery action
```

**Required fix:** startup/Home recovery logic must detect both active and paused recoverable sessions. Recovery should project the stored timestamps at current time and safely decide whether to resume, finalize an elapsed session, or show a recovery decision according to the approved UX.

### CF-02 — Persistence failures can cause silent data loss

**Severity:** High

The storage helper catches errors and returns fallbacks without surfacing failure state. On terminal session flow, the route performs:

```text
clear active session
→ append session history
→ navigate to summary
```

If clearing succeeds and history append fails, the only recoverable copy may be gone while the UI still moves forward.

**Required fix:** use a safer terminal-persistence transaction/order or recoverable journal pattern. Do not clear the active/recovery record until durable terminal persistence is confirmed. Surface a recoverable error when necessary.

### CF-03 — True Zen Break timer is not lifecycle-safe

**Severity:** High for V1 reliability

The break route decrements React state using a one-second interval. Unlike the focus timer, it does not derive remaining time from a persisted timestamp. Backgrounding, suspension, process death, delayed JS execution, or navigation can make break time inaccurate or reset it.

**Required fix:** model break start/end timestamps and project remaining time from the clock. Persist break state if V1 requires recovery across interruption.

### CF-04 — Task association is not durable

**Severity:** Medium/High

Focus sessions currently store `taskName` only. V1 requires task-to-focus-session association and preservation of historical records when a task changes/deletes. A name snapshot is useful for history, but it is not enough to update/verify the associated task or goal safely.

**Required fix:** persist stable `taskId` (and optional denormalized task-title snapshot). If goal contribution is part of V1 session completion, use stable goal/task relationships rather than text matching.

### CF-05 — Session Summary is incomplete against V1 scope

**Severity:** Medium

Current Summary shows focused/planned duration, status, and task name. It does not yet show verified daily-goal progress, streak progress, eligible XP/achievements, completed-break information, or task-completion action where approved.

### CF-06 — No trusted exactly-once progression pipeline yet

**Severity:** Critical before rewards/progression release

Local history duplicate protection is useful, but V1 requires duplicate-safe goal, streak, XP, achievement, reward, and analytics updates. Those side effects are not yet implemented as a single idempotent completion path.

**Required fix:** define a completion processor keyed by immutable session ID/idempotency key, with deterministic eligibility and retry-safe writes.

### CF-07 — Focus-engine automated tests not found

**Severity:** Critical for release confidence

Static search did not locate unit tests for create/project/pause/resume/complete/cancel behavior.

Minimum tests should cover:

- active projection at exact timestamps;
- pause stops focus accumulation;
- resume excludes paused time;
- foreground projection after long delay;
- auto-complete boundary;
- early completion;
- cancellation;
- duplicate completion/cancellation calls;
- corrupted active-session file;
- duplicate history append;
- persistence failure between terminal state and history save;
- active and paused restart recovery;
- device clock edge behavior policy if supported.

---

## 5. Important product/UX decisions still needing confirmation

These do not change whether Core Focus belongs in V1; they define exact behavior:

1. **Early completion:** should `Complete Session` before the planned end require confirmation and be recorded as completed vs ended-early?
2. **Restart after planned end:** if an active session's planned duration elapsed while the app was closed, should it auto-complete on recovery or ask the user to confirm the outcome?
3. **Task completion:** completing a focus session must not silently complete the linked task. Decide whether Summary offers an explicit `Mark Task Complete` action.
4. **Break recovery:** confirm whether a break must survive process restart or only background/foreground transitions. V1 scope strongly favors reliable timer behavior either way.

---

## 6. Recommended implementation order

1. Fix active-session startup recovery (`CF-01`).
2. Make terminal persistence crash-safe (`CF-02`).
3. Add focus-engine/storage unit tests before expanding behavior (`CF-07`).
4. Make True Zen Break timestamp-based and recovery-safe (`CF-03`).
5. Add stable task/session association and history snapshot semantics (`CF-04`).
6. Implement one idempotent completion/progression processor for analytics, goals, streaks, XP, achievements, and rewards (`CF-06`).
7. Complete Session Summary from verified processor results (`CF-05`).
8. Run Android lifecycle regression: background, force-close, restart, process death, offline, rapid pause/resume, repeated completion.
9. Run equivalent iOS lifecycle validation before release readiness can become green.

---

## 7. Audit conclusion

The focus vertical slice is **substantially real**, not a visual placeholder. The central timer engine is architecturally better than a naïve countdown because it uses timestamps, and local persistence/history provide a useful base.

The remaining work is primarily **reliability and integrity hardening**, not rebuilding the feature from zero. The most urgent V1 defect is active-session restart recovery, followed by crash-safe terminal persistence and automated lifecycle tests.
