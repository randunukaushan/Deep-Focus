# Plan replication, snapshot and export wire — PL-02

2026-09-20. **DRAFT / HIGH / REVIEW_PENDING.** Solo document preparation.
This extends [25](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md) and
[26](26-SAVED-PLAN-MANAGEMENT-WIRE.md), without executing SQL or modifying the app.

Continuation: [28](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md) now supplies the outer
account-export envelope and fourteen sections. Its coverage/source-mapping and
delivery gates remain pending; this document's plans-component schema is unchanged.

සිංහල: Sync අතරමඟ නැවතුණත් plan/reminders අඩක් වෙනස් වූ තත්ත්වයක් පෙන්වන්නේ
නැහැ. Delete කළ දත්ත පරණ snapshot/export එකකින් නැවත නොගන්න recovery නීතිත්,
offline වැඩ අහෝසි නොකර අලුත් snapshot එකක් ගන්න විදිහත් මෙහි විස්තර කරනවා.

## 1. Task brief and boundaries

- Outcome: PL-02 typed seven-entity replication, grouped pull, snapshot bootstrap,
  plan discovery and the plans section of account export; no production activation.
- Read: root/AI rules, execution/DoD/guardrails/map/task brief; 16 §§5/8/11.1–11.2,
  25 §§6–8, 26's command/receipt and remaining boundary; selected API/data/database/
  security/testing sections and current operations/extension/planning DTOs.
- Inspected: dirty work, package scripts and current transient Plan My Day route.
  No backend or saved-plan repository exists merely because these docs do.
- Approved direction: solo docs, existing Supabase/Expo/Next selections and local
  resource defaults. Replication details are proposed, not new owner approvals.
- Allowed: new 27, replication-v2 schema/OpenAPI/checker; doc checker/DoD;
  revision 16/25/26/README/07/18/09; canonical API/data/database/security/testing/
  changelog/map. Existing v1 JSON schemas and API paths remain unchanged.
- Non-goals: agents, app/package/SQL/provider edits, uploads, accounts, spending,
  commit/push/deploy, numeric retention or automatic migration. Preserve owner work.
- RP-A01: strict v1/v2 separation and shared domain intent; RP-A02: atomic grouped
  pull/snapshot and privacy-epoch reset; RP-A03: typed plan discovery/export with
  honest exclusions; RP-A04: fixtures/refs/routing checks with runtime gaps recorded.
- HIGH because replicas and retained artifacts contain personal data. Independent
  qualified review is pending before acceptance/integration. Rollback only this
  draft's own reviewed hunks. All implementation cards remain NOT_READY.

Artifacts: [DTOs](contracts/replication-v2.schema.json),
[six-operation API](contracts/replication-v2.openapi.json),
[read-only checker](check-replication-v2.mjs). Seven API files total **60 unique
operations**. Older 54/52/47 counts remain their named subsets, not all APIs.

## 2. Version boundary and authorization

New routes use `/v1/replication/v2/...`. V2 is the replication protocol, not a
wholesale `/v2` product API. Existing `/v1/sync/...` remains v1: six entities and
fourteen command kinds. Never add a plan payload to that strict union or silently
downgrade a client. New snapshot creation explicitly sends `{contractVersion:2}`;
push includes contractVersion 2. Successful new responses identify protocol 2.

Every operation requires active owned UserBearer/app-session authorization, private/
no-store success/errors, normal rate limits and the trusted browser boundary.
No owner selector. Opaque cursors bind actor, protocol, endpoint, privacy epoch,
position/filter and fixed high-water where relevant; clients never mint them.
Version numbers/epochs are compatibility/freshness evidence, never access grants.

`privacyEpoch` is a positive canonical decimal string within signed bigint range;
highWater/sequence are nonnegative canonical decimal strings in that range.
Compare with BigInt, not Number. Epoch starts at 1, advances under the owner-head
transaction on the erasure events in 25 and never wraps. Initial current epoch
comes from authenticated snapshot creation/status, not an unauthenticated counter.

Legacy cursors/artifacts also bind the server-side epoch without extra v1 fields.
V1 scans past private/plan-only records, advances its scan cursor, and still emits
ordinary task/reminder changes. Legacy mutations run upgraded domain cascades.
If old clients cannot reset safely, deny sync until upgrade; no unsafe fallback.
Deploy/migration/capability admission must establish these controls first.

## 3. Six exact operations

Paths below are relative to `/v1`. UUID Idempotency-Key is required for the two
POST operations. GET has no body. Only declared query keys are accepted; repeated
keys reject. Query integers use one canonical positive decimal value, not parseInt
prefix coercion. Defaults below are proposed existing paging conventions.

| ID | Operation | Request / result |
| --- | --- | --- |
| RP-01 | `POST /replication/v2/push` | PushInput → 200 PushResponse |
| RP-02 | `GET /replication/v2/pull` | cursor required; limit 1–100 groups, default 50 → 200 PullResponse |
| RP-03 | `POST /replication/v2/snapshots` | SnapshotCreate → 202 SnapshotAccepted |
| RP-04 | `GET /replication/v2/snapshots/{id}` | Owned job → 200 SnapshotStatus |
| RP-05 | `GET /replication/v2/snapshots/{id}/pages` | Bound cursor required → 200 SnapshotPage |
| RP-06 | `GET /plans` | state active/archived/all default active; cursor optional, limit 1–100 default 50; Plan-Contract-Version:2 → 200 PlanList |

Use shared safe errors: 400 VALIDATION_FAILED for format/version/query, 401
AUTH_REQUIRED, 403 ACCESS_DENIED, 404 NOT_FOUND for inaccessible jobs, 409 domain
version/intent/state conflicts, 410 SYNC_RESET_REQUIRED for expired/mismatched
replication cursors or epoch, 410 SNAPSHOT_EXPIRED for expired snapshots,
410 CURSOR_EXPIRED for list pagination, 429 RATE_LIMITED, 503 POLICY_UNCONFIGURED/
DEPENDENCY_UNAVAILABLE. Errors do not echo personal content or foreign references.
An unsupported v2 service must stay unavailable, not return a v1-shaped success.

## 4. Push: eighteen commands, same receipts

PushInput is `{contractVersion:2,privacyEpoch,items}`; 1–25 items, <=64 KiB UTF-8.
Each item retains `{mutationId,command,targetId,body}`. Fourteen existing command
shapes are reused unchanged, plus plan.edit/archive/restore/delete. No plan.create
command: initial plan save remains exact confirmed AI apply; no silent manual
create admission. No rewards/billing/resources/owner-setting commands.

plan.edit body is 26's PlanEditInput, plan.id equals targetId. Other plan bodies
are PlanActionInput, whose action must exactly match the command suffix. Reuse
the same normalized domain command/key/target/payload and receipt as direct API;
replication protocol, epoch and batch key are not part of domain intent hashes.
The batch Idempotency-Key identifies the envelope, never substitutes for item IDs.

Validate the whole shape/duplicate IDs/create-target consistency before any item.
Authenticate and verify epoch, then execute ordered one-transaction-per-item
domain commands. A batch 200 is not a promise every item succeeded. One outcome
per input, same order/IDs/command/target. Legacy commands use their existing
SyncOutcome; plan success uses `{mutationId,command,targetId,status,receipt}` with
26's minimal MutationReceipt, not a fabricated receiptId. Plan failures carry
safe code/status only (retryable may include retryAfterSeconds).

Epoch stale before batch: 410 and no processing. Recheck before each item. If a
successful deletion advances epoch, retain already committed outcomes and mark
remaining items retryable/SYNC_RESET_REQUIRED without executing them. Return the
current epoch; complete reset/review before resubmission. Frozen/revoked accounts
deny further processing under 16; uncertain/lost responses recover original item
keys, not blind new keys. A new envelope after authorized resync may have a new
batch key/epoch, but unchanged domain intent retains its original item key.
Quarantine erased/stale dependent drafts; no automatic resurrection through outbox.

## 5. Pull: complete transaction groups, never half a plan

V2 SnapshotRecord is v1's six-entity union plus `{entity:plan,entityId,version,
payload:SavedPlan}`. Reminders remain separate entities, not duplicated in plan
payload. SyncChange adds plan upsert and plan delete with null payload. Identity/
version equality is mandatory; deleted text is never carried in a tombstone.

PullResponse data is **transaction groups**, not the old flat change list:
`{transactionId,committedThrough,changeCount,groupDigest,changes}`. Changes are strictly increasing by
sequence; group commit boundaries strictly increase, all <= fixed highWater H.
First change is after the previous group boundary, last <= own committedThrough;
internal filtered rows can create gaps. A group contains every public change from
that owner transaction, including plan/reminder side effects. Stable UUID group
identity and durable commit boundary must be stored by **all writers**, including
AI apply and legacy mutation routes. This is a new migration requirement, not
information that clients can infer from contiguous numbers.

Store the public change count and digest commitment for each transaction, not a
count invented after pagination. changeCount equals the returned full changes
length; groupDigest is SHA-256/JCS of `{contractVersion:2,privacyEpoch,transactionId,
committedThrough,changes}`. Verify it before apply. This detects omission/corruption
relative to the trusted commitment, not a malicious server or authorization flaw.

Never split a group across pages. Draft ceiling: 100 groups, 500 total public
changes and 256 KiB per response; the requested limit bounds group count only.
If next complete group exceeds remaining space, finish at the previous group.
If one group exceeds hard ceilings, return SYNC_RESET_REQUIRED and bootstrap a
current sanitized snapshot; never omit or split that transaction. Large fan-out
still needs bounded jobs and tests under 25, not an unlimited HTTP transaction.

Meta is `{contractVersion:2,privacyEpoch,highWater,nextCursor,caughtUp}`.
nextCursor is nonempty even at caughtUp; then it represents after H. Empty caught-up
pages still advance through filtered rows. While not caught up, H/epoch remain
fixed. On next caught-up poll capture a new H at a committed owner boundary.
Atomic local page commit installs **whole groups plus cursor**; the UI reads only
committed state. Validate final referenced tasks/reminders after each group,
not between a plan row and its companion rows. An older/equal entity version
may be ignored only when not contradicting trusted current state; equal version
with different content is an integrity failure, not a last-write-wins merge.

## 6. Snapshot and offline reset

Acceptance response carries job, contractVersion 2 and epoch. A succeeded status
has non-null SnapshotMeta; other states have null snapshot. Bind jobs to epoch at
acceptance; stale jobs cannot publish after erasure. Metadata adds privacyEpoch
to the existing highWater/creation/expiry/count/digests/firstPageCursor/resumeCursor.
IDs, epoch and H must match every page. Capture/materialize all seven entity kinds
and H in **one consistent database snapshot**; not successive live reads.

Sort records by entity then UUID ASCII, unique entity/ID. Include active and
archived plans, exclude tombstones and deleted rows. Empty mirror has one empty
page. Pages have <=100 records/256 KiB, fixed pageCount and zero-based pageIndex;
only final page has null nextCursor. No body-size or record omission as a fallback.

V2 digest preimages (SHA-256 of UTF-8 RFC 8785 JCS, lowercase hex):

- Page: `{contractVersion:2,privacyEpoch,snapshotId,pageIndex,highWater,data}`.
- Manifest: `{contractVersion:2,privacyEpoch,snapshotId,highWater,records}` with
  all ordered records concatenated; excludes cursors, timestamps and digest fields.

Digest is integrity evidence, not authorization/signature. Do not substitute
ordinary JSON.stringify or silently normalize Unicode. Select/test a reviewed JCS
implementation with official vectors in PL-03; this packet installs no library.

Stage all verified pages, validate complete cross-entity plan bindings, then swap
the server mirror and save resumeCursor/epoch atomically. Preserve local resources,
active timer and safe pending work. Snapshot pagination expiration resets staging,
not user files. Account change quarantines the old partition. Privacy reset purges
known erased server copies and blocks dependent stale intents, while preserving
unrelated local work for explicit reconciliation; it is not a blanket device wipe.
Before install, re-read authenticated RP-04 status and require the same succeeded
job/epoch/metadata; failure leaves staging uninstalled. Servers check current
authorization/epoch before publish/download. This is not a distributed lock:
erasure can occur after a response is issued, so the next authenticated pull/reset
must invalidate stale local state. Offline devices cannot prove freshness while
disconnected; mark cached state and do not claim remote erasure happened there.
Traffic/restore suppression follows 25.

## 7. Plan discovery and account-export component

GET /plans returns SavedPlan summaries as full bounded records, **without**
bound-reminder details. Sort `(createdAt DESC,id DESC)`, filter current state;
cursor binds actor/filter/sort/epoch. Live edits/archive can change membership:
deduplicate IDs and refresh after mutations. Use snapshot for complete replication,
never assume a live list is an immutable account dump. Read PG-05 again before
reviewing exact reminder actions. Null nextCursor means list end only, not sync end.

Existing EX-21/22/23 export job/status/download requests remain unchanged. Once
plans are admitted, own_account_data must include a versioned `plans` component
whose value is ExportPlansSection `{manifest,pages}`. This is **only the plans
section**, not a replacement claiming to serialize every account-data family.
The outer packaging/other sections are now drafted in continuation 28. Its source
coverage, operational size limits and delivery proof still gate production export.

Manifest fields: contractVersion 2, section plans, exportJobId, snapshotAt,
highWater, privacyEpoch, planCount, pageCount, manifestDigest. Pages are
`{pageIndex,plans:SavedPlan[],pageDigest}`, <=100 plans each, one empty page for
zero plans. Order all plans by UUID ASCII; unique IDs, complete sequential pages,
planCount equals total, pageCount exact. Include active/archived only. Bound
reminders belong in the export's reminder section at the **same snapshot**, not
their live values later. Record included/excluded families in the outer manifest.

Export digest preimages:

- Page: `{contractVersion:2,section:plans,exportJobId,privacyEpoch,highWater,pageIndex,plans}`.
- Manifest: `{contractVersion:2,section:plans,exportJobId,snapshotAt,privacyEpoch,highWater,plans}`
  with all ordered plans; no page boundaries or digest fields.

Excludes raw AI input, private dependency machinery, local URIs/resource bytes,
credentials and deleted content. This does not supply teaching material or enable
paid cloud storage. Export jobs/artifacts/download authorization bind to epoch;
delete invalidates old access and stale workers. Tested revocable delivery or
artifact suppression is mandatory; already delivered bytes cannot be recalled.
Retention, real download mechanism and 28's source-coverage checks remain gates.

## 8. Verification and next implementation boundary

This checker validates strict shapes/references/API inventory and small synthetic
epoch/group/page/export examples. It is not a server, SQLite migration, real
authentication, cryptographic JCS, transaction race, download revocation or
independent security test. Production activation remains blocked by those proofs.

| Case | Future runtime acceptance — all NOT RUN |
| --- | --- |
| RP-T01 | Foreign/revoked/frozen actor cannot read or push any replica/export |
| RP-T02 | V1 rejects plan commands, v2 preserves exact 18-command mapping and direct receipt replay |
| RP-T03 | Mid-batch epoch change stops remaining writes without losing earlier receipts |
| RP-T04 | Plan/reminder group spans requested limit but is never partially displayed |
| RP-T05 | Oversized group resets to complete snapshot instead of losing changes |
| RP-T06 | Crash at every snapshot/page swap stage preserves outbox/timer/local resources |
| RP-T07 | Concurrent erase invalidates v1/v2 cursor, materialized snapshot, export and late worker |
| RP-T08 | Cross-page bindings and digest/order/count failures prevent mirror install |
| RP-T09 | Bigint values beyond Number precision remain ordered and never wrap |
| RP-T10 | List archive/edit pagination has documented live semantics, no hidden duplicates |
| RP-T11 | Export includes archived plans at consistent H, excludes deleted/local-only data |
| RP-T12 | Restore/deletion suppression and account-switch isolation prevent resurrection |

At this checkpoint the outer artifact was next; continuation 28 supplies that draft.
Next specify PL-03's isolated SQL/RPC/migration test packet with owner-head/group/
epoch storage and policy prerequisites. Review PL-01/02 before execution/integration;
the outer artifact does not prove all retained families have implemented access paths.
Do not run migrations, activate providers or claim independent review from this draft.

Research checked 2026-09-20: PostgreSQL Repeatable Read supplies a stable transaction
snapshot; application locks/metadata/workers still need proof. JCS defines
deterministic JSON serialization and preserves string data; these exact domain-
separated preimages are our design, not database guarantees.
[PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html),
[RFC 8785](https://www.rfc-editor.org/rfc/rfc8785).
