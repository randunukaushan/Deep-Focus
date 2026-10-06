# Own Resources, Work Planning and Optional Paid Cloud

Status: confirmed product direction with **DRAFT implementation contracts**, 2026-09-14. Latest owner decisions: Deep Focus supplies no teaching materials; students and teachers organise work using their own resources; local resource storage is the default; optional cloud storage is a subscription whose price depends on revenue/cost review. [01](01-REQUIREMENTS-AND-DECISIONS.md) owns approval, [06](06-MONETIZATION-AND-ENTITLEMENTS.md) owns commercial rules. Nothing here is implemented, provisioned, priced or approved for publication.

## 1. Product boundary

**අපි පාඩම් දෙන app එකක් නොවේ. තමන්ට තියෙන resources භාවිත කරලා, කරන්න තියෙන වැඩ පිළිවෙළට කරගන්න උදව් කරන app එකකි.** Studentට study-work organiser එකක්; teacherට teaching-work organiser එකක්. Professional කෙනෙකුටත් තමන්ගේ reference/brief එකක් task එකකට සම්බන්ධ කරගැනීමට මෙම shared model එක අදාළ විය හැක; ඒක වෙනම content product එකක් නොවේ.

Resource means a user-selected reference supporting a task: their paper, notes, book/page reference, local document or external link. It is not a task, a focus session, proof of completion or proof the user owns redistribution rights. No Deep Focus paper bank, model-answer library, lesson catalogue, course marketplace or teaching-video service. General mode needs no official curriculum pack or teacher account.

Core flow: **own resource → clear work item/steps → time estimate → available slot → focus → actual remaining work → next action**. Manually entered plans must work without AI. Optional AI task breakdown is still subject to existing V1 scope and confirmation rules; importing a resource never gives AI permission to read it.

## 2. Modes and release gates

| Mode | Behaviour | Authority / gate |
| --- | --- | --- |
| Local reference | Store user-entered title/reference or URL locally; associate with own tasks | Confirmed direction; exact schema/UI and local persistence need approval |
| Local file | Explicit file selection, validated app-owned local copy and local metadata | Confirmed local direction; file types/limits/picker/viewer/native backup policy need implementation approval |
| Optional Cloud Resources | Paid entitlement + explicit selected-resource upload, private storage and controlled download | January placement confirmed September 25; provider configuration, quotas, price, security, retention and production acceptance OPEN |
| Class work sharing | Instructions and learner-selected completion/progress to an authorised private class | Bounded V1 target per September 29 record; not granted by a storage subscription; resource-reference/file distribution not admitted |

Local resources are excluded from generic cloud sync, AI inputs, logs, diagnostics, notifications and telemetry. This includes filenames, resource titles/URLs, local paths, thumbnails, extracted text and local task-resource associations. Independently entered task/account data follows its approved sync contract; do not auto-populate cloud task descriptions from private resource details. A library with no remote rows is not a server error.

Purchasing Cloud Resources must not upload the whole library. Offer a review of exactly which resources and metadata will leave the device, their total size, remaining allowance, destination and applicable disclosures. Existing local copies stay intact unless the person separately requests removal after verified download/recovery is available. Cloud does not make a resource public or available to teachers.

No automatic resource upload while cloud launch is disabled, entitlement is unverified, or consent is absent. No hidden upload queue waiting for a later subscription. January Website/Account Portal stays required; a full resource web library is additional scope, not automatically required by billing management.

## 3. Student and independent teacher flows

### R-F1: Student paper → achievable work

1. From task detail, choose Add resource; alternatively create a resource first and then create a task.
2. Add a reference, link or supported local file. Preview title, resource kind, local storage label and optional subject. Cancel leaves existing work unchanged.
3. Enter a concrete work slice: “Maths paper: questions 1–10”. A physical paper can be referenced by name; no scanning/upload is required.
4. Enter an estimate, for example 45 minutes, and optionally smaller steps. Estimate is not a forced timer duration or guarantee.
5. Fit the task around school/tuition/travel and user availability. If only 30 minutes are free, show unplaced work or a proposed split; user confirms any change.
6. Start the shared focus flow. Open a resource only on user action; returning from another app recovers the same session state.
7. At the end, optionally record “questions 1–6 done; continue at 7”. Completing 45 minutes does not automatically mark all ten questions complete.

### R-F2: Teacher preparation and marking

1. Add class commitments and preparation/marking windows; no cohort creation or student invitations are required.
2. Associate own notes, paper, book reference or link with preparation/marking tasks.
3. Plan “prepare next lesson, 30 minutes” and “mark a batch of 15 papers, 60 minutes”. These are synthetic examples, not standard teaching time targets.
4. Focus; record actual work such as “8 of 15 marked” and an optional next action. Student names, marksheets and paper contents are not needed to manage the batch.
5. Keep the remaining seven as pending work; do not duplicate the completed eight when rescheduling. Preparing one class does not mark all recurring classes prepared.

Bounded class assignment/selected-progress/text-feedback sharing is now a V1 target in [11](11-SRI-LANKA-EDUCATION-CONTRACTS.md), optional for each user and not required for personal teacher work. Its detailed privacy/security contracts remain gated. Teachers cannot use personal cloud subscriptions to inspect or automatically upload learner data. Sharing a workload instruction and distributing academic material are distinct actions; the latter is not admitted by this classroom decision.

### Resource UI states

Support empty, selecting, cancelled, validating, copying, saved locally, unavailable source, unsupported type, insufficient space, open failure and recovery-needed states. Paid cloud adds selected-for-upload, waiting for entitlement, quota exceeded, uploading, processing, stored in cloud, failed/retry and download states. Never use a cloud checkmark for a local save. Show “Local only — not backed up by Deep Focus” where appropriate; avoid implying all personal app data is local if account/task sync is separately enabled.

## 4. Proposed data contracts

Names below are proposed, not migrations. Reuse the existing task/session entities. Current `Task` contains identity/title/description/status/timestamps, not an implemented resource relation; the current JSON task store suppresses write errors and is not evidence of durable resource transactions.

| Entity | Proposed fields / purpose | Boundary |
| --- | --- | --- |
| `LocalResource` | ID, owner namespace, kind `reference|external_link|local_file`, title, user reference/URL or file handle, resource revision, timestamps, lifecycle | Device-local; not a generic sync entity |
| `LocalAsset` | Asset ID, generated relative object key, checked type/size, content fingerprint, import state, local revision | No raw source URI or asset bytes in cloud task payloads |
| `TaskResourceLink` | Own task ID, local resource ID/revision, optional work-slice text, order | Local relation; removing it does not delete task/resource |
| `ResourceOperation` | Local operation ID, kind import/replace/remove, scoped asset IDs, state, error category | Recovery journal; not a network outbox |
| `CloudResource` | Separate server ID, authenticated owner, selected metadata, verified object version/size, state | Created only through approved paid/consented upload; no client-set ownership |
| `ResourceReplicaLink` | Local ID/revision ↔ verified cloud ID/version, last confirmed state | Local mapping; a remote copy is not implicit authority over unrelated local files |

Use stable IDs, not filenames as identity. Two resources may share a title. One resource can support several tasks without copying its bytes for every task. A file replacement creates a new revision; do not silently overwrite the original file in Downloads or change historical work-slice references.

A resource can be renamed without renaming linked tasks. Task completion does not archive/delete its resources. Task deletion removes local associations only, while preserving resource records and valid session history. Resource removal preserves linked tasks and their independently entered work descriptions, showing a missing-resource state rather than deleting work. Exact redaction of historic resource-derived labels on a privacy deletion must be frozen in the deletion contract.

The later September 26 owner approval selects initial book/page references, website/video links and PDF/JPEG/PNG attachments, with read-only in-app PDF/image viewing. All field bounds, exact format-admission rules, per-file/device limits and native viewer behavior remain required before READY. The approval does not settle static-only PNG, encrypted-PDF handling, a PDF package or numeric defaults; see 35. Do not silently enable archives, executables, HTML/SVG active content or embedded documents. Large PDFs/images need actual memory/performance limits, not only a filename check.

## 5. Local import, persistence and security

For owner review, [format/limit/viewer options](35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md)
compares a bounded first set, native vs external viewing and proposed test limits.
Its numeric profile is not an approved override of the OPEN policy fields here.

Expo SDK 56 DocumentPicker documents system selection and cache-copy behaviour; a successful picker result is not a durable saved resource. FileSystem provides copy/move APIs, but does not by itself make a file operation and a metadata transaction atomic. Candidate APIs must be verified against the installed SDK and actual devices before adoption. `expo-document-picker` is not currently in the inspected dependency list; no package installation is authorised by this document. [Expo DocumentPicker](https://docs.expo.dev/versions/v56.0.0/sdk/document-picker/), [Expo FileSystem](https://docs.expo.dev/versions/v56.0.0/sdk/filesystem/).

Proposed crash-safe import:

1. Explicit picker selection; request only necessary access. Do not scan all device documents or import every attachment automatically.
2. Validate supported type, actual size and filename/display safety. A file extension or supplied MIME value is not proof of safety. Reuse maintained parsers; do not execute embedded scripts/macros. File-validation guidance informs this local design but does not certify a local viewer. [OWASP file handling](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
3. Create an operation journal under the active owner namespace, copy to an app-controlled staging key and verify the copied length/fingerprint. Original source remains untouched.
4. Promote to the selected durable app-private location; commit resource/link metadata only when the owned copy is verifiably present. Do not acknowledge Saved before those conditions hold.
5. Recover interrupted operations on restart: either finalise the verified copy once or expose a repair state and safely clean only the identified incomplete app-owned copy. A database transaction cannot roll back an external filesystem operation by itself.
6. If storage is insufficient or source access disappears, retain existing tasks/resources, explain the failure and offer retry/reference-only. No silent eviction of another resource to make room.

Cache is staging, not the sole irreplaceable copy. Store generated relative keys and resolve them against the approved owner directory; reject path traversal and verify containment for deletion. Never delete/move the user's source file. Remove-from-task, delete app-owned copy and erase a confirmed cloud copy are distinct operations with distinct previews.

Local-only does not mean encrypted, immune to device compromise or automatically isolated between people sharing an unlocked app. Approve credential/key strategy, local access lock, sign-out behaviour and migration recovery under ADR-009/012. On account switch, no other owner's library, pending operation or thumbnail is visible. Do not merge guest/local records into an account without a reviewed merge flow if guest use is approved.

Android documents configurable backup exclusions and version-specific rules. Verify backups for both resource bytes and metadata in installed builds; merely choosing an app document directory is not evidence that no OS cloud backup occurs. iOS backup-exclusion and data-protection behaviour still need native verification. Do not claim to control copies a person manually exports to another app/provider. [Android Auto Backup](https://developer.android.com/identity/data/autobackup).

Disclosure: local-only copies may be lost on uninstall, device loss or unrecoverable corruption; another device/account portal cannot restore an unuploaded resource. User-initiated local export/transfer is a proposed separate recovery capability, not an implemented guarantee. An external provider selected through the OS picker may itself require a download; Deep Focus must not silently upload anything in response.

## 6. Links, opening resources and AI

An external link is a locally stored user reference, not downloaded content. Initial proposal: accept reviewed HTTPS URL forms, show destination, require an explicit open action, and do not embed autoplay media or fetch titles/thumbnails in the background. Reject executable/local-file schemes from user-entered web-link fields; internal selected file handles use a separate typed path.

Do not send arbitrary link URLs to a server proxy, preview bot or AI browser. URL fetching creates SSRF/network risks and requires its own reviewed controls if introduced. External destination availability, login, paywall and content correctness are not Deep Focus guarantees. [OWASP SSRF prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

Opening another app does not grant it the whole resource library. For local-file opening, approve the viewer and minimum temporary access mechanism; disclose when bytes are handed to another app. On return, recover the existing timer according to its lifecycle contract. A task may intentionally use an external learning site, so future focus shielding needs a user-reviewed exception; it must not promise to both block and require the same site.

Local-resource text, documents and notes are not automatically AI context. Optional later OCR/resource-derived task proposals need explicit selected-input consent, local-vs-remote processing disclosure, output validation, rights review and confirmed changes. Current basic planning remains manual/resource-reference based. A document saying “ignore rules” is data, never authority to upload, delete, buy or change a plan.

## 7. Optional paid-cloud contract

This section is a preparation contract, not an active service. January placement is confirmed by the September 25 owner reply; exact provider/region, price/capacity, supported formats, retention, malware processing and launch acceptance remain gated. Supabase Storage is an evaluated candidate compatible with the selected platform, not a selected/provisioned bucket service. Its documentation distinguishes private RLS-controlled access from public asset delivery; using a private bucket still requires correct policies and tests. [Supabase bucket access](https://supabase.com/docs/guides/storage/buckets/fundamentals).

Required upload sequence:

1. User selects resources; preview exact bytes/metadata and allowance. No selection means no upload even if subscribed.
2. Server validates identity, ownership and current Cloud Resources entitlement; reserve quota atomically for the operation before issuing narrow upload authority. Client `premium=true` or claimed size cannot grant storage.
3. Upload only to the reserved private object/version. Verify actual size/type and approved content-security checks; unvalidated/quarantined objects are not downloadable/shared. Any remote scanner needs approved processor/privacy terms, not a public-file scan upload by default.
4. Finalise idempotently after verification, recheck current authority, convert reservation to measured usage and record the immutable version. Retry cannot consume double quota or silently replace another object.
5. Expired/failed reservations and orphaned uploads are reconciled and cleaned under an approved bounded policy. A missing cleanup path can create operator costs even for failed uploads.
6. Local copy stays usable. Show stored-in-cloud only after server acknowledgement. Do not label a cloud copy a tested backup until restore/recovery evidence exists.

Quotas cover stored bytes, pending reservations, file count/size, concurrent work and downloads/egress under an approved policy. Don't use the provider's generous maximum as the app's product allowance. No unlimited tier or automatic overage charge without separate owner/user approval. When full, explain choices without interrupting focus or deleting files; reject excess uploads safely. Provider spend controls do not replace app-level per-user enforcement.

Downloads require current owner access and rate limits. If using signed URLs, define expiry and revocation limitations; a previously delivered URL/file cannot be magically recalled. If immediate access revocation is required, use a compatible authorised-delivery design and test it. Never create public buckets for private student/teacher resources. Downloading on another device requires deliberate action; task sync alone does not fetch every file.

Cancellation disables auto-renewal according to the verified billing event, not immediate arbitrary deletion. Expiry/downgrade blocks new excess uploads under the frozen grace policy while retaining a disclosed read/download/export path and warnings before any retention-based removal. Exact durations and legal obligations must be set before selling the plan. Never delete local originals due to cloud subscription loss or require renewal just to exercise essential data-access/export rights. See [06](06-MONETIZATION-AND-ENTITLEMENTS.md).

## 8. Acceptance scenarios

[Paid-cloud continuation](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md) expands R-05's
preparation into six draft cards and twenty NOT_RUN cases, including late upload
tokens, immutable verification, quota accounting and object-byte recovery.
This does not mark the existing R cards READY or replace their local prerequisites.

Future evidence, not executed tests. Map to G-02/04/05/08/11/12/16 as applicable. Use synthetic files and identities.

| Test | Scenario | Expected result |
| --- | --- | --- |
| R-T01 | Add local paper and use task planning with network blocked | Import/planning/focus usable; no upload or remote resource metadata |
| R-T02 | Teacher plans preparation and marking without cohort | Full private workflow; no forced learner list or class subscription |
| R-T03 | Ten-question task, timer completed but six questions done | Four remain; no inferred mastery or automatic full task completion |
| R-T04 | Cancel picker / deny source / low storage / unsupported or malformed file | Honest error/cancel; no empty saved resource or other data loss |
| R-T05 | Kill before copy, during copy, after promotion and before metadata commit | Recover once or explicit repair; original unchanged; no false Saved |
| R-T06 | Same resource linked to two tasks, rename or remove one link | Stable resource identity, one owned copy, unrelated task unchanged |
| R-T07 | Delete resource or task / replace resource revision | Other entity and valid focus history preserved; no source-file deletion |
| R-T08 | Switch owner with import pending or old file viewer returning | No foreign metadata/file visibility or wrong-owner finalisation |
| R-T09 | App backgrounded while opening external resource | Same session recoverable; no second timer or fabricated completion |
| R-T10 | Generic sync/export-to-server/diagnostics/AI processes a local-mode task | No resource bytes, paths, titles, URLs or local association leakage |
| R-T11 | Installed Android/iOS backup, uninstall/reinstall and device-loss simulation | Verified/disclosed limits; no false claim of recovering unuploaded files |
| R-T12 | Buy cloud subscription but select no resources | Library remains local; no upload, sharing or remote processing |
| R-T13 | Forged entitlement, parallel quota reservations, size mismatch or foreign object ID | Denied safely; quota not exceeded; no cross-owner access |
| R-T14 | Timeout after finalise / duplicate upload callback / abandoned upload | One verified version and usage charge; bounded orphan cleanup |
| R-T15 | Subscription expiry/downgrade while local session active | Focus/local files unaffected; disclosed cloud access/retention; no surprise charge |
| R-T16 | Sinhala/Tamil large text, screen reader, missing file, quota error | Local/cloud state and safe recovery actions understandable and reachable |

## 9. Bounded task preparation

The September 26 [local import/recovery packet](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md)
refines R-01–04 with five ordered LR cards and twenty NOT_RUN cases. The owner
accepted the organising concept, not the proposed format list or size limits.
This refinement remains draft; canonical data/security boundaries are unchanged.

All R cards remain DRAFT until exact contracts, dependencies and real test commands are recorded. Do not install dependencies or build paid cloud before local/core foundations are ready. No new agents.

| Card | Outcome | Prerequisites / evidence |
| --- | --- | --- |
| R-01 | Freeze local resource types, limits, namespace, viewer/backup policy | ADR-006/008/009/012 as relevant; canonical data/security reconciliation |
| R-02 | Local reference ↔ existing task relation | L-02/04/07; R-T01/06/07/10 |
| R-03 | Crash-safe local file import/open/remove | R-01/02; approved native adapter; R-T04/05/08/09/11 |
| R-04 | Student and independent-teacher resource-to-plan loop | R-02/03, L-11; R-T02/03/16; no cohort prerequisite |
| R-05 | Cloud offer unit economics and final policy | ADR-005/006/010/011; cost worksheet in 06; owner approval before sale |
| R-06 | Verified paid-cloud upload/download/quota slice | R-05, L-05/08/15, provider/RLS/object-recovery tests; R-T12–15 |

Resource implementation is not yet present: inspected `src/features/tasks/task-types.ts`, `task-storage.ts` and package metadata on 2026-09-14. Existing best-effort JSON writes must not be reused as a durability guarantee. Exact source paths for new modules/tests must be named after inspecting the then-current checkout. No resource import, device test, cloud upload, pricing calculation against real customers or payment validation has been performed by creating this document.
