# Mobile saved-plan storage, outbox and editor recovery — PL-04

Started 2026-09-20; completed document checks 2026-09-21.
**DRAFT / HIGH / REVIEW_PENDING.** Specification only; no mobile,
backend, dependency or database implementation. All device acceptance is NOT_RUN.

සිංහල: මෙහි “මේ device එකේ තබාගත් draft”, “sync කිරීමට බලා සිටින වෙනස” සහ
“server එක පිළිගත් වෙනස” වෙන් කරනවා. App එක වැසුණත් කළ වැඩ නැවත ගන්නත්,
වෙන account එකකට දත්ත නොපෙනෙන්නත්, conflict එකකදී user නොදැන වෙනස්කම්
overwrite නොවෙන්නත් නීති දක්වා ඇත. මේවා Luna සඳහා කුඩා වැඩ කොටස් හයකි;
මේ ලියවිල්ල සම්පූර්ණ වීම app එක implement/test කළ බවක් නොවේ.

## 1. Bounded task brief

- Outcome: PL-04 local persistence/outbox/editor recovery specification compatible
  with [25](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md),
  [26](26-SAVED-PLAN-MANAGEMENT-WIRE.md) and
  [27](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md).
- Authority: DF-037; September 15 ADR-012 SQLite/SecureStore selection and approved
  five-tab direction in the decision register. Exact adapters/policies below are
  proposals. Solo documentation continuation, not permission to implement PL-04.
- Read: AI rules/execution/DoD/guardrails/map/task brief; 25–27; 29 foundations and
  gates; 13 §§6–7, 15 §§1–2, 16 §4 and §8 lifecycle/sign-out; DATA_MODEL §§15/19,
  SECURITY §11, testing command preface, playbook §§1–4 and plan entry boundary.
- Inspected: package scripts/dependencies, task-storage.ts and Plan My Day route;
  HEAD a6a481e, dirty docs and two pre-existing Home/theme edits preserved. Current
  task JSON adapter swallows write errors and maps read errors to empty; current
  plan preview is transient. Neither is proof of durable saved-plan support.
- Allowed files: new revision 30, contracts/mobile-plan-recovery.json and
  check-mobile-plan-recovery.mjs; revision README/07/09/18/25/29/check-docs;
  docs/DOCUMENTATION_MAP.md, ai/DEFINITION_OF_DONE.md, DATA_MODEL.md, SECURITY.md,
  TESTING_STRATEGY.md and CHANGELOG.md. No other files authorized by this slice.
- Acceptance MP-A01: storage/identity/migration boundaries; MP-A02: immutable
  intent and honest recovery states; MP-A03: editor/notification/failure cases;
  MP-A04: reference checks, dependency cards and outstanding evidence explicit.
- HIGH: local private data, replay and deletion. Independent qualified review
  required before acceptance/integration; solo author checks cannot satisfy it.
- Non-goals: code, SQL, installs, new routes/wire shapes, manual plan.create,
  web timer, cloud resource upload, policy amounts, agents, spending or deployment.
- Verification: read-only checkers via installed Node, syntax/diff/link checks;
  MP-T01–20 below remain NOT_RUN. Rollback only this slice's own document hunks.
  Stop affected implementation for conflicting authority, unsafe recovery or leaks.

The [reference state map](contracts/mobile-plan-recovery.json) and
[checker](check-mobile-plan-recovery.mjs) illustrate command-state guards only.
They are not a repository adapter, durable transaction or proof of crash safety.
API inventory remains 60 operations; v1/v2 wire contracts are unchanged.

## 2. Storage ownership and minimum local records

Resolve an authenticated account partition through the session layer, never route
parameters. Partition by environment/backend project + account + workspace where
applicable; protocol and local schema versions are separate metadata. A transient
session-generation fence invalidates async callbacks after sign-out/switch. It is
not the server privacyEpoch, access authority or a new public API field.

| Logical record | Stored responsibility / boundary |
| --- | --- |
| Server mirror | Seven v2 entity types, committed versions, content-free tombstones and one coherent cursor/epoch/high-water; no optimistic version increments |
| Editor draft | Owner partition, plan ID, base plan/task/reminder versions, local revision, complete proposed edit, known dependencies and captured epoch; device-local, not confirmed or uploaded automatically |
| Frozen outbox item | Stable mutation UUID, command/target, exact reviewed 26 body, base epoch, state and durable attempt marker; no tokens; same identity as direct Idempotency-Key or v2 item mutationId |
| Minimal receipt | Typed 26 receipt and matching command identity; no old schedule/title copied into it; acknowledgement does not replace mirror state |
| Snapshot staging | Job/epoch/H, verified pages/count/digests and resume cursor; invisible until complete atomic install |
| Device reminder projection | Selected-device binding, desired confirmed reminder version, OS install ID, reconciliation status/error; separate from server intent |
| Identity/migration metadata | Account fence, schema version, import mapping/checkpoint, reset fence and evidence of committed migration; no guessed ownership |

An optimistic display is derived from mirror + pending intent with a visible badge,
not another authoritative plan. Keep receipts/status and wire payloads distinct.
Store only necessary base data for review, not perpetual plaintext edit history.
Do not persist access/refresh/deletion-status credentials in SQLite, outbox, routes,
logs or fixtures. SecureStore handles credentials under the reviewed auth adapter.
Selecting SQLite does not establish encryption or backup privacy; MP-G02 remains.

Mirror replacement must not delete task/session pending work, active timer state,
local resource bytes/URIs, personal phrases or drafts. Those have separate owners
and lifecycles. Resource metadata/files are not smuggled into generic sync or AI.
Ownerless legacy tasks do not automatically belong to whoever logs in next.

## 3. Local transaction and migration boundaries

Repository results distinguish found, empty and failed; only verified empty data
permits the empty state. Disk-full/corruption/locked-database errors cannot return
empty or “Saved”. A failed draft write preserves available in-memory text, exposes
Retry and warns before leaving; it cannot promise recovery after process death.

Use one serialized repository writer per partition. Proposed native adapter uses
Expo SQLite exclusive async transactions and the supplied transaction object for
every participating query; no network or OS calls inside. Parameter-bind user data.
Test concurrent writer/locked-database handling, foreign-key configuration and
rollback explicitly. Do not assume an async callback alone isolates queries.
The selected mobile approach is not a web-storage implementation. See §10 sources.

Atomic units: draft revision; draft confirmation plus one immutable outbox insert;
attempt marker before network; receipt/status record; whole pull page plus cursor;
complete snapshot mirror swap plus cursor/epoch; migration plus version marker.
Notify views only after commit. A receipt arriving while local storage fails leaves
the item uncertain locally; retry the same key to recover, never report durable sync.

Follow [13 §7](13-CORE-RELIABILITY-CONTRACTS.md) for legacy JSON: inventory complete
files including tasks/goals/history, preserve originals, distinguish corruption,
map non-UUID IDs once and obtain explicit owner disposition before import/upload.
No persisted saved plans exist in the inspected preview. Do not invent them from
screenshots or migrate preview state as an already confirmed cloud plan.

Migration preflight verifies compatible binary/schema, capacity and approved local
backup/recovery scope without uploading. Validate all source counts, IDs and
relations before switching reads. Crash/resume must not duplicate IDs or data.
After new-schema writes, old-file restoration is not a safe automatic rollback;
stop writes and use reviewed forward repair. Unsupported downgrade opens a recovery
screen, not a fresh empty database. Never advise uninstall/reset to fix unsynced work.

## 4. Frozen command lifecycle and reconnect

One unsettled command per plan is the proposed initial limit. Users may continue
editing a separate draft, but cannot enqueue a dependent command against a guessed
future version. Existing ordinary task commands keep their own domain ordering.
Unsynced dependencies must settle before plan confirmation; do not invent server
versions or atomically promise a mixed-command batch.

| State | Meaning / next safe action |
| --- | --- |
| queued | Local commit succeeded, no send attempt; Cancel may atomically win against dispatcher |
| in_flight | Attempt marker committed before network; frozen intent/key cannot be edited |
| unknown | Crash/response loss; may already have committed; recover identical intent/key |
| acknowledged | Matching receipt persisted; server committed once, current state still needs reconciliation |
| settled | Receipt plus authoritative mirror reconciliation observed; OS alert status still separate |
| needs_review | Definite conflict; refresh permitted current data, deliberate fresh preview/confirmation |
| rejected | Definite validation/state rejection; no automatic resend with altered values |
| cancelled | Only a never-attempted queued command; no server undo implied |
| privacy_blocked | Reset/erasure dependency unsafe; no automatic replay or old-content display |

Auth pause and reset fence are orthogonal partition gates, not rewritten intent.
Persist queue cancellation/dispatch as compare-and-set in the same local writer.
Crash after marking attempted but before sending still becomes unknown: exact-key
recovery is safe, pretending the command definitely never left is not. The reference
map rejects cancellation after attempted even if no response arrived.

Reconnect: validate account/session → pull to caught-up or bootstrap/reset as 27
requires → classify privacy/dependency changes → dispatch eligible frozen intents.
Do not silently update expectedVersion, time, reminder lists or IDs. A race after
refresh still relies on server atomic validation. Network retries retain item key;
new v2 envelopes after valid reset may use new batch keys per 27. Batch 200 means
inspect every outcome, not “all synced”. Concurrent dispatchers use one durable
claim; timeout does not justify overlapping new-key execution.

| Failure | Local action |
| --- | --- |
| Transport loss/crash/malformed success | Unknown outcome; keep attempted intent, do not trust partial receipt or fabricate versions |
| 401 / revoked or frozen 403 | Pause remote work; hide/quarantine affected private account views under auth policy; re-auth does not change command owner |
| 400 validation / definite invalid transition | Stop automatic retry; retain safe draft for explicit correction with fresh confirmation |
| 404 / ENTITY_DELETED | Hide unavailable target; reconcile tombstone/reset; never reconstruct it from outbox |
| VERSION_CONFLICT | Needs review; exact current read + reminder effects; no last-write-wins or silent rebase |
| IDEMPOTENCY_CONFLICT | Stop affected item, inspect redacted identity/fingerprint mismatch; not a convenient new-key retry |
| SYNC_RESET_REQUIRED / snapshot expiry | Fence dispatch; reset/revalidate using 27; expired staging is replaceable, local work is not |
| 429 / 503 | Preserve identity; bounded reviewed backoff/Retry-After; missing policy is not success |

Never infer definitive failure from a failed retry when an earlier attempt is still
unresolved. Expired replay evidence must use the reviewed recovery policy, not new
IDs. Persist minimal unresolved status until safe disposition; numeric lifetime is
open. Only fresh explicit confirmation creates a changed intent with a new key.

## 5. Receipt, mirror and privacy-reset recovery

A receipt is not current plan content. Fetch PG-05 under 26 for an up-to-date owned
review envelope; it cannot advance a global sync cursor or manufacture companion
entity versions. Keep that read view separate from the coherent mirror until pull
or snapshot reconciles it. After acknowledgement, reconcile through at least the
receipt watermark, or an authorized newer snapshot/reset; the plan may have changed
or been deleted since. Show that current outcome, not the old submitted schedule.

Pull validates complete groups, digest/count, decimal-string bigint order and final
references before atomic page/cursor commit. Same-version different-content is an
integrity failure. Network downloads happen outside local transactions. Snapshot
staging verifies all pages and cross-entity relations, then authenticated RP-04
revalidation immediately before install; one local commit swaps mirror/cursor/epoch.
A snapshot older than already installed same-epoch progress cannot roll it backward.
Recheck local account-generation and reset fences inside the installation boundary.
No install while offline just because old pages and an old success status exist.

On a privacy reset, hide stale server-derived plan content and disable dispatch
before downloading. Local drafts/outbox can contain known erased copies too. The
client has no private server provenance list: when safety cannot be determined,
quarantine affected old-epoch content rather than claiming it is unrelated. Fresh
sanitized mirror and approved reconciliation identify safe surviving references;
they do not justify copying old generated explanations back. Purge known erased
payload copies; preserve only minimal unresolved command identity/receipt evidence
under policy. A purged payload is never reconstructed merely to retry a key.
Safe unrelated local work remains available for deliberate reconciliation, not
automatic account-wide upload. This is not semantic erasure of every manual phrase.

Sign-out/switch closes the partition, clears private navigation/read caches,
invalidates callback generation and fences pending dispatch; delayed A responses
cannot render or write into B, including A→B→A with the same account ID. Timer
ownership never transfers. Preserve permitted recovery under 13/15, not B's view
of A's task/title. Credentials follow sign-out rules; discard/retain unsynced data,
backup cleanup and account-deletion purge follow separately approved policy.
An offline device cannot instantly learn about remote erasure; label cached state.

## 6. Editor, navigation and accessible outcomes

Use approved Plan tab and existing planning destination from 15; no sixth tab or
new route contract. The proposed local list offers active/archived and explicit
pending badges. Details/edit/actions must validate partition + ID before content.
Unsupported backend/capability explains saved-plan unavailability, while ordinary
tasks and focus remain usable without AI. Do not label transient preview “saved”.

Editor: load owned current/cached plan with bound reminders → edit local draft →
validate whole schedule → review complete result, timezone and four reminder action
lists → confirm exact revision → persist frozen outbox → report pending/committed
honestly. Offline cached editing is permitted as local intent, not current-server
truth. Missing dependencies require online refresh before confirmation. Background
refresh never replaces typed edits; mark base changed and offer review/discard.
Draft autosave is not confirmation to sync. Back offers keep verified local draft,
discard draft or stay; never silently delete or submit. Interrupted memory-only
changes are not guaranteed preserved, and the UI must say so on save failure.

Archive/delete preview exact bound alerts affected; restore preserves old instants
without new alerts. Conflict review shows accessible field/time/action differences
only for safe current content. Deleted/quarantined targets offer a safe parent,
not “restore from draft”. No automatic time shifting for missed blocks or DST;
ambiguous/nonexistent local times need explicit valid instant selection. Block Start
uses ordinary session rules and current locally eligible task, not planned XP or
an invented plan-to-session reward link. Active sessions are never edited by plans.

All status/error/confirmation controls support screen readers, dynamic text,
Sinhala/Tamil/English layouts as admitted, reduced motion and non-color labels.
Reordering needs buttons/accessible actions, not drag-only interaction. Announce
meaningful save/conflict transitions, not repeated polling. Restore focus to the
relevant control after dialogs; no destructive default, pressure or focus-time ads.

## 7. Native reminder reconciliation — separate acceptance

Server intent committed is not OS alert installed or delivered. Only the explicitly
selected device from 16 §4 schedules after permission. A newly confirmed offline
edit waits for authoritative reconciliation before installing new/retimed alerts;
no hidden schedule from an optimistic overlay. Pending archive/delete must warn
that existing alerts may still fire; early local suppression is a separate unapproved
policy, not silently introduced here. Reconcile on login/foreground/permission and
confirmed intent changes. Local sign-out/switch must reconcile old-account alerts
under the approved privacy policy; failed cancellation must remain visible.

Proposed adapter persists desired version and per-install identity, enumerates OS
schedules to reconcile a crash between scheduling and storing the OS result, and
uses an opaque partition-scoped installation token, not task text or credentials,
to recognize its own registrations. Cancel obsolete/duplicate owned plan alerts
before replacement; do not cancel every app notification and break focus timers.
Late adapter results obey account fences. Permission denial/cancellation error
keeps retryable device status; no delivered claim or server-plan rollback. Never
catch up missed reminders as a notification burst. Notification opens revalidate
current identity/target; no stale payload title as an authorization shortcut.
Exact adapter, device-binding policy, privacy text and scheduling limits need review.

## 8. Ordered Luna cards and open gates

All cards DRAFT. Implementation waits for applicable L-02/04/05/08/09 foundations
and [29](29-PLAN-DATABASE-RPC-TEST-PACKET.md) server contracts/evidence. Local design
and synthetic fixtures may be prepared earlier, not integrated as working sync.
Each later implementation task must name actual allowed code paths, installed
test commands and synthetic fixtures before READY; none are invented here.

| Card | One outcome / dependency | Runtime cases owned |
| --- | --- | --- |
| MP-01 | Inventory adapter/harness/identity and migration baseline; no prior MP card | MP-T01 |
| MP-02 | Transactional partitioned repository/migration; MP-01 + storage/auth review | MP-T02–06 |
| MP-03 | Immutable outbox and exact receipt recovery; MP-02 + accepted server handlers | MP-T07–10 |
| MP-04 | Grouped pull/snapshot/reset and erasure recovery; MP-03 + PL-03 replication proof | MP-T11–14 |
| MP-05 | Accessible draft/review UI and device reconciliation; MP-04 + approved UX/adapter | MP-T15–18 |
| MP-06 | Cross-device interruption/upgrade regression and independent review; MP-05 | MP-T19–20 and review prior evidence |

| Gate | Required resolution before affected implementation/acceptance |
| --- | --- |
| MP-G01 | Compatible installed SDK adapters/test harness and isolated synthetic target; source baseline/allowed paths verified |
| MP-G02 | Local encryption/backup/key accessibility, reinstall, sign-out and unsynced retention/import policy; no inferred cloud consent |
| MP-G03 | Accepted 25–29 wire/server prerequisites, lifecycle/receipt expiry and capability negotiation; not merely passing DTOs |
| MP-G04 | Reviewed JCS, migration recovery, dispatcher retry/claim bounds, size limits and safe quarantine disposition |
| MP-G05 | Exact reminder adapter/selected-device binding, permission/privacy/failed-cancel UX; accessible editor acceptance |
| MP-G06 | Independent qualified review of this design and resulting implementation plus real Android/iOS evidence |

## 9. Runtime acceptance matrix — all NOT_RUN

Use synthetic owners A/B, revoked/frozen sessions, active/archived/deleted plans,
context-only deleted tasks, receipts older than current plans, late callbacks and
sequences beyond Number precision. Inject failures at each named boundary; record
build/OS/schema, command, crash point and before/after evidence without payload logs.

| Case | Given / when / observable required result |
| --- | --- |
| MP-T01 | Current package and source / inventory / missing adapters/harness and transient preview reported; no fictional npm test |
| MP-T02 | Ownerless legacy file / import requested / explicit ownership disposition and stable mapping required; no automatic upload |
| MP-T03 | Corrupt/partial legacy file / read / error or quarantine, not empty-success or deletion of source |
| MP-T04 | Draft and disk-full failure / save/back/restart / no Saved acknowledgement; last durable draft retained, memory-only risk shown |
| MP-T05 | Two writers / simultaneous draft/outbox commit / serialized revisions, no half-confirmed queue or swallowed lock error |
| MP-T06 | Migration interrupted at each checkpoint, then older binary / reopen / one import, unchanged originals, no silent downgrade/data reset |
| MP-T07 | Confirm double-tap and dispatcher/cancel race / run / one frozen item; cancel wins only before attempted marker |
| MP-T08 | Commit response lost or local receipt write fails / restart/retry / same key/body, one server effect, no guessed success |
| MP-T09 | Remote plan/reminder edit / queued send / whole conflict, preserved safe draft, no version rebase; fresh confirmation for changed intent |
| MP-T10 | Revoked auth, malformed success, 429/503, expired receipt / retry / correct pause/unknown/bounded recovery, no blind new key |
| MP-T11 | Plan+reminder group and huge sequence / apply/crash / all-or-none page+cursor, exact bigint comparison; digest contradiction blocked |
| MP-T12 | Partial/reordered/expired snapshot or stale H / install / no partial/backward mirror; valid empty snapshot handled without wiping local work |
| MP-T13 | Task/plan erasure while staging / revalidation/reset / old content hidden, stale dependent intent quarantined/purged, no resurrection |
| MP-T14 | A request then A→B→A / delayed result / old generation ignored, no B disclosure; timer/resources remain correctly partitioned |
| MP-T15 | Offline draft and background refresh / navigate/return/review / explicit pending/base-change state, no autosubmit or loss of durable draft |
| MP-T16 | Archive/restore/delete or DST ambiguity / review/confirm / exact alert consequences and valid instants; no session/XP/time reflow |
| MP-T17 | Permission denied or OS schedule succeeded before crash / reconcile / truthful status, duplicate/obsolete owned alerts cleaned without touching focus alerts |
| MP-T18 | Large text/three admitted locales/screen reader/reduced motion / edit/reorder/conflict / reachable labels, focus and non-drag controls on both platforms |
| MP-T19 | Device A edits/deletes; B offline with unsynced unrelated work / reconnect / one serial valid result, sanitized cache, preserved safe unrelated work |
| MP-T20 | Approved backup restore/sign-out/reinstall and lost SecureStore access / launch / no inferred auth/ownership or erased-content replay; independent evidence review |

Reference checker results do not change these statuses. Lint/typecheck, real SQLite,
HTTP/Auth, OS notifications, backups, accessibility and concurrent devices need
their own execution evidence. Continuation
[31](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md) now supplies PL-05 activation/rollback
readiness; it cannot waive any pending foundation, owner-policy or review gate.

## 10. Primary research and design limits

Checked 2026-09-20, exact SDK 56 documentation. Expo documents non-exclusive async
transaction interleaving, the exclusive transaction object's use, possible competing
write locks and lack of that API on web. Parameterized statements protect bound
input; SQLCipher is not enabled by default. Our serialized-writer/migration design
still requires testing. [Expo SQLite](https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/).

SecureStore uses platform credential facilities; iOS reinstall can retain Keychain
values and Android backup must exclude entries that cannot be decrypted after
restore. It is not the only copy of irreplaceable work. Our identity/backup gates
follow from these limitations, not a claim the app already configures them.
[Expo SecureStore](https://docs.expo.dev/versions/v56.0.0/sdk/securestore/).

Expo exposes enumeration/cancellation of scheduled alerts and warns scheduling
does not guarantee presentation. Our desired-versus-installed reconciliation and
crash mapping are application proposals, not SDK-provided atomicity. No notification
dependency or provider is installed/approved by reading this source.
[Expo Notifications](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/).
