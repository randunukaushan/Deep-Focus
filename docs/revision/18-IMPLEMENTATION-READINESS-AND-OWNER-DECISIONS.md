# Implementation Readiness and Remaining Owner Decisions

**Current entry: [Final Build Guide](49-BUILD-ENTRY-HANDOFF-SI.md).** The owner
asked to finish the broad documentation pass. Section 6's D1–D9 items now map to
specific implementation lanes in guide §6, rather than another global planning
cycle. This sheet preserves detailed pending facts and historical evidence;
none of those items is marked implemented or accepted by closing the guide.

මෙම package එකෙන් Lunaට ඉදිරියේ වැඩ දිය හැකි අනුපිළිවෙළ, contracts සහ
failure scenarios දක්වා ඇත. එහෙත් **සියලු enterprise features දැන්ම build-ready
කියන එක නොවේ**. තීරණ නොගත් product/security facts අනුමාන කරලා පිරවීම නොකරයි.
මේ සටහන මුළු වැඩේ ඉවර බවක් හෝ January release guarantee එකක් නොවේ.

For the current remaining-work queue, start at **section 6**. Earlier dated
checkpoints retain historical omissions; later packets may have filled a specific
document gap without implementing or accepting the corresponding feature.

October 3 build entry: [49](49-BUILD-ENTRY-HANDOFF-SI.md) supplies the bounded
L-02A coding handoff and separates immediate prerequisites from later launch
facts. [48](48-API-OWNERSHIP-AND-CONSOLIDATION.md) inventories all eight API
slices (82 operations), records component collisions and the corrected draft
empty-cursor rule. This is not full V1 specification freeze or runtime acceptance.

## 1. What exists now

| Work area | Durable artifact / evidence | Not yet achieved |
| --- | --- | --- |
| Vision and market | 80-family register, retained 20-app research, Sri Lanka student/teacher evidence | User interviews/willingness-to-pay proof, every future subfeature fully specified |
| Core reliability | `13`, six CR cards/20 scenarios, eight actual pure-engine diagnostics | Five reproduced engine gaps remain unfixed; storage/device tests not run |
| Backend first slice | `14`, 14-operation OpenAPI, input/output schemas, nine-table guarded SQL prototype | SQL execution, business RPCs, auth/RLS proof or deployed API |
| UX | `15`, 27 mobile routes, token pairs, eight UX cards/24 cases | Exact tokens/fonts approved, rendered UI or navigation implementation |
| Safety/commitment | `19`, four SC cards/20 cases; Focus Bet/health-component contradictions reconciled | Proposed default/snapshot/interaction freeze, runtime/device/AI-safety tests; no strict mode implemented |
| Settings/progress/units | `20`, five SP cards/24 cases; strict account/analytics output shapes and default/unit provenance | Numeric default/reward/day-rule freeze, migrations and app/backend behavior tests |
| Remaining backend | `16/22`, all 33 extension inventory rows covered by 12 personal + 15 operations + six reward/AI operations (47 unique with core), strict selected outputs, fourteen sync commands, eight BX cards/24 cases | Full V1 wire consolidation including generation/revision/assessment/provider families, executable migrations/handlers, open policies and independent review |
| Website/Portal | `17`, 25 proposed pages, two auth handlers, ten WP cards/24 cases | Next project/host/configuration, working auth/privacy/billing, production release |
| Local resources/education | `10–12`, own-resource workflows, independent teacher organizer and bounded classroom V1 placement | Official pack approval, concrete classroom contracts/review and minor-data eligibility, paid cloud deployment |
| Release/operations | `07/08/17`, scope/evidence/rollout/rollback gates | Owner facts, completed staging/device/browser/security/legal signoff |
| Engineering workflow | `21`, documentation map, short root/AI rules, `docs/ai` execution/risk/DoD/model mapping/task brief | Independent governance review; full canonical feature decomposition and remaining implementation contracts |
| AI generation/recovery/revision | `23`, explicit lifecycle/terminal races, reference model/checker, five draft cards and 24 integration scenarios | Strict HTTP schemas, full ordered block/break schedule, conditional child/review results, provider/runner/retention decisions and real concurrent tests |
| Latest daily-plan/wire refinement | `24`, ordered focus/break/reminder DTOs, v2 plan command, five new wire operations (52 total), 16 integration scenarios | Plan SQL/RPC, versioned sync/snapshot/export/deletion, post-save lifecycle, provider/conditional AI admission and real tests; prior row is the earlier checkpoint |

Latest continuation: [25](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md) supplies the
proposed saved-plan lifecycle/privacy/compatibility design and synthetic checker,
five PL packets and twelve future runtime cases. Strict current-plan/v2 sync/
export schemas, SQL/RPC, client/provider integration and independent review are
still missing at that checkpoint. [26](26-SAVED-PLAN-MANAGEMENT-WIRE.md) now adds
strict PL-01 read/edit/action/receipt DTOs and two operations (54 total across six
files). [27](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md) adds PL-02's six routes
(60 total across seven files), seven-entity snapshots, eighteen commands, atomic
grouped pull and a plans-only export section.
[28](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md) now types the outer artifact with
fourteen sections and explicit exclusions/deferred-family coverage (no new routes).
Actual storage inventory, mappings/access processes for retained deferred data,
export policy/delivery, SQL/client/provider/independent-review evidence remain open.
These continuations refine earlier rows, not their runtime status or authority.

[29](29-PLAN-DATABASE-RPC-TEST-PACKET.md) now provides the PL-03 execution/test
specification: seven draft cards, seven open gates and 24 NOT_RUN cases. Actual
SQL/RPCs, approved disposable environment/harness, security review and migration
evidence are still absent; the nine-table prototype is not a complete foundation.
The new checker verifies packet structure/order only, not any database behavior.

[30](30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md) adds PL-04's partitioned local
storage, immutable outbox, snapshot/privacy-reset, editor and reminder-recovery
draft: six cards, six open gates, twenty NOT_RUN device cases and a synthetic
state checker. App/package files are unchanged; migration, Auth/SQLite/OS tests,
independent review and exact local privacy/adapter policies remain open.

[31](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md) adds PL-05's eight unfilled evidence
gates, four draft cards and twelve NOT_RUN release scenarios. The actual candidate
is unspecified and ineligible; its checker validates an honest blocked inventory
and synthetic gate logic, not production safety. PL-01–05 specification drafts
are now all present. Their implementation, review and release acceptance remain
pending; this is not completion of the whole enterprise documentation package.

The detailed input-shape fixtures and structural checks validate documents, not
application behavior. Source code and deployment have not changed in this work.
All future scenario tables must remain marked NOT RUN until real evidence exists.

[32](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) maps all 80 families and the five
September 25 release answers. [33](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md) adds
paid-cloud research/lifecycle, six draft cards and twenty NOT_RUN cases. Exact
cloud wire/schema/provider policies, runtime evidence and independent review
remain open. These artifacts do not complete the enterprise implementation freeze.

## 2. Decisions already made — do not ask again

Classroom detail checkpoint, September 29: [39](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md)
adds eight DRAFT cards, 24 NOT_RUN scenarios and six gates. The inspected current
Task JSON adapter cannot establish durable, owner-isolated assignment acceptance.
No classroom SQL/API/UI/test harness was implemented. Exact eligibility/retention,
invitation controls, validation/recovery configuration, canonical wire/schema,
privacy export coverage and independent review remain before activation. Ordinary
design preparation may continue; legal facts/prices/spending/review involve owner.

September 30: [40](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md) and its schema/
OpenAPI now specify 22 classroom operations and relational/transaction boundaries.
Local DTO/structure checks are runnable; TX-01–24 remain NOT_RUN. This partially
prepares G3/G4, not approved production caps, tested SQL/RLS, account-export
integration or an independently accepted design. CL cards remain DRAFT.

September 30 CR-00: [41](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md)
adds scoped canonical references and access/integrity coverage. Six SQ gates stay
OPEN; no disposable target, runnable migration, identity bridge acceptance or
database proof exists. Classroom export coverage cannot silently reuse the current
fourteen-section format. Reference reconciliation is not design acceptance.

September 30 TI-00: [42](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md) selects
the minimal deleted-link/live-FK representation and server-only PostgreSQL identity
bridge candidate. Design alternatives are narrowed; SQ-02/03 stay OPEN until
qualified review and actual tests. Sixteen TI-T scenarios are NOT_RUN. No roles,
SQL, source code, credentials or retention duration were created/approved.

September 30 SF-00: [43](43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md) specifies
22 internal function signatures, capability boundaries, migration ordering and
isolated runner inputs/schedules/oracles. Seven migration files and the runner
remain UNCREATED; all 40 TX/TI scenarios remain NOT_RUN. Shared helper contracts,
exact reviewed DDL/toolchain/target, policy and independent review still gate
implementation/execution; a complete entry inventory is not a secure backend.

September 30 HC-00: [44](44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md) adds
canonical command digest/replay/expiry, auxiliary cursor storage and invitation
delivery/redemption helper candidates plus runnable synthetic reference vectors.
Public DTOs stay unchanged. These narrow behavior gaps, not SQL/crypto-adapter
implementation. Closed-command retention, key custody/adapter compatibility,
isolated execution authority and independent design review remain unresolved.

October 1 FA-00: [45](45-CLASSROOM-ADAPTER-FEASIBILITY-REVIEW.md) found that the
combined 43/44 SQL-only GCM path lacks a documented compatible primitive and put
it on ADAPTER_HOLD. Edge crypto plus atomic DB writes is proposed, not adopted;
internal digest/preparation/delivery signatures must be reconciled before bodies.
Pre-jsonb decoded-NUL validation now has reference regressions. No runtime,
independent review, provider selection or production readiness is established.

October 1 EB-00: [46](46-CLASSROOM-EDGE-DATABASE-BRIDGE.md) fills that internal
interface gap with strict preparation/material/delivery schemas, signature/grant
changes and bounded same-command recovery. Correct operation counts are thirteen
mutations and nine reads, plus one private preparation call; public routes remain
22. No key/nonce allocator, shared SQL foundations or real adapter is implemented;
ADAPTER_HOLD and required independent review remain. Synthetic checks cannot lift them.

October 2 KN-00: [47](47-CLASSROOM-KEY-NONCE-AND-REVIEW-BRIEF.md) documents
separate purpose-specific key custody, a durable per-key nonce-counter candidate,
rotation/restore fencing and the independent-review brief requested by the owner.
K1/K2, invocation budgets, retention/destruction and allocator implementation are
not approved; no key was generated or provider account/tool was used.

- Work alone; no agents. Sinhala explanations with English technical identifiers.
- Android + iOS + Public Website + Account Portal target January 1, 2027; full productivity
  web is later. 25–35 owner hours/week; budget amounts discussed later.
- Supabase PostgreSQL/Auth/Edge API, Expo SQLite domain data, SecureStore credentials,
  Next.js Website/Portal framework. Provider deployment/settings are separate.
- Home / Plan / Focus / Progress / Profile; Rewards inside Progress. Supplied
  blue/navy/coral logo/brand direction; exact tokens remain review proposals.
- Organize work and make doing it easier; no supplied academic papers/notes/videos.
  Sri Lanka O/L/A/L/higher-stage education first; independent personal-teacher
  planning plus bounded private invitations/assignments/selected-progress/text
  feedback targeted for V1 (September 29 record); no full LMS/file sharing or
  private timetable/notes/history access. Stage is not age consent.
- Optional personalization/defaults/redo, language separate from country pack,
  General/Custom mode; own motivation phrases/default/off. Sinhala/Tamil/English
  launch selection approved September 25; other locales later, qualified QA still needed.
- Resources local by default; optional paid cloud required for January by the
  September 25 reply; price/limits/security and launch acceptance still gated.
  Subscription alone is not upload or sharing consent.
- No missed-work XP penalties or unverified health predictions. Choose focus-exit
  behavior in Settings beforehand; separate Emergency exit remains available
  even when ordinary End early is disabled. Exact interaction/in-session rules
  remain open, not emergency-exit availability.
- Limited free AI + optional paid AI, core usable without AI, unobtrusive ads in
  the initial release. Allowance/prices deferred; ad implementation details open.
- January-first policy: document feature deferrals if measured progress shows
  date risk; no specific cut yet and no safety/quality waiver. Website/Portal
  remain required, full productivity web later. Ordinary design/specification
  delegated; spending/prices/legal facts/required independent review ask owner.

## 3. Minimum decision sheet

Record actual replies in [01](01-REQUIREMENTS-AND-DECISIONS.md), including exact
scope and date. A generic “carry on” authorizes this documentation work, not
every proposed provider, legal declaration, price or irreversible operation.

| Decision | Recommendation / missing fact | What can continue without it |
| --- | --- | --- |
| ADR-004 safety | No XP penalties/unverified health claims; ordinary End early configurable beforehand, separate Emergency exit always retained. Exact interaction/in-session setting policy still open | Core correctness and configuration design; no invented hard lock |
| ADR-005 AI packaging | Free allowance + optional paid AI approved; initial ads-free proposal REJECTED, unobtrusive launch ads required. Amounts/prices deferred; ad formats/placements/provider/eligibility still open | Shared usage contracts and ad-safe boundaries; no SDK or priced offer |
| ADR-006 January slice | Android+iOS+Website+Portal, personal teacher, bounded classroom and paid cloud targeted; January-first deferral policy approved; exact additions/conditional AI checkpoint/estimates and specific cuts remain | Shared foundations and visible revised release map; no silent cuts or safety waiver |
| ADR-002 web host/configuration | Choose host, region and pinned compatible versions; Vercel is a candidate, not activated | Route/content/DAL specifications; no account/purchase/deployment |
| ADR-003 tokens/fonts | Review proposed token sheet and actual script/large-text prototype | Contrast arithmetic, component contracts; no broad overwrite of owner edits |
| ADR-007/008 education/locales | O/L/A/L/higher-stage, personal teacher and bounded classroom placement; si/ta/en initially APPROVED. Concrete sharing/policy/review, any metadata pack and qualified locale reviewers remain | No-pack personal organization, bounded sharing and locale specification; no real-minor pilot, official content or completed-QA claim |
| ADR-009 age/consent | 15+ target; owner approved development for ages 15–17 on October 6, but real-minor pilot/release access stays disabled pending qualified legal review. Age assurance, consent, guest/account and per-feature AI/ad/cloud rules remain open | Synthetic/adult fixtures and age-neutral feature development only; no real-minor data, pilot or production access |
| ADR-010 business/payment | Planned Sri Lanka company publisher; verify actual incorporation/entity and merchant/payout eligibility when ready; prices later | Entitlement state model and cost inputs; no checkout, invented registration or false-country workaround |
| ADR-011 data/operations | Region, retention, recent-auth/session/export TTLs, restore objectives and operator | Safe default-deny designs and synthetic job tests; no production personal data |
| ADR-012 adapters/testing | Expo SQLite/SecureStore selections retained; October 6 approves versioned local SQLite schema, atomic JSON import/cutover, local-only legacy ownership and no source cleanup. Exact SecureStore/key/backup policy and installed-build proof remain open | Implement/test the local synthetic migration; no account claim/upload, production migration, source deletion or security/backup claim |

The owner answered the first two direction questions on September 16 with the
refinements shown above; see the actual approval record in `01`. Do not re-ask
whether free AI/paid add-on/launch ads or no XP penalties are wanted. Ask only the
unresolved exact policy. The September 17 reply also confirms Emergency exit
availability; do not re-ask that choice. Prices/budget amounts stay deferred; business/legal facts
still need verification, not a model-generated default.

September 25's five replies are now recorded in 01 and the
[complete release map](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md). Current ADR
totals after September 26's age/publisher clarification are 2 APPROVED, 9 PARTIAL
and 1 OPEN, not a work-completion percentage. Desired minimum age is 15+; consent
is not thereby resolved. Sri Lanka company formation is an intention, not proof.
Do not ask again for mobile platforms, stage audience, independent teacher use,
launch languages or January cloud placement. The September 29 record additionally
confirms bounded classroom placement and deadline policy; ADR totals unchanged.
Prices remain deferred by the owner.

[34](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md) now details local add/import/open/
replace/cancel/recovery, five draft cards and twenty NOT_RUN cases. Resource
concept and initial format/viewing direction are accepted; detailed format/size,
adapter/key/backup policies and implementation remain gated. Testing intent is
AWS Device Farm plus friends' Android phones;
no paid run, completed test or iOS signing/coverage is inferred.

[35](35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md) adds the requested file-type,
limit and viewer recommendations: option B's PDF/JPEG/static PNG + links/references,
local read-only preview, prototype-only numeric limits and eight NOT_RUN probes.
The owner's later September 26 reply approves PDF/JPG/PNG, website/video links,
book/page references and in-app read-only PDF/image viewing. Do not re-ask that
direction. Static-only PNG and other exact restrictions remain proposals; numbers,
PDF adapter/security/accessibility and LR-01 remain gated. No dependency selection,
native spike execution or runtime acceptance is inferred.

[36](36-RESOURCE-VIEWER-COMPATIBILITY-AND-DEVICE-TEST-PLAN.md) adds exact-stack
baseline, sourced native/web candidate comparisons, isolated-harness prerequisites,
measurement rules and twelve NOT_RUN device cases. Upstream plugin version guidance
is not a tested lockfile; Android/iOS parser paths and accessibility require separate
evidence. September 28's §7 records checksum verification for four exact packages
and eight viewer files matched to npm gitHead/the tag commit. Source findings leave
the tuple on HOLD: generic storage/download permissions, parser containment,
cache/cancellation and native accessibility are unresolved. Full transitive/license/
advisory and runtime review are incomplete. Next safe work is a narrow permission/
containment proposal before any separately authorized spike. No library chosen or
installed; HIGH review remains pending and LR-01 is not READY.

[37](37-VIEWER-PERMISSIONS-AND-CONTAINMENT.md) now supplies that proposed permission/
containment boundary: separate Android/iOS feasibility, native close versus UI
revocation, CLOSE_PENDING and owner-scoped cleanup, with six NOT_RUN scenario
refinements. It does not prove parser cancellation/isolation or supply an iOS
equivalent to Android isolated services. Qualified platform/security review and
missing native policy values precede RV-03 harness authority; implementation stays HOLD.

## 4. How to give the next task to Luna

September 28 foundation refresh: [13 §11](13-CORE-RELIABILITY-CONTRACTS.md#11-foundation-handoff-refresh--september-28)
records actual diagnostic exit 1: three positive checks, five existing gaps still
reproduced. It adds caller-impact/regression mapping, not app fixes or new scope.
The [L-02 harness proposal](38-TEST-HARNESS-ADMISSION-PLAN.md) now provides a
no-new-package pure-domain first slice and separately gated component candidates.
Actual test-file creation/adoption remains unapproved; CR-02 return-shape/
precision/cutoff approval and caller integration remain gated.
Viewer HOLD is separate; do not skip timer foundations to add resource UI.

Further September 28 preparation: 38 §6 traces test-renderer 1.3.0's inspected
reconciler dependency to a React ^19.3.0 peer mismatch and narrows a 1.2.0 candidate
for the current React 19.2.3 stack. Range checks are not installed compatibility;
no upgrade/override/install is approved. Core 13 §12 supplies CF-01–07 proposed
engine/caller decisions, explicit V2 projection outcomes, eight oracles and a
proposed completionCutoff snapshot for paused-at-target recovery. These additions
do not change ADR counts, canonical units, production policies or implementation
status; HIGH timing/persistence review and real tests remain outstanding.

The follow-up 13 §12.E (CR-02R) now packages all seven decisions for independent
review, with precise questions, affected canonical sections and a review-response
evidence checklist. Author self-review corrected the draft's cutoff precedence
after resume and clarified its incomplete enclosing validation context; it is not
independent acceptance. Next: obtain that review and exact adoption before the
mapped canonical rewrite. No test/code phase, new duration policy or schema change
is approved by the owner's request to prepare this packet.

Core 13 §7.1 now supplies CR-03I's twelve-field legacy inventory and six future
migration cases. A synthetic actual-engine probe produced identical saved JSON
from two different pause histories, establishing lost precision, not a fixed
engine or successful migration. Current filtered readers are not a lossless
inventory. Exact destination/ownerless-data/active-recovery policies, migration
evidence and independent review still gate CR-03; no real saved files were read.

1. Read `AGENTS.md`, `docs/AI_RULES.md`, the routed execution/DoD rules, selected
   canonical contracts and `07`. Use [the task brief](../ai/TASK_BRIEF_TEMPLATE.md).
2. Choose one card with all its relevant decisions resolved. A partial ADR may
   satisfy a specific subdecision (e.g. five-tab order) without approving fonts.
3. Inspect current code and dirty files. Establish exact allowed files and actual
   commands. Never assume the audit commit or dependency versions are unchanged.
4. Before feature implementation, establish the approved test harness and convert
   the card's Given/When/Then cases to executable tests. Do not claim `npm test`
   exists in the present package; do not use `reset-project` as a test.
5. Implement one vertical slice, with owned data, loading/failure/retry/offline/
   recovery and accessibility behavior. Review diffs and run tests in the right
   environment, then update evidence/changelog. Do not hide failing security tests.
6. Mark VERIFIED only when all mandatory scoped checks pass. Record independent
   review separately (required for HIGH/CRITICAL); OWNER_ACCEPTED requires the
   owner. Future cards stay DRAFT. Model name/reasoning level is not a guarantee.

Proposed order after decisions: L-02 test foundation → CR/BE identity-storage-timer
vertical slices → tasks/goals and BX sync → UX navigation/personalization → selected
differentiation/education → AI/billing only after their gates → WP portal in its
dependency lane → full release hardening. WP public design/content can progress
once its own gates are stable; one person still owns all lanes. Preserve canonical
phase order and do not skip an incomplete foundation for easier cosmetic work.

## 5. Remaining document work before a complete implementation freeze

- Continue reconciling affected legacy normative sections, not only headings/banners:
  AI/ad numeric/provider details (direction approved), numeric reward/day rules,
  pause/break flows, settings defaults,
  goal editing and timing units. Focus Bet stake/loss paragraphs and positive
  health-component examples were reconciled in the September 17 safety pass;
  historical evidence and explicitly prohibited examples are not approved features.
  `20` now separates legacy defaults, current implementation and proposed values;
  concrete settings/analytics outputs do not fill missing XP/day policies or
  complete the other extension responses/migrations.
- Consolidate one versioned API contract with complete response/query schemas,
  domain RPC signatures and migrations per admitted feature. The new schemas
  intentionally do not pretend to be all of that executable infrastructure.
  EX-01–11/17 now have an explicit OpenAPI slice and typed response/query mapping;
  EX-12–16/21–30 now also have explicit wire outputs; `22` adds EX-18–20/31–33
  reward/goal-progress/AI outputs. The four existing slices are not a
  finished merged API. Header forwarding, cross-field equality, temporal rules,
  authorization and idempotency require actual integration tests.
  New deletion receipt pre-issuance/encrypted replay and snapshot digest designs
  additionally need security review and approved TTL/key/canonicalizer policies;
  no owner approval or production security certification is implied.
- Specify and approve exact production values, provider adapters and legal/locale
  facts. Expand the admitted enterprise subfeatures using FUT/SL/R/BE/BX/UX/WP
  cards; broad future maps are not executable feature specifications.
- Recheck capacity using current date and measured first-slice velocity, not the
  earlier planning snapshot or a promise of model speed.
- Freeze the release feature matrix; update root/canonical routing guidance if
  the approved phase/scope changes; perform semantic cross-review and targeted
  prototype/testing. A successful link checker cannot do this review for us.

This sheet prevents a false “everything finished” handoff. The next affected
policy-dependent rewrite can proceed when the requested owner choices are
recorded; unrelated safe document work need not stop while those answers arrive.

## 6. Bounded documentation closeout queue — October 3

පහත queue එකේ ඉතිරි වැඩ Final Build Guide §6 අනුව අදාළ feature task එකේදී
සම්පූර්ණ කරන්න. Row එකක් අවසන් කියන්නේ එහි සඳහන් evidence තිබෙන විට පමණයි.
මෙය වැඩ ප්‍රමාණයෙන් සමාන කොටස් නවයක් හෝ completion percentage එකක් නොවේ.
මේ queue එක අලුත් product/security rules හෝ launch scope එකක් අනුමත නොකරයි.

| Order / workstream | Existing source | Remaining concrete document output | Completion evidence / dependency |
| --- | --- | --- | --- |
| D1 Foundation handoff | [13](13-CORE-RELIABILITY-CONTRACTS.md), [38](38-TEST-HARNESS-ADMISSION-PLAN.md), [Final Build Guide](49-BUILD-ENTRY-HANDOFF-SI.md) | Use the single coding prompt and two-file harness boundary; after CR-02R disposition, reconcile exact engine/caller/storage decisions | First prompt exists; harness creation and CR-02R acceptance remain pending. Link each adopted decision to its canonical change and regression oracle |
| D2 Core behavior reconciliation | [19](19-SAFETY-AND-COMMITMENT-CONTRACT.md), [20](20-SETTINGS-PROGRESS-AND-UNITS.md), canonical data/scope/UI | One traceable disposition for timing units, goal edits, day/reward rules, settings and pause/break interactions | Each affected old paragraph is reconciled or explicitly retained with its authority; unresolved values remain named, not guessed |
| D3 API consolidation | [14](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md), [16](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md), 22–28 and 40–46 via the map | Inventory all existing OpenAPI slices and operation/schema ownership; specify consolidation/version boundaries and remaining query/response gaps | No duplicate operation ownership or incompatible shared definition silently merged; selected slice checkers and manual semantic review recorded |
| D4 Storage and recovery contracts | [29](29-PLAN-DATABASE-RPC-TEST-PACKET.md), [30](30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md), 13/14/16 | Resolve selected identity, migration, backup and recovery decisions; align task-specific migration/RPC briefs | Exact selected decisions and required review recorded. Executable migrations and real recovery evidence belong to implementation, not document completion |
| D5 Education and resources | [11](11-SRI-LANKA-EDUCATION-CONTRACTS.md), [33](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md), 34–37 and 39–47 | Finish admitted cloud wire/quota/recovery details and resource adapter restrictions; obtain dispositions on prepared classroom/viewer questions | Reviewed policy/adapter disposition linked to affected card. Classroom crypto detail is already in 47; continue that design only for a specific unresolved question or finding |
| D6 Experience and localization | [15](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md), [20](20-SETTINGS-PROGRESS-AND-UNITS.md), canonical UI/components | Freeze chosen tokens/fonts/defaults, route states, si/ta/en terminology and motivation/onboarding copy for the selected slice | Traceable owner/design decisions; qualified language and rendered accessibility evidence remain separate implementation/review work |
| D7 AI, commercial and policy inputs | [06](06-MONETIZATION-AND-ENTITLEMENTS.md), [22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md), 23–31 and section 3 above | Exact provider/allowance/ad/entitlement configuration and decision placeholders with affected operations | Owner supplies deferred prices, spending and business/legal facts when needed; preserve approved free/paid AI and launch-ad directions. No guessed numeric offers |
| D8 Website and release preparation | [17](17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md), [08](08-VERIFICATION-AND-RELEASE.md), [32](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) | Selected public-content/auth/privacy/billing handoffs, host decision and revised capacity/scope evidence | Public Website/Portal remain January targets; full productivity web stays later. Real store/browser/device/provider evidence and publication authority remain separate |
| D9 Final package review | [Documentation map](../DOCUMENTATION_MAP.md), register 01, this queue and audit 09 | Trace selected launch requirements through canonical contract, task, acceptance, dependency and unresolved decision; archive stale instructions by explicit reconciliation | No unresolved contradiction in the selected implementation slice; scoped checks and semantic self-review recorded. Required independent review remains separately identified |

These workstreams overlap and have unequal effort. D2–D8 can be prepared when
their inputs are available; implementation still follows the canonical phase
order. Finish each existing packet against its named questions before expanding
it. Post-V1 enterprise maps retain future requirements but need not be fully
implemented or frozen to admit one approved V1 task.

### Current handoff

- **Diagnostic completed:** the October 3 core baseline is recorded in guide
  §2. Refresh it when source changes. Its five known failures are evidence for
  the next fix, not a reason to change tests or claim success.
- **Prepared for later implementation:** L-02A's exact two-file domain harness
  in 38 §3. Copy its bounded task only when the owner starts that code/test task.
  This does not require adopting the component stack or activating a backend.
- **Review packet prepared:** classroom key/nonce brief 47 and core CR-02R in
  13 §12.E. A missing reviewer holds the affected acceptance, not all editorial
  work in this queue. No reviewer has been dispatched.
- **D3 inventory completed:** 48 records all 82 operations, no duplicate public
  ownership, four repeated component-name groups and local reference results.
  The actual empty-cursor inconsistency is corrected in the core draft with
  seven fixtures. A generated bundle and missing cloud/other launch contracts
  remain separate work; similar identifiers are not a merge instruction.
- **Build-entry handoff prepared:** use 49 for the exact first L-02A task when
  the owner starts implementation. Its baseline does not depend on CF-03's new
  duration-policy adoption or classroom/provider activation. Subsequent HIGH
  timer/storage acceptance still requires the prepared review dispositions.

The package is ready for scoped diagnosis and review preparation. It is not yet
a fully frozen specification from which every launch feature can be implemented
without further decisions. Documentation completeness, feature implementation,
test results and release readiness must be reported separately.
