# Saved-plan management wire — PL-01

Started 2026-09-19; resumed and checked 2026-09-20. **DRAFT / HIGH / REVIEW_PENDING.** Solo documentation only. This
completes a bounded wire draft, not the implementation or acceptance of PL-01.
The lifecycle recommendations in [25](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md)
still need review; production activation remains blocked by PL-02–05 and policy.

සිංහල: Plan එක වෙනස් කරන විට schedule එකත් reminders වලට කරන වෙනස්කම්ත්
එකම confirmation එකෙන් සුරකිනවා. Retry කළා කියලා දෙවැනි reminder එකක්
හැදෙන්නේ නැහැ. Archive/delete කළාට කළ වැඩ හෝ XP වෙනස් කරන්නේ නැහැ.

## 1. Task brief

- Outcome/phase: DF-037 / PL-01, reopened documentation phase; no app build.
- Approved: solo preparation, selected stack, core independent of AI; no new
  provider, pricing, retention, notification policy or release-scope approval.
- Read: root/AI/execution/DoD/guardrails/map/task brief completely; 25, relevant
  24 read/time/binding rules, 16 reminder/idempotency rules, canonical API §28,
  DATA_MODEL §19, DATABASE_SCHEMA §25, SECURITY §23 and implementation-plan entry.
- Inspected: package scripts, current Plan My Day route, planning/extension DTOs,
  planning checker and dirty work. Current route is still a transient 25/5 preview.
- Allowed: new 26, plan-management schema/OpenAPI/checker; existing planning
  schema/OpenAPI/checker and docs checker; 24/25/README/07/18/09 routing/evidence;
  canonical API/data/database/security/testing/changelog/map and DoD command list.
- Non-goals: app, SQL, existing sync schema, provider or dependency changes;
  agents, accounts, spending, commit/push/deploy. Preserve unrelated dirty work.
- PM-A01: strict read/edit/action/receipt types; PM-A02: exact reminder coverage,
  ownership/version/atomicity/replay semantics; PM-A03: executable positive and
  negative document fixtures; PM-A04: canonical reconciliation and honest gates.
- Risk HIGH: persisted ownership and deletion; independent qualified review is
  pending before acceptance/integration. Rollback only this packet's own hunks.

Artifacts: [management DTOs](contracts/plan-management.schema.json),
[two-operation OpenAPI](contracts/plan-management.openapi.json),
[read-only checker](check-plan-management.mjs). Existing
[planning DTOs](contracts/planning.schema.json) now refine SavedPlan/PlanResponse.
Six OpenAPI files have **54 unique operations**. The old planning checker remains
a five-file/52-operation check; four-file checkers remain 47-operation checkpoints.

## 2. Read contract and compatibility

PG-05 `GET /plans/{id}` now requires `Plan-Contract-Version: 2` and returns
`{data:{plan:SavedPlan,boundReminders:Reminder[]}}`. SavedPlan retains 24's fields
and adds required `state:active|archived` and `updatedAt`; `createdAt <= updatedAt`.
Initial AI apply sets state active, version 1, createdAt=updatedAt. Its existing
minimal apply-result target/version shape is unchanged: fetch current PG-05 after
receipt recovery. It is not guaranteed to return the original version after edits.

Read plan plus bound reminders in one consistent owned snapshot. Exactly one
non-deleted reminder per non-null focus binding; no missing, duplicate, foreign
or unbound row. Sort reminders by UUID ASCII ascending. Archived plans have no
bindings/reminders. Invariants cover disabled as well as enabled bound intents;
stored past reminders remain readable, not falsely delivered. Missing or deleted
plan GET returns generic 404, not its erased text. Never return tombstones as
malformed empty SavedPlan objects.

This explicitly replaces the **undeployed initial PG-05 response** in 24, not a
claim of backwards-compatible wire evolution. Missing, duplicate or unsupported
plan contract header rejects with 400 VALIDATION_FAILED before mutations. Accept
exact canonical header value `2`; clients verify it on successful responses.
Do not guess/fallback to the former shape. The plan header is not proposal
contractVersion, row version, sync protocol negotiation, consent or authorization.
Generation/proposal routes retain their existing header rules. PL-02 must later
connect activation to supported replication; this header alone cannot enable it.

## 3. Two additional operations

Paths below are under `/v1`, active owned UserBearer account/app session required.
Browser access uses the existing trusted Next.js boundary. No query keys, owner
selector, arbitrary return URL or client-derived permissions. Success and errors
are private/no-store. Writes require UUID Idempotency-Key and the plan contract
header. Draft maximum body is 64 KiB; this is an engineering ceiling, not a price.

| ID | Operation | Exact request / success |
| --- | --- | --- |
| PM-01 | `PATCH /plans/{id}` | PlanEditInput → 200 MutationResponse |
| PM-02 | `POST /plans/{id}/actions` | PlanActionInput → 200 MutationResponse |

Edit body: `{expectedVersion,plan,taskVersions,reminderActions}`. `plan` is a full
24 PlanCreate replacement of editable schedule content, not JSON Patch, generic
merge or a way to set state/createdAt/provenance. Its id equals path id; workspace
stays unchanged. New blocks are permitted with fresh non-reused IDs; retained IDs
cannot change kind. Preserve source provenance. `taskVersions` has exactly one
`{id,expectedVersion}` for each distinct task in resulting focus blocks, sorted by
ID for canonical intent. Check current owned/live task versions atomically;
this does not constrain manual edits to the AI generation's old captured subset.
Task changes outside this request are never silently overwritten.

Revalidate full UTC/window/zone/date/interval/break invariants from 24. Retiming
past planned work is descriptive, not backdated actual activity. Only newly
created, retimed or re-enabled reminder intent must be future-valid at commit; an
unchanged historical reminder may be explicitly kept. Current product duration
limits remain required configuration. An archived plan must be restored before
editing. No-op requests reject; each effective command increments plan once.

### Exact reminder action set

Each previously bound reminder appears **exactly once** as keep, update or disable.
Every newly bound reminder is a create; no ordinary existing standalone reminder
can be adopted. Actions have unique IDs across all kinds. Maximum 200 actions
allows replacing all 100 old bindings with 100 new ones; final bindings <=100.

| action | Fields after action | Meaning |
| --- | --- | --- |
| keep | id, expectedVersion | Preserve the exact current intent and retain binding |
| update | id, expectedVersion, scheduledFor, timeZone, enabled | Full explicit reminder timing/enabled replacement; task and delivery immutable |
| disable | id, expectedVersion | Set enabled false if necessary and remove binding; no deletion of task |
| create | id, taskId, scheduledFor, timeZone, delivery:local_device | New explicitly enabled ordinary intent with version 1; must bind a resulting focus block |

Keep/update IDs must remain bound once; disable IDs must not occur in the result;
create IDs must be fresh for that owner, never tombstoned or owned elsewhere.
Every resulting binding matches its focus task, plan zone, and time <= focus start.
Moving an existing reminder to a different task is not an update: disable the old
one and explicitly create a new one. No unbound create, hidden reminder, implicit
rescheduling or claim that server commit installed an OS alert.

Explicit keep is allowed when a focus time changes but the unchanged alert still
satisfies the resulting binding; show its unchanged alert time in the preview.
This refines 25's broad timing-change rule, not an automatic choice. An update
that only disables an existing alert may keep its past time; it does not install
a new alert. A retimed or re-enabled alert must still be future-valid.

UI shows the complete resulting schedule, zone and four categorized action lists
before sending these exact values. Full request is the manual intent; no separate
AI digest or model authority is needed. A stale reminder version rejects the whole
edit, even if another device changed only enabled state. Refresh and review again.

Action body: `{action:archive|restore|delete,expectedVersion,reminderVersions}`.
For archive/delete, reminderVersions lists **exactly all current bound reminders**
with their expected versions; all will be disabled/detached. For restore it is
empty; reminders never re-enable automatically. Archive allowed only from active,
restore only archived, delete active or archived. Already-deleted/new-key writes
return ENTITY_DELETED; same-key authorized replay returns the minimal receipt.
Never silently operate on newly added bindings not present in the confirmation.
Delete uses a POST command because the reviewed intent includes a reminder-version
list; no ambiguous DELETE request body is introduced.

## 4. Atomic receipt, errors and response-loss recovery

Normalize intent with command/target, exact expected versions and full schedule;
sort taskVersions/reminderActions/reminderVersions by ID, **not** ordered blocks.
Hash canonical intent using the existing reviewed domain receipt design; never
persist plaintext intent just to detect replays. Authorization/account checks
precede receipt lookup; matching receipt precedes current-version/state checks.
Changed intent under the same key conflicts. Different command names retain
16's `(actor,commandName,mutationId)` uniqueness. No new key on transport retry.

Under the existing owner-head transaction, recheck plan/task/reminder access and
versions, apply schedule/state/reminder changes, append each entity change and
store one receipt atomically. No independent nested reminder commit. Keep or
already-disabled reminder need not increment reminder version; update must change
at least one value. Plan mutation increments once, including detached bindings.
Reject version overflow. Replay creates no second receipt/change/reminder or AI
charge. Native installation/cancellation is separate device reconciliation.

MutationResponse is `{data:MutationReceipt}`. Receipt contains mutationId, command,
targetId, previousVersion, entityVersion, state, committedThrough, updatedAt and
reminderResults. Each result is `{id,action,version}` with matching submitted action
(archive/delete results use disable), sorted by ID. No task title, explanation,
schedule, token or user-controlled success flag. entityVersion=previousVersion+1;
committedThrough is the original transaction's final positive decimal bigint
sequence, not a fresh head on replay. Its semantic maximum is signed bigint.

Use the shared error envelope: 400 VALIDATION_FAILED (unknown/missing fields,
header, no-op, invalid/binding-mismatch request); 401 AUTH_REQUIRED; 403
ACCESS_DENIED for disallowed account/session; 404 NOT_FOUND for inaccessible IDs;
409 VERSION_CONFLICT, INVALID_TRANSITION, ENTITY_DELETED or IDEMPOTENCY_CONFLICT;
429 RATE_LIMITED; 503 POLICY_UNCONFIGURED/DEPENDENCY_UNAVAILABLE. Do not leak the
foreign reference or private values in error text. A server invariant violation
is unavailable/no partial response, not a success with omitted reminders.

After a lost response resend the identical command/key. A returned receipt means
the intent committed, not that its version is still current. Re-fetch PG-05;
if since deleted, show unavailable and reconcile local cache, never resurrect
from the submitted old request. Minimal replay evidence may survive content
erasure only under reviewed retention. Expired receipt recovery must not repeat
effects; bounded key/tombstone policy is still a release gate. No reset of expiry
or blind retry with new IDs. Account freeze denies ordinary receipt replay.

## 5. Reconciliation and remaining boundaries

26 owns current PL-01 wire; 25 owns proposed lifecycle/privacy; 24 owns generation,
proposal and temporal rules. Former immutable initial-read text is a historical
checkpoint, explicitly superseded for PG-05 by this current read. No revision of
AI proposal input or confirmed original writes is implied by editing a saved plan.
Shared PlanResponse's changed shape is intentional and checked; do not restore
an old fixture merely to silence a failing generated client.

[27](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md) now supplies PL-02's seven-entity
v2 feed/commands, cursors/snapshot/digests/privacy-epoch wire, plan discovery and
plans-only export component. Full account-export packaging remains open.
PL-03 needs migrations/RPC/
RLS/worker tests; PL-04 needs local repository/editor/OS tests. No initial manual
plan-create endpoint, block-to-actual-session link or conditional AI feature is
added here. Ordinary manual tasks/focus remain independent of AI. Archive/delete
side-effect choice, exact retention/limits and required independent review remain
pending before implementation acceptance. No production feature flag is enabled.

## 6. Evidence and real acceptance

Checker validates JSON shapes, refs, method/header mappings and synthetic binding/
version/action/receipt examples. It does not implement authorization, atomicity,
JCS crypto, privacy deletion or a client UI. All cases below remain **NOT RUN**.

| Case | Future runtime evidence |
| --- | --- |
| PM-T01 | Foreign plan/task/reminder and frozen session cannot read, mutate or replay |
| PM-T02 | GET plan/reminders is consistent during concurrent edits; response header/shape fail closed |
| PM-T03 | Missing/extra/duplicate reminder action, hidden binding or stale version rolls back |
| PM-T04 | Full edit plus reminder create/update/disable is atomic under mid-transaction failure |
| PM-T05 | Same key reordered set arrays replays, reordered blocks do not change intent unnoticed |
| PM-T06 | Archive/delete confirm exact reminder set; restore cannot re-enable alerts |
| PM-T07 | Concurrent task deletion/edit/apply cannot resurrect erased data or reuse block IDs |
| PM-T08 | Offline/timezone/DST/late plan edits preserve actual sessions and surface conflicts |
| PM-T09 | Lost-response retry after later deletion returns minimal receipt without old content |
| PM-T10 | Native cancellation failure and pending receipt/cache state are accessible and truthful |

Research checked 2026-09-19: PATCH requires atomic application and is not inherently
idempotent; this design adds explicit version/receipt controls. HTTP DELETE request
content has no generally defined semantics. These support, but do not prescribe,
our typed PATCH and POST action choices. [RFC 5789](https://www.rfc-editor.org/rfc/rfc5789),
[RFC 9110 §9.3.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.5).
