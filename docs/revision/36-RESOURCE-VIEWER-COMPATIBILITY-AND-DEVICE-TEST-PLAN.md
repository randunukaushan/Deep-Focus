# Resource viewer — compatibility research and device-test plan

2026-09-26. **DRAFT / REVIEW_PENDING. Research and test preparation only.**
No viewer selected, installed, built or security-certified. Native tests NOT_RUN.
[35](35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md) owns candidate limits;
[34](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md) owns local import/recovery;
[01](01-REQUIREMENTS-AND-DECISIONS.md) owns the approved format/viewing direction.
This refines RO-T02–08 and LR-01/04/05, not a new feature family or phase order.

## Task brief — RV-01

- Outcome: give the next implementer a source-backed candidate comparison and
  bounded, reproducible native compatibility/privacy/accessibility test proposal.
- Authority: owner requested this plan after approving PDF/JPG/PNG, links/book-page
  references and in-app read-only PDF/image viewing. Detailed policies stay open.
- Risk: HIGH, untrusted parsing/private previews/native dependencies; independent
  qualified review PENDING. Work alone using configured model, no extra agents.
- Read: AI rules/execution/DoD/guardrails/map/task template; 35 §§3–6, 34 §§2–5,
  18 current gates, 08 testing/release boundaries, implementation-plan introduction;
  inspect package/lock/installed versions, current task types/storage and dirty work.
- Allowed files: new docs/revision/36-RESOURCE-VIEWER-COMPATIBILITY-AND-DEVICE-TEST-PLAN.md;
  docs/revision/00-OWNER-REVIEW-SI.md, 09-COVERAGE-AND-AUDIT.md,
  18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md,
  35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md, README.md;
  docs/DOCUMENTATION_MAP.md and docs/CHANGELOG.md.
- Non-goals: app/native/config/lock/schema edits, installation, fixture generation,
  builds, real-user files, uploads, AWS runs, purchases, signing credentials,
  commit/push or deployment. No finalized numeric policy or architecture downgrade.
- RV-A1: distinguish observed upstream facts, local baseline and recommendations.
  RV-A2: no untested exact-stack compatibility, security or accessibility claims.
  RV-A3: test IDs have fixtures, steps, oracle, evidence and clear NOT_RUN state.
  RV-A4: explicit prerequisites, stop conditions and dependency-safe handoff;
  do not re-ask approved format direction or turn proposals into production rules.
- Verification: existing check-docs.mjs; matrix ID/status/whitespace checks;
  full scoped Markdown review and git diff --check; preserve source hashes.
  Runtime tests require a separately authorized isolated harness, not this task.
- Recovery: reversible docs only, no user-data rollback. Incomplete source access
  is reported as a limitation, never filled with invented native behavior.

## 1. Finding and recommendation

**Research shortlist, not dependency selection:** investigate an existing native
React Native PDF wrapper first; keep a small platform-specific wrapper as a
fallback investigation if security/accessibility gates cannot be met. Reuse the
existing image dependency for the image spike. Do not downgrade Expo or disable
New Architecture to make a candidate work. A local bundled web renderer is a
separate fallback investigation, not an automatic remote viewer.

PDF feature support does not establish safe untrusted parsing. A package can
render correctly and still fail isolation, account-switch cleanup, screen-reader
content, memory or dependency-maintenance requirements. None is accepted yet.

### Local baseline inspected today

The lockfile and installed package metadata agree: Expo 56.0.21, React Native
0.85.3, React 19.2.3, expo-image 56.0.12, expo-file-system 56.0.11 and
expo-dev-client 56.0.26. Neither lock nor installation contains react-native-pdf,
react-native-blob-util or expo-document-picker. These are metadata observations,
not a successful native build. Actual minimum OS/target SDK/build settings must
be captured from the future generated native build, not a library's fallback.

Root scripts are start/reset-project/android/ios/web/lint; no test script.
Current Task has no resource relation. Its legacy JSON save suppresses write
errors and load failure returns an empty list. Do not reuse that writer as the
durability oracle or claim this viewer plan fixes it. Preserve existing Home/theme
edits and other dirty work. Core persistence/identity foundations still precede
resource integration under the canonical implementation plan.

## 2. Source-backed candidate comparison

Observed 2026-09-26; upstream branch pages are mutable, not pinned audit evidence.
Before an authorized spike, resolve exact released artifacts, source commits,
lockfile hashes, transitive native binaries, license obligations and advisories.
Do not infer “latest published version” from a branch package.json.

| Candidate | Observed capability / source | Deep Focus disposition and missing proof |
| --- | --- | --- |
| react-native-pdf with its required native dependencies | Upstream supports local files, page navigation and zoom; excludes Expo Go. Its README exposes cache/link hooks and a permissive trustAllCerts default. [Upstream](https://github.com/wonday/react-native-pdf) | First investigation candidate, NOT selected. Wrap behind local-only resource access; never copy remote-download/TLS examples. Exact-stack build, parser isolation and accessible page content unproved |
| Small platform-specific Expo/native wrapper | Android PdfRenderer accepts a seekable descriptor, owns its close, and recommends isolated minimal-permission parsing for untrusted files off the main thread. [Android](https://developer.android.com/reference/android/graphics/pdf/PdfRenderer) | More native ownership/maintenance. Custom code is not automatically safer. iOS implementation, Android text accessibility across OS versions, isolation/lifecycle and native error recovery need a bounded design first |
| Bundled PDF.js in a local web surface | Mozilla provides a web PDF parser/renderer under Apache 2.0. [PDF.js](https://mozilla.github.io/pdf.js/) | Alternative only after native feasibility review. Bundle assets locally; investigate worker/CSP, bridge validation, no remote scripts/fonts/fetch, navigation and WebView lifecycle. Neither a dependency choice nor proof of mobile parity |
| Existing expo-image for JPG/PNG | SDK 56 documents image rendering, downscaling and cache controls. [Expo Image](https://docs.expo.dev/versions/v56.0.0/sdk/image/) | Reuse candidate, not a PDF renderer. Bound decode work, verify owner-isolated cache/view reuse and accessible image descriptions; flags alone do not prove erasure |

An external Open with action would transfer bytes and require separate explicit
consent; it cannot silently replace the approved in-app experience. A remote
Google/other online document viewer is not admitted by the local-resource policy.

### Exact compatibility questions, not a blanket green badge

- Expo SDK 55+ cannot disable New Architecture. Native libraries absent from
  Expo Go require a development build; this project declaring expo-dev-client
  does not prove that a matching installed binary exists.
  [Expo architecture](https://docs.expo.dev/guides/new-architecture/) and
  [development builds](https://docs.expo.dev/develop/development-builds/introduction/).
- The Expo-community config-plugin table lists SDK 56.0.0 / react-native-pdf
  7.0.4 / plugin 14.0.0. Its branch metadata reads plugin 14.0.3, while the viewer's
  branch metadata reads 7.0.5. This mismatch is a version-resolution question,
  not proof of incompatibility or permission to install any of them. Blob-util
  and its plugin also need exact resolution. [Plugin table](https://raw.githubusercontent.com/expo/config-plugins/main/packages/react-native-pdf/README.md),
  [plugin metadata](https://raw.githubusercontent.com/expo/config-plugins/main/packages/react-native-pdf/package.json),
  [viewer metadata](https://raw.githubusercontent.com/wonday/react-native-pdf/master/package.json).
- Inspected Android build source declares AndroidPdfViewer 4.0.1 and
  io.legere:pdfiumandroid 1.0.32; the iOS podspec links PDFKit. Therefore Android
  platform PdfRenderer guidance is NOT proof that this wrapper uses that engine
  or runs in an isolated service. Inspect the chosen artifact's actual call path.
  [Android build source](https://raw.githubusercontent.com/wonday/react-native-pdf/master/android/build.gradle),
  [iOS podspec](https://raw.githubusercontent.com/wonday/react-native-pdf/master/react-native-pdf.podspec).
- Native binary compatibility must include Android 16 KB page-size environments,
  not just successful JavaScript bundling. Verify the packaged artifact and actual
  device page size; do not confuse this with PDF page count.
  [Android guidance](https://developer.android.com/guide/practices/page-sizes).
- Apple's PDFView page required JavaScript and its offered Markdown retrieval
  failed in this research session. No VoiceOver or action-suppression claim is
  inferred from it. The podspec establishes linkage only; runtime/source inspection
  is still needed. [Apple PDFView](https://developer.apple.com/documentation/pdfkit/pdfview).

No full transitive source/security-advisory or license audit was performed.
The wrapper metadata says MIT; that is not every bundled binary's license review.
Upstream fixes/feature lists do not close any of the device gates below.

## 3. Proposed adapter boundary for the spike

This is a test design, not a production TypeScript interface or storage schema.
Use the lifecycle/ownership contracts in 34; do not create a second importer.

1. A repository resolves an owned, committed immutable asset revision. The UI
   supplies resource identity, not arbitrary file paths, URLs or renderer options.
   Native access gets the minimum scoped local handle plus current owner/view
   generation. Initial spike uses synthetic committed-asset stand-ins only.
2. Resolve → opening → displayed or typed failure → closing → closed. A new open
   invalidates the previous view generation; late loaded/page/error callbacks
   cannot repopulate the closed view or the next owner's screen. Closing is not
   deletion or task completion. No success state merely because a file was selected.
3. Check policy/ownership before open and again before accepting completion;
   owner switch/deletion closes access and clears visible/derived content. Test
   native cancellation, descriptors, process death and stale callback ordering.
   A JS Promise timeout alone is not cancellation of native parsing.
4. Disable automatic remote sources/actions, downloads, script/form submission,
   attachments and undisclosed share/clipboard actions. Review selectable-text
   menus explicitly. Rendering an existing annotation is different from editing
   or executing its action; do not hide meaningful content by assuming one flag
   solves all three. If a backend cannot enforce the admitted behavior, fail the
   candidate rather than claim “read-only” makes it safe.
5. Keep errors typed and user-readable without paths, filenames, extracted text,
   URIs or raw native exceptions in telemetry. No per-resource ad/AI enrichment,
   no analytics upload and no remote fallback. Test Internet-connected operation
   too; airplane mode cannot reveal attempted network access.
6. Scan/text/language accessibility limitations must be explicit. Controls need
   labels/focus order and PDF text needs actual readable content order; announcing
   “PDF, page 1” alone is not accessible document reading. No added OCR promise.

Potential typed outcomes: missing-or-not-owned, unsupported, corrupt, protected,
limit-exceeded, cancelled, renderer-unavailable and internal-failure. These are
proposed categories, not finalized DTO spellings. Protected-file handling remains
an owner policy decision; a fixture can verify graceful rejection without deciding
that the release must reject every encrypted file.

## 4. Isolated test preparation and measurement

### Admission before executing any native spike

- Name exact candidate versions/commits and allowed harness files, chosen native
  build environment, test commands and disposable synthetic-data directory.
  Obtain dependency/install/build authority; this plan grants none. Do not run
  reset-project or prebuild --clean in the shared dirty checkout.
- Record Android SDK/NDK/Gradle/JDK and iOS Xcode/SDK/signing conditions plus
  generated manifests/entitlements and resolved dependencies. Windows alone is
  not evidence of an iOS build. No keys in the report and no paid EAS/AWS run assumed.
- Specify an observed low-memory Android, another supported Android, an Android
  16 KB environment, and a signed iPhone build at supported OS boundaries. Actual
  models/OS support floor remain to be recorded. Emulators are supplementary;
  friends' phones are consented ordinary-use tests, not destructive storage labs.
- Device Farm remains an intended environment from 08/34, not purchased capacity.
  Test screen-reader gestures, memory instrumentation and network observability
  availability before assigning a case; missing capabilities mean NOT_RUN.
- Use synthetic si/ta/en tagged-text PDFs, scanned images, mixed documents,
  protected/corrupt/empty files, inert action/link fixtures, JPG/PNG and non-admitted
  HEIC/APNG examples. No student papers, marks, personal accounts or exploit payloads.
  Keep a fixture manifest with ID, hash, actual bytes/pages/pixels, generator/version,
  expected text/order and expected validation disposition. No fixtures created here.

### Numeric policy method

Use 35's byte/page/pixel candidates without copying them into new normative
defaults. Test below/exact/above each candidate, one varied dimension at a time,
then combinations: compressed size alone does not bound decoded memory or parse
work. Boundary files must be structurally valid; don't pad a PDF into corruption
and mislabel its rejection as a size-bound pass.

Measure baseline and incremental native memory, peak total memory, render/open
time, input responsiveness, cache/staging disk, crash/ANR and cancellation latency.
Proposal for repeatability: three cold opens and ten open/close cycles per ordinary
fixture/device, with raw samples retained. This is a sample plan, not a statistically
proven performance threshold or product default. Use release-like builds separately
from debug traces. Monotonic leakage across cycles is a failed investigation.

Before stress cases, the harness must have reviewed worker/process containment,
memory/time ceilings and a safe operator abort. Those ceilings are OPEN, so do
not run unbounded huge-file tests now. Report measurements without declaring a
performance PASS until thresholds and supported devices are explicitly agreed.
No auto-delete/auto-compress, universal 1 GiB device guarantee or paid upsell.

## 5. Device test matrix

All rows are future procedures, **NOT_RUN**. For every row record exact build hash,
dependency lock/commit, device/OS/page-size, fixture IDs/hashes, steps, expected vs
actual result and sanitized evidence path. A fixture/harness limitation is not PASS.

| ID / parent probe | Fixture and action | Required observable result / evidence | State |
| --- | --- | --- | --- |
| RV-T01 / RO-T04 | Build the separately authorized exact candidate on Android/iOS New Architecture; open local text PDF offline | Native view loads in signed/installed build; lock/native dependency and build logs retained; Expo Go or JS-only success insufficient | NOT_RUN |
| RV-T02 / RO-T04 | Inspect chosen Android engine/process and iOS call path; close during open | Actual parser, permissions, process/thread and handle ownership recorded; isolation/control gaps fail admission pending qualified review | NOT_RUN |
| RV-T03 / RO-T02/04 | Inert link/action/form/attachment fixtures; open and tap while online | No automatic network, external launch, execution, mutation or undisclosed transfer; OS/network evidence, not only JS request hooks | NOT_RUN |
| RV-T04 / RO-T03 | Valid bounds from 35, high-compression and complex-page fixtures under harness ceilings | Peak memory/open time/cancel metrics recorded; responsive safe failure, no eager all-page decode; numeric safety remains unapproved until threshold review | NOT_RUN |
| RV-T05 / RO-T05 | Known tagged si/ta/en text and scanned equivalents; TalkBack/VoiceOver through controls/content | Expected text/order checked against manifest; zoom/back/large labels usable; scanned limitations disclosed; screenshot/visual rendering alone cannot pass | NOT_RUN |
| RV-T06 / RO-T06 | Owner A open → close/logout/switch B → relaunch; deliberately delay A callbacks | No A content in B view/memory-backed reused component/cache; native handles cleaned per policy; sanitized trace and owned-storage inspection | NOT_RUN |
| RV-T07 / RO-T06 | Kill/background/rotate while opening or removing synthetic asset; restart | No phantom success or deleted revision resurrection; exact recovery state and original hash preserved; backup policy gaps remain gates | NOT_RUN |
| RV-T08 / RO-T05 | Start focus → open PDF/image → lock/background → return | Same session/timestamps recovered; no double timer/reward/completion and no focus/recovery ads; lifecycle trace | NOT_RUN |
| RV-T09 / RO-T02/08 | Damaged/empty/protected PDF, false MIME, APNG/HEIC; cancel while validating | Typed safe rejection or admitted behavior; no crash, hidden conversion/upload or original deletion; exact unapproved policy choices reported | NOT_RUN |
| RV-T10 / RO-T07 | Only if external action is separately admitted: no handler, denied/cancelled handoff | Explicit disclosure and temporary grant; no silent share/remote fallback; external copies not falsely claimed recalled | NOT_RUN |
| RV-T11 / RO-T04 | Verify packaged native binaries and install/open on 4 KB and 16 KB Android environments | Actual page size, binary alignment and installed behavior recorded; no missing-library/crash; one environment cannot substitute for both | NOT_RUN |
| RV-T12 / RO-T03/06 | Repeated JPG/PNG previews and PDF open/close; synthetic disk-full and restore in disposable lab | Bounded working set/caches, no other-owner exposure or source deletion; backup bytes/metadata/keys checked against approved policy, otherwise unresolved | NOT_RUN |

RV-T10 is conditional, not a reason to add external sharing. If excluded by the
approved candidate scope, record that decision before marking it N/A. All other
applicable unrun cases remain gates; no average score can offset a privacy leak.

## 6. Small implementation handoff and decision rule

| Next card | Bounded output | Admission / stop |
| --- | --- | --- |
| RV-02, source audit | Exact candidate artifact/dependency/license/advisory and parser-path dossier; recommend one spike candidate | Read-only research can continue; do not equate branch metadata with released bits or certify security |
| RV-03, isolated harness | Disposable native viewer with synthetic local assets and instrumentation only | Exact candidate/environment/file/install authority plus reviewed isolation/abort plan; no production repository integration |
| RV-04, evidence review | Per-device matrix and measured-limit proposal, failure dispositions | Real evidence plus independent qualified review; no synthesized PASS or pricing change |
| LR-01 continuation | Final admitted format/viewer/limit/owner policy and resource implementation brief | Owner choices, review and durable identity/import prerequisites from 12/34; no skipped foundations |

These cards are DRAFT, not new authorization or executable commands. Do not build
every alternative simultaneously. First inspect the wrapper's exact released
source; if it cannot enforce the required privacy/action/isolation behavior,
document the gap and compare the custom-native alternative before seeking spike
approval. Do not silently downgrade accessibility or in-app viewing.

Candidate acceptance requires exact Android+iOS builds, relevant passing cases,
resolved numeric/key/backup policies, maintenance/license/advisory disposition and
independent review. A blocker on one required platform is not a two-platform pass.
This plan's completion is documentation progress only, not viewer implementation,
January delivery assurance or production security acceptance.

## 7. RV-02 — exact release source/dependency audit

### Bounded task brief

2026-09-26; owner authorized the proposed read-only release/source investigation.
Resumed 2026-09-28 after an approval-service usage-limit interruption; the failed
approval did not execute its network command. No workaround bypass was used.
Outcome: identify an exact research candidate and evidence-backed admission gaps,
not install or approve a production dependency. HIGH privacy/parser/dependency
assessment; independent qualified review remains PENDING, working alone.

Read: AI rules/execution/DoD/guardrails/map/task template in full, this document's
baseline/candidates/handoff, 01's exact format approval and current task storage;
refresh package scripts, lock metadata and dirty state. Preserve all prior work.
Allowed files: this 36, docs/revision/00-OWNER-REVIEW-SI.md,
09-COVERAGE-AND-AUDIT.md, 18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md,
and docs/CHANGELOG.md. No app/config/dependency/lock edits or new harness.

- RV2-A1: record registry release and matching source identity; distinguish metadata,
  artifact integrity and actual runtime evidence.
- RV2-A2: inspect loader and Android/iOS paths; separate observed source behavior,
  inferred risks and unperformed checks. Review direct/transitive policy limits.
- RV2-A3: recommend proceed/hold for this exact candidate, with concrete gates;
  retain all twelve NOT_RUN device cases and unresolved production policies.
- Checks: primary-source links and narrow source observations, existing check-docs,
  whitespace/matrix counts and full added-text self-review. No code execution from
  external packages; no installs/builds/uploads/spend/agents/commit/deploy.
- STOP: report unavailable artifact/source/advisory evidence rather than invent a
  clean security result. Reversible docs only; no user-data migration or rollback.

### Release identity and artifact evidence — September 28

**Disposition: HOLD for integration or automatic installation.** The bounded
source investigation is recorded; this is not a completed transitive security
audit. No release is selected for Deep Focus. The research tuple below makes
future checks reproducible; it is NOT a compatible, approved dependency lock.

| Published artifact inspected | Registry observation | In-memory archive check |
| --- | --- | --- |
| react-native-pdf 7.0.5 | Published 2026-08-13; npm gitHead and GitHub tag resolve to `5aa68703ee8d931d829bac223d47e62c645011a3` | 99,793 compressed bytes; SHA-512 matches registry; eight selected files byte-identical to that commit |
| @config-plugins/react-native-pdf 14.0.2 | Published 2026-08-15; registry latest at inspection; Expo peer >=56 | 2,423 compressed bytes; SHA-512 matches; inspected packaged build/withPdf.js |
| @config-plugins/react-native-blob-util 14.0.2 | Published 2026-08-15; Expo peer >=56 | 2,294 compressed bytes; SHA-512 matches; inspected packaged build/withReactNativeBlobUtil.js |
| react-native-blob-util 0.25.1 | Published 2026-09-24; registry latest at inspection; not a compatibility guarantee | 193,219 compressed bytes; SHA-512 matches; metadata/README only, not a full native-source audit |

Sources: exact npm metadata for [viewer 7.0.5](https://registry.npmjs.org/react-native-pdf/7.0.5),
[PDF plugin 14.0.2](https://registry.npmjs.org/@config-plugins/react-native-pdf/14.0.2),
[blob plugin 14.0.2](https://registry.npmjs.org/@config-plugins/react-native-blob-util/14.0.2)
and [blob-util 0.25.1](https://registry.npmjs.org/react-native-blob-util/0.25.1);
[viewer tag](https://api.github.com/repos/wonday/react-native-pdf/git/ref/tags/v7.0.5).
Registry access used approved read-only network commands when web retrieval failed.

The PDF plugin's branch metadata previously showed 14.0.3, but the exact registry
request returned `version not found: 14.0.3`; registry latest is 14.0.2 at this
checkpoint. This explains why §2's branch observation is not an install target.
It is not evidence that published 14.0.2 is broken or that the project has a bug.

Recorded SHA-512 integrity values, in table order:

```text
react-native-pdf@7.0.5
sha512-Dho2k2TKmplmd7XGgfW+rMAInaw6Pf6g88BSYPX423b/fCzLB5K/h+YaoW+YRUhtWO/cJ4EEnz5uD3RwwigDPQ==
@config-plugins/react-native-pdf@14.0.2
sha512-Vs+KH2p5H+0k+5ANCnFbQUjJeyGvkU11DW5hbefXCFu+kVOr4COaL5qiRH0jVuanedUi9IDOq6ywr7zeMyXQ5Q==
@config-plugins/react-native-blob-util@14.0.2
sha512-VpAcGtwj+0JcDb2zFDde9t3vEQ/8EhrxbsJETs2nso6iKrNS13FU5kl7zCtEyrRJOGEdOk52XKtcpudMjH0Faw==
react-native-blob-util@0.25.1
sha512-HMzab2SL8h48pvfufji0TKdet/jnNvamxYmYyNqTV5YOge00V28ycdc3S4leHjGXMJ1+fS2j2SrQ3aG5pzbx1w==
```

Own Node code fetched archives into memory, computed SHA-512, decompressed and
read tar entries as bytes only. No files extracted to disk, package code executed,
install hooks run or project lock changed. Matching a registry checksum proves
byte consistency with that registry record, NOT maintainer authenticity, signature
verification, vulnerability absence or build safety. npm signatures were not verified.
Only these eight viewer files were compared with pinned GitHub bytes: index.js,
Android PdfView.java, iOS RNPDFPdfView.mm, android/build.gradle, the podspec, both
Android manifests and LICENSE. This is not complete archive-to-repository parity.

### Source findings and required disposition

| Finding | Observed evidence | Inference / action before admission |
| --- | --- | --- |
| RV-F01 — broad plugin permissions | Packaged blob plugin adds READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, DOWNLOAD_WITHOUT_NOTIFICATION and ACCESS_NETWORK_STATE; also a download-complete action and non-exported BlobProvider | Generic plugin behavior exceeds our narrow local-file need. Review minimum necessary manifest/config path; prove final merged permissions and absence of unwanted runtime requests. Declarations alone do not prove granted permissions or a leak |
| RV-F02 — parser containment unproved | Android wrapper subclasses PDFView and loads via configurator; its two manifests declare no isolated service. Gradle names AndroidPdfViewer 4.0.1 and pdfiumandroid 1.0.32 | A background parse is not process isolation. Full dependency call path/merged manifest is still needed; do not assert the library has the Android platform renderer's isolation properties |
| RV-F03 — loader has broader inputs than our contract | Pinned JS dispatches HTTP(S), bundled assets and base64; constructs a cache path from caller-supplied cacheFileName or URI hash and initiates unlink before loading. Unmount clears the download-task reference with cancellation commented out | Never expose arbitrary source/cacheFileName props from user metadata; restrict to owned immutable local handles, disable download routes, verify owner-generation cleanup. Unmount is not proof of cancelled I/O; not a reproduced Deep Focus exploit |
| RV-F04 — link/text/lifecycle hooks need testing | Android external URI handler emits a JS event; iOS PDFView delegate emits linkPressed, creates PDFDocument from file URL/data, retains selection state, and has recycle/dealloc cleanup methods | Event existence is not proof of all action interception, accessible reading, clipboard control or full cleanup. RV-T03/05/06 must test exact native behavior and late callbacks |
| RV-F05 — build plugin is not a security adapter | Packaged PDF plugin adds Android packaging pickFirst rules to Groovy build files and warns on other languages | It does not establish parser containment, compatible final binary selection, 16 KB alignment or a successful SDK 56 build |

Pinned source for RV-F02/04:
[Android PdfView](https://github.com/wonday/react-native-pdf/blob/5aa68703ee8d931d829bac223d47e62c645011a3/android/src/main/java/org/wonday/pdf/PdfView.java),
[manifests](https://github.com/wonday/react-native-pdf/tree/5aa68703ee8d931d829bac223d47e62c645011a3/android/src/main),
[Android build](https://github.com/wonday/react-native-pdf/blob/5aa68703ee8d931d829bac223d47e62c645011a3/android/build.gradle),
[iOS view](https://github.com/wonday/react-native-pdf/blob/5aa68703ee8d931d829bac223d47e62c645011a3/ios/RNPDFPdf/RNPDFPdfView.mm).
RV-F03 uses [pinned loader](https://github.com/wonday/react-native-pdf/blob/5aa68703ee8d931d829bac223d47e62c645011a3/index.js),
particularly componentWillUnmount/_prepareFile. RV-F01/05 use the packaged build
files from the checksum-checked exact plugin archives linked by registry metadata.
No public vulnerability disclosure or upstream mutation was made.

### Dependency, license and advisory boundaries

Viewer direct JS requirements are crypto-js 4.2.0 and
deprecated-react-native-prop-types ^2.3.0; peers include blob-util >=0.13.7 and
unbounded React/RN versions. Blob-util 0.25.1 declares base-64 1.0.0; its README
minimum-version/New Architecture statements are not an exact RN 0.85.3 build test.
The native viewer build also declares Gson 2.13.2 and a React Native resolution
expression. A future resolved npm/Gradle/Pods inventory must include actual native
binaries, hashes, notices and runtime vs build/example-only dependency separation.
No full transitive graph was resolved, and blob-util's native source remains unaudited.

The pinned viewer LICENSE is MIT and registry metadata labels these four packages
MIT. Preserve applicable notices; transitive/binary license obligations are not
cleared by those labels. No commercial license entitlement is implied.

Upstream [issue 997](https://github.com/wonday/react-native-pdf/issues/997) reports
an older 7.0.3 iOS dependency concern, but the inspected report does not identify
a concrete affected component/CVE sufficient to establish a 7.0.5 vulnerability.
Do not repeat its older “latest/unmaintained” claim as a current fact. It is a
triage lead, not a clean bill of health or a verified finding against our build.
Viewer advisories page was reachable; blob-util advisories retrieval failed.
No exhaustive advisory/database scan or affected-version/reachability assessment
was completed. Native engine and platform patch-level review remain mandatory.

### Decision and next bounded step

RV2-A1 identity/artifact checks completed as scoped; RV2-A2 source observations and
limits documented; RV2-A3 disposition is HOLD. All RV-T01–12 remain NOT_RUN.
Do not automatically install the tuple, waive permissions, remove the in-app
experience, disable New Architecture or turn read-only props into a safety claim.

Next safe action: a narrow native permission/containment feasibility specification
addressing RV-F01–04, comparing the audited wrapper boundary with a custom native
adapter only where it cannot meet the contract. It must establish how parser work
is contained/cancelled and how private handles are revoked before requesting an
isolated build. Independent qualified review and exact install/build authority
remain gates; no user decision is needed merely to preserve these findings.

The next specification is now [37](37-VIEWER-PERMISSIONS-AND-CONTAINMENT.md):
permission deltas, platform-specific containment, view leases and truthful
close-pending behavior, with six NOT_RUN refinements of this test matrix. It does
not close the HOLD or select a native adapter; qualified review remains necessary.
