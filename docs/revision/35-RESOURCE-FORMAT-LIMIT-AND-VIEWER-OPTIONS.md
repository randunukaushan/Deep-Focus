# Resource formats, limits and viewer — owner option sheet

2026-09-26. **Format families and in-app read-only viewing direction APPROVED;
detailed policy PROPOSED / REVIEW_PENDING.** The owner's later “හා” confirms
the explained file-type/viewing direction, not every option-sheet detail.
[01](01-REQUIREMENTS-AND-DECISIONS.md) owns approval; [12](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md)
and [34](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md) own local-resource boundaries.
This is LR-01 preparation, not another import lifecycle or executable migration.

## Task brief — RO-02 approval reconciliation

- Outcome: record the later September 26 approval consistently, without expanding it.
- Deliverable/phase: documentation only, LR-01 preparation; no implementation READY.
- Authority: owner's “හා” to proceeding with the explained file types and in-app
  viewing. PDF, JPG/PNG, website/video links and book/page references; read-only
  PDF/image viewing. Numeric limits and technical restrictions are not approved.
- Risk: MEDIUM exact approval transcription; self-review for this slice only.
  Surrounding HIGH parser/privacy/storage design remains independently REVIEW_PENDING.
- Read/inspect: AI rules, execution, DoD, map/task template; affected resource,
  scope/readiness/decision passages, package scripts and existing dirty work.
- Allowed files: docs/revision/00-OWNER-REVIEW-SI.md,
  01-REQUIREMENTS-AND-DECISIONS.md, 09-COVERAGE-AND-AUDIT.md,
  12-LOCAL-RESOURCES-AND-WORK-PLANNING.md,
  18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md,
  34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md, this 35;
  docs/DOCUMENTATION_MAP.md, docs/V1_FEATURE_SCOPE.md, docs/CHANGELOG.md.
- Acceptance: current summaries agree on approved families/experience; numeric,
  adapter and production gates remain explicit; ADR totals stay 2/9/1 and all
  native tests remain NOT_RUN. Historical briefs/evidence remain historical.
- Verification: existing document checker, exact patch review, git diff --check.
  Record actual outcomes in 09; structural checks do not prove runtime behavior.
- Non-goals/STOP: no code, package selection/install, SDK/config changes, pricing,
  native spike, accounts, spend, agents or deployment. No migration/rollback needed;
  stop if reconciliation would require an unconfirmed policy choice.

## Historical task brief — RO-01 (before direction approval)

- Outcome: give the owner understandable format/viewer alternatives, numerical
  prototype limits and the evidence needed to choose them without guessing.
- Scope: documentation/research only; DF-030/035/036/045/047, accepted resource
  concept. No format, number, native viewer or dependency is approved by this task.
- Risk: HIGH — untrusted file parsing, private cache and external handoff design.
  Independent qualified review PENDING; no additional agent or automatic switch.
- Read: full AI rules/execution/DoD/guardrails, map/task template, 34; 12 §§4–6,
  current approval/readiness boundaries; inspect package/task storage/types and
  dirty files. Official source observations below are distinct from recommendations.
- Allowed: new 35; revision 00/09/12/18/34/README/check-docs.mjs;
  docs/DOCUMENTATION_MAP.md and CHANGELOG.md. No source, packages, native config,
  schema, test uploads, paid accounts, commit/push or deployment.
- Baseline: Expo ~56.0.21, expo-image ~56.0.12, FileSystem ~56.0.11; no installed
  resource import/PDF viewer, DocumentPicker/SQLite/SecureStore or test script.
  Existing task JSON persistence suppresses write errors; not a durable importer.
- RO-A1: distinguish importing, viewing and editing; retain user choice and no
  supplied content. RO-A2: label all proposed values, units and boundary semantics.
- RO-A3: compare native/external/web preview privacy/capability tradeoffs; do not
  invent Expo compatibility or accessibility. RO-A4: specify validation spikes
  and NOT_RUN evidence; no approval or runtime claims from document check results.
- Checks: links/fences/IDs, document/reference scripts, source preservation,
  exact patch/new-file semantic review and whitespace. Native proof NOT_RUN.
- Recovery/STOP: reversible document-only edits; no rollback of user data. Missing
  parser/isolation, policy or owner approval stops affected implementation admission.

## 1. සරල නිර්දේශය

**මුල් release එකට PDF, JPG/PNG, website/video links සහ පොත්/page references.**
PDF සහ image එක app ඇතුළේම read-only බලන්න දීම අනුමත direction එකයි.
එතකොට task එකෙන් file එක බලලා ආපහු ඒ වැඩේට එන්න ලේසියි. PDF highlighting,
editing, OCR, Word/PowerPoint editor හෝ video hosting/player එකක් මුලදී යෝජනා
කරන්නේ නැහැ. File types සහ viewing direction එක ඔබ අනුමත කර ඇත;
පහත සියලු technical restrictions හෝ numeric limits අනුමත වී නැහැ.

File එක add කිරීම = තමන්ගේ local copy එකක් task එකට සම්බන්ධ කිරීම.
Viewer එක = ඒ file එක කියවන්න/බලන්න දෙන පහසුකම. Editor එක = file ඇතුළේ
ලියන්න/වෙනස් කරන්න දෙන වෙනම feature එක. තුනම එකම වැඩක් නොවේ.

| Option | First-release experience | Tradeoff / recommendation |
| --- | --- | --- |
| A — references/links only | Name/page/link associated with a task | Smallest implementation, but no offline document copy/view; not my preferred complete resource experience |
| B — bounded documents/images | A plus validated local PDF/JPEG/static PNG, read-only in-app viewing | Recommended direction; useful personal study/preparation with native validation/QA work |
| C — broad media/office | B plus Word/PowerPoint/audio/video and more viewers | More compatibility, codecs, memory/storage and file-security work; recommend later validation, not an approved exclusion |

Existing local-first and optional paid-cloud January requirements are unchanged.
No content library, public file sharing or teacher access is created by option B.
Future video links may open their original service; Deep Focus does not download
the media or promise the destination's availability/offline access.

## 2. Proposed detailed behavior within the approved format direction

Approval covers the format families and read-only in-app experience, not every
restriction below. Static-only PNG, encrypted-PDF handling and other detailed
admission rules still require policy resolution and technical evidence.

| Kind | Add/store | View / failure |
| --- | --- | --- |
| Physical book/paper reference | Local title + optional page/work reference | Text detail; no file, scanning or network needed |
| HTTPS link | Store entered URL locally; no title/thumbnail fetch | Explicit open after showing destination; no autoplay/embed/proxy |
| `.pdf` | Checked app-owned immutable copy | Read-only local PDF adapter; encrypted/password-required, malformed or unsupported files rejected clearly in initial proposal |
| `.jpg` / `.jpeg` | Verify actual JPEG type/dimensions and copied size | Local image preview, fit/zoom, accessible controls; original bytes not silently recompressed |
| `.png` | Verify actual static PNG, dimensions and copied size | Same image preview; detect/reject animated PNG in this proposed static-only set |
| HEIC/WebP/GIF/SVG/office/media/archive | Not initially admitted by option B | Explain unsupported format and offer reference/link; no silent conversion, upload or file deletion |

HEIC is a usability consideration for iPhone photos, not an irrelevant edge case.
Before freeze, test real synthetic iPhone-photo selection and decide whether a
separately previewed local conversion or native HEIC support is worth admitting.
Neither is authorized here. Do not market “all photos supported” with only JPEG/PNG.
Picker filters are convenience, not validation; double extensions, false MIME,
embedded actions and damaged files still require safe handling.

## 3. Candidate limits — starting hypotheses for device tests

**These are assistant-proposed engineering values, not measured safe limits,
provider maxima, legal requirements, customer offers or owner-approved defaults.**
One MiB = 1,048,576 bytes; GiB = 1,073,741,824 bytes. Display units consistently;
do not label a binary value MB in one screen and interpret it as decimal elsewhere.

| Parameter | Candidate inclusive maximum / rule | Why test this; what may change |
| --- | --- | --- |
| PDF encoded file bytes | 25 MiB = 26,214,400 bytes | Initial paper/notes envelope; large scanned books may exceed it; validate representative synthetic documents |
| Image encoded file bytes | 10 MiB = 10,485,760 bytes | Bounds copy/storage, not decoded memory or decoder complexity |
| Image dimensions | width × height ≤ 24,000,000 pixels; each dimension ≤ 16,384, positive integers | Accommodates common photo-sized candidates while bounding dimensions; still potentially expensive |
| PDF page count | 1–300 | Bounded paper/notes scope; page count alone cannot bound a malicious page's work |
| File imports | One selected file / one active import per app instance | Simpler cancellation, quota and error recovery initially; no automatic bulk import |
| Local resource byte budget | 1 GiB per owner namespace, including retained assets, staging/reservations and derived disk files | Device protection, same proposal for free/paid users; not a paid-cloud GB allowance |
| Local resource count | 1,000 non-erased resource records per owner, including references/links | A finite repository/UI test bound, not proof that 1,000 renders are responsive |
| Source display title | 1–200 Unicode code points after trim | Preserves Sinhala/Tamil; don't truncate mid-code-point; filenames never become filesystem keys |
| Reference description | At most 2,000 Unicode code points | Bounded local note, not a full document editor |
| HTTPS URL | At most 4,096 UTF-8 bytes, valid parsed HTTPS and no embedded username/password | Allows many resource links while excluding credentials; not a safe-destination guarantee |

No overwrite or silent deletion when a limit is reached. Offer Cancel, use a
reference/link, or let the user explicitly manage their own saved copies. Local
budget adjustment can be a future approved setting; do not invent auto-paid
upgrades. Subscription expiry never reduces this local budget or deletes originals.
The global multi-owner device cap, parser execution/decoder memory/time bounds,
disk free-space safety reserve, staging lifetime and key/backup rules remain
OPEN. Thus this table is **not a complete production policy or READY gate**.

For initial fixtures, 24 million pixels × 4 bytes is 96,000,000 bytes (about
91.6 MiB) for just one hypothetical full RGBA buffer, excluding decoder/extra
buffers. A 10 MiB compressed image can therefore be expensive. Use a bounded
metadata reader and downsample/tile; do not first decode the entire image merely
to discover that it is too large. Do not eagerly render every PDF page.

Validate measured final copy, not only picker size. Unknown size is not zero;
choose an adapter that can bound copying/temporary allocation before enabling
that source type. Account for cache + staging + final overlap and preview files
without double-counting the same physical allocation. A provider-managed download
outside app control must be disclosed/tested, not claimed controlled by our cap.
No file import can guarantee free disk remains available after the check.

These values do not select cloud pricing/quota or permit cloud uploads. A future
cloud policy may be stricter; display local validity and upload eligibility
separately, never mislabel a valid local save as successfully stored in cloud.

## 4. Viewer comparison and recommended technical investigation

| Approach | Benefit | Risk / admission gate |
| --- | --- | --- |
| Local in-app image component | Keeps task context; existing expo-image dependency candidate | Downscaling, cache isolation, account switch, zoom and actual script/accessibility tests |
| Read-only native-backed in-app PDF | Keeps flow; avoids uploading to a web viewer | Native bridge/library, Expo 56/RN 0.85.3 compatibility, maintenance/license, parser isolation and accessibility require proof |
| Explicit external viewer | Can reuse a user's existing app | No installed handler is possible; selected bytes leave our process; other-app copies cannot be recalled |
| Remote online viewer/converter | Can simplify rendering implementation | Sends private files/URLs to another processor; not compatible with current local-default consent boundary, not recommended/admitted |

Recommendation: investigate option B with in-app images and a local native-backed
read-only PDF adapter. Do not select a package just because a README says Expo.
Apple PDFKit and Android PdfRenderer establish platform possibilities, not a
ready cross-platform React Native component. A wrapper can use different engines
or permissions; audit the actual implementation and exact installed build.

PDF minimal proposed UI: open/back, current/total page, page navigation, fit/zoom,
clear load/error/retry state; no annotation/form filling/embedded attachments,
automatic external links, script execution or remote processing. Disable or
intercept actions with the actual adapter; if that cannot be demonstrated, do
not claim the adapter meets this proposal. Preserve focus lifecycle on return.
Bitmap rendering alone is not accessible text. Prove supported text-PDF reading
with TalkBack/VoiceOver and expose honest limits for scanned pages; OCR is not
silently added. User-entered labels do not make page content screen-reader accessible.

Private images/thumbnails must not survive account switch through reusable views
or caches. Prefer no automatic disk cache for private previews in the initial
spike; an explicit derived cache would need owned paths, purge/backup rules and
capacity accounting. Cache-policy flags alone are not a verified privacy purge.

External Open with, if offered, is explicit and separately tested with minimum
temporary permissions. A generic share sheet may send files elsewhere; label it
Share/export, not a guaranteed private viewer. No automatic external handoff or
online-upload fallback after a PDF preview failure. If the native path is not
viable, return to the owner with the external-viewer tradeoff rather than silently
cutting the agreed experience. Still no dependency selection/install in this task.

## 5. Source facts versus the recommendations above

Checked 2026-09-26. Numbers in §3 are **not** prescribed by these sources.

- SDK 56 expo-image documents JPEG/PNG support, downscaling and cache controls.
  It is an image renderer, not a PDF solution. Our package declaration is ~56.0.12;
  docs currently show ~56.0.13. This does not authorize an update or prove which
  patch is installed. [Expo Image](https://docs.expo.dev/versions/v56.0.0/sdk/image/).
- Apple describes PDFKit/PDFView/PDFDocument for presenting and working with PDFs.
  Its full page needs JavaScript; the official indexed text supplied the cited
  capability description. It is not evidence of our mobile integration.
  [Apple PDFKit](https://developer.apple.com/documentation/pdfkit).
- Android PdfRenderer documentation calls for a seekable descriptor and recommends
  isolated minimal-permission rendering for untrusted files; construction can be
  long-running. This motivates a native security spike, not main-thread parsing.
  [Android PdfRenderer](https://developer.android.com/reference/android/graphics/pdf/PdfRenderer).
- OWASP advises allowlists, size bounds, generated storage names and combined
  validation; MIME/signature alone are insufficient, and public scanning services
  risk data leakage. Applying those principles to local import is our design
  inference, not certification of a mobile parser.
  [OWASP file handling](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

## 6. Evidence needed before selecting implementation

All investigations below NOT_RUN. Owner direction plus actual spike results and
independent review must precede an LR-01 READY declaration. Use synthetic files,
approved isolated native build environments and the testing plan in 08/34.

| Probe | Required evidence | State |
| --- | --- | --- |
| RO-T01 | Candidate limit minus one / exact / plus one byte, pixel, page and count; measured-copy validation, unknown sizes, no unit confusion | NOT_RUN |
| RO-T02 | Allowed/static vs disguised/animated/malformed/encrypted files; bounded metadata/parser failure without app crash or remote processing | NOT_RUN |
| RO-T03 | Low-memory Android and representative iOS, scanned/text/Sinhala/Tamil PDFs; peak memory, time to page, cancellation and huge-page cases | NOT_RUN |
| RO-T04 | Native PDF engine/permissions/isolation, maintained dependency/license and exact Expo/RN build compatibility | NOT_RUN |
| RO-T05 | Screen-reader page content/controls, large text, zoom/back and same focus-session recovery; honest scanned-page limits | NOT_RUN |
| RO-T06 | Account A preview → B/login/logout/relaunch; memory/disk/thumbnail/backup leakage, no background uploads | NOT_RUN |
| RO-T07 | External handler absent/denied/share cancelled; temporary grant and explicit bytes-transfer disclosure | NOT_RUN |
| RO-T08 | HEIC selection, unsupported-format guidance, full disk, replacement overlap and local-vs-cloud quota distinctions | NOT_RUN |

Owner format/experience direction confirmed September 26; do not re-ask that
broad choice. Numbers remain assistant-proposed prototype candidates, not approved
defaults. Production values require measured evidence and explicit final policy.
No PDF package, installation, native spike or launch acceptance follows from this
approval or from a passing link checker.

[36](36-RESOURCE-VIEWER-COMPATIBILITY-AND-DEVICE-TEST-PLAN.md) refines the next
step with source-backed viewer candidates, exact-stack compatibility questions,
an isolated measurement plan and twelve NOT_RUN device cases. It selects no
dependency and does not replace this document's unapproved numeric candidates.
