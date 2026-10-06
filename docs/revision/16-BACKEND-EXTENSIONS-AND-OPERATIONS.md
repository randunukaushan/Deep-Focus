# Remaining Backend Modules and Operations

මෙම ලේඛනය core API එකෙන් ඉතිරි වූ settings, sync, progress, AI confirmation,
billing visibility සහ export/deletion flows නිශ්චිත කරයි. මෙය app/backend
implementation එකක් නොවේ. Missing policy එකක් වෙනුවට Lunaට අනුමාන කරන්න බැහැ.

Status: **proposed extension contracts**, refined 2026-09-18. Approved platform choices
remain unchanged. [14](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md) supplies identity,
owner-head transaction ordering, errors, fourteen core operations and prototype
DDL. [Extension DTO schemas](contracts/backend-extensions.schema.json) provide
additional strict input shapes; semantic authorization/time checks still apply.
No SQL migrations, RPCs or providers are executed by this package.

## 1. Complete module disposition, not a claim of deployed completeness

| Module | Contract disposition | Remaining gate before implementation/release |
| --- | --- | --- |
| Profile/tasks/goals/session core | `14` plus sections 2–3 below | RPC implementation, executable migrations, tested timing/ownership |
| Goal edit/delete/progress | Title/description edit, soft delete and bounded derived progress below | Numeric target/period/type edits explicitly excluded until attribution policy approved |
| Task delete/reopen | Soft delete below; reopen not admitted | Owner decides whether reopen is needed; never silently duplicate completion rewards |
| Settings/personalization | Explicit account allowlist; drafts/phrases remain local by default | Exact product limits, locale list and any extra sync consent |
| Break history/reminders | Separate break record; single-device notification installation | OS permission/device tests and approved reminder scope |
| Sync | Full command registry, initial snapshot, bounded pull, tombstones | Actual response schemas/migrations/load/chaos tests and retention window |
| Streak/reward/analytics | Trusted ledger + deterministic projection/version rules | Approved numeric rules and calendar-day attribution; no guessed XP formula |
| AI usage/proposals | Reserve/generate/review/apply with no silent writes | Provider, processing consent, action catalog, pricing/ad policy and evaluations |
| Export/deletion/auth sessions | Durable own-account jobs and revocation boundaries | Region/retention/recent-auth policy and actual job runner/restore proof |
| Billing/cloud | Read rights/catalog/manage safely; verified grants only | Merchant/provider/catalog/quotas; no resource upload endpoint in generic API |
| Education/team/future integrations | `11`, `12`, `05` and future-card admission rules | Own release/ownership policies; not smuggled into private personal-core API |

This makes every remaining module's disposition explicit, but does not make all
modules READY. JSON input shapes are not complete output schemas or database
implementations. Exact provider callback payloads cannot be authored before that
provider is selected. Prices/budget amounts remain deferred as requested.

## 2. Extension endpoint inventory

All paths below have `/v1` prefix. Reads and writes require a validated user and
active account unless the narrow privacy-job receipt exception in section 8
applies. Browser consumers additionally use the protected Next.js server boundary.
Every write has a stable UUID `Idempotency-Key`, with the same domain receipt
used by sync/direct/confirmed-AI transports. Query and route IDs are untrusted.
Responses use `data`, optional `meta`, or the safe error envelope from `14`.

| ID | Method / path | Request or query; result |
| --- | --- | --- |
| EX-01 | `PATCH /goals/{id}` | `GoalPatch`; owned Goal DTO; title/description only |
| EX-02 | `DELETE /goals/{id}` | Required `Expected-Version` header → domain `VersionOnly`; typed Tombstone + receipt |
| EX-03 | `DELETE /tasks/{id}` | Required `Expected-Version` header → domain `VersionOnly`; typed Tombstone + receipt |
| EX-04 | `GET /settings` | AccountSettings DTO; no questionnaire/phrase/device grants |
| EX-05 | `PATCH /settings` | `AccountSettingsPatch`; new owned settings version |
| EX-06 | `POST /breaks` | `BreakRecord`; validated Break DTO; no focus XP |
| EX-07 | `GET /breaks` | Owned history cursor; Break DTO page |
| EX-08 | `POST /task-reminders` | `ReminderCreate`; Reminder DTO, not a claim of OS delivery |
| EX-09 | `GET /task-reminders` | Owned cursor; Reminder DTO page |
| EX-10 | `PATCH /task-reminders/{id}` | `ReminderPatch`; versioned reminder; device reconciliation required |
| EX-11 | `DELETE /task-reminders/{id}` | Required `Expected-Version` header → domain `VersionOnly`; tombstone and schedule invalidation |
| EX-12 | `POST /sync/push` | `SyncPush`; ordered per-item outcomes |
| EX-13 | `GET /sync/pull` | `SyncPull` query; immutable changes through captured high-water |
| EX-14 | `POST /sync/snapshots` | Empty object; queued snapshot Job |
| EX-15 | `GET /sync/snapshots/{id}` | Owned Job + snapshot metadata when ready |
| EX-16 | `GET /sync/snapshots/{id}/pages` | Opaque bound cursor; immutable own-data snapshot page |
| EX-17 | `GET /analytics/summary` | Valid bounded start/end/timezone; projection with data freshness |
| EX-18 | `GET /rewards` | Owned reward projection/rule version; no client reward writes |
| EX-19 | `GET /rewards/history` | Owned ledger cursor; immutable earned/correction entries |
| EX-20 | `GET /goals/{id}/progress` | Owned goal; bounded attributed contribution totals |
| EX-21 | `POST /privacy/exports` | `ExportRequest`; export Job, HTTP 202 |
| EX-22 | `GET /privacy/jobs/{id}` | Owned Job or narrow deletion receipt status |
| EX-23 | `POST /privacy/exports/{id}/download-token` | Empty object + recent auth; short-lived own-export access |
| EX-24 | `POST /privacy/deletion-challenge` | Empty object + recent auth; challenge/consequences version + pre-issued scoped status credential and reserved job ID |
| EX-25 | `POST /privacy/deletions` | `DeletionRequest`; freeze-account + deletion Job, HTTP 202 |
| EX-26 | `GET /account/sessions` | Registered app sessions only; no tokens/device fingerprints |
| EX-27 | `POST /account/sessions/revoke` | Selected own app-session ID or explicit others/all scope + recent auth |
| EX-28 | `GET /billing/entitlements` | Authoritative capability/scope/validity/provenance; unavailable is not free |
| EX-29 | `GET /billing/catalog` | Published eligible offers only; no fabricated currencies/prices |
| EX-30 | `POST /billing/management-link` | Own license ID; provider-authorized allowlisted management destination |
| EX-31 | `GET /ai/usage` | Approved policy version/allowance/pending reservations, no client grants |
| EX-32 | `POST /ai/proposals/{id}/apply` | `ProposalConfirmation`; apply exact reviewed version once |
| EX-33 | `GET /ai/proposals/{id}` | Owned proposal version/operations/expiry/state; no provider prompt dump |

These are proposed additional/overlapping contracts, not 33 newly deployed
endpoints. `/settings`, reminders, rewards and AI paths refine earlier canonical
examples rather than create parallel APIs. Export query `format=json` is an
interchange artifact, not a claim that source resource files were cloud stored.
Conditional AI generation paths already in `API_SPEC §28` remain gated; this
inventory does not activate them. The original OpenAPI file covers 14 core
operations. The separate [extension OpenAPI](contracts/personal-extensions.openapi.json)
covers exactly EX-01–11 and EX-17: twelve more, **26 unique operations across two
draft slices** at that checkpoint, not all 33 extension rows or the complete V1
API. The later [operations slice](contracts/operations-api.openapi.json) now adds
EX-12–16 and EX-21–30: fifteen operations, **41 unique operations across three
draft files** at that checkpoint. The [reward/goal/AI slice](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md)
now covers EX-18–20/31–33: **47 unique operations across four draft files**, covering
all 33 extension inventory rows. This is not the full V1 API: generation/revision,
assessment and provider-specific families still need complete contracts. No slice
is deployed or certified by a full OpenAPI conformance test.

### Selected extension wire rules (September 18)

The twelve-operation slice shares bearer authentication, owned-account/session
checks, safe errors and domain idempotency with `14`. All private responses use
`Cache-Control: private, no-store`; browser access stays behind the selected
Next.js server boundary. No extra account/workspace selector permits a foreign read.

For these three DELETE operations, use no JSON body. The required application
header `Expected-Version: 1` becomes `{expectedVersion:1}` inside the same domain
command used by sync. Accept exactly one canonical positive decimal integer
<=2147483647; missing/duplicate/malformed is 400 `VALIDATION_FAILED`. An owned
stale version is 409 `VERSION_CONFLICT`. This is a custom version header, **not**
HTTP `If-Match`; do not claim ETag semantics. Reject unexpected body bytes rather
than silently ignoring a conflicting version. Keep `Idempotency-Key` required.
Hash the normalized domain payload, never raw header spelling. Thus direct delete
then sync retry returns the same receipt even though the transports differ.

This refines the older draft's ambiguous `VersionOnly` request-body notation;
the domain/sync body is unchanged. OpenAPI permits DELETE bodies but discourages
relying on their undefined semantics.[^3] Before any generated-client adoption,
test header serialization and forwarding through mobile, Next.js and Edge. No
deployed client migration or owner product-policy change is implied.

Successful patch/read/delete is HTTP 200; break/reminder create is 201. Replay
returns the originally committed status/body after renewed authorization. A delete
response is `{data:{tombstone,receipt}}`, with an endpoint-specific entity type.
Receipt contains `receiptId, mutationId, command, targetId, entityVersion,
committedThrough`; it is a domain acknowledgement, not the private deletion-job
credential in section 8. Serializer checks must equate tombstone ID/version with
receipt target/version and match the request command/key. `committedThrough` is
the original transaction's final sequence, including linked-row changes, not the
new current head on replay. Source equality/bigint range need semantic tests.

Check existing receipt before testing current entity version/deleted state; an
identical lost-response retry must replay, not fail because its own delete worked.
A different key against an owned tombstone yields 409 `ENTITY_DELETED`; cross-owner
or inaccessible IDs remain 404. Expired list cursors use 410 `CURSOR_EXPIRED`;
expired sync cursors use 410 `SYNC_RESET_REQUIRED` and retain the local outbox.
These two recovery paths are not interchangeable. Both missing extension codes
are now in the shared safe error schema; exact retention policies remain open.

List query is only optional `cursor` and `limit` (default 50, maximum 100).
Reject unknown/repeated query keys; parse a single canonical positive decimal
limit before JSON-shape validation, without permissive `parseInt` coercion.
Responses are `{data:[...],meta:{nextCursor:string|null}}`, maximum 100 items.
Break history sorts `(endedAt DESC,id DESC)`; reminders sort
`(scheduledFor ASC,id ASC)` and exclude tombstones, while disabled/past intents
remain readable. Cursors bind actor/endpoint/query/sort. These are live pages;
editing reminder time can move a row, so deduplicate by ID, refresh after edits,
and use the snapshot/sync protocol for complete replication, not these list pages.

Break response `actualMs` is server-derived from validated timestamps under the
approved timing policy; clients cannot supply it. Verification states reuse
`pending|verified|needs_review` without claiming physical rest. The proposed
24-hour DTO ceiling is not approval for 24-hour breaks. Reminder creation records
an explicit user's enabled intent, version 1 and `deletedAt:null`; it never grants
OS permission or proves delivery. Remote deletion cannot guarantee cancellation
on an offline installing device; reconcile on contact and disclose that limit.

Analytics requires exactly `start`, `end`, `timeZone`; echo the validated period
and label snapshot freshness. Half-open order, reviewed range limit and IANA
membership still require service validation. Missing settings bootstrap/error is
not a successful default GET. Exact duration, locale, reminder timing and reward
policies still gate implementation, despite complete selected JSON shapes.

## 3. Mutation and response rules

Normalize every write to `{actor, commandName, targetId, mutationId, payload}`.
Actor is derived, not accepted from JSON. Hash a specified canonical JSON payload
including command/target and explicit nulls, excluding transport/path/cursor.
Receipt uniqueness is `(actor, commandName, mutationId)` across direct and sync
calls. The ID in a create body must equal its target ID; event IDs identify events,
while session-event target identifies the session. A settings target is the
owned singleton settings-row ID returned by GET. Duplicate IDs within one batch
are rejected before processing. Do not re-key a timed-out write and create a
second intent. Reusing a key with changed intent is 409, including another target.

Delete task: verify version/owner, mark tombstone, cancel pending reminders and
remove live planning links under the same owner-head transaction. Keep historical
session attribution readable. Delete goal: clear live task-goal links with their
version increments/change entries; retain historical attribution. Every changed
row emits its own sequence before commit. A stale offline edit returns
`ENTITY_DELETED`; never recreate an old ID. Large fan-out requires a frozen,
durable deletion job, not a partially applied HTTP loop.

Classroom-specific [TI-00](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md) adds
a proposed atomic private acceptance-link tombstone to this delete group. It
separates retained identity from nullable live FK without preserving Task content;
shared progress withdrawal remains a separate explicit action. Identity/session
guards precede the owner sync head, which remains first among domain locks; all
affected writers require reconciled SQL/tests before integration. Existing public
Task tombstone DTOs and the current prototype are unchanged.

Goal title/description editing does not alter historical progress. Type, target,
period and timezone mutations are excluded from the new patch until an approved
rule states whether to recalculate, fork or retain history. This is a proposed
conservative refinement, not an unnoticed deletion of the old goal-edit capability.

Exact proposed result types (unknown fields rejected by the eventual serializers):

```text
Tombstone = { id: UUID, entity: task|goal|reminder, version: integer,
              deletedAt: UTCInstant }
AccountSettings = { id: UUID, version: integer, theme: system|light|dark,
  uiLocale: SupportedLocale, defaultFocusDurationMinutes: integer,
  defaultBreakDurationMinutes: 5|10|15, aiFeaturesEnabled: boolean, updatedAt: UTCInstant }
Break = { id, focusSessionId, startedAt, endedAt, plannedMs, actualMs,
          outcome: completed|ended_early, version, verificationState }
Reminder = { id, taskId, scheduledFor, timeZone, enabled, delivery: local_device,
             version, updatedAt, deletedAt: UTCInstant|null }
ProjectionMeta = { asOf: UTCInstant|null, sourceSequence: DecimalString|null,
                   ruleVersion: string|null, status: current|pending|stale|unavailable }
```

September 18 refinement: [20](20-SETTINGS-PROGRESS-AND-UNITS.md) and the extension
schema define strict AccountSettingsResponse and AnalyticsSummaryResponse.
Unavailable has null totals and null snapshot metadata; other statuses require
a known snapshot, non-null metadata and explicit freshness. This closes those
two output shapes first; the selected OpenAPI slice above also adds break/reminder
pages and typed soft-delete receipts. Sync/privacy/billing/AI outputs and actual
service semantics are still incomplete.

IDs/timestamps/numeric bounds use `14`. Proposed schema storage bounds of
1–1440 focus minutes and at most 24-hour break milliseconds are defensive shape
limits, **not approved product duration choices**. Server additionally enforces
approved focus/break ranges and chronological validity. Locale/timezone strings
must belong to reviewed locale/valid IANA sets. JSON shape alone proves neither.
Cloud serializers never include local URIs, resources/associations, private
phrases, raw assessment answers or secret/session credentials.

## 4. Settings, assessment, breaks and reminders

Account allowlist is deliberately small: UI locale, theme, next-session duration
defaults and AI feature visibility preference. AI visibility true is not consent
to send any data or spend allowance. Remote edits never modify a running session.
Device overrides win until the person explicitly returns a field to account
default. Portal previews the precedence and refreshes a version conflict; it
does not claim to change every device immediately.

Device-only: OS notification grants/install IDs, haptics/sounds/reduced-motion
overrides, local resource libraries, assessment drafts and personal phrases.
Raw questionnaire answers/phrase sync require a separately approved opt-in data
contract; they are not in `/settings` or the generic feed. Optional personalized
defaults can be reviewed and saved through the same allowlisted settings write.
The older assessment cloud endpoints are conditional alternatives, not mandatory
traffic during onboarding. No assessment completion call grants consent.

Break records link only an owned eligible terminal focus session. Server validates
end >= start, duration bounds and a unique `(owner,focusSessionId,breakRole)` for
the post-focus break. Pause rests are distinct and not fabricated as completed
focus breaks. Skip before starting creates no fabricated positive-duration break;
a started break can end early. Actual rest time gives no focus XP or focus-minute
credit. Any dedicated rest reward requires its own approved rule, not this record.

Reminder time is a UTC instant plus its selected timezone; validate future/past
rules against server time and preview DST ambiguity to the user. For the initial
proposal the server stores reminder intent; only an explicitly selected device
installs it after OS permission. Other devices may display intent but do not all
schedule duplicates. Device bindings/install IDs remain local/approved device
registry, not trusted from an arbitrary owner field. Reconcile installed schedules
on edit/delete/login/permission changes. An expired offline reminder is labelled
missed, not back-dated as delivered. No push/SMS provider selected by this design.

## 5. Synchronization and safe bootstrap

### Push

`SyncPush.items` supports fourteen command kinds: create/patch/action/delete tasks;
create/patch/delete goals; start/event sessions; record break; patch settings;
create/patch/delete reminders. Each reuses the ordinary domain command validation.
It does not accept rewards, billing grants, owner changes or resource uploads.
Maximum 25 items/64 KiB envelope; apply in supplied order, one transaction per item.

```text
PushResult = { data: { outcomes: PushOutcome[] } }
PushOutcome =
  { mutationId, command, targetId, status: applied|replayed,
    receiptId, entityVersion, committedThrough: DecimalString }
  | { mutationId, command, targetId, status: rejected|retryable,
      code, retryAfterSeconds?: integer }
```

Batch-auth/schema failure returns an ordinary HTTP error before any item is
processed. Valid batch HTTP 200 means the outcome list was produced, **not** that
each item succeeded. A mid-batch account freeze stops remaining items with explicit
retry/denial results. A created task rejected earlier makes a dependent reminder
reject normally; no imaginary task is created. Client durably records each ack
before removing that outbox item. Retain rejected drafts and offer resolution.

### Initial snapshot and pull

Do not assume a new device can replay from zero forever. Snapshot creation is a
durable job that captures a consistent owner-data snapshot and high-water H in
one repeatable-read database snapshot; all domain writers obey `14`'s head lock.
Materialize immutable snapshot rows within that snapshot, not separate live HTTP
queries of tables at different times. For small accounts a short transaction can
do this; large accounts need a measured bounded implementation before READY.
Stored snapshot data is personal data with ownership/expiry/deletion rules.

Snapshot metadata: `{snapshotId, contractVersion:1, highWater:DecimalString,
createdAt, expiresAt, pageCount, manifestDigest}`. Pages bind snapshot/owner/index
and contain allowlisted typed entities; no local-only data. SQLite stages pages
in a new mirror, verifies completeness/digest, atomically swaps the server mirror
and saves cursor H, then reapplies pending local overlays. It never overwrites the
outbox/active timer/local resources with a server snapshot. A crash resumes the
staging snapshot or safely starts another; it does not expose half a mirror.

Pull takes an opaque server-issued cursor, optional limit <=100. Server cursor
binds owner, schema version, last sequence and a fixed batch high-water. Page type:

```text
PullPage = { data: Change[], meta: { nextCursor, caughtUp: boolean,
                                    highWater: DecimalString } }
Change = { sequence: DecimalString, entity: task|goal|session|break|settings|reminder,
           entityId: UUID, version: integer, operation: upsert|delete,
           payload: the exact allowlisted DTO for this entity OR null for delete }
```

Reject mismatched entity/payload/ID/version; use an explicit serializer per entity,
not `SELECT *`. Feed contains domain state, not credentials/jobs/billing/AI prompts.
Rewards/analytics refresh through authoritative reads and are not client writes.
Each received page and cursor commits atomically; ignore older entity versions
without discarding local unsynced overlay. Do not merge arbitrary same-field edits
by client timestamps. Stale cursor returns `SYNC_RESET_REQUIRED` with no data loss;
start a new snapshot and retain/reconcile the outbox. Retention windows for logs,
receipts and snapshots must be approved together: expire receipts too early and
an old retry can duplicate effects. Preserve permanent source uniqueness for
terminal/reward events even when transport receipts are pruned.

Sequence strings parse as BigInt and must be <= PostgreSQL signed bigint maximum;
do not coerce into JavaScript Number. Ordering and semantic range require server
checks beyond the JSON decimal-string regex. Snapshot expiration is an error with
a recovery path, not an empty successful page.

## 6. Progress, streak and reward ledger

Only trusted domain processing writes an immutable ledger entry identified by
`(owner, sourceType, sourceId, awardKind)`. `ruleVersion` is provenance, not a way
to re-grant the same source. Retrying completion, direct/sync replay or rebuilding
a projection produces no additional award. Corrections are explicit append-only
adjustments linked to the source, not editing the historic award or user balances.

Before implementation freeze a rules fixture under
[20](20-SETTINGS-PROGRESS-AND-UNITS.md): qualifying statuses/verification,
rounding/unit conversions, XP/levels/achievement thresholds, calendar-day timezone,
cross-midnight attribution, pause/break exclusion and late-sync handling. Import
any actually approved canonical numbers with their source section; the current
canonical examples do not specify a complete XP/level catalog. Do not invent it from
an attractive screenshot. Missing rule fixture blocks trusted rewards, not local
session saving. No public ranking, betting or clinical inference follows from XP.

Analytics query uses a bounded half-open `[start,end)` interval and valid timezone;
return completed verified focus milliseconds, completed session count, task
completion count and separately identified pending/local information. No physical
attention verification or mastery claim. Summary supplies ProjectionMeta and
explicit no-data state. A materialization can lag; show its as-of marker. On
projection rebuild failure keep the last valid snapshot labelled stale; never reset
the displayed lifetime total to a fake zero or re-award the ledger.

Goal progress uses immutable eligible contribution IDs attributed under a frozen
goal/timezone rule and bounded period, not an unbounded total of every session on
a currently linked task. Delete/edit cannot secretly move historic contributions
between goals. Goals for task counts require explicit task completion events;
completing a timer does not automatically complete the task.

## 7. AI proposal execution and billing visibility

Generation uses a durable job/request ID and one usage reservation before provider
I/O; no database transaction remains open while waiting for AI. Store validated
operations as a private versioned proposal with expiry, selected input versions,
and a server-computed digest of canonical reviewed operations. Generation cannot
write tasks/reminders. Invalid/unsafe provider output is rejected; no silent fix-up
that adds actions. Usage debit/release follows the approved billable-success rule
and provider reconciliation; a network timeout does not automatically prove no
provider charge. No action-price or ad rule selected by this specification.

The exact proposed review/apply outputs, restricted command catalog and single-use
apply lifecycle are in [22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md). Canonical V1
still limits a successful generation to at most one user action; terminal failed/
cancelled requests consume none. Provider cost reconciliation is separate from
user allowance. A transport timeout alone does not establish terminal failure.

[23](23-AI-GENERATION-RECOVERY-AND-REVISION.md) refines generation identity,
reservation/deadline/fencing, lost-acceptance recovery, cancellation races and
manual revision without a new debit. Its reference model is not a durable runner
or new OpenAPI slice; strict wire, context retention and provider gates remain.

User edits create a newly validated proposal version/digest and display it for
review; client-supplied digest is a match check, not authority. Apply accepts exact
selected operation IDs from that reviewed version. Expand and display dependencies
before confirmation (e.g. reminder needs proposed task); reject a selection missing
required dependencies. Check owner, expiry, selected subset, versions, limits and
current permission again. Proposed initial apply is atomic all-or-nothing across
selected task/reminder changes plus apply receipt; stale dependency yields 409
and refreshed review, not a partly successful surprise. No unselected item is
created. Domain command helpers participate in that transaction and emit changes
without nested independent commits. Same apply key returns the same receipt.
Apply consumes no second generation unit. Revised wire input is an explicit
refinement of the old editable-items example, not two formats to send together.

Entitlement read returns `{capability, scopeType, scopeId, state, validUntil,
source, checkedAt, catalogVersion}` for actual verified grants; unknown is pending/
unavailable, not assumed active or revoked. Paid checkout is absent until provider
and catalog are approved. Management link creation authorizes the owned license,
checks known purchase origin, requests an official destination and validates its
host. It never accepts a client return URL outside the configured allowlist.
Opening that URL does not mean cancellation succeeded. Poll/reconcile provider
truth before showing the new state. Provider callbacks verify raw signed bodies
in a dedicated endpoint family; they never reuse a user session or skip signature
checks because the client said payment completed.

## 8. Export, deletion, sign-out and durable jobs

Job row proposal: ID/owner/kind/state, operation ID, lease owner/fencing version,
lease expiry, attempt count, next attempt, progress checkpoint, created/updated
times, safe error and private result locator. Workers claim using transactional
locking, bounded leases and a fencing token checked at every checkpoint/finish.
After worker loss another worker can resume idempotently; a stale worker cannot
publish completion. All provider calls need their own idempotency/reconciliation.
Edge background continuation alone is not a durable queue: workers still have
finite CPU/wall/memory limits.[^1] The durable runner/scheduler choice is still an
implementation gate; this doc does not create a scheduled automation or service.

Export: recent auth → owned request → consistent snapshot → allowlisted JSON
manifest/data with schema/version/timezone and explicit inclusion/exclusions →
private expiring artifact. Download requires a fresh authorized request, short
expiry and no URL in analytics/referrers/logs. Local-only resources/phrases/raw
answers are excluded and disclosed; mobile local export is a separate approved
flow, not a claim that the server has those bytes. Never include another user's
workspace data, secrets or internal fraud/support notes. No paywall for required
privacy access. Export lifetime/rate limits and legal scope require ADR-011 review.

Deletion: recent auth → one-time account-bound challenge with current consequences
version → explicit confirmation → owner-head transaction freezes account and
creates the reserved job and activates its pre-issued status receipt (section 11).
Every ordinary API checks frozen state; existing JWTs cannot
continue writing. Block new AI/sync/uploads, cancel jobs/schedules, revoke connectors
and sessions, reconcile billing consequences, remove own resources/projections/
ledger per reviewed retention policy, then dependent rows/profile and Auth identity
in an approved order. Minimal legally retained billing records are segregated,
purpose-limited and disclosed. No claim to erase all backups instantly.

Pre-issue a narrowly scoped status receipt at challenge creation, before the
client sends confirmation; activate it atomically with account freeze/job creation.
This prevents a lost confirmation response from also losing the only status
credential. It permits only that job's coarse status, no account content/cancel/export.
Receipt is protected like a credential, never in a public URL; status polling can
use it as an Authorization credential only for EX-22. On completion it returns no
personal fields. It does not restore full account access after deletion. Exact
receipt TTL/key handling and support proof policy must be fixed before release.
Cancellation, if later offered, requires a separate reversible stage and explicit
policy; no generic job Cancel button for irreversible deletion. Receipt creation
does not itself request/authorize deletion. This detailed protocol is a security
review proposal, not a deployed mechanism or final TTL/key policy.

Use a retained deletion/suppression journal appropriate to the approved policy
outside the set restored from an older backup. During restore quarantine traffic,
reapply deletions/revocations before allowing logins or exports, then verify a
deleted account did not reappear. Do not retain personal content under the excuse
of preventing resurrection. Offline devices cannot be remotely erased while
disconnected; clear or quarantine on next authenticated contact and disclose limits.

Supabase sign-out revokes refresh sessions, but existing access JWTs can remain
valid until expiry.[^2] Distinguish local sign-out, other-device revocation and
all-device sign-out. For immediate app/API revocation maintain an app-session
registry keyed to validated token session identity, enforce its active state at
every entry and invalidate privileged cached results. Never claim complete device
inventory from IP addresses or merely clearing browser cookies. External provider
calls/direct data access must not bypass that registry. Exact session TTL,
recent-auth freshness and registry cleanup remain security-policy gates.

## 9. Migration and operations sequence

Proposed migration families (new files only after approval, not executed SQL):

1. Personal core from `14`: review UUID/time/version constraints and grants; create
   app-session registry, settings singleton and owner sync-head atomically.
2. Events/receipts/domain RPCs: owned commands, terminal immutability and replay;
   PostgreSQL integration tests before clients use them.
3. Break/reminder intent tables with composite owned FKs; local installation registry
   only when its privacy/device design is fixed.
4. Sync snapshot staging/change retention and deletion tombstones; replay/bootstrap
   tests with real concurrent transactions and interrupted SQLite writes.
5. Immutable reward/contribution ledger and rebuildable projections from approved
   rules; no writable client balance fields.
6. Private job/outbox/lease/deletion journal plus export object ownership; actual
   backup restore and worker-loss drill.
7. AI proposals/reservations/apply receipts, then provider-specific billing inbox/
   licenses only after their decisions; no simulated premium in production.

For each: migration number/checksum, forward/backward schema compatibility,
synthetic fixtures, rehearsal, backup verification, explicit rollback or forward-
fix choice, minimum compatible client version and deprecation plan. Do not run
destructive down-migrations to rescue a bad release with real user data. Disable
the affected write/feature, preserve local work and follow the rehearsed recovery.
Logs contain correlation IDs, safe codes/latencies and no task text, tokens, phrase
text, AI prompts, signed URLs or full payment payloads. Define alert thresholds,
responsible operator and runbook before production, not an unsupported SLA claim.

## 10. Bounded cards and future integration scenarios

| Card | Outcome | Dependencies / verification |
| --- | --- | --- |
| BX-01 | Shared command registry + delete/title-edit handlers | BE foundations; direct/sync same-receipt and stale/deleted-object tests |
| BX-02 | Account settings/device override + reminder/break flows | UX/settings gates; no phrase/resource transmission, real permission checks |
| BX-03 | Snapshot/push/pull with durable local acknowledgments | Real DB + SQLite fault tests; retention and reset policies |
| BX-04 | Reward/contribution ledger and projections | Approved numeric/calendar fixtures; rebuild without new awards |
| BX-05 | AI jobs/reservation/review/apply | Approved provider/consent/meter policy; confirmed subset and replay tests |
| BX-06 | Durable export/delete/session revocation | Recent-auth/region/retention/runner choices; worker loss and restore drills |
| BX-07 | Catalog/entitlement/management + provider adapter | Merchant/catalog authority; sandbox duplicate/out-of-order/cancel/restore cases |
| BX-08 | Operational deployment rehearsal and rollback | All selected migrations/gates; explicit deploy authority, no fabricated script |

| Test | Required evidence, not a reported pass |
| --- | --- |
| BX-T01 | Same command direct then sync → original receipt, no duplicate change |
| BX-T02 | Same mutation ID with changed target/payload → conflict |
| BX-T03 | Delete goal with linked tasks → all live links/tombstones consistent after crash |
| BX-T04 | Deleted task arrives as stale offline edit → no resurrection or hidden draft loss |
| BX-T05 | Settings edit → active-session snapshot unchanged; no device grants/phrase fields accepted |
| BX-T06 | Reminder edited offline across devices → chosen installer reconciles; no false delivery claim |
| BX-T07 | Break end before start/foreign session/duplicate → reject or replay, no XP |
| BX-T08 | Initial snapshot concurrent with writes → consistent H and subsequent complete pull |
| BX-T09 | Kill during snapshot swap/page ack → old or complete new mirror, outbox intact |
| BX-T10 | Cursor wrong owner/expired/altered → safe rejection/reset without clearing local work |
| BX-T11 | Delayed commit under head lock → no skipped earlier change |
| BX-T12 | Partial push success then timeout → independent stable-key retries, exact outcomes |
| BX-T13 | Reward replay with a new rule version → no second award |
| BX-T14 | Projection rebuild failure → old labelled snapshot, ledger unaffected |
| BX-T15 | Half-open goal boundary/timezone/late sync → frozen attribution fixtures pass |
| BX-T16 | AI provider timeout → durable pending/reconciled reservation, no duplicate spend |
| BX-T17 | Edited/stale/unowned proposal/digest/subset → reject, no partial hidden write |
| BX-T18 | Apply replay or invalid reminder dependency → one atomic selected result or none |
| BX-T19 | Export wrong-owner/download expiry → no data; local-only exclusions disclosed |
| BX-T20 | Worker lease lost then old worker finishes → fencing rejects stale completion |
| BX-T21 | Deletion after JWT issuance → ordinary API blocked; narrow receipt only |
| BX-T22 | Restore old backup → deletion journal reapplied before traffic; account not resurrected |
| BX-T23 | Revoke app session with otherwise valid JWT → app gateway denies access |
| BX-T24 | Billing management/restore outage or wrong license → safe state, never grant/cancel from client claim |

## 11. Concrete operations wire slice and recovery protocol

[Operations schemas](contracts/operations-api.schema.json) and the
[fifteen-operation OpenAPI](contracts/operations-api.openapi.json) cover sync
push/pull/snapshot, export/deletion/session registry and billing visibility.
[Read-only checker](check-operations-contracts.mjs) compiles the definitions,
exercises positive/negative fixtures and checks all three slices' operation IDs,
method/path uniqueness, inventory mapping, request/response/query references and
authentication metadata. This does not run a gateway or prove authorization.

### 11.1 Domain commands, batch outcomes and snapshot handoff

Every push item retains its mutationId/command/target/body from the durable local
outbox. The batch header identifies the envelope; it does not replace per-domain
receipts. Validate the entire envelope (including duplicate mutation IDs and
create body/target equality) before executing any item. Then process in order,
one owner-head transaction per item. On transport loss, replay items through
their original domain keys. Do not cache a half-processed batch as a complete
HTTP success. A completed outcome list has exactly one result per input item,
in the same order with matching IDs/commands/targets; missing/duplicate/foreign
results invalidate the response and leave unacknowledged items intact.

`applied|replayed` contains receipt/version/committed-through, not a second client
grant. `rejected` has a safe code, no success receipt; `retryable` may include a
positive retry delay. Display retained rejected drafts for deliberate resolution.
A changed intent uses a new mutation ID after review, never changes the payload
behind an existing key. Frozen/revoked account state is rechecked per item.

Sync data is a discriminated union for task, goal, session, break, account settings
and reminder. Current delete commands emit only task/goal/reminder tombstones;
there is no ordinary delete-settings/session/break command in this slice.
Profile/bootstrap remains `/me`, not a new public feed payload. The older SQL
prototype logs private `profile` changes and calls session kind `focus_session`;
its enum is not this DTO. Required adapter/migration maps `focus_session` to
`session`, adds the selected extension kinds, and scans past internal profile
entries while advancing the opaque scan cursor. Re-fetch `/me` on account restore
and after catching up so profile edits on another device are not silently stale.
Private profile-change log rows never serialize as arbitrary untyped payloads.
No resource metadata,
local URI, credential, questionnaire, phrase, AI prompt or billing grant belongs
in this feed. Validate payload ID/version equality and signed-bigint sequence
range after shape validation. Response serializers reject unknown fields.

For pull, `nextCursor` is **always a nonempty opaque string**, including when
`caughtUp:true`. While false, it continues the captured high-water H. At true it
represents `after=H`; the next poll captures a new H. An empty caught-up page still
returns that cursor. Never use list pagination's null-at-end convention for sync.
Pages advance only through committed ordered changes. Validate strictly increasing
sequences <=H, identity/versions and full bounded response before atomically
persisting page/cursor. Visible sequence numbers need not be consecutive because
internal profile changes are filtered; do not mistake that for missing task data.
The signed scan cursor/high-water protocol and server transaction tests establish
completeness, not client inference from consecutive integers. A duplicate replay
is harmless; a malformed/inconsistent page cannot be accepted as complete.

Snapshot create returns HTTP 202 with an owned durable job. Status returns
`{data:{job,snapshot}}`; snapshot is null unless the job succeeded. Ready metadata
includes both `firstPageCursor` and `resumeCursor`: the first fetches immutable
snapshot pages, the second starts pull after H **only once all pages are verified
and installed**. A new device must not synthesize a sync cursor from a number.
Empty accounts still have one page with an empty data array. Snapshot page index
is zero-based, with fixed pageCount, snapshotId and H; final page has null
nextCursor. Nonfinal pages cannot claim null or loop to an earlier index.

Proposed deterministic representation: records sorted by entity name then UUID
(ASCII ascending), no duplicate entity/ID. `pageDigest` is lowercase hex SHA-256
of UTF-8 JCS of `{snapshotId,pageIndex,highWater,data}`. `manifestDigest` is SHA-256
of UTF-8 JCS of `{snapshotId,contractVersion:1,highWater,records}` with all ordered
records concatenated, excluding cursors/expiry/digest fields. JCS means RFC 8785,
not arbitrary JSON.stringify property order; preserve strings without hidden
Unicode normalization.[^4] Use a reviewed compatible implementation and official
fixtures before adoption. A digest detects inconsistent bytes; it is not identity
or authorization, and the checker here does not implement/test a JCS library.

Proposed response ceiling is 256 KiB UTF-8 and at most 100 records per page;
choose immutable page boundaries during snapshot materialization, not later live
table queries. A single oversized record is an explicit safe failure, never
silently omitted. Actual account-size/job duration limits need measured policy.
Stage every page in SQLite, verify indexes/count/digests, then swap only the
server mirror and save resumeCursor atomically. Preserve local outbox, active
timer and resource library; reapply pending overlays. Snapshot expiration resets
staging, not local work. Quarantine failed data without logging private payloads.

### 11.2 Privacy jobs, pre-confirmation receipt and lost response

Privacy jobs expose only ID/kind/state/updatedAt and an optional allowlisted
safeErrorCode. EX-22 with a user bearer accepts owned export/deletion jobs only;
a snapshot job uses EX-15. Export URLs are absent from job polling. EX-23 requires
recent auth, owned succeeded unexpired export and an approved destination. It
returns an expiring private URL; HTTPS syntax alone is not a host allowlist.
Do not issue new URLs for a removed/expired account/export or return raw object
storage locators. URL replays keep the original expiry, never silently extend it.

Proposed deletion protocol, requiring security review before implementation:

1. Show the current reviewed consequences (including subscription/local-only/
   backup limits) and perform approved recent authentication.
2. EX-24 creates a server-random challenge ID, reserved deletion job ID and separate
   high-entropy status credential. Bind all to actor/consequences version/expiry.
   Challenge creation neither freezes the account nor starts a deletion job.
3. Return challenge/job IDs, consequences version, challenge expiry and status
   credential/expiry. Persist the credential successfully in the approved secure
   store before enabling final confirmation. Portal keeps it server-side under a
   narrow HttpOnly receipt-session design, never page props/localStorage. Its
   cookie/CSRF/key/TTL configuration remains ADR-011/WP-04, not guessed here.
4. EX-25 accepts the exact challenge and acknowledged version. Recheck recent
   auth/ownership/expiry, then under owner lock consume the challenge, freeze
   account, create the reserved durable job and activate receipt status access in
   one transaction. Return HTTP 202 job state, not "deleted". Confirmation cannot
   select another job, owner or arbitrary receipt scope.
5. If the confirmation response is lost, the client already knows the job ID and
   status credential. It can poll EX-22 without weakening frozen-account checks.
   Before accepted confirmation, that credential returns generic 404 (no job),
   not account data or false success. An unconfirmed/expired/unknown result is
   shown as unknown and follows reviewed recovery, not guessed deletion completion.
6. Credential authorizes only its matching deletion job's coarse status. It cannot
   list jobs, export, cancel, sign in, unfreeze or call any other endpoint. Reject
   a user JWT as a receipt credential or vice versa; no downgrade/fallback from
   a failed JWT check to a less strict generic bearer parser. Ordinary endpoints
   continue to reject frozen/revoked sessions. Job completion follows worker proof.

Status capability hashes, activation state and minimal job receipt must survive
the account-content purge for their approved lifetime; they must not depend on a
cascading owner FK that removes the only receipt. Store a verifier, not plaintext
secret, for routine polling. Idempotent challenge/grant/link responses containing
secrets need a separate encrypted, short-lived response capsule; never copy their
raw JSON into the core mutation_receipts prototype, sync, logs or analytics.
Fresh authorization still applies to replay. After capsule/credential expiry,
return an explicit expired result; do not mint an unbounded replacement from an
old key. Encryption key lifecycle, retention and receipt expiry must be reviewed
together with job runtime/retry/backup policy. No TTL/region or support proof is
invented in this document. A lost local receipt cannot grant account restoration.

### 11.3 App sessions and billing visibility are not provider authority

EX-26 paginates the owned app-session registry by `(createdAt DESC,id DESC)`.
Display a coarse label, active/revoked state, current marker and timestamps; no
raw token, IP address or fingerprint. It is not a complete physical-device list.
EX-27 accepts exactly one of `{scope:one,sessionId}`, `{scope:others}`, `{scope:all}`.
Use approved recent auth and authoritative current-session identity; freeze the
target set in the transaction and atomically revoke those registry rows plus a
durable provider-revocation outbox. Return `revokedCount,currentSessionRevoked,
providerRevocationStatus`. Replays cannot revoke sessions created after the
original request. Already revoked targets do not inflate the count.

If the caller revokes itself/all, subsequent ordinary replay may correctly get
401/403; never create an exception allowing a revoked caller to read data. Clear
its credential locally and truthfully show uncertain provider completion if the
response was lost. Provider revocation retries happen in the durable worker.
Supabase refresh-session revocation does not itself invalidate every already
issued access JWT immediately; app registry checks remain necessary.[^2]

EX-28 returns `{data:{status,checkedAt,catalogVersion,entitlements},meta}`. Current
means a checked owned projection; unavailable uses null metadata/entitlements,
not an empty list or free state. Every grant has explicit capability, scope ID/
type, state, validity, source and provenance, plus a stable app `grantId`.
`licenseId` is an app UUID only when the caller owns a manageable underlying
license; otherwise null (e.g. a sponsoring organisation), not its private receipt/
customer identifier. The portal uses this reference for EX-30; it must not invent
a license ID from the capability name. Personal scopeId is the actor ID; workspace
scopeId requires approved active membership and never exposes unrelated grants.
Null validUntil means only an
explicitly approved non-expiring grant; pending/unknown is not active. Provider
outages do not by themselves expire/revoke rights. This visibility endpoint does
not define an offline grace duration or grant privileged actions from client data.

EX-29 requires `surface:ios|android|web`, an untrusted display hint. Server derives
identity and checks actual catalog/provider eligibility; it must not trust a
client country/price/product mapping. Ready returns reviewed published offers;
unconfigured/unavailable returns null offers and metadata. Known ready empty is
distinct. Prices serialize minor units as canonical decimal strings plus currency,
fractionDigits, provider source and freshness. Currency exponent, display text,
tax/period disclosure and store eligibility need actual provider verification;
the schema's arbitrary synthetic fixture is not a price recommendation.

Billing list/catalog cursors bind owner, surface where relevant, catalog/grant
revision and sort (`grantId ASC` / `offer.id ASC`). A mid-pagination revision returns
CURSOR_EXPIRED; restart and replace the display as a coherent view, not a union
of stale/new grants. Every privileged execution independently checks current
rights in trusted infrastructure; a cached paginated list is never authorization.
EX-30 accepts only an owned licenseId. Destination and return location come from
the reviewed provider adapter/allowlist; block credentials in URL authority,
unexpected ports, scheme-relative targets and unapproved redirect chains.

This is **billing visibility/management**, not checkout, purchase restore or
webhook implementation. Provider callbacks still need raw-body signature checks,
unique event inbox, out-of-order reconciliation, explicit ownership binding and
sandbox transition evidence. Stripe's official webhook documentation illustrates
those delivery/verification issues, not approval of Stripe for Deep Focus.[^5]
No provider, price, age policy, grace period, ad SDK or cloud upload is selected.

### 11.4 Error mapping and implementation admission

In addition to `14`: 401 RECENT_AUTH_REQUIRED means invoke the reviewed re-auth
flow (not repeatedly refresh an otherwise valid token); 409 JOB_NOT_READY means
poll owned status without issuing another job; 410 SNAPSHOT_EXPIRED/CAPABILITY_EXPIRED
means discard only expired staging/credential, preserve user work; 503
POLICY_UNCONFIGURED blocks the dependent operation until real policy is set.
Do not return a provider exception, leak foreign existence or silently turn
these states into success. Recent auth comes from validated provider/server state,
never a client checkbox/timestamp. All private responses remain no-store.

BX-03 must add interrupted batch replay, caught-up polling, initial resume cursor,
mixed entity/ID denial and full snapshot digest cases to BX-T08–12. BX-06/WP-06
must add lost deletion response after freeze, failed credential persistence,
pre-confirmation receipt denial, wrong-job/route credential rejection, encrypted
capsule expiry, current-session revocation and job restore cases to BX-T19–23/
WP-T15–18. BX-07 must exercise unknown rights, catalog revision changes and
unapproved management redirects under BX-T24/WP-T13–14. All are **NOT RUN**.

Before READY: reviewed secret/receipt/recent-auth policies; numeric TTLs and
retention; real durable worker/key adapter; DB migrations and RPC signatures;
response serializers, temporal/ownership checks; real SQLite/gateway/browser/
provider tests. The new JSON shapes do not fill those missing implementation gates.

### 11.5 Saved-plan replication continuation

[27](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md) adds an explicit v2 protocol
under `/v1/replication/v2/...`: seven entities, eighteen command kinds, complete
transaction groups and epoch-bound snapshots. This section's existing v1 six-
entity/fourteen-command JSON stays unchanged. Legacy server cursors/artifacts
still require epoch suppression and upgraded domain cascades before admission.
EX-21–23 retain their request/status/download wire; 27 types only the plans
component, not the full account-export artifact. SQL, policies, worker/revocation
proof and independent review remain required. Earlier API counts are subsets.

[28](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md) subsequently defines the outer JSON
artifact and fourteen section serializers, including explicit inventory/disposition
rules for retained data outside these DTOs. EX-21–23 HTTP shapes do not change.
Contract-scoped export must not be advertised as all stored data; required separate
access paths, real source mapping and delivery/retention policy remain gated.

## Sources

[^1]: Supabase, [Background Tasks](https://supabase.com/docs/guides/functions/background-tasks), accessed 2026-09-16. Background lifetime is bounded; durable job design above is a proposed application mechanism, not a Supabase queue automatically supplied by Edge.
[^2]: Supabase, [Signing out](https://supabase.com/docs/guides/auth/signout), accessed 2026-09-16. Token expiry and sign-out scope must be accounted for; app-session registry is an additional proposed boundary requiring implementation/testing.
[^3]: OpenAPI Initiative, [OpenAPI 3.1.1 Operation Object](https://spec.openapis.org/oas/v3.1.1.html#operation-object), checked 2026-09-18. DELETE body portability limitation; the custom header and normalization above are proposed Deep Focus design, not an OpenAPI-mandated header.
[^4]: RFC Editor, [RFC 8785: JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785), checked 2026-09-18. Informational canonicalization specification; the snapshot layout/hash protocol above is a proposed application design, not an implemented or tested library.
[^5]: Stripe, [Webhooks](https://docs.stripe.com/webhooks), checked 2026-09-18. Provider example for signed payloads, retry/duplicate/out-of-order delivery; no Stripe selection, eligibility or account setup is implied.
