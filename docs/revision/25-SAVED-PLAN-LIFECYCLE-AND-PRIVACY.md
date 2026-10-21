# Saved-plan lifecycle, compatibility and privacy

2026-09-19. **DRAFT / HIGH / REVIEW_PENDING.** This is the next specification
packet after [24](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md), not activation
of a backend, a schema migration or approval of a new release feature.

සිංහල: Save කළ plan එක පසුව edit/archive/delete කරන්න පුළුවන් විදිහත්,
task එකක් delete කළ පසු පරණ plan/export/cache වලින් එය නැවත එළියට නොඑන
විදිහත් මෙහි යෝජනා කරනවා. Plan එක වෙනස් කිරීමෙන් කලින් කළ සැබෑ වැඩ වෙනස්
වෙන්නේ නැහැ. Offline device එකක දත්ත ක්ෂණිකව මකා දැමිය හැකි බව කියන්නේ නැහැ.

## 1. Bounded task and authority

- Outcome: one lifecycle/ownership/compatibility specification with executable
  synthetic examples, before changing any existing wire format.
- Requirement/phase: DF-037, AG-02/03 documentation preparation; approved solo
  work and stack retained. Detailed lifecycle choices below are recommendations.
- Read: root rules, AI rules/execution/DoD/guardrails/task brief/map; 24 in full;
  16 §§3/5/8/11.1–11.2; DATA_MODEL §19, DATABASE_SCHEMA §25, SECURITY §23;
  existing planning checker, playbook/readiness/audit entries and package scripts.
- Inspected current Plan My Day route: transient local preview, fixed 25/5,
  no saved plan repository or backend. No test script in package.json.
- Allowed files: new 25 and `check-plan-lifecycle.mjs`; existing 24, README,
  playbook/readiness/audit/doc checker; canonical data/database/security/testing/
  changelog/map and DoD command list. No schema/OpenAPI changes in this slice.
- Non-goals: app changes, SQL, installs, accounts, providers, TTL/price selection,
  agents, commit/push/deploy. Preserve existing dirty work and `artifacts/`.
- Acceptance PL-A01: state transitions and reminder effects explicit; PL-A02:
  ownership, task deletion and stale-artifact suppression explicit; PL-A03:
  legacy/new sync boundaries and offline conflict rules explicit; PL-A04:
  reference cases pass, runtime gaps and implementation order remain visible.
- Risk HIGH: personal-data lifecycle and cross-device authorization. Independent
  qualified review is required before acceptance/integration and is NOT RUN.
  Rollback concerns only this draft's reviewed hunks, not owner files.

## 2. Three independent version axes

Continuation: [26](26-SAVED-PLAN-MANAGEMENT-WIRE.md) supplies the PL-01 strict
current-plan/read/edit/action/receipt wire and explicitly replaces the initial
read shape discussed below. Its explicit keep/disable timing refinement governs
manual reminder edits. [27](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md) supplies
PL-02's v2 replication/discovery/snapshot and plans-export-component wire. Outer
account-export packaging, real implementation, lifecycle-choice acceptance and
independent review remain pending. The requirements below are not proof of activation.

Do not confuse proposal `contractVersion:2`, a plan's optimistic `version`, and
the replication protocol version. They change for different reasons.

24's `SavedPlan` is the **initial-save/read checkpoint**, not a shape capable of
representing the lifecycle below. Before enabling plans, replace it coherently
with a strict current-plan envelope and update PG-05, proposal apply result,
replication and export serializers together. Do not append unknown fields to
the existing strict DTO or pretend that this prose already changes its schema.

Proposed current record: 24's plan fields plus `version`, `createdAt`,
`updatedAt`, `state:active|archived`, `sourceProposalId`. Initial version is 1;
createdAt/identity/workspace/source provenance never change through normal edits.
Deleted plans are separate minimal tombstones, not invalid empty PlanCreate
objects. No completed/missed/productivity score field belongs on this record.
SourceProposalId is provenance, not permission to fetch expired proposal content.
Store only current plan content by default, not a perpetual plaintext revision
archive. A receipt stores minimal result identity/version, not the old schedule.
Ordinary identity/version receipts still need approved replay-retention rules;
do not persist plaintext intent in a fingerprint field. Hash the canonical intent
under the reviewed receipt design, with privacy policy for retained identifiers.

## 3. Post-save actions and exact side effects

All actions require an active owned account/workspace and expected current
version, except an identical authorized receipt replay. Validate ownership before
receipt lookup; lookup a matching receipt before checking the now-changed version.
Changed intent under an old mutation key conflicts. No-op writes reject rather
than generating new versions. Effective mutations increment once; reject version
overflow. Same ID can never be recreated after deletion.

| Action | Allowed source / result | Reminder and activity effects |
| --- | --- | --- |
| Manual edit | active → active | Exact reviewed schedule replacement; no AI debit, session change or automatic reflow |
| Archive | active → archived | Disable and detach exclusively plan-bound reminders in the same transaction; show this consequence before confirmation |
| Restore | archived → active | Retain schedule instants; do not re-enable reminders, shift old times or restart sessions |
| Delete | active/archived → tombstone | Clear content; disable/detach exclusively plan-bound reminders; never delete real tasks or actual sessions |
| Start block | active, live eligible task | Separate ordinary focus action; does not mutate plan or award planned progress |

Manual edit proposes a complete resulting schedule, not a field-wise merge by
device timestamp. Keep IDs of retained blocks; new blocks use new IDs; block IDs
are never reused for a different kind. Revalidate 24's temporal/break invariants
and current task access. At least one focus block remains; an intentionally empty
plan uses Delete. Window/zone/date changes are allowed only as explicitly reviewed
post-save changes, unlike 24's narrower pre-confirmation revision. Show affected
times and zone before saving. Do not modify an already-running session.

Reminder safety must be explicit in the next strict command shape: unchanged
bindings retain their intent; removing/changing a bound task/time/zone requires
an explicit reviewed detach-and-disable or exact reminder update. Reject an edit
that leaves an enabled reminder inconsistent with its block. Creating/re-enabling
an alert requires fresh ordinary reminder validation, current access and explicit
confirmation, never an implicit consequence of restore. The next wire packet
must bind each reminder action/version to the exact reviewed edit. No implicit
new notifications, no ordinary reminder silently claimed by a plan.

Each bound reminder has at most one owning plan/block. Independent reminders,
including unbound reminders selected in the original AI apply, are unaffected by
archive/delete. This disable-on-archive/delete recommendation needs review and
clear UI copy; it is not an approved notification policy hidden in implementation.
Database commit stores intent only; installation/cancellation on the selected
device happens afterward, retries idempotently and reports failure truthfully.
An offline device may still fire an old scheduled alert until reconciliation.

## 4. Ownership and transaction design

Proposed relational storage separates plan headers and ordered blocks. Every
row carries server-derived owner identity and composite owned foreign keys:
plan/workspace, block/plan, focus/task and optional reminder. Private provenance
also records **all captured context task IDs**, including those not selected as
blocks, so generated explanation copies have a known deletion dependency.
These dependency IDs are not a user-editable owner or arbitrary SQL selector.

Checks include unique `(owner,plan,position)`, `(owner,plan,blockId)`, one exclusive
reminder binding, kind-specific nullable columns and ordered positive intervals.
Cross-row ordering/break/task/reminder checks belong in the trusted domain
transaction; a JSON union or SQL CHECK on one row alone is insufficient.

All direct/sync/AI writers use the same domain helper and owner-head lock order
from 14/16. Within one transaction: authenticate/recheck account → owner head →
receipt and expected versions → owned references → validate → write all affected
plan/reminder rows → append each changed entity → store minimal receipt → commit.
No AI, storage download or native notification call inside that transaction.
Use deterministic subordinate row ordering. Failure rolls back the entire intent;
an unsupported transport must fail before any command runs.

RLS is defense in depth, not the complete mutation boundary. PostgreSQL documents
that table owners normally bypass RLS, as do BYPASSRLS roles. **Design inference:**
restrict grants/RPC execution and test the actual service role as well as ordinary
users; privileged services must explicitly enforce actor/account ownership.
[PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

## 5. Task/reminder deletion and content copies

Task deletion, including a valid legacy-client request, must invoke the same
new domain cascade after plan support exists. Under the owner transaction:

1. Delete/tombstone the task and disable its reminders under the existing contract.
2. Remove every matching focus block and its immediately associated break from
   active **and archived** plans. Keep other intervals unchanged; no reflow.
3. Clear explanation for every plan whose recorded context dependencies include
   that task, even if it was not chosen as a block. Invalidate dependent reviewable
   proposals and generation context; a worker may not publish a stale result.
4. Increment each affected plan once. If no focus blocks remain, replace the plan
   with a content-free tombstone; do not violate the at-least-one-focus invariant.
5. Emit all domain changes and advance the owner's privacy epoch atomically.

Plan deletion likewise advances that epoch and invalidates associated
content-bearing proposal/revision copies, without deleting independently owned
tasks. Ordinary task deletion is not an account-wide erasure request: actual
session history follows its separate approved retention contract. Do not market
this cascade as semantic removal of every mention throughout the account.

Reminder deletion instead clears the matching block binding and increments that
plan version; it does not delete a task or a focus block. A standalone reminder
edit that breaks binding consistency must use the reviewed combined command or
fail; it cannot silently invalidate a plan. Removing a task reference from a
plan does not erase the independently owned task.

Ordinary manually entered prose can contain arbitrary pasted information that no
dependency list can reliably identify. Do not claim semantic erasure of every
mention. Track known generated copies, provide explicit plan deletion/editing,
and apply the reviewed account-wide erasure policy for an account deletion.
Do not retain an old title in a tombstone, receipt, diagnostic log or audit payload.

Large fan-out requires a bounded reviewed implementation or a frozen durable
privacy job. Never report synchronous deletion success after only the first page.
During an unfinished purge affected data and old artifacts are inaccessible;
continuation/recovery must not depend on the deleted task's remaining plaintext.
Numeric limits and retention lifetimes remain policy gates.

## 6. Sync compatibility and offline behavior

Proposed replication **v2** adds plan as a seventh typed entity and its strict
mutation commands. Freeze exact endpoint/header negotiation, DTO unions, cursors,
snapshot digest inputs and command catalog in PL-02 below before enabling it.
This document does not choose an unimplemented HTTP path or modify the existing
six-entity/14-command v1 wire. The five OpenAPI slices still total 52 operations.

Legacy v1 can continue its six-entity projection only if the server explicitly
supports and tests that projection: filter plan-only rows, advance the scan
cursor through them and include related ordinary task/reminder changes. Never
send unknown plan rows to v1 or claim v1 replicated plans. Old task/reminder writes
still run the upgraded domain cascades. Unsupported protocol requests fail closed.
Client capability is compatibility information, not authorization.

The server must bind **legacy opaque cursors and snapshot artifacts** to the same
privacy epoch too, without adding unknown fields to their wire shape. After
invalidation v1 follows its existing SYNC_RESET_REQUIRED/bootstrap path. If the
legacy implementation cannot safely reset/suppress these artifacts, block that
client's sync until upgrade; do not keep an unsafe compatibility fallback.

V2 cursors/snapshots bind owner, protocol, scan position/high-water and privacy
epoch. Do not reuse a v1 cursor for v2. Upgrade installs a fresh v2 snapshot in
staging, checks completeness and swaps the server mirror/cursor atomically while
preserving pending work, active timer and local resources. Local schema upgrades
need backup/rollback and interrupted-migration tests before adoption.

Privacy epoch changes invalidate old cursors, snapshot jobs/pages and pending
materializations. Restart from an authorized sanitized snapshot; do not serve
pre-deletion payloads from an old change log merely because they are immutable.
Check epoch again before publishing a worker result. Future strict errors must
distinguish this reset from an empty dataset or an ordinary list end.

Offline edits remain visible as pending local intent, not a confirmed server
version. Reconnect checks current account/privacy epoch before replay; a tombstone
or privacy reset blocks automatic resurrection. Retain safe draft work for
deliberate conflict resolution, but purge known erased server-derived content and
quarantine dependent stale outbox payloads from automatic replay. Do not copy an
erased title back through a draft. Never apply a foreign account's cache/receipt.
When server version changed, show conflict and allow an explicit fresh edit/key;
do not silently rebase a saved schedule or replay it as new AI generation.

## 7. Export, deletion and retained artifacts

Export includes current active and archived plans with their current metadata,
blocks and provenance reference, using an explicit versioned allowlist. Explain
that planned time is not verified work. Exclude deleted content, raw prompts,
private context/dependency machinery, local resource files/URIs and credentials.
Choose one consistent DB snapshot for all exported entities and its high-water;
not successive ordinary reads that could mix pre-/post-edit plans and tasks.
PostgreSQL Repeatable Read provides a stable transaction snapshot; actual jobs,
retry handling and transaction duration still require implementation tests.
[PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html).

Bind export jobs/artifacts to owner/privacy epoch. Task/plan erasure or account
freeze must deny further access to affected old artifacts, including old snapshot
pages and content-bearing replay capsules. A newly minted download token is not
enough if an earlier storage URL still works: require a revocable download
boundary or demonstrated artifact deletion/revocation. Do not claim that an
already issued signed URL can always be recalled. Final hosting/storage method
and expiry policy remain open; release is blocked without tested suppression.
Define the read/download authorization point relative to the committed erasure
transaction and test that race. Bytes already delivered or in flight cannot be
retracted; epoch checks on a new request alone are not a claim to revoke them.

Account deletion freezes new reads/writes/jobs, purges all plan rows/blocks,
dependency links, generation content, snapshots/exports and account-scoped caches
under 16's reviewed job order. Minimal suppression/receipt records have separate
approved purpose/retention; they cannot preserve erased content. Apply deletion
suppression before restoring traffic from backups. No instant erasure promise
for disconnected devices, user-downloaded exports or external provider retention.

## 8. Dependency-safe implementation packets

All cards below remain **DRAFT / NOT_READY**, not permission to implement now.

| Card | Single outcome | Required evidence before acceptance |
| --- | --- | --- |
| PL-01 | Strict current-plan/read/edit/archive/restore/delete DTOs and exact reminder-action preview | Reconcile PG-05/24; positive/negative shapes, conflict/no-op/idempotency fixtures; reviewed lifecycle choice |
| PL-02 | V2 sync/snapshot/export wire and legacy projection contract | Version negotiation, epoch reset, seven-entity unions, command mapping/digests; reject unsupported protocol before writes |
| PL-03 | Owned plan SQL/RPC/cascade and privacy suppression in isolated database | Two-owner/service-role/RLS tests, concurrency/rollback/fan-out, stale-worker/read/export suppression; approved retention and independent review |
| PL-04 | Local repository/outbox migration and editable Plan UI | Atomic snapshot install, account switch/crash/conflict/privacy reset, accessibility and native reminder reconciliation on devices |
| PL-05 | Capability activation and recovery rehearsal | All dependencies accepted, provider/consent/duration gates closed, mixed-version/restore/delete end-to-end evidence |

Do PL-01 then PL-02 before drafting executable SQL. Do not rewrite v1 shapes to
make a counter look complete. Provider/AI work is not required for ordinary manual
task/focus use. Conditional AI families remain separate admission decisions.

[29](29-PLAN-DATABASE-RPC-TEST-PACKET.md) decomposes PL-03 into seven ordered
implementation/review cards with 24 future DB cases and explicit foundation,
actor/role, policy and independent-review gates. It is a specification, not proof
that this PL-03 outcome is implemented or accepted. PL-04 cannot skip those gates.

[30](30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md) now specifies PL-04's local
mirror/draft/outbox separation, account fences, editor recovery and device-reminder
reconciliation. Its six draft cards and twenty NOT_RUN cases do not activate plans
or bypass the server, local privacy-policy and independent-review prerequisites.

[31](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md) supplies PL-05's admission, pause,
containment and recovery evidence draft. This completes draft coverage of the five
packets above; it does not mark any card READY, implemented, accepted or released.

## 9. Evidence limits and runtime acceptance

[Reference checker](check-plan-lifecycle.mjs) exercises a tiny synthetic model:
state transitions, version/replay ordering, task/block/explanation erasure,
epoch-based artifact suppression and legacy feed projection. It is not shared
production code, wire validation, SQL, authorization or a concurrency proof.

| Case | Future real-system observation — all NOT RUN |
| --- | --- |
| PL-T01 | Foreign plan/task/reminder/workspace and service-role bypass attempts denied |
| PL-T02 | Same-key retry after edit/delete returns minimal receipt; changed intent/stale new key rejected |
| PL-T03 | Concurrent edit/task deletion/AI apply has one valid serialized result and no resurrection |
| PL-T04 | Archive/delete disables only bound reminders; restore never re-enables or shifts time |
| PL-T05 | Context-only task deletion clears generated copies; last focus removal yields tombstone |
| PL-T06 | Old feed, materialized snapshot, export URL and late worker cannot return erased content after invalidation |
| PL-T07 | Legacy client deletion runs new cascade; v1 skips only declared unsupported entities, cursor advances |
| PL-T08 | V1-to-v2 upgrade and crash retain outbox/timer/resources; no mixed-version cursor |
| PL-T09 | Offline stale edits after erasure cannot recreate data; foreign-account caches never display |
| PL-T10 | Account freeze and backup restore prevent plan/proposal/export resurrection |
| PL-T11 | Mid-cascade failure rolls back; large fan-out remains inaccessible until durable completion |
| PL-T12 | DST/late plan edits, accessible consequences and OS cancellation failure remain truthful |

Research checked 2026-09-19. Cited database behavior supports the design, not a
claim that PostgreSQL alone supplies these application-specific guarantees.
