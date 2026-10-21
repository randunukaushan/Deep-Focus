# Daily plan and generation wire contract

2026-09-19. **DRAFT / HIGH / REVIEW_PENDING.** DF-037 and AG-02/03 document
preparation only. Required Plan My Day is not being downgraded to task edits;
conditional task breakdown/review remain disabled until their own contracts and
admission gates close. No app, provider, database or production changes.

සිංහල: මේ plan එක කරන්න බලාපොරොත්තු වන වැඩ පිළිවෙළයි. Save කිරීමෙන් session
එකක් complete වෙන්නේවත් XP ලැබෙන්නේවත් නැහැ. User review කර confirm කළ දේ
පමණක් save වෙනවා. වේලාවක් මඟහැරුණොත් වෙනත් වැඩ නිහඬව එහා මෙහා කරන්නේ නැහැ.

## 1. Task boundary

- Read: root/AI rules, execution/DoD/guardrails/task brief/map; V1 scope §§11–13,
  implementation-plan introduction/Phase 7, API §28, security §23, data model §19,
  database §25, testing §13; revision 20 units, 22 exact apply and 23 lifecycle.
- Inspected current package and `src/app/plan-my-day.tsx`: local selected tasks,
  fixed 25/5 minute preview, no trusted generation, saved itinerary or atomic apply.
- Approved direction: solo documentation, existing stack, optional free/paid AI,
  core independent of AI. Detailed persistence/wire design below is proposed,
  not an owner-approved database migration or release scope expansion.
- Allowed files: this contract, planning schema/OpenAPI/checker; reward schema
  versioned command support, shared error enum and affected existing checkers;
  canonical API/security/data/database/testing/changelog and routing/audit notes.
- Exclude app/dependency/provider edits, real data, installs, agents, commits,
  migrations and deployment. Preserve prior dirty files including `artifacts/`.
- DP-A01: ordered time model and truthful plan/actual separation; DP-A02: strict
  generation/status/cancel/revision/plan-read wire and versioned confirmation;
  DP-A03: positive/negative schema and semantic fixtures; DP-A04: compatibility,
  policy/implementation limits and cross-document routing remain explicit.
- Rollback is limited to this draft's reviewed hunks. HIGH independent qualified
  review is pending before acceptance/integration; author checks are not that review.

Artifacts: [DTOs](contracts/planning.schema.json),
[five-operation OpenAPI slice](contracts/planning.openapi.json),
[read-only checker](check-planning-contracts.mjs). The new checker counts all five
OpenAPI slices: **52 unique operations**, including the previous 47. Older bounded
four-file checkers still report 47 for their named subset, not the total package.

## 2. Time and ordered-block model

`PlanCreate = {id, workspaceId, localDate, timeZone, availableStart, availableEnd,
explanation, blocks}`. All fields explicit; no hidden defaults. Workspace/IDs
are assigned/validated by the trusted service. `localDate` is the start instant's
calendar date in `timeZone`, not the device's current date. Personal plans only.

An ordered block is one of:

- Focus: `{id, kind:focus, taskId, startsAt, endsAt, reminderId}`. An existing
  owned captured task, not arbitrary model-created work; reminderId is explicit
  null or an ordinary reminder being created by this same reviewed proposal.
- Break: `{id, kind:break, afterBlockId, startsAt, endsAt}`. Refers to the
  immediately preceding focus block, starts at its end, and has positive duration.
  No task, reward, completion flag or fabricated recovery-session record.

Use canonical UTC instants with millisecond precision on this new wire:
`YYYY-MM-DDTHH:mm:ss.sssZ`; validate actual calendar/time values, not regex alone.
Keep the IANA zone separately. Blocks are half-open intervals `[start,end)`:
positive duration, inside the availability window, ascending and non-overlapping.
Adjacent intervals may meet; gaps are unallocated time, not credited focus/rest.
Require at least one focus block, unique block IDs, and no orphan/consecutive
breaks. Repeated focus blocks for the same task are allowed; their IDs differ.

Draft engineering ceilings: 100 captured task IDs, 100 blocks, 25 proposal
operations, 64 KiB generation/revision body, availability span at most 48 elapsed
hours. These are validation proposals, not approved focus-duration defaults,
allowance quantities or promises of 48-hour work. Configured product bounds may
be stricter and must be approved before admission. A local day is not assumed
to be exactly 24 hours; a cross-midnight window remains a labelled single plan.

Preference `defaultFocusMinutes` is positive, `defaultBreakMinutes` nonnegative;
`reminderLeadMinutes:null` means no proposed reminders, otherwise nonnegative.
All are explicit integers, not strings. Multiply minutes by 60,000 exactly once
with checked safe-integer conversion at the boundary. Reject values outside
approved configured bounds instead of silently clamping them. A generated block
may be shorter than the preferred duration
to fit; show its actual proposed duration, never silently claim the default.
Zero break preference creates no zero-length break. Duration safety/configuration
and remainder behavior need approved policy/evaluation, not guessed clinical rules.

For ambiguous/nonexistent local times, the UI asks the user to resolve the wall
time before sending an instant. Do not guess the first repeated hour or silently
shift a nonexistent time. Travel/device-zone changes do not reinterpret stored
instants. Display the plan's zone and offer an explicit future edit, not a hidden
rewrite. Provider input and output must pass the same time/window checks.

## 3. Versioned proposal and atomic save

Contract version **1** retains 22's task.create/task.patch/reminder.create shapes.
Contract version **2** is the new Plan My Day subset: exactly one `plan.create`
operation, with optional preceding `reminder.create` operations. No task edits,
new child tasks, arbitrary settings, calendar API writes or rewards in v2.
Version 2 is rejected by clients/servers without that capability; never strip the
plan operation to make it look like a valid v1 result. No deployed client is upgraded
by these files. The proposal `version` counter is distinct from contractVersion.

`plan.create` uses PlanCreate as its payload and the plan ID as targetId. The
complete blocks/explanation/window are inside the existing RFC 8785 digest input
through `operations`; no separate unsigned schedule is rendered as authoritative.
The server pins every existing task version and resolves every reminder's task,
time and zone. Plan dependencies include **all** reminder-create operations whose
IDs appear in its blocks. Such operations must precede the plan operation. A
reminder ID may bind one focus block only, match its task and zone, and be no later
than its start. It must still be in the future when applied; stale time is an error,
not an automatically shifted notification. Normal reminder policy also applies.

Confirm still uses EX-32 `{expectedProposalVersion,reviewDigest,selectedOperationIds}`.
Selecting plan.create means saving **the entire exact displayed block list**.
Block-level exclusions happen by a reviewed manual revision first, not by silently
filtering payload during apply. Removing a block never deletes its real task.
Users can deselect the plan and select standalone reminders explicitly; the UI
must accurately label that result as reminders only, not a saved plan.

Optional reminders remain explicit: to save a plan without one, revise that block's
reminderId to null, then deselect the now-unreferenced reminder operation. Version-2
revision recalculates the plan's dependency list from the edited bindings and shows
the resulting exact operations before fresh review. It never automatically selects
new dependencies or discards a user's submitted selection. This is an explicit v2
refinement of 23's immutable-edge first-slice rule, not permission for arbitrary graphs.

Apply atomically creates selected reminders and the exact confirmed initial plan,
all corresponding owner change entries, the apply receipt and consumed-proposal
marker. Reuse normal domain authorization and one transaction; no nested commits,
AI calls or OS notification installation inside it. Return the plan's target ID/
version in the existing result list. No allowance debit on apply/revision. A failed
transaction leaves no partial plan/reminders. Receipt replay never saves another plan.

**Integration gate:** `plan` is not yet in the existing six-entity sync feed,
snapshot/export schemas or fourteen sync commands. Do not emit an unsupported
plan change to current clients. Before enabling v2, add/version and test plan
read/snapshot/pull/export/deletion and any admitted manual CRUD together with its
SQL/RPC migrations and client capability gate. This slice provides `GET /plans/{id}`
for exact owned receipt recovery, not a full plan-management/sync implementation.
Required manual tasks/focus still work without AI; no AI paywall for core features.

## 4. Editing and using a plan

Continuation: [25](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md) now proposes post-save
state, task/reminder deletion cascades and versioned replication/privacy rules.
That lifecycle draft did not itself change SavedPlan. The subsequent
[26](26-SAVED-PLAN-MANAGEMENT-WIRE.md) now refines SavedPlan/PG-05 into the current
active/archived plan plus its bound reminders, adds the required plan-contract
header and types manual management. PL-02 sync/export and implementation gates
remain. An exact initial save is not a perpetual immutable-content archive.

Manual revision body is `{expectedProposalVersion,reviewDigest,replacements}`;
each entry is `{operationId,payload}`. Payload is a full strict typed replacement,
not JSON Patch or user-chosen command/target. Unknown/duplicate IDs reject. Validate
against the stored operation kind, not merely any union member that parses.

For v1 preserve 23's identity/graph/input-version rules. For v2 preserve plan ID,
workspace, window/zone/date, generation identity, expiry, operation kinds/targets
and captured inputs. Allow explanation edits, reorder/retime/drop existing blocks,
switch a focus block only to another captured owned task, and clear/rebind to
an existing matching reminder operation. No newly invented block/operation IDs,
changed block kind, arbitrary new reference or silent stale-input rebase. At
least one focus block must remain. Change a linked reminder's full payload in
the same revision when its task/time changes; otherwise reject inconsistent
bindings. Dependency recalculation is limited to plan/reminder binding edges.

The revision receipt returns previousVersion, proposalVersion, new reviewDigest,
proposalId, mutationId and revisedAt. Effective edits increment exactly once;
no-op edits reject. Same key/same normalized intent replays the receipt even if
a newer revision exists, not old executable content. Fetch current proposal and
explicitly confirm. Normalize replacement order to stored operation order for
idempotency; changing array order alone is not new intent. Expiry is never extended.

After apply, `GET /plans/{id}` returns the current saved plan and bound reminders
under 26's read contract, not an original-version archive, live task titles or a
statement that work was completed. Missing/deleted task
references render unavailable and cannot be used to bypass current task access.
Before enabling v2, define/test detach/tombstone behavior; deletion may not leave
a privacy-erased task title copied inside a plan explanation. Retention/export/
deletion cover the plan and its text, not just proposal storage.
Privacy deletion/redaction overrides snapshot preservation; an immutable-plan
claim is never a reason to retain erased personal content. The exact tombstone/
redaction wire and cache invalidation are part of the activation gate, not done here.

Start is a separate explicit action using the normal focus setup/service. Recheck
current task state, active-session exclusivity, selected duration and policy.
Never auto-start at planned time or backdate an actual session to its planned start.
If late, show lateness and let the person choose; do not silently shorten, move
later blocks or complete missed work. The scheduled break is only a suggestion:
actual recovery follows actual session outcome and ordinary recovery controls.
Actual history is timestamp-derived; plans award no XP/streak/goal contribution.

26 now types post-save edit/archive/restore/delete commands; no editor is
implemented. Block-to-actual-session linking and list/history remain separate
contracts. Do not present pre-confirmation revision as a working post-save editor.
Offline cached reading never grants write authority;
persisting a receipt/cached plan is idempotent and account-partitioned. Lost apply
response recovers the original receipt, then plan by ID; no generation retry.

## 5. Five exact wire operations

All paths are under `/v1`, active UserBearer required, private/no-store on success
and errors. PG-05 additionally requires `Plan-Contract-Version: 2` and uses 26's
current-plan/bound-reminder response; other routes retain their existing headers.
No owner selector is accepted. All GETs have no body/query. POSTs reject unknown
fields/query keys and require UUID Idempotency-Key; generation key equals requestId.
Browser calls use the existing trusted Next.js boundary. Authorize before detailed
existence/status disclosure. Error shapes reuse the shared core envelope.

| ID | Operation | Request / success |
| --- | --- | --- |
| PG-01 | `POST /ai/plan-my-day` | PlanGenerationInput; 202 PendingResponse, terminal replay 200 TerminalResponse |
| PG-02 | `GET /ai/requests/{requestId}` | RequestResponse, 200; this admitted result schema is Plan My Day only |
| PG-03 | `POST /ai/requests/{requestId}/cancel` | Empty object; 200 CancelResponse with cancelled or already_terminal and terminal snapshot |
| PG-04 | `POST /ai/proposals/{id}/revisions` | ProposalRevisionInput; 200 RevisionResponse |
| PG-05 | `GET /plans/{id}` | PlanResponse, 200; inaccessible/deleted ID 404 |

PlanGenerationInput: requestId, taskIds, availableStart/availableEnd, timeZone and
all three preference fields. IDs unique; order is explicit input preference and
retained in the intent fingerprint. Server sends only minimized approved context,
not arbitrary local resources, credentials or full account history. No result is
generated or charged before feature/provider/retention/consent policies are ready.

Status always returns requestId, actionType, version, createdAt, updatedAt,
deadlineAt, completedAt, result, failureCode, reservedActions, consumedActions.
Pending has null terminal fields/result, reserved=1/consumed=0; completed has a
proposal reference with contractVersion=2, terminal time, reserved=0/consumed=1;
failed/cancelled have no result and zero counters, with a safe failure code only
for failed. Counters describe this request, not remaining allowance; read EX-31
for live availability. Status result may refer to expired content without rerunning
generation. No raw provider status, fence, job secrets or internal billing data.

202 Location is the owned status-monitor relative path; equality to requestId is
a server/client check beyond regex. Status GET returns 200 even while pending.
No invented ETA/poll default. Respect 429 Retry-After when supplied and approved
bounded client policy. Missing known request uses 404; retained owned expired
request uses 410 AI_REQUEST_EXPIRED. Either is not proof cancellation succeeded.
23's cancellation-before-acceptance and same-key recovery rules remain mandatory.

Failures before acceptance use 400 VALIDATION_FAILED, 401 AUTH_REQUIRED, 403
ACCESS_DENIED/AI_FEATURE_DISABLED, 404 NOT_FOUND, 409 IDEMPOTENCY_CONFLICT,
409 AI_ACTION_REQUIRED, 429 RATE_LIMITED, or 503 POLICY_UNCONFIGURED/
DEPENDENCY_UNAVAILABLE as applicable. Revision also uses 409 AI_PROPOSAL_MISMATCH,
AI_PROPOSAL_ALREADY_APPLIED or VERSION_CONFLICT, 410 AI_PROPOSAL_EXPIRED, and
400 VALIDATION_FAILED for no-op/invalid edits. Error requestId is the ordinary
diagnostic correlation, not authority to recover another generation request.

Conditional `/ai/break-down-task` and `/ai/review-my-day-lite` names are retained
in canonical scope but not added to these success schemas or enabledActions by
this slice. Their success payloads, hierarchy/analytics semantics and admission
need separate work. No generic untyped result loophole is introduced to count them.

## 6. Acceptance and remaining implementation packets

Document checker exercises strict DTO rejection, v1/v2 separation, all 52 route
identities, reference resolution and small temporal/binding/state examples. It
does not prove DB authorization, clock correctness, real DST UI, hashing,
transaction isolation, notifications, provider safety or app behavior.

| Case | Future integration observation — all NOT RUN |
| --- | --- |
| DP-T01 | Two owners, guessed plan/proposal/request IDs and revoked sessions deny access without data leak |
| DP-T02 | UTC round trip, real IANA zone, local-date mismatch, DST gap/fold and travel preserve intended instants |
| DP-T03 | Overlap/out-of-window/zero or reversed block, duplicate ID and orphan break reject without writes |
| DP-T04 | Multiple blocks for one task remain distinct; plan totals never increment verified progress |
| DP-T05 | Provider result outside captured inputs or unsupported action/contract version rejects with no debit |
| DP-T06 | Exact plan/reminder dependency closure and whole-plan preview match confirmed writes |
| DP-T07 | Block removal/retiming plus reminder revision is atomic; stale/unselected dependent reminder never appears silently |
| DP-T08 | Same revision key/order normalization, concurrent edit/apply and expired content preserve exact-once receipt behavior |
| DP-T09 | DB failure after first reminder rolls back all selected reminders, plan, changes and receipt |
| DP-T10 | Sync/snapshot/export/account deletion includes plans before capability activation; old clients fail safely |
| DP-T11 | App crash after apply recovers plan by receipt ID; local cache/account switch cannot show another account's plan |
| DP-T12 | Late/missed block and manual Start do not auto-start, backdate, complete task or move later blocks |
| DP-T13 | OS reminder install failure is shown after committed intent; retry cannot duplicate schedules or AI usage |
| DP-T14 | Large text/screen reader review shows exact block times, zone, reminder dependency and fresh confirm |
| DP-T15 | Cancel before/after completion and lost acceptance obey 23 without a blind new generation |
| DP-T16 | No policy/provider configured gives unavailable, not fabricated quota or fake success |

Next bounded packet: plan persistence integration (owned SQL/RPC, sync/pull/snapshot/
export/deletion, client version gate, post-save lifecycle and focused tests), then
selected provider adapter and runtime client integration after their own gates.
No price, provider, TTL, exact duration policy or deployment is selected here.

## 7. Source basis

Checked 2026-09-19. RFC 3339 distinguishes qualified instants from unspecified
local-time scheduling rules. PostgreSQL stores timezone-aware timestamps as UTC
instants without retaining the originally supplied zone. **Design inference:**
this plan stores a separate IANA zone and compares elapsed intervals in UTC;
the local calendar/ambiguity UI and production database version still need tests.
[RFC 3339](https://www.rfc-editor.org/rfc/rfc3339),
[PostgreSQL date/time](https://www.postgresql.org/docs/current/datatype-datetime.html).
