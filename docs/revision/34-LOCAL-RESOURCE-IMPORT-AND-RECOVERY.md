# Local resources — add, import, open and recover

Date: 2026-09-26. **DRAFT / REVIEW_PENDING; no implementation READY claim.**
[12](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) owns resource/local/cloud boundaries;
this refines R-01–04 into bounded preparation. [01](01-REQUIREMENTS-AND-DECISIONS.md)
owns approvals. The later September 26 reply approves initial PDF/JPG/PNG,
links/book-page references and in-app read-only PDF/image viewing. Exact limits,
format restrictions and adapters remain open. No supplied materials or second timer.

## Historical task brief — LR-00 (before format/viewing approval)

- Outcome: preserve the September 26 owner answers and specify an owner-isolated,
  crash-recoverable local-resource workflow with truthful user-visible states.
- Phase/approvals: documentation before expanded V1 freeze; DF-020/022/030/036/
  045/047, local-default direction and resource concept accepted. New facts:
  desired 15+ target, planned Sri Lanka company, intended AWS Device Farm plus
  friends' Android testing. No new legal policy, format, purchase or dependency approval.
- Risk: HIGH — local private files, ownership and durable deletion/recovery.
  Qualified independent review PENDING; working alone, no reviewer dispatched.
- Read: AI_RULES, execution/DoD/guardrails, documentation map/task template in full;
  12 in full, 01 approvals, 18 readiness, 32 scope, 33 cloud boundary; DATA_MODEL
  resource paragraph, SECURITY resource/auth-provider boundary, current task source
  and package metadata. The proposal does not silently rewrite canonical storage.
- Baseline: existing dirty docs and two owner source edits preserved. Task has no
  resource relation; task-storage.ts stores one JSON file, returns empty on load
  errors and suppresses save errors. No DocumentPicker/SQLite/SecureStore packages
  or test script in inspected package.json; expo-file-system ~56.0.11 is present.
- Allowed files: new 34; revision 00/01/08/09/12/18/32/README/check-docs.mjs;
  docs/DOCUMENTATION_MAP.md, V1_FEATURE_SCOPE.md, CHANGELOG.md. No source/package,
  SQL/native settings, credentials, provider accounts, upload/spend/commit/deploy.
- LR-A1: separate confirmed concept/target/intention from unapproved formats,
  consent and registration/merchant facts. LR-A2: every import commit boundary
  has recovery and cancellation/owner-fence behavior without source-file deletion.
- LR-A3: link/open/remove/cloud actions stay distinct; local resource metadata
  never enters generic sync/AI/diagnostics. LR-A4: five draft cards, twenty NOT_RUN
  cases and actual checker evidence, with no native/backup/security success claim.
- Verification: installed Node document/reference checkers; exact patch and new
  file review, whitespace/link/ID checks and source hashes. Native tests NOT_RUN.
- Recovery/STOP: document-only edits; no data migration. Stop affected future
  implementation for missing format/viewer/key/backup/age policy or owner mismatch.

## 1. User experience and proposals awaiting selection

Resource = reference supporting work; task = work to do; schedule = reserved time;
focus = actual session; remaining work = user-entered next action. Timer completion
does not prove a paper was finished. A teacher can plan a marking batch without
storing learner names/marks or creating a class. These are the accepted boundaries.

| Resource | Proposed first-release handling | Not implied |
| --- | --- | --- |
| Book/page or physical-paper reference | Local title/reference + task link; no bytes required | Scanning, copyright ownership or remote metadata |
| HTTPS link, including a lesson-video link | Local reference; explicit destination/open action | Download, preview bot, autoplay, video player or hosted content |
| PDF / JPEG / PNG | Approved initial family and in-app read-only direction; explicit validated local copy proposed | Safe renderer, exact format restrictions or size cap already approved |
| Word / PowerPoint / audio / video files | Additional candidates awaiting user need, cost and adapter review | Owner-approved exclusion or inclusion; importing is not editing/rendering |
| Archives/executables/active HTML/SVG | Not admitted by this draft | Accept-all picker or executing imported content |

Recommended visible entry: task detail → Add resource → Reference / Link / File.
File action remains unavailable if its implementation/policy is not admitted;
do not fake a functioning control. Library-first addition is the same repository
operation without a task link. Navigation still Home/Plan/Focus/Progress/Profile.
Selecting a file never starts AI, cloud, a timer or task completion.

Before READY, freeze a versioned local policy with finite positive limits for
file bytes, per-owner stored/reserved bytes, count, concurrent operations, text/
URL length and parser work (image pixels/PDF pages/time/memory as applicable).
No numeric values are chosen here. Missing policy blocks file import, not core
focus. Picker metadata and extension are advisory; validate actual copied bytes.
Encrypted/password-protected or parser-unsupported PDFs need an explicit reject/
supported-viewer contract before admission; no password retention by default.

## 2. Research checkpoint, not package installation

SDK **56** references checked September 26, not latest-SDK copy-paste:

- DocumentPicker selects through the system UI; MIME filters exist and size/MIME
  may be absent. Cache-copy helps FileSystem immediate reads but has large-file
  performance implications. A chosen/cache file is not a durable save. Proposed
  implication: bounded copy/validation and cancellation/error states, not blind
  trust in picker metadata. [Expo SDK 56 DocumentPicker](https://docs.expo.dev/versions/v56.0.0/sdk/document-picker/).
- FileSystem offers File/Directory operations including copy/move and app paths.
  This does not supply a filesystem+SQLite transaction. Proposed journal/fence
  design below needs native kill/restart proof; the existing legacy JSON writer
  is not that proof. [Expo SDK 56 FileSystem](https://docs.expo.dev/versions/v56.0.0/sdk/filesystem/).
- Android distinguishes cloud backup and device transfer, with rules dependent
  on OS/target version. Disabling cloud backup is not universal proof of blocking
  all transfers. Verify bytes, metadata and journal exclusions together in actual
  builds; iOS backup/data-protection remains a separate native gate.
  [Android Auto Backup](https://developer.android.com/identity/data/autobackup).

No iCloud capability, broad media permission, scanner or PDF-viewer dependency
is authorized by the examples. Local storage is not a claim of encryption or
exclusion from OS backups; disclose only verified behavior.

## 3. Owner-scoped operation and durable commit

Proposed local records refine 12's entities, not executable schema:

- Operation envelope: operationId, ownerNamespace, sessionGeneration, kind,
  policyVersion, resourceId, baseRevision, intended new revision, optional target
  taskId, staging/final generated relative keys, phase and typed failure.
- Asset evidence: measured byte length, detected allowed type, integrity identity,
  validation version and owned path. Keep names/URLs/content out of logs.
- Resource/task link/asset rows share a durable local transaction when published.
  Validate task and resource ownership; IDs and filenames are not authority.
- Persist only necessary recovery state. Do not retain provider access tokens,
  arbitrary original absolute paths or clipboard contents in the journal.
  A lost picker handle can require explicit reselection, never silent device scan.
- Guest availability/merge and local sign-out retention/key policy remain open.
  No adoption of legacy ownerless JSON data into the next signed-in account.

| Phase | Work / permitted acknowledgement | Restart or cancellation behavior |
| --- | --- | --- |
| SELECTING | Explicit picker, preview and validation of policy/owner | Cancel leaves no new resource; late callback checked against owner generation |
| PREPARED | Durable operation + unique destinations and capacity reservation | No Saved; if source inaccessible, request reselection or safe cancellation |
| COPYING | Copy to owned staging under bounded worker | Partial file never opened as resource; cancel fences worker before cleanup |
| VALIDATED | Check copied bytes/type/integrity and current policy | Failed validation quarantines from open; bounded cleanup, originals untouched |
| PROMOTED | Verified owned final file exists at generated key | No Saved until metadata/link commit; recovery may finish once only if intent/owner/deletion fences still valid |
| COMMITTED | Atomic resource revision/asset/link/operation result | Saved locally; replay returns same result, does not create another link |
| CLEANUP_PENDING | Cancel/reject/remove; no new public resource visibility | Retain capacity accounting while worker can still write; retry exact owned cleanup |
| TERMINAL | Cancelled/failed/cleaned or complete | Do not restart a terminal import from a delayed callback |

Filesystem and database effects need reconciliation, not an assumed shared
transaction. An operation fence changes before cancellation/removal; late copy
completion cannot publish. Reconcile to a verified final file or a repair-needed
record; never pretend a missing committed file is an empty successful resource.
Cleanup failures remain visible to diagnostics by non-sensitive IDs/state, with
bounded retry. Never acknowledge deletion as complete while required cleanup is
pending. No broad directory sweep based on filenames or user-supplied paths.

Capacity includes staged/in-flight files and replacement overlap. Two imports
must reserve atomically against the approved owner budget, while OS disk-full can
still occur and must be handled. Do not automatically evict another resource.
Same operationId with different content/target intent is a conflict. Same title
or content hash alone never merges two resources; link reuse is explicit.

If the target task is removed or changed while picking/copying, do not recreate
it or attach to a different task. Proposed recovery: retain verified staged work
as a reviewable pending operation, then ask Save to library or Cancel; do not
silently alter the user's originally confirmed intent. Exact staging lifetime is
an approved retention value, not indefinite storage.

## 4. Opening, replacement and deletion

Opening a reference displays its local text. Opening a link requires explicit
action, safe HTTPS validation and a visible destination; no background metadata
fetch. Reject script/file/data URL schemes in web-link fields. A network fetch
service or embedded browser is not included. External login/paywall/outage is not
Deep Focus failure to save the reference.

Opening a file uses a separately approved native/in-app adapter. If no handler
exists, show Cannot open with safe retry/reference options, not success. External
handoff is a deliberate transfer of selected bytes; disclose that, grant the
minimum supported temporary access, and do not imply copies can later be recalled.
Account switching invalidates app UI callbacks; revoke grants where supported
but do not claim remote/other-app copies disappear. Return recovers the same
focus session; opening resources is not a second timer or automatic completion.

| Action | Effect / failure boundary |
| --- | --- |
| Rename | Same resource identity, new metadata revision; task title unchanged |
| Link/unlink task | Own relation only; shared asset not duplicated or erased |
| Delete task | Remove its associations; resource and valid history retained |
| Replace file | Import a new immutable revision; old revision remains until commit and approved retention/pin rules allow cleanup |
| Remove local resource | Confirm affected links/revisions; block new opens, mark missing references and queue exact owned cleanup; tasks/history survive |
| Delete cloud copy | Separate paid-cloud operation/confirmation from 33; no inferred local deletion |
| Expire subscription | No local original deletion, focus interruption or new cloud upload |

Reference-count and operation checks prevent deleting a file still needed by
another committed link, retained revision or in-flight owner operation. Strict
privacy erasure may require removing retained private labels/bytes; its approved
policy overrides convenience retention and must suppress late publication.
Resolve every deletion path within the intended generated owner root; never act
on arbitrary picker/source paths or another owner directory. A matching checksum
is integrity evidence, not ownership, safety or permission to redistribute.

## 5. Testing placement and small-context cards

Owner intends AWS Device Farm and friends' Android phones. Treat that as a plan,
not purchased capacity or performed testing. AWS remote sessions capture video/
logs and recommend test credentials; use synthetic documents and an isolated
staging backend only. Record device model/OS/build/test ID and actual result.
Missing cloud-device capabilities require another approved environment, not a
fabricated PASS. [AWS remote access](https://docs.aws.amazon.com/devicefarm/latest/developerguide/remote-access.html).

Friends' consented Android builds can exercise real daily use/background/open/
network/storage conditions. Never perform destructive storage/backup experiments
against their personal files. iOS signed-build/device coverage, long-run/battery,
OS backup/restore and store billing need their own verified environments. Device
Farm is not signing credentials, merchant approval or a complete release gate.

| Card | One bounded outcome | Prerequisites / cases |
| --- | --- | --- |
| LR-01 | Approve exact format/limits/viewer/owner policy and adapter test harness | R-01, ADR-009/012; no assumed values; LR-T01/02/05/19 |
| LR-02 | Local reference/link/task association repository | LR-01, durable core task identity; LR-T03/04/11/12/16 |
| LR-03 | Journalled import/replace/cancel and restart reconciliation | LR-01/02, native fault harness; LR-T05–10/13–15 |
| LR-04 | Safe opening, removal and focus-return integration | LR-03, approved viewer/deletion rules; LR-T12–18 |
| LR-05 | Installed-device privacy/backup/accessibility evidence | LR-01–04, actual Android/iOS environments; LR-T01–20 |

All cards DRAFT. Future implementation briefs must name exact source/test paths
after inspection, approved dependency versions, error DTOs and real commands.
Current package has no `test` script; do not invent `npm test` as passed evidence.

## 6. Required runtime evidence — NOT_RUN

| Test | Given / when | Expected result | Evidence |
| --- | --- | --- | --- |
| LR-T01 | Format families/viewing direction approved, exact limits/adapter unresolved | No accept-all importer or silent numeric defaults admitted | NOT_RUN |
| LR-T02 | Offline physical-book reference and manual planning | Useful work flow without file/AI/cloud/account-policy bypass | NOT_RUN |
| LR-T03 | Same resource linked to two own tasks; rename | Stable identity, one asset, task names unchanged | NOT_RUN |
| LR-T04 | Unsafe URL scheme or link added without Open action | Reject unsafe scheme; no preview fetch or external network open | NOT_RUN |
| LR-T05 | Missing/false MIME/size, malformed/encrypted unsupported document | Bounded byte validation or explicit rejection; no renderer execution | NOT_RUN |
| LR-T06 | Kill before copy, mid-copy, after verification, after promotion | No false Saved; resume once or safe repair/cancel; original intact | NOT_RUN |
| LR-T07 | Metadata commit succeeds then response lost | Operation replay returns one resource/revision/link | NOT_RUN |
| LR-T08 | Cancel races with worker completion and restart | Fence prevents publication; exact owned cleanup, no resurrection | NOT_RUN |
| LR-T09 | Two imports consume remaining capacity; disk fills mid-copy | Bounded reservations, honest failure, no eviction or corrupted prior file | NOT_RUN |
| LR-T10 | Account switch/logout during picker/copy/viewer callback | No wrong-owner display/commit; pending work handled by approved local policy | NOT_RUN |
| LR-T11 | Task deleted while import targeting that task runs | No recreated task; explicit library-or-cancel recovery | NOT_RUN |
| LR-T12 | Unlink/delete one task that shares a resource | Other task/resource and valid history preserved | NOT_RUN |
| LR-T13 | Replacement fails before/after metadata publication | Old valid revision retained as policy requires; one new revision or repair | NOT_RUN |
| LR-T14 | Traversal/foreign path in corrupt journal and cleanup request | Refuse outside-owner access/deletion; no original or other-owner mutation | NOT_RUN |
| LR-T15 | Cleanup fails, disk full or late writer returns | Cleanup pending honest; no early capacity release or renewed publication | NOT_RUN |
| LR-T16 | Generic sync, AI, telemetry or server export handles task | No resource title/path/URL/bytes/association leaked through task payload | NOT_RUN |
| LR-T17 | No viewer / denied external handoff / damaged committed file | Clear open/repair state; no success toast or unrelated deletion | NOT_RUN |
| LR-T18 | Open file during focus, lock/background, return | Same session recovered, no auto task completion or double reward | NOT_RUN |
| LR-T19 | Installed native backup/restore/uninstall/account switch | Verified byte+metadata+key policy; unuploaded data not falsely recoverable | NOT_RUN |
| LR-T20 | si/ta/en, screen readers, large text and long filenames | Local/pending/failed states and recovery actions accessible; names safely displayed | NOT_RUN |

Next specification gap: approve LR-01 values/adapters, then define exact local
schema/commands and fault fixtures. This document supplies neither a migration
nor proof against every storage, native, policy or security failure.

[35](35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md) now supplies LR-01's option
sheet: approved PDF/JPEG/PNG + references/links and in-app read-only direction,
with proposed detailed restrictions, adapter investigation and numerical prototype
candidates. Those values are not approved policy; eight additional probes remain
NOT_RUN. No LR card becomes READY from direction approval alone.
