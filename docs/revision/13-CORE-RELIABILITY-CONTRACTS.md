# Core Reliability Contracts and Reproducible Checks

මේ කොටස Lunaට focus flow එකේ success path පමණක් නොව, interruption සහ
failure එකකට පසුව කළ යුතු දේත් නිශ්චිතව ලබා දෙයි. Timer එක පෙනීම, local save
වීම සහ cloud verification වීම වෙන වෙනම ප්‍රතිඵල තුනකි.

Status: **baseline invariants + partially reconciled implementation contracts**.
Requirements DF-025/027–033/036; tasks L-01–08; gates G-01–05. On 2026-10-06,
the owner approved the local SQLite/legacy-import boundary and time-goal treatment
of cancelled sessions recorded in revision 01 and canonical DATA_MODEL/
DATABASE_SCHEMA. Other CR-02 precision/cutoff choices, task identity and HIGH
independent/native verification remain separate gates. No production migration,
auth provider operation or deployment is authorized.

## 1. Contract authority and current implementation

Read `AGENTS.md` and [AI rules](../AI_RULES.md) completely, then
[scope](../V1_FEATURE_SCOPE.md), [data model section 6](../DATA_MODEL.md),
[architecture section 9](../ARCHITECTURE.md), [implementation phase 3](../V1_IMPLEMENTATION_PLAN.md)
and [testing strategy](../TESTING_STRATEGY.md). For this expansion also read
[product sections 5–6](03-PRODUCT-AND-EXPERIENCE.md) and
[storage/sync sections 5–7](04-BACKEND-SECURITY-AND-SYNC.md).

Current source inspected on 2026-09-14:

| Existing path | Actual behaviour, not intended design |
| --- | --- |
| [session-types.ts](../../src/features/focus/session-types.ts) | Four statuses; second-based totals; task display name, no stable task ID/owner/version |
| [session-engine.ts](../../src/features/focus/session-engine.ts) | Pure timestamp functions; early completion accepted; terminal projection still uses current time; epoch-zero pause checked by truthiness |
| [session-storage.ts](../../src/features/focus/session-storage.ts) | Two legacy JSON files, swallowed errors, non-transactional history append, web no-op |
| [use-focus-session.ts](../../src/features/focus/use-focus-session.ts) | Creates a session before hydration; persistence is fire-and-forget; terminal callback is effect-driven |
| [session route](../../src/app/focus/session.tsx) | Clears active file before appending history; summary fields come from route parameters; pause opens the same break route |
| [goal-progress.ts](../../src/features/goals/goal-progress.ts) | Creation lower bound only; current goal model has no explicit end boundary |

These paths are not an instruction to overwrite them. Re-inspect the actual
checkout and preserve unrelated edits. In particular, the existing edits to
`src/features/home/home-screen.tsx` and `src/theme/tokens.ts` are outside this task.

## 2. Separate state dimensions

Keep persisted domain status exactly `active | paused | completed | cancelled`.
“Running” is a display label for `active`, not a fifth serialized status.
Setup/configured, hydrating, saving, failed save and clock uncertainty belong to
their own UI/repository/validation state, not invented successful session statuses.

Proposed controller model:

```ts
type ControllerPhase =
  | 'hydrating' | 'setup' | 'starting' | 'ready'
  | 'saving_transition' | 'saving_terminal'
  | 'save_failed' | 'recovery_required';
type SyncState = 'local_only' | 'pending' | 'verified' | 'needs_review';
```

`completed + pending` means locally saved work awaiting server verification.
`completed + save_failed` in memory is not durable history and must never show
“Saved” or a verified reward. Keep the last durable record separately from an
uncommitted command/candidate. Do not overwrite it on a failed write.

Owner namespace is resolved before any private hydration. Never briefly render
account A's old active session/history while account B is being authenticated.
Recovery is a view of valid persisted state, not permission to guess ownership.
Whether public guest/local entry ships remains open; legacy unowned data cannot
automatically be claimed by whichever account signs in first.

## 3. Baseline invariants and transition outcomes

The baseline already requires valid transitions, no cancellation rewards,
timestamp-based timing, immutable terminal history and duplicate prevention.
The exact discriminated result below is proposed so callers cannot mistake
a rejected action for successful completion:

```ts
type TransitionResult<T> =
  | { ok: true; changed: boolean; session: T }
  | { ok: false; code:
      'INVALID_INPUT' | 'INVALID_RECORD' | 'INVALID_TRANSITION'
      | 'DURATION_NOT_REACHED' | 'CLOCK_UNCERTAIN'; session?: T };
```

An implementation task must explicitly adapt every caller if it adopts this
type. Do not quietly return an object with a new shape to an old hook. Errors
expose safe codes, not raw stored records, file contents or tokens.

| Current state / command | Required invariant / proposed exact outcome |
| --- | --- |
| No session / Start | Validate configuration, create one stable ID, persist active record before acknowledging a durable start |
| Active / Pause | Snapshot focus at command time; begin pause; duplicate pause does not reset its start |
| Paused / Resume | Add the open pause once; resume without clearing prior focus; duplicate resume has no effect |
| Active or paused / Complete before target | Reject with `DURATION_NOT_REACHED`; unchanged domain state, no history/reward, Cancel still available |
| Active / Complete at valid target | Produce one completed candidate, then use the terminal transaction |
| Paused / Complete | No paused time credited. If target had already been reached, apply the approved threshold rule; otherwise reject |
| Active or paused / Cancel | Freeze measured partial totals, record cancelled, no completion-only credit |
| Completed or cancelled / any lifecycle retry | Return the existing terminal record unchanged; never update its timestamps or convert one terminal status into the other |
| Malformed/incompatible state | Typed invalid/recovery outcome; do not create an empty replacement as if recovery succeeded |

Serialization/validation requirements: finite safe numeric values; positive
planned duration; valid timestamp representations; nonnegative durations;
focused time no greater than planned time; terminal status matches its one
terminal timestamp; paused state has a valid open-pause timestamp. Zero epoch
is a valid test timestamp and must not be treated as missing.

Exact minimum/maximum/custom-duration UI values are not selected here. Validate
against one approved shared duration policy, not a route-only `Math.max` or
an arbitrary upper bound chosen inside the engine. A zero duration is already
invalid under the canonical data model; this does not require a new price/scope decision.

## 4. Timing precision, projection and cutoff proposal

The expanded backend draft uses integer milliseconds while old DTOs use
seconds. **Do not rename an old seconds field while retaining its numeric value.**
Recommended contract version 2 uses integer milliseconds internally, converting
to old `*Seconds` fields only at an explicit legacy/display adapter.

Proposed timing state for the new version:

```ts
type TimingV2 = {
  version: 2;
  plannedMs: number;
  settledFocusMs: number;
  settledPauseMs: number;
  segmentStartedAtMs: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  completionCutoff?: { reachedAtMs: number; pausedMs: number };
  endedAtMs?: number;     // effective end, when validly determinable
  recordedAtMs?: number;  // when the terminal command was processed
};
```

`settled*` contains only closed segments. For a valid active state at `now`,
`focusMs = min(plannedMs, settledFocusMs + now - segmentStartedAtMs)` and
`pauseMs = settledPauseMs`. For a valid paused state,
`focusMs = settledFocusMs`, `pauseMs = settledPauseMs + now - segmentStartedAtMs`.
`remainingMs = plannedMs - focusMs`. Display focus seconds with floor and
remaining seconds with ceiling; never round each short pause to whole seconds
before accumulating. Rendering never writes a segment or history entry.

`completionCutoff` is the proposed extension in §12.C for preserving target-time
evidence across pause/resume at the duration boundary. It is not an implemented
field, a trusted-server verification or authorization to change legacy records.
TimingV2 is a timing fragment, not a complete persisted session schema: session
identity, original start, ownership, command/version provenance and their
validation must come from the admitted enclosing record. In particular, the
fragment alone cannot prove that a stored cutoff belongs to this session's
chronology. Do not invent that context from the current time.

Pause/resume close the old segment once and start the next at the same command
timestamp. Terminal projection uses the frozen totals and never `Date.now()`.
Terminal timing rejects inconsistent fields instead of silently repairing them
to apparently verified history.

Proposed automatic cutoff: use an existing validated `completionCutoff` first,
including after a later resume. Only when no cutoff exists and the validated
active segment contains the first target crossing, derive the effective end as
`segmentStartedAtMs + plannedMs - settledFocusMs`. This formula is not a fallback
for an already-full resumed/legacy snapshot lacking target provenance; use §12.C's
recovery outcome instead. Do not move the effective end to the later resume time.
A delayed callback/restart records that end and a separate processing time;
it does not credit hours merely because the app reopened late. This can affect
which calendar day earns progress, so the end/recorded-time rule and legacy
mapping must be reconciled before adoption. It is not already implemented.

The cutoff specifies the timestamp of a **completion** outcome, not permission
to rewrite a cancellation. Auto-complete is a serialized command like any other.
If an explicit valid Cancel wins the terminal commit before auto-complete, it
remains cancelled with capped measured time and no completion-only credit. If
completion already committed, Cancel returns that immutable result. A controller
must not issue another terminal intent while its previous terminal save is unresolved.

On a backward timestamp or invalid ordering, retain last valid state and return
clock uncertainty; no NaN, silent zero reset or automatic full reward. Positive
wall-clock jumps cannot be reliably distinguished from real elapsed time across
process death by this schema alone. Boot/monotonic anchors and server checks
need a platform spike; acceptable tolerances and multi-device credit remain
open. Do not claim that a local clock proves attention or fraud resistance.

The RN 0.85 `AppState` API reports application state changes; its Android blur
event is distinct from a background transition. Treat these as reconciliation
signals, not a stopwatch or proof that the user stopped working.[^1] React
Strict Mode can repeat initializers/updaters in development; keep them pure and
perform durable side effects through the command boundary, not a state updater.[^2]

## 5. Repository commands and honest outcomes

Recommended repository interface (design, not an installed library):

```ts
type StoreError = 'UNAVAILABLE' | 'FULL' | 'LOCKED' | 'CORRUPT'
  | 'UNSUPPORTED_SCHEMA' | 'OWNER_MISMATCH' | 'VERSION_CONFLICT';
type LoadResult<T> =
  | { kind: 'found'; value: T }
  | { kind: 'empty' }
  | { kind: 'failed'; code: StoreError };
type WriteResult<T> =
  | { kind: 'committed'; value: T; duplicate: boolean }
  | { kind: 'rejected'; code: StoreError | 'INVALID_TRANSITION' }
  | { kind: 'unknown'; commandId: string };
```

“Unknown” means the caller cannot yet know whether commit succeeded, not that
it is safe to retry using a new identity. Reopen/read the same command ID first.
Proposed commands: `loadActive(owner)`, `start(command)`,
`applyTransition(command)`, `finalize(command)`, `getCommandResult(owner,id)`
and `loadHistory(owner,query)`. Each command contains a stable command ID,
session ID, expected version, intent time and validated minimal payload. The
local controller serializes commands; DB constraints/version checks protect
against other writers. Client-supplied owner IDs never authorise remote writes.

### Terminal transaction

```text
Freeze intent time + command ID (once)
  → resolve account namespace and current durable version
  → transaction:
      validate/replay-deduplicate command
      persist terminal session + command result
      add one eligible outbox event, if sync is enabled for this record
      clear only this session's active pointer
    COMMIT
  → publish durable result to UI → summary / optional recovery
  → later server verification and independently deduplicated progress
```

The outbox excludes local resources and their associations; session sync cannot
smuggle a file URI/resource title into a generic payload. No network request,
AI call, sound, navigation or file-copy operation belongs inside a DB transaction.
If a statement fails, all database changes roll back. A competing terminal
command reads the committed winner; it never overwrites it. Reusing a command ID
with different intent/payload is a conflict, not a duplicate success.

Durable failure rules:

| Failure boundary | Required recovered result |
| --- | --- |
| Before commit / explicit rollback | Previous active state and history remain; no success screen |
| Commit succeeds, UI response lost | Same command ID reads original terminal result; one history entry |
| Concurrent start while finalizing | Version/active-pointer constraint prevents old finalization clearing a newer session |
| Outbox retry after server commit | Same event identity returns original acceptance; no second reward |
| Account changes during async work | Completion cannot publish into or send with the new account; resolve in its original namespace |
| Storage unavailable/full | Clear save-failed state; retain in-memory intent while process lives and show restart-loss limitation |

A durable cancel/start/pause cannot be promised if storage failed. Pause may
stop the visible timer immediately with a clear “not saved” state, but a process
death can only recover the last durable record. Keep Retry and safe navigation
available; do not force the person to continue focusing until a disk write works.
For terminal retry reuse the frozen intent time, not the retry's later time.
Across process death, only durably recorded intent can be replayed; do not invent
the timing of an unsaved cancellation.

Expo SDK 56 documents `withExclusiveTransactionAsync` as using its `txn`
handle, with possible lock errors and no web support. Its ordinary async
transaction can include queries outside the callback. Therefore the recommended
native adapter uses a controlled writer and transaction handle, bound parameters
and tested lock retry; never assume three unrelated `await` writes are atomic.
SQLite adoption still requires ADR-012. The documented SDK recommendation at
inspection was `~56.0.6`; verify the compatible resolved version before install.[^3]
PostgreSQL also groups related changes into transactions; a server commit is
separate from the device commit, requiring outbox/deduplication, not a claimed
device-plus-cloud distributed transaction.[^4]

## 6. Hydration, navigation and recovery

1. Resolve authorised local namespace; show loading without a temporary new timer.
2. Load returns found, empty or failed. Only empty permits normal new-session setup.
3. Validate schema/state. Found active/paused offers recovery. Failed load offers
   Retry and safe exit; do not show “no sessions yet” for corruption/permission failure.
4. Start persists once before durable-start acknowledgement. A route remount or
   duplicate Start tap must not create another session.
5. While saving a command, serialize/disable conflicting commands and expose
   accessible pending feedback. Back navigation never silently completes/cancels.
6. A successful terminal save routes with **session ID**, then the summary loads
   its owned durable record. URL `focusedSeconds`, `status`, task name or XP is
   not a source of truth. Missing/inaccessible ID gets a safe parent/error state.
7. Optional post-completion break is a separate linked record. A paused-focus
   rest screen remains paused focus, not a completed session or completed break.
   The existing dual-use break route needs an explicit discriminator or separate
   controller before reuse. Skip/end rest never auto-completes an unfinished task.

Start/updater creation, random identity generation and persistence must not be
side effects of a render. Stable command identity is created once per user/system
intent outside render; replay/redraw uses that identity. Screen readers announce
phase changes and errors, not a noisy live region every second.

## 7. Legacy JSON migration and rollback boundaries

Exact current legacy names are `deep-focus-active-session.json` and
`deep-focus-session-history.json` under the adapter's document directory.
Do not delete/move real files during diagnosis. Planned migration:

- Inventory supported schema shapes and preserve originals. Validate the entire
  import; report counts of valid, conflicting and quarantined records without
  printing private payloads. A malformed file is not empty history.
- Preserve IDs through an explicit legacy mapping if the new schema requires
  UUIDs. Never create a new mapping on retry. Duplicate identical terminal IDs
  import once; conflicting same-ID outcomes require review, not last-write-wins.
- Seconds convert to milliseconds by multiplying by 1000 once under a version
  marker. Reject overflow/non-finite values. Legacy precision already lost cannot
  be reconstructed as exact subsecond evidence.
- Resolve ownerless legacy data explicitly; no automatic adoption/upload by the
  current login. Task names map only when unique and owner context is known;
  otherwise preserve the historic display snapshot with no fabricated task link.
- Import data and migration marker transactionally, verify counts/relationships,
  then switch reads. Partial import never becomes the default read source.
- Old files remain until an approved retention/cleanup decision. Before cutover,
  failed migration can keep safe old reads. After new-version writes occur,
  blindly restoring old files loses new work: stop writes and use a tested forward
  repair/export or separately designed reverse migration. Do not advertise a
  rollback that merely discards the new database.

Legacy completed records may reflect the currently permitted early-completion
bug. Preserve their recorded history, label verification state as needed, and
resolve reward eligibility under an approved legacy policy. Do not silently erase,
upgrade to full-duration work or issue new XP for imported records.

### 7.1 Source-to-migration inventory — CR-03I

**DRAFT / REVIEW_PENDING, September 28.** This is a source-inspected mapping and
failure packet, not an executable migrator, new schema or permission to read a
person's saved files. It refines CF-02/04/05 and CR-T17; §12.E's review gate remains.

Task brief: document what can and cannot be inferred from the current twelve
FocusSession fields before a future migration. HIGH, because misinterpreting
history, identity or timing could lose data, expose private records or fabricate progress.
Owner authority is documentation continuation only. Reads: full mandatory rules,
this §§2–7/9/12, DATA_MODEL §§3/6, SECURITY §11, 20 §3, implementation-plan
foundation boundary and ADR-012. Re-inspected session types/engine/storage,
package/scripts and existing dirty work. No real persisted user file was opened.

Allowed writes: this document; revision 07-LUNA-IMPLEMENTATION-PLAYBOOK.md,
18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md, 09-COVERAGE-AND-AUDIT.md and
docs/CHANGELOG.md. No new files, app/test code, package/config, SQL, approval
register, ownership policy, retention value or production action. Acceptance:
MI-A1 all twelve source fields covered; MI-A2 actual reader limitations and lost
precision distinguished from intended behavior; MI-A3 six future failure fixtures
and adoption gates explicit; MI-A4 docs/field inventory/whitespace checks pass.
Verification: read-only synthetic pure-engine probe and document/source checks,
not a storage/migration test. Preserve source bytes; recovery remains §7's proposal.
Stop adoption if exact schema, ownership, active-record treatment or required
independent review is missing. Work alone; no reviewer dispatched.

#### Raw source boundary, not the current reader's filtered output

The two exact filenames above are source-code constants, not proof those files
exist on any user's device. Current active loading returns null for missing,
invalid/non-active state and caught read/parse failure. History loading returns
an empty array for non-array input/read failure and filters out records failing
the shallow predicate. Therefore those helpers cannot establish a lossless
migration inventory. A future admitted importer needs a separate raw snapshot
and validated classification; it must not turn filtered-away records into
"nothing to import" or call the existing clear/append helpers as a transaction.

The current predicate checks basic string/number types and status membership,
not finite/safe values, timestamp validity, terminal consistency, optional-field
types, ownership or a schema version. Source inspection establishes that gap;
it is not a runtime test of native file I/O. Unknown fields/shapes require the
approved schema policy; do not discard them silently to make a parse pass.

| Current field | Observed source meaning | Required migration disposition before implementation |
| --- | --- | --- |
| `id` | String created from focus/time/random suffix; no UUID guarantee | Preserve source identity; use one durable explicit mapping if destination IDs differ. No regeneration on retry and no ownership inference from ID |
| `status` | active/paused/completed/cancelled; history reader does not restrict to terminal | Validate record and container context together. Preserve conflicts for recovery; never promote an active history entry to completed |
| `taskName` | Optional display string, not a stable task reference | Preserve as historical display data; do not automatically join a task by name or send it to a new account/cloud |
| `plannedDurationSeconds` | Configured duration multiplied by 60 | Validate supported positive integer/overflow rules; convert once to proposed plannedMs only under an admitted version. Do not clamp old records to current setup limits |
| `focusedDurationSeconds` | Snapshot at Pause/Complete/Cancel; not updated continuously or by Resume | A converted legacy total is not automatically V2 settledFocusMs at the latest segment anchor. Preserve the source value and apply a separately reviewed active/terminal adapter |
| `pausedDurationSeconds` | Sum of closed pause spans rounded down individually; terminal includes current pause projection | Multiplying by 1,000 preserves only recorded precision, not true pause history. No inferred subsecond reconstruction or new verified credit |
| `createdAt` | Source creation timestamp | Validate and retain provenance; not migration time, server receipt time or a replacement updatedAt |
| `startedAt` | Original session start used by current projection | Retain valid original instant; do not replace with migration/restart time or treat it as the latest V2 segment anchor |
| `completedAt` | Processing timestamp of current Complete, including early completion | Preserve recorded meaning; it is not proven V2 effective-end/cutoff evidence. Early legacy completion must not be upgraded to the full plan |
| `cancelledAt` | Processing timestamp of current Cancel | Preserve valid cancellation; no conversion to successful completion or completion-only credit |
| `lastPausedAt` | Open pause anchor while paused, cleared on resume/terminal commands | Validate against state/chronology. Missing/malformed data requires recovery, not an invented current-time pause start |
| `lastResumedAt` | Latest resume instant, possibly retained after terminal transition | Not an event log, command receipt or proof that the stored focus snapshot belongs to this anchor. Never use it alone to infer the first target crossing |

Missing from the current type: owner/account namespace, stable task ID, schema
version, durable command ID/result, expected version, trusted verification and
cutoff provenance. A successful shape parse cannot supply these facts. Choosing
SQLite/SecureStore does not answer them. The exact destination envelope is still
open; no column/type name in this table is permission to create one now.

#### Reproduced precision-loss counterexample

One synthetic seed: 25 minutes, start 0, fixed synthetic ID. Trace A pauses at
1,250 ms and resumes at 2,000; trace B pauses at 1,500 and resumes at 2,000.
Using the actual unchanged engine, both serialize to the same JSON: stored
focus 1 second, paused 0 seconds, same latest resume timestamp. At 3,000 the
engine projects 3 focus seconds for both, although the event traces contain
2,250 versus 2,500 eligible focus milliseconds. The old final snapshot cannot
distinguish them. JSON equality was asserted, not assumed from rounded displays.

Actual read-only Node probe: exit 0/PASS for reproducing this information loss;
known MODULE_TYPELESS_PACKAGE_JSON warning, no package change to suppress it.
This is evidence of a current limitation, **not a passing correctness test** or
an implemented migration. All timestamps/data were synthetic; no native storage
module or actual history file was loaded. A new representation can preserve
future precision but cannot manufacture already-discarded evidence.

#### Migration acceptance refinements (all NOT_RUN)

These refine CR-T17 and related recovery cases without replacing their coverage.

| Case | Synthetic input/failure | Required result after admitted implementation |
| --- | --- | --- |
| MI-T01 | Read denied/truncated JSON/non-array history/mixed valid and invalid entries | Distinct failure/classification and preserved source; not empty-success or silent filtering; no read-source cutover |
| MI-T02 | The two indistinguishable snapshots above; resume after a previous pause | Preserve recorded precision/provenance; no claim of recovered 250 ms difference, no blind settledFocusMs/anchor pairing. Source probe is run; migration behavior remains NOT_RUN |
| MI-T03 | Same-ID identical repeats versus conflicting active/history or terminal records | Deterministic duplicate handling only under reviewed comparison rules; preserve conflicting evidence, no last-write-wins or deletion of the other source |
| MI-T04 | Unknown/versioned-ms shape; unsafe seconds multiplication; old early completion | No double conversion, overflow, forced duration clamp, fabricated cutoff or full-duration/reward upgrade |
| MI-T05 | Source changes during inventory; failure before commit; crash after commit before acknowledgement | Admitted snapshot/writer exclusion prevents stale import; data and marker commit together, retry reads the same result; originals retained and no partial cutover |
| MI-T06 | Account switches mid-import; ownerless history; new writes after cutover then attempted rollback | No automatic owner claim/upload or foreign UI; no restore of stale JSON over new work. Approved forward-recovery/ownership policy and negative evidence required |

Before a migration card is READY, resolve the ownerless-data policy, exact
destination envelope/validation, active legacy-session recovery, duplicate/conflict
comparison and snapshot/writer exclusion mechanism. Specify retained-source
location/protection/cleanup policy and the measured rollback/forward-recovery
procedure in its own authorized test environment. Raw snapshot preservation is
not permission to make unprotected backups or upload private files. No confidence
score, universal timeout, retention duration or guessed account is supplied here.

## 8. Acceptance cases

The first eight cases have a read-only current-source diagnostic below. The
remaining cases require future controller/repository/device fixtures; listing
them is not executing them. All synthetic timestamps in the first cases are
milliseconds from Unix epoch, no real waiting or user data.

| ID | Given / when | Required result |
| --- | --- | --- |
| CR-T01 | Start 25 min at 0; complete at 1,500,000 | Completed, focus 1500 s, pause 0, remaining 0 |
| CR-T02 | Start 25 min at 0; Complete at 60,000 | Rejected, still active, no terminal record/credit; Cancel available |
| CR-T03 | Pause 300,000; resume 420,000; project 1,320,000 | Focus 1200 s, pause 120 s, remaining 300 s |
| CR-T04 | Cancel at 60,000; project at 120,000 | Cancelled projection stays focus 60 s, remaining 1440 s |
| CR-T05 | Pause exactly at epoch 0; project 60,000 | Focus 0 s, pause 60 s, remaining 1500 s |
| CR-T06 | Attempt start with duration 0 | Validated rejection, no session created |
| CR-T07 | Complete at 1,500,000; complete again then cancel later | Same terminal ID, timestamps and totals; no transition |
| CR-T08 | Loaded active record has invalid startedAt | Explicit validation/recovery failure, never successful NaN projection |
| CR-T09 | Pause/resume with multiple 250 ms pause spans under V2 | Exact accumulated milliseconds; no pause lost through per-span rounding |
| CR-T10 | App opens while active-record read is pending/fails | No newly started timer, no false empty state, visible retry |
| CR-T11 | Fail each terminal transaction statement | No partial history/outbox/pointer commit or success UI |
| CR-T12 | Kill after commit before route update; retry same command | One durable terminal record and same intent time |
| CR-T13 | Two writers finalize/cancel/start | First committed valid terminal wins; old command cannot clear new active pointer |
| CR-T14 | Storage-full pause/cancel; later retry | Honest pending/loss limitation; same intent on in-process retry; safe exit remains |
| CR-T15 | Task renamed/archived; summary deep link has fake totals | Stable historic task label/link; summary uses owned persisted ID only |
| CR-T16 | Account changes during hydration/write/outbox retry | No foreign UI flash, ownership claim or token/queue crossover |
| CR-T17 | Migration interrupted/conflicting IDs/old seconds retried | Original preserved; deterministic mapping; one conversion/import; conflicts explicit |
| CR-T18 | Restart late or clock rollback; optional break skipped | Apply approved cutoff/clock review; no fabricated focus/break/task completion |
| CR-T19 | Goal interval [2026-09-14T00:00:00Z, 2026-09-21T00:00:00Z) | Eligible event at start included, event at end excluded; no cancelled/foreign/duplicate credit |
| CR-T20 | Server committed sync event but reply lost | One verified event/reward; local result survives network failure; resources excluded |

CR-T19 does not decide whether all goal types bucket by start/completion or
split intervals. Freeze each metric's unit, event timestamp, timezone, eligibility
and edit policy first. The current Goal type must gain an explicit bounded
period before claiming this test passes; a type-only field with unchanged query
logic is insufficient.

## 9. Bounded Luna subcards

All cards remain DRAFT until their listed dependencies and the
[playbook READY gate](07-LUNA-IMPLEMENTATION-PLAYBOOK.md) are met. Read-only
CR-01 diagnosis is in scope now; future code changes are not authorised here.

| ID | Outcome / allowed boundary | Dependencies and verification |
| --- | --- | --- |
| CR-01 | Reproduce baseline using docs diagnostic + existing engine read only | No app writes; CR-T01–08; capture source hash and separate failures from harness errors |
| CR-02 | Pure validation/transitions/projection; existing engine/types and approved tests only | L-02, approved result/precision/cutoff contract; CR-T01–09; no reward/provider/UI redesign |
| CR-03 | Versioned owner-scoped local SQLite repository + all-or-nothing retained-source JSON migration | ADR-012 and owner decisions in 01; CR-T11–14/16/17; SQLite failure/restart/duplicate tests, then independent review and native crash/lock/full-disk evidence |
| CR-04 | Hydration-safe controller and durable-ID summary; focus hook/session/recovery/summary/break boundaries | CR-02/03, auth foundation, approved rest route; CR-T10–18; component + real-device tests |
| CR-05 | Stable task identity and bounded goal calculation; task/goal types/storage/progress/tests | CR-03/04; goal event/period policy approved 2026-10-06; stable task-link migration and CR-T15/17/19; no XP formula inventions |
| CR-06 | Trusted event/reward synchronization; approved backend/local-outbox boundaries | Exact RLS/API/schema/runtime/overlap rules; CR-T16/20, two-user/two-device negative checks |

For every implementation card: add failing fixtures first, implement its minimal
boundary, run the approved test command plus type/lint, examine diff and perform
the listed device/integration checks. Leave a card unverified when a required
check cannot run. Do not change package scripts or declare production RLS from
local SQLite tests. The October 6 owner explicitly authorized the selected Expo
SQLite package/schema for the synthetic local migration slice; actual app cutover
remains HIGH and REVIEW_PENDING until independent review and native evidence.

### Reproducible current-source diagnostic

[inspect-core-baseline.mjs](inspect-core-baseline.mjs) uses the already installed
TypeScript compiler to transpile only the inspected pure engine in memory. It
does not write compiled output, change the app, install dependencies, open user
storage, call providers or mount React. Assertions use synthetic data and the
current function signatures; adapt this diagnostic explicitly if a future
approved signature changes. It is not the future application test harness.

```powershell
node docs/revision/inspect-core-baseline.mjs
node --check docs/revision/inspect-core-baseline.mjs
node docs/revision/check-docs.mjs
git diff --check
```

Exit 0: listed checks pass only. Exit 1: contract gaps reproduced. Exit 2:
diagnostic could not execute reliably (missing compiler/source, incompatible
runtime or harness error). Do not count an execution error as a product finding.
Record actual results in [audit](09-COVERAGE-AND-AUDIT.md); source hash ties a
result to inspected code, not to a claimed clean Git commit. Device persistence,
React lifecycle, migration, backend, goals and security remain separate checks.

## 10. Remaining decisions for this slice

- Adopt/adjust proposed discriminated results, V2 milliseconds and effective-end
  versus recorded-time semantics; reconcile seconds examples before migration.
- ADR-012: native transactional/secure storage and supported test tooling;
  browser adapter is not automatically the same as native SQLite.
- Exact focus/custom-duration limits and invalid/legacy-data handling; not a
  license to choose product limits during implementation.
- Auth/legacy-owner handling, retention/cleanup, clock tolerance, offline overlap
  verification and goal/reward attribution rules.
- Pause-rest route/controller discrimination and expanded navigation migration.

These are bounded decisions, not reasons to re-open Supabase/Next.js selection,
remove January Website/Portal or build a lesson-content platform. No card here
requires cloud resource uploads to make the core focus workflow useful.

## 11. Foundation handoff refresh — September 28

### Task brief CR-01B (documentation and read-only diagnosis)

- Outcome: map each reproduced engine gap to its caller impact, regression oracle
  and prerequisite, so the next implementation task cannot mistake an engine-only
  patch for a repaired focus workflow. Refines L-01/02 and CR-02/04, not new scope.
- Authority: owner continuation of documentation work; canonical V1 scope §§4–5,
  data model §6 and existing core invariants. No new result type, unit migration,
  focus limit, emergency interaction or test dependency is approved here.
- Risk: MEDIUM for this reversible diagnostic/handoff annotation; it changes no
  runtime or normative security/persistence rule. Surrounding CR-03/04 ownership,
  migration and durable lifecycle design remains HIGH and requires independent
  review before acceptance/integration. This annotation receives author self-review.
- Read: complete AI rules/execution/DoD/guardrails/map/task template; this file
  §§1–3/8–10, playbook §§1–5/8, readiness §§1/3–5; canonical scope §§4–5,
  data model §6, architecture §9.1–8, testing §4.1; revision 03 §5 and 04 §§5–7;
  implementation-plan introduction and foundation-first order.
- Inspect: package scripts, Git dirty state, engine/types/hook/storage/session
  route, diagnostic source and all `src` engine/projection callers. HEAD a6a481e
  is not a clean-worktree claim. Preserve existing Home/theme and all other edits.
- Allowed files: this file; revision 07-LUNA-IMPLEMENTATION-PLAYBOOK.md,
  18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md, 09-COVERAGE-AND-AUDIT.md;
  docs/CHANGELOG.md. No new file is needed.
- Acceptance: all five actual gaps have expected/actual evidence and a scoped
  next boundary; passing cases remain regression obligations; dependencies and
  unrun caller/native tests are explicit; documentation checks remain passing.
- Verification: existing read-only baseline diagnostic, check-docs and
  git diff --check; semantic review of all five edited sections. No real user
  storage, component mount, native test, provider call or installed harness.
- Non-goals/recovery: no code/config/package edits, file cleanup, migration,
  accounts, spending, agents or deploy. Revert only this annotation if incorrect;
  never repair the baseline by changing assertions to accept defective behavior.

### A. Reproduced evidence, not a new regression

Installed Node v24.19.0 + TypeScript 6.0.3 ran the existing diagnostic at
`2026-09-27T20:04:00.655Z` (September 28 in Asia/Colombo). Exit **1** means the
expected contract gaps were reproduced, not that the diagnostic failed to run.
Engine SHA-256:
`44c029a482e1a452acc633577dacac4a59b6a01df373cfa8eb1654716c1c78a4`.

| Gap / existing case | Observed result | Required regression oracle | Smallest next boundary after approval |
| --- | --- | --- | --- |
| Early finish — CR-T02 | 25-minute session completed at 60,000 ms returns `completed` | Still active/rejected; no terminal save or completion credit; cancellation remains possible | Engine threshold + hook rejection handling + session-route feedback; removing only the button is insufficient |
| Terminal display — CR-T04 | Cancel at 60,000 ms, project at 120,000 ms gives 120 focused seconds | Frozen 60 focused, 0 paused, 1440 remaining seconds; later render does not mutate the record | Terminal branch of projection; preserve valid stored partial totals, not a rewrite to full duration |
| Zero-epoch pause — CR-T05 | Pause at timestamp 0, project at 60,000 ms gives 60 focused seconds | 0 focused, 60 paused, 1500 remaining; timestamp zero is present, not absent | Parsed timestamp presence/validity check; preserve the ordinary pause/resume case |
| Invalid start — CR-T06 | Duration 0 creates a session instead of validated rejection | No session created, safe validation outcome, no persisted active record | Creation validation + hook initializer/setup caller; route fallback/minimum alone cannot enforce the engine invariant |
| Corrupt timing — CR-T08 | Invalid `startedAt` returns a projection rather than a validation outcome | Explicit invalid-record/recovery result; no successful NaN display/progress or fabricated replacement | Projection validation + every caller's failure branch; storage validation/recovery remains separately required |

CR-T01 (full duration), CR-T03 (pause/resume arithmetic), CR-T07 (terminal command
immutability) pass on this source and must stay in the regression set. CR-T07
does not prove CR-T04: an unchanged terminal record can still be projected
incorrectly. Three passing checks out of eight is **not an app completion or
quality percentage**. No other CR-T cases were executed in this refresh.

### B. Caller contract checklist before CR-02 implementation

The source search finds one app hook consuming the engine, and one session route
consuming that hook. Search again at implementation time; this is a dated inventory.

1. Engine functions currently return bare FocusSession/SessionProjection types
   defined in `session-types.ts`;
   `use-focus-session.ts`'s updater expects every transition to return FocusSession.
   If §3's discriminated results are approved, change the caller in the same
   coherent slice. Never store `{ ok: false, ... }` as the current session or
   silence a type mismatch with a cast. Specify how setup receives a rejected
   create result rather than throwing from an unhandled state initializer.
2. The hook projects on render and automatically calls complete when remaining
   time is zero. Validation failure must not look like zero remaining, enter a
   completion loop or erase the recoverable record. Error state is separate
   from domain status; exact presentation must be reconciled before coding.
3. The route exposes Complete Session while active/paused and persists whenever
   state becomes terminal. A rejected request must leave it nonterminal and
   must not navigate to summary. Use an interaction test with storage/navigation
   spies to show neither call occurred; the pure diagnostic cannot prove this.
4. The current route clears active storage before appending history, and storage
   suppresses errors. These remain CR-03/04 defects after any arithmetic fix.
   Reversing two awaits alone is not the transactional solution in §§5–6.
5. Hydration currently starts with a new in-memory session; active controls and
   the automatic completion effect are not gated by hydration. Test delayed and
   failed load separately under CR-04. Do not fold an unreviewed storage/controller
   rewrite into a small pure-engine repair to claim end-to-end correctness.

Caller tests above are **NOT_RUN** and refine CR-T02/06/08/10–14, not additional
passing evidence. Invalid persisted data handling and legacy terminal records
must follow §§6–7; do not delete history or invent a current-account owner.

### C. Smallest dependency-safe next task

The [L-02A/L-02B harness proposal](38-TEST-HARNESS-ADMISSION-PLAN.md) now records
the first two-file boundary, proposed commands, eight acceptance cases and
separate component compatibility gates. It retains the five failures; no test
files/packages or engine fixes have been added by that documentation.

Use **L-02's bounded test-harness proposal** for the next adoption decision, not
another feature module or an automatic install. Preserve its exact local commands,
files and version evidence, separate pure-domain from React/native/integration
tests, and resolve any required install authority. Existing in-memory transpilation is a diagnostic,
not proof of TypeScript type safety or a production test runner.

The first harness acceptance must demonstrate that these five failures remain
visible against unchanged source, that the three positive cases pass, that a
deliberately wrong fixture in a disposable test produces a failing exit, and
that unsupported imports/harness errors are distinguished from product failures.
Do not commit a permanent intentionally broken test just to demonstrate that check.
Use synthetic data and explicit timestamps; no real waiting or user-file reads.

Then resolve CR-02's exact return-shape/precision/cutoff scope and caller changes
before its READY gate. A narrowly approved compatibility-preserving repair may
avoid a V2 migration, but no such alternative is silently approved here. Storage,
identity and device proofs retain their dependency order. Viewer RV-03 remains
on its separate review HOLD and does not block this documentation preparation.

## 12. Engine/caller decision packet — CR-02F

මෙහි අරමුණ තවම open වී ඇති timing/return-value තීරණ එක තැනකට ගෙන ඒමයි.
පහත recommendations අනුමත implementation contract එකක් නොවේ. Lunaට ඒවා
නිහඬව තෝරාගෙන migration හෝ app rewrite එකක් කරන්න අවසර නැහැ.

### Task brief

- Outcome: one coherent proposed engine/caller boundary with explicit decisions,
  acceptance oracles and the affected reconciliation paths. Refines CR-02/04;
  no new product feature or claim that existing five bugs are fixed.
- Authority: documentation continuation; baseline DF-027/028 and existing
  full-duration, cancellation, precision and recovery proposals in §§3–7.
- Risk: HIGH because adopting timing/cutoff rules changes persisted history and
  downstream attribution. Draft/self-review only; independent qualified review
  remains required before acceptance/integration. No extra reviewer dispatched.
- Read: mandatory rules/map/guardrails/template; §§3–4/8/11, revision 20 §§1–3,
  V1 scope §4, data model §6 timing/recovery/validation, implementation-plan
  foundation boundary and ADR-012. Inspected current session types/hook and setup
  presets/range; current engine/caller baseline from §11 remains unfixed.
- Allowed writes: this file, revision 07-LUNA-IMPLEMENTATION-PLAYBOOK.md,
  18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md, 09-COVERAGE-AND-AUDIT.md,
  docs/CHANGELOG.md. No source/config/schema/provider or approval-register edits.
- Acceptance: numeric examples are internally consistent; runtime results,
  stored data and UI failures are distinguished; every remaining gate has an
  affected boundary and recommendation, not an invented approval.
- Verification: document checks, read-only arithmetic assertions and semantic
  self-review. Device/engine/migration implementation tests NOT_RUN for this draft.
- Non-goals/STOP: no migration, new limits, reward formula, clock tolerance,
  session-owner policy or emergency interaction approval. Preserve real history.
  A material conflict stops the affected implementation, not safe documentation.

### A. One proposed choice per unresolved boundary

This table narrows the choices for review. It does not duplicate the approval
register or change the canonical second-based model by itself.

| Decision | Recommended contract | Evidence/reconciliation required before adoption |
| --- | --- | --- |
| CF-01 — results | Adopt §3's explicit success/rejection for create/transitions, plus the distinct projection result below. Expected invalid input is a value, not an unhandled render exception | Update engine/types and every hook/route caller together; establish component tests under 38; reconcile data/model error contracts |
| CF-02 — precision | Use §4's integer-ms V2 for new-domain timing; keep explicit versioned seconds/display adapters | Reconcile 20 §3, canonical DATA_MODEL and actual local/wire schema; CR-03 migration approval, source preservation and rollback/forward-recovery evidence |
| CF-03 — duration policy | Preserve the inspected setup baseline: initial 25, presets 25/45/60, custom integer 5–180 minutes; validate once at the command boundary | Product approval of the shared policy and API/UI alignment. This remains a recommendation from 20, not permission to enforce new limits on legacy records |
| CF-04 — threshold | Only eligible focused time reaches the target; paused time never helps. Paused-at-target completion also needs validated effective-end evidence; otherwise require recovery rather than guess a timestamp | Resolve exact endpoint/provenance semantics with §4; reject early requests without a terminal state, save, reward or summary route |
| CF-05 — late callback | Use §4's effective completion end plus a separate processing time; never credit the callback delay | Freeze field mapping and downstream goal/day attribution separately; no silent timezone/XP changes or claim that clock validity is established |
| CF-06 — competing terminal commands | Existing first valid durable terminal winner remains immutable; retry the same frozen intent identity/time | CR-03/04 transaction/version tests; engine-only return immutability cannot prove this |
| CF-07 — invalid clock/record | Separate unavailable projection/recovery from zero progress or empty state; retain evidence and safe exit | Exact controller/repository error paths and platform clock review; positive-jump tolerance and restart evidence remain open, not guessed constants |

If an interim seconds-compatible fix is preferred, it needs a separately scoped
approval and its own precision limitations; do not mix that route with CF-02
inside one unversioned record. A domain-only repair must not quietly claim V2
precision or migrate old history. This packet recommends the final V2 direction,
not an instruction to skip CR-03 storage/identity foundations.

### B. Projection is not a transition or a save result

Proposed in-process return shape; not an API/SQL schema:

```ts
type ProjectionResult<TProjection> =
  | { ok: true; projection: TProjection }
  | { ok: false; code: 'INVALID_INPUT' | 'INVALID_RECORD' | 'CLOCK_UNCERTAIN' };

type TimingProjectionV2 = {
  focusMs: number;
  pauseMs: number;
  remainingMs: number;
  progress: number;
};

type V2ProjectionResult = ProjectionResult<TimingProjectionV2>;
```

For V2, successful values use §4's exact integer milliseconds; progress is the
bounded ratio focusMs/plannedMs after positive-duration validation. Current
SessionProjection remains a separate legacy/display shape, not an alias for
TimingProjectionV2. An explicit display adapter applies §4's floor/ceiling rules.
Do not assign millisecond values to current `*Seconds` fields. These proposed
types do not constitute a persisted-record schema or runtime input validator.

- Create/transition success returns a candidate session; it is not durable until
  the repository confirms commit. A duplicate terminal command returns the same
  valid terminal record with `changed: false`; do not rewrite its timestamps.
- Projection reads validated state without mutation, identity generation, writes,
  navigation or network. A valid terminal projection uses frozen totals and does
  not need the current time. Inconsistent terminal data gets a recovery outcome,
  not a recomputation that changes the recorded history.
- A live projection validates `now` and ordering under the selected timing
  contract. Invalid command input is INVALID_INPUT; malformed persisted data is
  INVALID_RECORD; known contradictory time evidence is CLOCK_UNCERTAIN. Mere
  absence of a known contradiction does not prove a trustworthy wall clock.
- Neither a projection failure nor a load failure becomes `{ remaining: 0 }`.
  The automatic completion effect must require a successful eligible projection
  of a ready, validated active session and no unresolved terminal command.
- The controller retains the last valid/durable state separately from pending
  candidates and errors. Render a recovery/error state instead of NaN or fake
  success. Do not save an error union or private raw record into a route parameter.
- Rejected manual Complete leaves domain state unchanged, displays the reason
  accessibly and makes no terminal storage/navigation call. Ordinary exit follows
  the approved mode; the separate Emergency exit remains available. Even if
  clock/storage is uncertain, leaving the focus UI must not require manufacturing
  a completed record. Pending/recovery and possible unsaved work remain explicit.

### C. Numeric oracles for the proposed contract

All times below are synthetic milliseconds; values are specification arithmetic,
not observations of a fixed app. They refine existing CR-T09/18 and caller cases.

| Fixture | Inputs / event | Expected result after the proposed contract is admitted |
| --- | --- | --- |
| CF-X01 — short pauses | 25-minute plan, four separate 250 ms paused spans, total elapsed 1,500,250 ms | Paused 1,000 ms; focus 1,499,250 ms; remaining 750 ms; display focus 1499 s / remaining 1 s, not completed |
| CF-X02 — target edge | Same paused spans; total elapsed 1,501,000 ms | Focus exactly 1,500,000 ms, remaining 0; one completion candidate eligible |
| CF-X03 — late callback | Start 0; paused interval [300,000, 420,000); completion processed at 1,800,000 | Effective end 1,620,000; recorded time 1,800,000; focused 1,500,000, paused 120,000; no 180,000 ms bonus |
| CF-X04 — paused below target | Settled focus 1,499,999 ms, open pause grows | Complete rejected regardless of pause length; 1 ms remains, displayed as 1 s |
| CF-X05 — paused at target | Settled focus 1,500,000 ms when pause begins; Complete requested later | Full focused amount alone cannot reconstruct when target was reached. Use validated effective-end evidence if retained; otherwise explicit recovery, no invented timestamp or post-end pause accounting |
| CF-X06 — invalid observation | Live timestamp precedes its valid segment anchor or contains NaN | No successful projection or auto-complete; appropriate typed error; no destructive recovery |
| CF-X07 — malformed history | Terminal record has conflicting completed/cancelled fields or invalid totals | Preserve source for recovery/legacy handling; no success projection, automatic repair or new reward |
| CF-X08 — rejected caller action | Valid active state below target; user requests Complete | Same domain state; zero terminal-save/summary-navigation calls; accessible feedback; permitted exit remains |

CF-X01–04 arithmetic can be checked without waiting. Their actual V2 engine and
caller behavior, and CF-X06–08 error/recovery behavior, remain NOT_RUN. Production
duration limits must not be inferred from these synthetic millisecond-edge cases.

CF-X05 exposes a gap in the original minimal TimingV2 snapshot: once active
timing is settled into a paused snapshot, the previous segment's target instant
cannot always be reconstructed. The proposed `completionCutoff` extension in §4
closes the *specification* gap as follows; implementation and review are pending:

1. A transition/recovery evaluator, before overwriting an active segment, checks
   whether its validated focus has reached the planned duration. When eligible,
   capture `reachedAtMs = segmentStartedAtMs + plannedMs - settledFocusMs` and
   `pausedMs = settledPauseMs` from the pre-transition state. If a valid cutoff
   already exists, reuse it; never recalculate it from a later segment. Pure
   rendering can derive eligibility but does not persist or mutate the snapshot.
   Without an existing cutoff, the anchor must identify the segment containing
   the first crossing. An already-full resumed/partial snapshot with missing
   provenance requires recovery; eligibility alone does not justify this formula.
2. Capture the cutoff with the transition's other state changes in the same
   approved durable transaction. A failed/unknown save keeps normal recovery
   semantics; no detached write or success acknowledgement. An active record
   recovered before this transition still has its original anchor for evaluation.
3. Later pause/resume cannot change the cutoff. A valid Complete uses its
   reachedAtMs as effective end, its pausedMs as pre-completion pause total,
   plannedMs as focus total and the frozen command-processing time as recorded
   time. Post-target waiting/rest is not appended to this completed focus record.
4. Validate safe integers, finite timestamps, reachedAtMs within the session's
   valid chronology, nonnegative pausedMs no greater than accumulated pause and
   a full target for records carrying a cutoff. A cutoff is local timing evidence,
   not proof of attention or immunity to clock manipulation. Apply the existing
   clock-uncertainty/server-verification gates; do not certify client values.
5. A legacy/partial paused-at-target record with no reconstructible cutoff gets
   recovery, not `reachedAtMs = pauseStartedAt`. No automatic backfill from current
   time. This path preserves the source and does not grant new XP.
6. A valid Cancel still competes under CF-06: it uses cancellation intent time
   and actual capped partial totals, not the completion cutoff as a forced
   completion. An existing committed terminal outcome remains unchanged.

Concrete extension of CF-X05: a 25-minute active session started at 0 pauses at
1,600,000. The transition captures cutoff `{ reachedAtMs: 1500000, pausedMs: 0 }`.
If completion is processed at 1,700,000, it ends effectively at 1,500,000 with
1,500,000 focus and 0 pause; neither the late pause nor later callback adds time.
If resumed before the completion command, the same cutoff must survive. A
process death before/after the transition commit must recover respectively the
original active anchor or the complete paused snapshot, never half a cutoff.

This extension has no exact admitted local/wire schema yet. CF-02/04/05 review
must reconcile its version/serialization and transaction together; no field is
to be added to existing seconds JSON by a pure-engine bug fix. CF-X05's actual
provenance/recovery behavior remains NOT_RUN.

### D. Review and reconciliation order

1. Freeze CF-01/02/04/05 with technical review and explicit adoption record;
   confirm CF-03's shared product policy without re-asking approved stack choices.
2. Reconcile canonical data/architecture/API descriptions only for the adopted
   representation. Map every old/new unit and timestamp; preserve historical
   examples as labelled legacy, not concurrent normative formats.
3. Admit the exact test slice from 38 and add failing domain/caller fixtures.
   A small pure harness does not satisfy component, storage or native gates.
4. Implement in the existing foundation order: validated domain; owned repository
   and migration; hydration/terminal controller; verified summaries and attribution.
   Split exact allowed paths per task and preserve dirty Home/theme edits.

No decision in this packet is OWNER_ACCEPTED. CF-06/07, persistence, recovery
and downstream attribution need the related HIGH reviews/tests; this document
does not release the engine, storage or controller implementation gates.

### E. Review submission and canonical reconciliation sheet — CR-02R

Task brief, September 28: prepare the seven choices for a bounded independent
review and later owner adoption; the owner's request authorizes this documentation
work, not acceptance of CF-01–07 or a test/code install. HIGH because the proposal
affects persisted time and recovery. Current state: REVIEW_PENDING. Work alone;
no reviewer has been dispatched and author self-review is not independent review.

Read: AI rules/execution/DoD/guardrails/map/task template in full; this document
§§2–8/11–12, 20 §§1–3, DATA_MODEL §6, V1 scope §4, architecture §9 lifecycle,
API §10 version boundary, testing §4.1, implementation-plan foundation boundary,
07 §§1–5, 38 §3 and ADR-012. Re-inspected engine/types/hook/storage and the
setup/session routes, package scripts and dirty state at HEAD a6a481e. Existing
Home/theme edits and all unrelated documentation remain user-owned.

Allowed files: this document, revision 07-LUNA-IMPLEMENTATION-PLAYBOOK.md,
18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md, 09-COVERAGE-AND-AUDIT.md and
docs/CHANGELOG.md. No new file, schema, source, approval-register or provider edit.
Acceptance: CR-R01 all seven choices mapped to a precise review question and
reconciliation destination; CR-R02 cutoff precedence/context ambiguities addressed
in the draft with a numeric counterexample; CR-R03 next-task and approval gates
remain explicit; CR-R04 document links/structure and scoped whitespace checks pass.
Verification: existing docs checker, read-only arithmetic/inventory checks and
author semantic review. Runtime/migration/device checks NOT_RUN. Recovery is a
documentation correction; no real session is changed or migrated. Stop any
attempt to turn this packet into approved production policy without its gates.

#### Author findings, not independent sign-off

1. **Cutoff precedence:** the older §4 formula could be read as recalculating
   completion from the latest active segment, contradicting §12.C's preserved
   cutoff. §4 now explicitly reuses the validated original cutoff. Counterexample:
   start 0, target 1,500,000; pause 1,600,000, resume 1,650,000, Complete 1,700,000.
   Settled focus is already 1,500,000; applying the formula to the resumed anchor
   would incorrectly produce 1,650,000. Expected retained end is 1,500,000,
   completed pause total 0 and processing time 1,700,000. Refines CF-X05, not a
   ninth fixture or an executed engine test. With missing provenance, recover.
2. **Incomplete validation context:** TimingV2 lacks the original start/identity
   fields needed to validate a cutoff's chronology and association. §4 now calls
   it a fragment and requires the enclosing admitted record. The exact envelope
   and cross-field validator remain open; the example type is not a migration.
3. **Two pause meanings:** §4's live paused projection includes waiting up to the
   observation time; a completed record uses only the pre-cutoff pause total
   retained in §12.C. Never persist the live projected pause blindly as completed
   history. A future controller test must check this distinction after resume,
   failed save and recovery. Cancellation retains its separate CF-06 rule.

#### Decision-specific review questions and affected contracts

Each row is PENDING. The destination column is a future change map, **not an
instruction to rewrite canonical files now**. Exact SQL/wire work requires its
own scoped inventory; a local TimingV2 choice does not approve an API version.

| Choice | Question the reviewer must answer with evidence | Reconcile after accepted disposition |
| --- | --- | --- |
| CF-01 | Can every create/transition/projection rejection reach the caller without a thrown render error, persisted error union or summary navigation? Specify error precedence when both record and observation are invalid | DATA_MODEL §6 validation; ARCHITECTURE §9 command/controller boundary; this §3/12.B; 07 L-03A and actual engine/types/hook/session callers |
| CF-02 | Is one safe-integer, versioned unit conversion sufficient for every supported legacy shape, with no repeated multiplication or fabricated subsecond precision? Identify unknown-version and active-record recovery treatment | DATA_MODEL §6 timing; 20 §3; this §§4/7; DATABASE_SCHEMA FocusSession and API_SPEC §10/version boundary under separate schema/wire scope |
| CF-03 | Does the owner retain initial 25, presets 25/45/60, integer custom 5–180 for new sessions? Show how valid user settings and historical out-of-policy records are preserved | 20 §2 freeze sheet; V1 scope §4; shared setup/domain/API duration policy; no retroactive history clamp |
| CF-04 | Does target eligibility exclude pauses, distinguish full-focus from valid cutoff provenance and reject one-ms-early completion without trapping permitted exit? | This §§3/4/12.C; DATA_MODEL §6 recovery/validation; V1 scope §4; 07 L-03A/B and CR-T02/09/18 |
| CF-05 | Is original target time retained through pause/resume, late callback and restart, with effective end distinct from processing/commit/receipt times? Identify each downstream field mapping still unresolved | This §§4/5/12.C; DATA_MODEL §6 timestamp semantics; API_SPEC §10; 20 §§3/5 before goal/day attribution, not a silent XP/timezone change |
| CF-06 | Can duplicate/lost-response and competing Complete/Cancel/Start commands preserve one valid durable winner and the newer active pointer? Show failed/unknown-commit handling, not just pure-function immutability | This §§5–7; ARCHITECTURE §9 persistence/recovery; 07 L-04/L-06; exact future repository transaction/version tests |
| CF-07 | Are malformed record, invalid command time, contradictory clock, missing record and failed load distinguishable without deleting evidence or awarding credit? Which platform clock claims remain unproven? | This §§2/4/6/12.B; DATA_MODEL §6 recovery; 07 L-06 and CR-T08/10/14/18; safety exit contract remains separately authoritative |

**Owner versus technical responsibility:** the owner chooses the new-session
duration policy in CF-03 and accepts the recorded scope/tradeoffs after review.
A qualified technical reviewer examines CF-01/02/04–07 and CF-03 enforcement.
Do not ask the owner to certify transaction correctness or invent clock tolerance.
Do not re-ask already selected SQLite/SecureStore or the retained Emergency exit.

#### Bounded review request (owner can arrange later; not sent)

Review this document §§2–8 and §12, together with the canonical destinations
above, 20's units and 38's harness boundary. Inspect current source and the exact
authored changes; do not assume drafts describe implemented behavior. Challenge
the seven choices using CF-X01–08 and CR-T01–20 where relevant. Return findings,
not code, installs, migrations or approval-register edits. No additional agents,
remote upload, account access, spending or production action is authorized.

The review response must identify reviewer/role and date, reviewed file hashes
or exact diff snapshot (HEAD alone cannot identify these dirty/untracked docs),
and one disposition per CF choice: recommend / changes required / unresolved.
For each finding give severity, section, counterexample, requested correction and
evidence needed to close it. List actual checks separately from proposed tests.
State residual risks and distinguish design review from runtime/security proof.
There is no completed review response or owner acceptance recorded here.

After review: resolve findings in the same packet, capture exact owner adoption,
then reconcile only accepted representations in the mapped canonical sections.
Do not mark a whole ADR approved when only a subdecision is accepted. Canonical
reconciliation is followed by task-specific harness/implementation admission, not
an automatic schema migration. A separately authorized L-02A baseline-only harness
can precede V2 adoption because it tests existing invariants without introducing
these new fields; it cannot prove the proposed V2 behavior or resolve HIGH review.

## Sources

Technical platform observations were verified 2026-09-14. Product contracts and
failure policies above are design proposals derived from the project requirements,
not behaviours guaranteed by these vendors.

[^1]: Meta, [AppState — React Native 0.85](https://reactnative.dev/docs/0.85/appstate), version-specific reference, accessed 2026-09-14. Foreground/background and Android blur semantics.
[^2]: React, [useState](https://react.dev/reference/react/useState), current reference, accessed 2026-09-14. Strict Mode initializer/updater purity.
[^3]: Expo, [SQLite — SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/), accessed 2026-09-14. Transaction scope/handle, lock/web limitations and compatible-version recommendation; no installation performed.
[^4]: PostgreSQL Global Development Group, [Transactions — PostgreSQL 18](https://www.postgresql.org/docs/18/tutorial-transactions.html), accessed 2026-09-14 through the current-version reference. Atomic database transactions, not a cross-device guarantee.
