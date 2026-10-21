# Viewer permissions, containment and close semantics

2026-09-28. **PROPOSED / REVIEW_PENDING; no native implementation READY.**
This is the feasibility specification following [36 §7](36-RESOURCE-VIEWER-COMPATIBILITY-AND-DEVICE-TEST-PLAN.md).
It addresses RV-F01–04 without selecting a replacement library or relaxing the
approved local-first, in-app read-only experience. [34](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md)
owns import/deletion durability; [35](35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md)
owns proposed limits. This document does not duplicate their numeric policies.

## Task brief — RV-02B

- Outcome: a bounded permission/containment and cancellation contract for review
  before RV-03's isolated harness. Documentation only, authorized by continuation.
- Risk: HIGH, untrusted parser and private owner-scoped files. Independent qualified
  review PENDING; author self-review is not independence. Work alone.
- Read: full AI rules/execution/DoD/guardrails/map/task template; 36 §§3/5/7,
  34 §§3–4, security own-resource paragraph, implementation-plan dependency boundary;
  refresh package/scripts, task storage and dirty state. Baseline remains SDK 56,
  legacy best-effort task JSON and no admitted resource viewer/test harness.
- Allowed files: new docs/revision/37-VIEWER-PERMISSIONS-AND-CONTAINMENT.md;
  docs/revision/00-OWNER-REVIEW-SI.md, 09-COVERAGE-AND-AUDIT.md,
  18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md,
  36-RESOURCE-VIEWER-COMPATIBILITY-AND-DEVICE-TEST-PLAN.md, README.md;
  docs/DOCUMENTATION_MAP.md, docs/CHANGELOG.md.
- Acceptance: permission delta is scoped to viewer, Android/iOS guarantees are
  separated, cancellation does not falsely imply revocation, six concrete review
  scenarios map to existing RV tests, policy/build/review gates remain explicit.
- Non-goals: source/native/config/lock changes, installs, generated builds,
  fixtures/devices, spending, new agents, publication or finalized security policy.
- Verification: primary-source checks, semantic review, existing check-docs,
  six scenario IDs/states and Markdown whitespace; git diff --check. Runtime NOT_RUN.
- Recovery/STOP: reversible documents; missing native authority or security proof
  stops implementation, not documentation. No data migration or cleanup performed.

## 1. What this design does and does not protect

Distinguish: accidental wrong-owner display, an unresponsive parser, and a
compromised native parser. A generation token helps the first; a worker thread
may help UI responsiveness; neither alone contains arbitrary native execution.
Checksums identify bytes, not safe content. Hiding the view is not sanitizing a PDF.

Protect local file bytes, paths/titles, selection text, thumbnails, credentials,
other owners' data and the focus session. No automatic AI/cloud/telemetry transfer
or OS share sheet. Device compromise/rooting and guaranteed forensic memory erase
are not promises of this proposal. Existing legal/age/backup policies stay open.

## 2. Permission delta, not blanket app permission removal

Proposed requirement: opening an already imported, app-owned document must not
introduce broad storage/media, camera, microphone, contacts, location or download
permissions. Import selection is a separate system-picker operation under 34.
Do not remove permissions required by another admitted capability without review.

| Boundary | Proposed rule | Evidence before acceptance |
| --- | --- | --- |
| Android local viewer | Internal app-owned copy; no new READ/WRITE_EXTERNAL_STORAGE, MANAGE_EXTERNAL_STORAGE, READ_MEDIA_* or DOWNLOAD_WITHOUT_NOTIFICATION merely to render it | Before/after generated and merged manifests, runtime prompt inventory on supported OS levels |
| Android network | No resource fetch/download path in the adapter; whole-app INTERNET/network state may be needed elsewhere | Actual native network trace for synthetic documents; do not remove app networking or call a JS network denylist process isolation |
| Providers/services | No exported viewer entry point or generic file provider added without a named need; exact handles only | Merged exported/grant/service declarations and negative other-app binding/open tests; non-exported alone is not an owner boundary inside our app |
| iOS local viewer | No new photo-library/camera/iCloud/shared-container entitlement solely for app-owned read-only files | Entitlement/Info.plist delta and real permission prompts; no guessed exemptions |

Android documents that internal app-specific files need no storage permissions.
This supports the narrow permission goal, not an encryption/backup certification
of Deep Focus. [App-specific storage](https://developer.android.com/training/data-storage/app-specific).

The audited blob plugin adds broader permissions (36 RV-F01). Candidate options:
review a minimal custom configuration or avoid that dependency in a custom native
adapter. Neither is approved. Merely omitting a plugin can break its native setup;
merely removing one permission can leave it reintroduced by manifest merging.
Prove the final artifact; do not edit node_modules or suppress warnings to pass.

## 3. Platform feasibility and containment

| Path | Proposed investigation | Limit / current status |
| --- | --- | --- |
| Audited React Native wrapper, unchanged | Retain as comparison only; local-only UI boundary and minimal configuration do not transform its parser architecture | HOLD: 36 did not establish an independently contained/cancellable parser; no automatic integration |
| Android custom adapter | Non-exported bound isolated service, explicit read-only seekable handle to one immutable asset, bounded IPC results, no account secrets/network/other-owner paths | Research candidate, not selected. Service lifecycle/identity and actual parser placement must be demonstrated, including service crash/hang |
| iOS PDFKit-based candidate | Review actual PDFDocument/PDFView scheduling, main-thread work, lifecycle, selection/actions and owner-safe teardown | No reviewed mechanism established here for an independently killable least-privilege parser in this candidate. Do not claim Android isolation parity or guarantee interruption of a synchronous native call |

Android's isolatedProcess service mode has its own restricted process; a separate
process name alone is not the same property. Its non-exported setting separately
limits external component access. [Service declarations](https://developer.android.com/guide/topics/manifest/service-element).
PdfRenderer recommends isolated minimal-permission processing for untrusted input,
requires a seekable descriptor, and has ordered page/renderer close operations.
Its open/render/close calls must not be treated as a proven asynchronous cancellation
API. [PdfRenderer](https://developer.android.com/reference/android/graphics/pdf/PdfRenderer).

For the Android candidate, include document metadata/page-count parsing in the
isolated work; doing unbounded parsing in the host before admission defeats the
boundary. The host authorizes the immutable asset and byte bound, not a caller's
arbitrary path. Validate returned dimensions, output lengths, page IDs and request
generation; bound bitmap/tile allocations and IPC. A compromised worker's output
is untrusted. Do not send an entire PDF through the JavaScript bridge as base64.
Text accessibility must survive the isolation boundary; bitmap-only pages cannot
substitute for readable tagged text. OS/API support differences remain a gate.

For iOS, pinned source inspection in 36 shows PDFKit object creation and cleanup,
not a process-security guarantee. Apple's PDFDocument page remains script-gated
in this research interface; no unsupported cancellation/sandbox API is invented.
[Apple PDFDocument](https://developer.apple.com/documentation/pdfkit/pdfdocument).
If the available design cannot satisfy the reviewed threat model, escalate the
architecture choice. Do not silently lower protection or replace in-app viewing
with remote upload/external sharing. The owner is not being asked to certify
technical safety; qualified review must make the limitation understandable first.

## 4. Proposed view lease and close state machine

Each open is a fresh, opaque view lease tied to owner session generation, immutable
asset revision and request generation. The repository authorizes it; an ID alone
is not permission. Native events contain the matching lease/generation. UI props
must not carry user-controlled paths, cache names, URLs or arbitrary renderer flags.

| State / event | Required proposed behavior | Completion meaning |
| --- | --- | --- |
| AUTHORIZING → OPENING | Resolve committed own asset, acquire exact reader lease; reject missing/foreign/staged data | No file displayed yet; parse result is not import success |
| OPENING → VISIBLE | Accept only matching live owner/asset/lease generation; validate output bounds | This view may display content; no task/reward completion |
| Any live state → REVOKING | Back/cancel, account switch, asset deletion or error: invalidate generation first; clear visible content/selection; stop accepting results and issuing work | UI hidden and logical access revoked, native work may still be active |
| REVOKING → CLOSED | Native work quiescent; handle/read lease released; views/listeners/derived buffers detached; required temporary cleanup acknowledged | Native close complete for this lease; not a proof of forensic erasure or deletion of the original |
| REVOKING → CLOSE_PENDING | Missing native acknowledgement, worker failure or cache cleanup error | Keep stale callbacks fenced; no false cleanup success; prohibit reuse of that worker/view for another owner |

Closing the host descriptor does not establish closure of copies held elsewhere.
Deleting a pathname likewise does not prove an existing reader lost access. Track
all native reader ownership; Android descriptor duplication shares underlying
file state. [ParcelFileDescriptor](https://developer.android.com/reference/android/os/ParcelFileDescriptor).
No claim that a delivered descriptor is instantly revocable. Confirm receiver
release or reviewed worker termination/death before claiming quiescence.

Account switching may continue to a safe non-resource screen after UI clearing;
the unsafe viewer instance stays quarantined. Do not share a worker across owners
while an old lease is unresolved. Do not end the focus session, delete originals,
kill the entire app as ordinary cancellation, or leave a success toast behind.

Worker-death observation invalidates that lease's results but does not complete
host disk cleanup. Unbinding or a JS timeout is not proven termination. Before any
stress test, an approved adapter-specific abort/termination mechanism and bounded
deadline must exist; no arbitrary kill command or guessed timeout is supplied here.
On restart discard stale volatile leases and reconcile derived files through 34's
exact-owner cleanup rules. A retry creates a new generation, never revives old work.

## 5. Derived data and failure boundaries

- Prefer no persistent viewer thumbnails/cache in the initial proposal. If an
  adapter requires temporary files, record exact owner/asset/lease paths, byte
  accounting and cleanup responsibilities. Disabling one cache flag is not proof
  of no files. No generic cache-directory deletion, silent evictions or cleanup of
  picker originals. Local quota, retention and native backup/key rules stay open.
- Releasing view references is not proof that OS/GPU memory or app-switcher images
  were securely wiped. Test account-switch/background snapshots and private state
  reuse; use a reviewed privacy cover where needed, not an absolute screenshot ban.
- Safe metadata for diagnostics: synthetic operation ID/state and typed failure;
  no raw path, URL, selected text, document body or native exception upload. No
  background preview/thumbnail generation by ads, AI or generic synchronization.
- Resource deletion fences new views, closes active readers, then follows the
  existing repository deletion contract. Keep completion pending if access or
  cleanup remains live; cancellation of a view must not delete a saved resource.

## 6. Review scenarios refining the existing twelve device cases

These add concrete oracles to 36, not new executed tests or proof of a harness.
All are **NOT_RUN**. Keep exact build/device/fixture evidence required by 36.

| Scenario | Given / when | Expected observable result | Parent cases | State |
| --- | --- | --- | --- | --- |
| PC-T01 | Clean baseline vs candidate merged manifests/entitlements; open committed local file | No unexplained viewer permission delta or prompt; no network caused by preview; existing unrelated app capabilities still work | RV-T01/03 | NOT_RUN |
| PC-T02 | Synthetic worker tries another owner's path/network and malformed IPC result | Proposed isolated worker cannot access ungranted data/network; host rejects invalid output before allocating/displaying; recorded UID/process and boundary evidence | RV-T02/03/04 | NOT_RUN |
| PC-T03 | Delay open/page result; A exits and B signs in | A content/selection disappears before B viewer; stale results ignored; no reuse until old native lease quiesces; remaining cleanup honestly pending | RV-T06/07 | NOT_RUN |
| PC-T04 | Parser stalls; cancel then deadline expires in approved isolated lab | UI leaves safely; no fake CLOSED; reviewed abort/death evidence or CLOSE_PENDING with viewer quarantined; focus continues without duplicate completion | RV-T02/04/08 | NOT_RUN |
| PC-T05 | Remove resource while reader lives; close host descriptor; fail temp cleanup | No claim of receiver revocation from host close alone; deletion waits for actual reader/cleanup evidence; original source untouched | RV-T07/12 | NOT_RUN |
| PC-T06 | Tagged si/ta/en content through chosen containment path; background/return and scanned counterpart | Expected accessible text/order and controls preserved; no stale private snapshot/view; scanned limits disclosed, no silent OCR or remote fallback | RV-T05/06/08 | NOT_RUN |

PC-T02 is specific to the proposed isolated-worker path. If another path is chosen,
its equivalent threat controls require explicit review, not automatic N/A or a
weaker test. A failed required safety case cannot be offset by rendering speed.

## 7. Handoff boundary

No native implementation card is made READY here. The next reviewer packet must
resolve: per-platform containment/action control, exact supported OS floor and
accessible-text path, permissions/configuration changes, abort/death mechanism,
native/IPC memory-time-output ceilings, cache/backup/key policy and transitive
dependency/license/advisory inventory. These are engineering/review questions
before presenting a meaningful owner choice, not requests for the owner to guess.

Once those are reviewed, prepare RV-03 with exact harness files, dependency pins,
environment and commands and request the missing install/build authority. No
additional agent, paid device run, production integration or blanket feature
approval is implied. Other independent documentation work can continue while
this viewer implementation remains HOLD.
