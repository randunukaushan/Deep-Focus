# Changelog

## Audit fixes — 2026-10-07

- Guarded terminal session history against stale active writes; moved local
  SQLite operations onto a private serialized connection with foreign keys
  checked before transactions. Failed initialization is retryable in-process.
- Preserved unchanged migrated goals during new-goal saves; save-failure waiting
  time now stays paused until explicit user resume. Tasks keeps drafts/list state
  on failed saves and exposes load/retry/saving states.
- Corrected Plans navigation and footer-note text contrast using theme tokens.
  Added regressions for all eight audit findings; combined suite passed 64/64.
- Independent/native/browser verification remains pending; no production-ready
  claim. Details: [audit-fix evidence](revision/evidence/AUDIT-FIXES-2026-10-06.md).

All notable changes to the Deep Focus project should be documented in this file.

This changelog provides a chronological record of significant project updates and helps developers, contributors, and future users understand how Deep Focus has evolved over time.

The format is inspired by Keep a Changelog principles and adapted to the needs of the Deep Focus project.

The changelog should record completed and meaningful changes rather than planned or speculative work.

## Unreleased — 2026-10-06

- Corrected the public-site skip link to target the page's programmatically
  focusable `<main>` landmark on home, public content and not-found routes.
  Added regression assertions for all three render paths and small accent-text
  contrast across sampled light/dark page surfaces (minimum 5.75:1 and 6.06:1).
  Website tests 6/6, typecheck, ESLint, Next production build and local route
  response smoke check pass. Real keyboard/screen-reader browser verification
  remains pending.

- Applied 16 semver-compatible transitive dependency updates from a reviewed
  `npm audit fix` (without `--force`); root SDK/framework versions were not
  changed by this remediation step. The command's fresh audit output reported
  32 findings (20 high, 12 moderate, 0 critical), down from the recorded 38
  after SDK patch alignment. Remaining advisories include `braces`,
  `decode-uri-component`, `image-size`, `node-forge` and `uuid`; npm's proposed
  fixes for several require breaking Expo/router changes and were not applied.
  Fresh full and `--omit=dev` audits both confirm 32 findings (20 high,
  12 moderate, 0 critical): 7 direct and 25 transitive. The same graph under
  `--omit=dev` does not prove runtime exploitability. The final Expo SDK
  compatibility check reports dependencies up to date. Root tests
  47/47, root typecheck, focus ESLint, web tests 6/6, web typecheck/ESLint and
  Next production build pass. The website's fresh production-only audit reports
  0 findings; its full audit has five high dev-tool findings through `braces`,
  with no patched compatible path applied. Details and limitations:
  [dependency audit evidence](revision/evidence/Dependency-Audit-2026-10-06.md).

- Focus recovery now routes startup read failures to an explicit, retryable
  recovery state instead of leaving a rejected promise or implying there is no
  active session. The flow is read-only and preserves the active record. This
  HIGH-risk candidate remains `REVIEW_PENDING`; independent review and Android/
  iOS lifecycle evidence are not complete. Details:
  [focus recovery read-failure evidence](revision/evidence/FOCUS-RECOVERY-READ-FAILURE-2026-10-06.md).

- Added an isolated Next.js public-site preview with twelve static public routes,
  responsive navigation and reduced-motion support. It clearly labels the
  product as in development and does not fake accounts, prices, policies,
  downloads or support. Isolated website dependency installation succeeded;
  website tests, typecheck, ESLint and Next production build pass after fixing
  Turbopack root inference. Browser/accessibility review, account portal, legal
  review, locale QA, hosting and publication remain pending. Evidence:
  [WEB-01/02 preview](revision/evidence/WEB-01-public-preview-2026-10-06.md).

- Progress now distinguishes an unreadable session history from a genuinely
  empty one, gives a non-destructive retry, and avoids exposing storage error
  details. Added read-state and transient-retry regression tests. This does not
  alter stored data or progress calculations; native rendering and screen-reader
  behavior remain pending. Task evidence:
  [Progress read-failure slice](revision/evidence/UX-02-progress-read-failure-2026-10-06.md).
  Final focused suite: 43/43 pass; TypeScript typecheck, direct ESLint and docs
  checker pass. No platform interaction was run.
- Clarified Goals screen copy to distinguish focused time from completed-session
  count. Added direct regressions for both approved outcomes (cancelled session
  time counts; its session count does not). The complete mobile test command
  passes 45/45; root typecheck, focused ESLint, docs checker and whitespace check
  pass. No native device UI test was run. Details:
  [goal semantics evidence](revision/evidence/GOAL-SEMANTICS-UI-2026-10-06.md).

- Recorded owner-approved SQLite local-store, no-auto-account-claim, and ages
  15–17 development/legal release boundary decisions in canonical contracts.
- Added an Expo SQLite v1 schema/import repository draft and routed native task,
  goal, settings, and session storage adapters through it. Legacy JSON inputs are
  retained and import is transactional; production data/migration/deployment
  remain explicitly out of scope.
- Updated goal progress semantics: completed and cancelled sessions contribute
  confirmed seconds to time goals; only completed sessions count toward
  session-count goals. Existing legacy goal time units convert explicitly.
- Evidence: TypeScript typecheck, docs checker, in-memory SQLite DDL execution
  (7 tables), ESLint and whitespace check passed. The earlier 35-test run omitted
  the separate three-test Button suite; the historical 38-test baseline was 31
  timer/session + 4 navigation + 3 component tests. All 38 remain, and three new
  SQLite-backed migration/ownership tests bring the combined total to 41/41.
  The seven former JSON-adapter safety cases now run through SQLite and retain
  failure/retry/restart/concurrency/corruption/duplicate assertions. Tests use
  Node's built-in SQLite engine with a narrow Expo API shim, not an installed
  Android/iOS runtime. Independent review, native device checks, qualified legal
  review for real-minor access, and production migration/deployment remain pending.
- The initial install reported 40 vulnerabilities without retaining their
  advisory detail. On 2026-10-06, official npm CLI 11.21.0 ran from an isolated
  temporary folder with Node 24.19.0. Full and `--omit=dev` audits both returned
  40 findings (27 high, 13 moderate, 0 critical): 7 direct, 33 transitive, none
  exclusively dev-only in the production dependency graph. Project manifests
  were hash-checked unchanged. Actual app exploitability/binary reachability
  remain conditional and unverified; findings and remediation scope are in
  [the dated dependency audit evidence](revision/evidence/Dependency-Audit-2026-10-06.md).
  At the time of that initial read-only audit, no audit fix or dependency upgrade
  had been attempted; the later reviewed remediation is recorded at the top of
  this Unreleased section and in the linked evidence addendum.

---

## Versioning

---

Deep Focus intends to use Semantic Versioning principles for public releases where appropriate.

Version numbers generally follow the format:

`MAJOR.MINOR.PATCH`

Examples:

- `1.0.0`
- `1.1.0`
- `1.1.1`

In general:

- `MAJOR` represents significant incompatible or major product changes
- `MINOR` represents backward-compatible functionality or meaningful feature additions
- `PATCH` represents backward-compatible fixes and smaller corrections

Before the first stable public release, versioning may remain flexible while the product and release process are still evolving.

Version numbers should communicate meaningful differences between releases as clearly and consistently as practical.

---

## Change Categories

---

Changes may be recorded under the following categories:

## Unreleased

### Accessible loading state for shared buttons — 2026-10-06

- Loading buttons now expose a changed accessible name alongside their busy and
  disabled states; callers may supply localized loading copy. Added synthetic
  source-level component tests for loading, localization override and idle state;
  38/38 combined focus/navigation/component tests pass. Real VoiceOver/TalkBack
  announcement behavior remains NOT_RUN.

### Approved mobile navigation skeleton — 2026-10-06

- Aligned the tabs with Home / Plan / Focus / Progress / Profile. Plan links to
  existing Tasks and Goals; Rewards and session history now live under Progress.
  Legacy Analytics, Rewards and history routes redirect to their canonical
  destinations while preserving the history session ID.
- Added static navigation-contract checks. Expo Router cold/warm links, Back,
  account switching and Android/iOS behavior remain NOT_RUN; the read-only ADB
  inventory found no connected Android device.
- Focused verification: 35/35 session/timer/navigation tests pass; TypeScript
  typecheck and ESLint pass. Static checks do not establish native navigation
  behavior.
- The document-only experience checker passes: 27 routes, five aliases and 56
  proposed-token contrast pairs; these figures do not certify runtime UI.

### Session persistence recovery — 2026-10-06

- Surface active/history/cleanup write failures, serialize same-runtime storage
  operations, and persist terminal history before clearing the active recovery
  file. Identical terminal retries are idempotent; a pending terminal active file
  can be restored and finalized after restart. Malformed history is preserved.
- Added synthetic failure, retry, restart, conflicting-duplicate and
  concurrent-append tests; 31/31
  domain/boundary tests, typecheck and focused ESLint pass. The legacy JSON adapter
  still lacks a cross-process lock and atomic multi-file transaction; HIGH review
  and Android/iOS failure/restart evidence remain pending.

### Remaining timer contracts and guarded startup — 2026-10-06

- Fixed CR-T02/06/08: early completion retains the live session; invalid duration
  and malformed timing records reject explicitly. Preserved CR-T04/05 repairs
  and the existing seconds schema/engine return types.
- Timer startup now waits for hydration, catches validation/read errors, blocks
  controls/writes/auto-completion on error and preserves unreadable active data.
  Added loading/recovery UI, early-completion feedback, guarded break navigation
  and restored task-name display. New route duration follows setup's 5–180 range.
- 24 domain/boundary tests pass; typecheck and direct ESLint pass. Boundary tests
  use substituted React/platform scheduling, not device integration. See
  `tests/domain/README.md` for exact evidence and remaining storage risks.
- HIGH lifecycle candidate: independent review/device checks remain pending.
  No storage transaction rewrite, V2 migration, dependency changes or deployment.

### Focus timer projection corrections — 2026-10-06

- Corrected seconds-based projection of completed/cancelled sessions to use their
  stored totals, and treated an epoch-zero pause timestamp as present.
- Added CR-T04/CR-T05 regression coverage. The focused suite reports 7 pass and
  3 remaining failures (CR-T02/06/08); TypeScript check passes. Lint remains
  unverified because `npm` and `npx` are unavailable. No schema, UI, return type,
  persistence or V2 migration change; broader timer review remains pending.

### Optional onboarding prototype — 2026-10-06

- Added UI-P3 intro, optional conditional 9/10-step questionnaire, selected-change
  review, defaults, keep/resume/discard and Profile re-entry to the isolated preview.
- Added draft en/si/ta onboarding/card copy, independent learning-context/medium
  choices and personalized Home card. Sri Lanka is explicitly a metadata preview,
  not an installed/verified syllabus; no auth, provider, upload or persistence.
- New browser flow and existing interaction/motion checks pass. Native language,
  accessibility and production integration remain unverified; see
  `artifacts/ui-prototype/ONBOARDING.md` for evidence and Luna handoff.

### Prototype scenery and motion refinement — 2026-10-04

- UI-P2 adds layered day/night SVG scenery, finite entrance replay, start/pause
  feedback and completion check reveal to the isolated browser prototype.
- OS/manual reduced-motion and session scenery freeze tested; existing flows and
  320/390px checks pass. Visual approval and native performance remain pending.
  No production Expo code, providers or dependencies changed.

### Interactive UI reference — 2026-10-04

- Added isolated `artifacts/ui-prototype` Home/Plan/Focus browser preview with
  light/dark scenery, sample task and timer interactions, personal motivation
  controls, reduced-motion support, and local preview server.
- Edge interaction/320px/390px smoke checks passed; screenshots and limitations
  recorded in its README. No production Expo implementation or release readiness
  is claimed; final visual approval remains pending.

- October 3 FG-01: finalized the existing build guide as the single working
  entry, with canonical phases 0–10, required launch lanes and feature-specific
  pending inputs. Routed root/revision README, map and implementation plan to it;
  replaced the duplicate diagnostic handoff with a pointer to the coding prompt.
  Closed the broad editorial pass while retaining unresolved feature/review
  requirements. No new numbered document or app/source change.

- October 3 BH-01: inventoried eight OpenAPI sources / 82 operations and local
  schema references; documented four repeated component-name groups without
  flattening their meanings. Corrected the personal-core draft to reject a
  supplied empty cursor, with seven parameter fixtures. Prepared the first
  bounded coding-task handoff and refreshed actual timer diagnostic evidence
  (three passing cases, five existing gaps). No app repair or runtime API work.

- October 3 DH-01: consolidated remaining documentation into nine linked
  workstreams with concrete completion evidence, added a copyable read-only
  first-task handoff, and refreshed January capacity to 90 days / approximately
  321–450 gross owner hours. Preserved feature/review gates and identified API
  operation/schema ownership inventory as the next document task.

- October 1 EB-00: drafted typed classroom Edge/database preparation, crypto
  material and encrypted invitation result contracts; reconciled internal
  signatures/grants/recovery and added local bridge schema/model checks. Corrected
  the prose operation split to 13 mutations/nine reads against unchanged OpenAPI.
  No public API, app/SQL implementation or production key/nonce policy change;
  independent review and runtime integration remain pending.
- October 2 KN-00: drafted separate command/AES key custody options, committed-
  before-use nonce allocation/recovery rules, rotation/restore fencing and a
  reviewer-ready independent security review brief. No keys, KMS, allocator,
  provider account or runtime integration was created or approved.
- October 1 FA-00: recorded classroom adapter feasibility self-review, placed the
  incompatible SQL-only AES-GCM path on ADAPTER_HOLD and documented the proposed
  Edge/atomic-database correction. Added decoded-NUL guard/reference regressions
  and reconciled implementation warnings. No app/SQL/Edge implementation, provider
  change or independent security acceptance.
- September 30 HC-00: specified classroom canonical command digest/replay,
  closed-command denial, opaque cursor registry and invitation helper behavior;
  added synthetic encoding/HMAC/token and predicate-model fixtures/checker.
  Reconciled auxiliary-storage and helper references; public DTOs and app code
  unchanged. No SQL/crypto adapter, legal retention or production policy implemented.
- September 30 SF-00: documented 22 classroom internal function signatures,
  capability restrictions, seven ordered uncreated migration seams and isolated
  runner admission/barrier/oracle requirements; mapped all 40 TX/TI scenarios to
  required execution surfaces. Extended read-only contract checks; no SQL, runner,
  app, provider or production policy implemented and no runtime tests claimed.
- September 30 TI-00: selected draft private acceptance tombstone/live-FK and
  server-only Edge/PostgreSQL identity-bridge designs in packet 42; reconciled
  owner-head/session/class lock ordering and added 16 NOT_RUN integration scenarios.
  No public DTO, app code, SQL, role, credential or retention-policy change.
- September 30 CR-00: reconciled bounded-classroom references across canonical
  API/data/database/security/testing documents; added 22-operation/11-table access
  and integrity review matrices, privacy-export boundaries and six OPEN isolated
  SQL admission gates in packet 41. Expanded read-only document coverage checks;
  no migration, app implementation, new export DTO or independent acceptance.
- September 30: added draft classroom wire/data packet 40, 57 strict JSON Schema
  definitions, 22 OpenAPI operations, a read-only DTO/reference checker and 24
  NOT_RUN isolated transaction scenarios. Documented relational constraints,
  authorization/replay/locking and private-task recovery boundaries. No SQL,
  app code, deployment or independent security acceptance is claimed.
- September 29: added draft bounded-classroom packet 39 with eight implementation
  preparation cards, 24 NOT_RUN scenarios, explicit private/class payload and
  retry/revocation boundaries, inspected Task-storage prerequisites and six gates.
  Included primary-source authorization checks and canonical reconciliation map;
  no app/SQL implementation, independent review or runtime/security pass claimed.
- September 29: recorded bounded classroom sharing in the V1 target, January-first
  feature-deferral policy and delegated routine specification boundaries. Reconciled
  canonical scope/sequence and active education/release/owner summaries, preserving
  full productivity web later and required Website/Portal. No specific feature cut,
  app implementation, security acceptance or production readiness is claimed.
- September 28: added the twelve-field source-to-migration inventory, actual
  legacy reader limitations and six pending migration failure cases. A synthetic
  probe confirmed two pause histories can produce identical legacy JSON; clarified
  why conversion cannot recover lost precision. No real data read/migrated, app
  fix, new schema, ownership policy or independent review claimed.
- September 28: reconciled stale active summaries with already recorded teacher,
  locale, age-target, selected-stack and resource-format decisions. Updated the
  owner entry point to current core review/harness work. Kept legal, configuration,
  limits, translation/native QA and independent-review gates; no new approvals,
  application changes or production acceptance.
- September 28: prepared the seven-choice core review/reconciliation packet with
  specific questions, canonical destinations and evidence requirements. Corrected
  draft cutoff precedence after resume and clarified enclosing validation context;
  linked the Luna handoff/readiness gates. Self-review only, no canonical timing
  adoption, app/test code, installed package or independent sign-off.
- September 28: extended the harness investigation with the concrete renderer/
  reconciler React peer mismatch and a narrower uninstalled candidate. Expanded
  the existing core contract with seven proposed freeze choices, typed projection
  outcomes, eight fixture oracles and target-cutoff provenance across pause/resume.
  Updated readiness/playbook; no app fixes, schema migration or approval inferred.
- September 28: completed revision 38's test-harness proposal after interrupted
  research: no-new-package Node domain slice, exact future files/commands, eight
  acceptance cases and separate Expo/RNTL component gates. Recorded passing
  import smoke, deliberate failure canary and unchanged five engine gaps;
  no test-suite files, packages, app fixes or device/security verification added.
- September 28: refreshed the read-only core diagnostic (three checks pass,
  five existing contract gaps reproduced) and added revision 13's gap-to-caller
  handoff with regression oracles and exact next harness-proposal requirements.
  Updated playbook/readiness; no app fixes, dependencies or native tests claimed.
- September 28: added revision 37's proposed viewer permission/containment contract,
  separating Android/iOS feasibility, logical UI revocation, native quiescence and
  disk cleanup. Added view-lease/CLOSE_PENDING behavior and six NOT_RUN refinements
  of existing device cases. No permission/config/code change, adapter selection,
  runtime evidence or security acceptance; viewer integration remains HOLD.

- September 28: completed the bounded PDF-viewer source investigation in revision
  36 §7. Verified four public npm archive checksums in memory and matched eight
  viewer files to its release commit; corrected branch-versus-published plugin
  version assumptions. Recorded permission, parsing, loader/cleanup and review
  gaps with a HOLD disposition. No package installation, app edit, runtime test or
  complete transitive-security certification; all twelve device cases remain NOT_RUN.

- Added September 26 viewer compatibility research and isolated device-test plan
  (revision 36): inspected lock/installed native-stack baseline, primary-source
  candidate and plugin-version evidence, parser-engine distinctions, synthetic
  measurement/harness prerequisites and twelve NOT_RUN device cases. No library
  selected, installed or built; numeric policy, native security/accessibility
  evidence and independent review remain open. App behavior is unchanged.

- Recorded the later September 26 owner approval of initial PDF/JPG/PNG,
  website/video links and book/page references, with in-app read-only PDF/image
  viewing. Reconciled resource scope, options and readiness summaries. Numeric
  limits, detailed format restrictions, native adapters and production acceptance
  remain open; no code, dependencies or runtime behavior changed. ADR totals
  remain 2 approved / 9 partial / 1 open.

- Added the requested resource format/limit/viewer option sheet (September 26,
  revision 35): three scope alternatives, recommended bounded local PDFs/images,
  numerical prototype candidates with exact units, native/external/remote viewer
  tradeoffs and eight NOT_RUN probes. No owner approval, measured safety, PDF
  package choice, app change or paid-cloud allowance is inferred. Independent
  review and real native compatibility/security/accessibility evidence remain open.

- Recorded September 26 owner clarifications: desired 15+ product audience,
  intended Sri Lanka company publisher, resource-organising concept and planned
  AWS Device Farm/friends' Android testing. Consent, incorporation, merchant and
  format/size/viewer choices remain separate gates. Added revision 34's local
  import/open/recovery draft with five cards and twenty NOT_RUN cases; routed
  scope/readiness/test planning and document checks. No source, package, native,
  provider, purchase or deployment change; independent review remains pending.

- Reconciled the September 25 owner release answers: Android+iOS, Website/Portal,
  O/L/A/L/higher-stage education, independent personal-teacher launch, si/ta/en
  and optional paid cloud. Added revision 32's complete 80-family placement map;
  retained numeric-age/consent, exact feature, price/quota and operational gates.
  Added revision 33's source-backed paid-cloud admission/recovery draft, six cards
  and twenty NOT_RUN runtime cases. Updated scope/routing/readiness and structural
  checks; fifteen document/reference checkers PASS. No app, provider, purchase,
  migration or deployment change; independent review and real tests still pending.

- Added PL-05 saved-plan activation/pause/recovery draft (September 25): revision
  31, eight unfilled evidence gates, four cards, twelve NOT_RUN scenarios and a
  fail-closed reference checker. Completes the five PL specification drafts, not
  implementation or release acceptance. Specifies compatible writer/cursor rollout,
  preserved privacy duties, worker/receipt recovery and safe-forward boundaries.
  No app/API/SQL/config change, real rollout or independent review performed.

- Added PL-04 mobile saved-plan storage/outbox/editor recovery specification
  (September 20–21): revision 30, six cards, six open gates, twenty NOT_RUN device
  cases and a synthetic state/guard checker. Reconciled data/security/testing and
  documentation routing. Defines honest pending/receipt states, account fences,
  crash/conflict/privacy reset and reminder recovery; no app/package/SQL/OS
  implementation or capability activation. Independent review remains pending.

- Added PL-03 isolated database/RPC/migration test specification (September 20):
  revision 29, seven ordered cards, seven open gates and 24 detailed future cases,
  plus a structural packet checker. Separates prototype foundation gaps, trusted
  actor/privilege design, atomic commands, cutover and safe recovery. No executable
  SQL, runtime test, new API operation, app change or database action; independent
  review and actual implementation/evidence remain pending.

- Added account-export artifact draft (September 20): revision 28, nineteen schema
  definitions, fourteen typed sections, explicit deferred-family dispositions,
  snapshot/digest and private delivery rules; added reference checker and routing.
  EX-21–23 and the 60-operation API inventory are unchanged. Source mapping,
  deferred-family access, policy/runtime/independent review remain gates; no app,
  SQL, provider, cloud upload or deployment was performed.

- Added PL-02 replication/snapshot/export-component draft (September 20): revision
  27, 23 DTO definitions and six operations (60 across seven partial API files).
  Defines atomic groups, privacy epochs, legacy isolation and archived-plan export;
  added reference checker and reconciled routing/readiness docs. Full account-export
  packaging, real SQL/client tests and independent review remain open. No app,
  database, provider or deployment change; this is not a shipped sync feature.

- Completed the interrupted saved-plan management wire draft (September 20):
  revision 26, thirteen DTO definitions, two management operations (54 combined),
  exact reminder actions/versions and minimal receipts. Reconciled PG-05's
  undeployed current-plan read/header and added its document checker; initial
  interruption left stale fixtures and a missing checker, now addressed.
  No app/backend/SQL changes; replication/export wire and independent review
  remain pending. This records documentation work, not a shipped feature.

- Added the draft saved-plan lifecycle/privacy contract (revision 25): explicit
  edit/archive/restore/delete effects, known-context erasure, owner transactions,
  privacy-epoch artifact suppression and legacy/v2 sync boundaries; five bounded
  next packets and twelve future runtime cases. Added a read-only synthetic
  lifecycle checker and reconciled data/security/routing references. No wire/API
  count change, executable SQL, app/backend implementation or production action;
  strict lifecycle/replication DTOs and independent review remain pending.

- Added draft daily-plan focus/break/reminder contracts, strict generation/status/
  cancellation/revision/plan-read wire schemas and five OpenAPI operations (52
  across five slices). Proposed contractVersion 2 separates whole-plan confirmation
  from v1 task/reminder changes, with no progress awarded for planning. Added
  read-only negative/time/dependency checks; plan migrations, sync/export/deletion,
  provider/runtime integration and independent review remain gated. No app changes.

- Specified the proposed AI generation/reservation, lost-response recovery,
  cancellation-versus-completion, worker fencing and manual-revision lifecycles
  in revision 23, with a read-only transition model/reference checker and five
  follow-up cards / 24 future integration scenarios. Reconciled canonical timeout,
  cancellation and legacy data-shape notes. Strict generation wire/schedule/provider
  contracts and independent/runtime review remain open; the existing OpenAPI count
  is unchanged at 47. No application code, provider or database changes.

- Added the six remaining extension-inventory wire contracts for rewards/history,
  goal progress, AI usage, proposal retrieval and atomic selected apply, with
  strict schemas and read-only negative/semantic-reference fixtures. Four draft
  slices now cover 47 operations / all 33 extension rows, not the full V1 API.
  Reconciled the older editable AI-apply and introductory-five response examples;
  preserved no failed-generation debit, zero apply debit and explicit policy gates.
  Generation/revision/provider contracts, migrations and independent/runtime
  security verification remain incomplete. No application code changed.

- Added a critically reviewed, bounded engineering-workflow specification:
  documentation authority/map, risk/STOP/escalation rules, evidence-based
  Definition of Done, replaceable model mapping and task brief. Shortened root
  AGENTS/AI entry points with detailed constraints preserved in routed guardrails;
  reconciled playbook/contribution/development workflow and authorization language.
  Independent governance/security review remains pending; this is not a completed
  enterprise implementation freeze. No app/model/provider configuration changed.
- Corrected the draft SyncPull query schema to express its existing shared
  default limit of 50; no checker assertion was weakened and no runtime default
  application is implied.

- Added fifteen proposed sync/privacy/session/billing-visibility wire operations
  and strict DTO fixtures (41 unique operations across three partial OpenAPI
  slices). Specified snapshot/poll cursors, filtered profile-log mapping, lost
  deletion-response recovery via a pre-issued narrow status credential, secret
  replay isolation, app-session revocation and truthful billing states/IDs.
  Corrected an older ruleVersion-based reward deduplication reference. Exact
  security/TTL/key/merchant/price policies and provider-specific implementation
  remain gated; no app, SQL execution, payment, account deletion or deployment.

- Added a proposed twelve-operation extension OpenAPI slice alongside the
  fourteen-operation core, with strict break/reminder/page and typed soft-delete
  receipt schemas. Clarified bodyless delete/version-header normalization,
  direct/sync reuse, error codes and live pagination; extended document-only
  fixtures and cross-file contract checks. Corrected settings endpoint IDs and
  the stale fixed-five/ad-only packaging note. Restored required unobtrusive ads
  explicitly in the January admission checklist, added its release gate and
  refreshed capacity-date arithmetic. No API deployment, app changes, ad SDK,
  new owner policy, dependency, purchase or runtime-test pass is claimed.

- Reconciled legacy settings defaults/cloud API examples and clarified numeric
  XP examples, calendar-day ordering and minute/second/millisecond boundaries.
  Added a proposed settings/progress contract with five SP cards/24 NOT RUN cases,
  strict account-settings/analytics response shapes and truthful zero versus
  unavailable snapshots. Extended document fixtures to compare canonical settings
  examples with schemas and check reference unit arithmetic. Numeric reward/day
  policies, full extension APIs and actual migrations remain open; no app code,
  production default, XP formula, service or dependency changed.

- Reconciled both legacy Focus Bet stake/forfeiture sections, architecture reward
  references and misleading positive health-component examples with approved
  non-punitive/non-diagnostic rules. Retained clearly labelled prohibited examples
  and historical evidence. Aligned canonical strict-mode exit guidance; added
  proposed safety/commitment contract with four SC cards and twenty NOT RUN cases.
  Exact default/interaction/schema adoption remains gated; no app, health model,
  shielding capability or Emergency exit implementation was changed.

- Recorded September 17 owner approval that a separate Emergency exit remains
  available when ordinary End early is disabled through pre-session Settings.
  Synchronized scope, AI rules and revision decision/product/readiness summaries;
  exact interaction and in-session preference details remain open. Documentation
  only; no strict-mode or emergency-exit UI implementation is claimed.

- Reconciled the owner's safety/AI/advertising decisions in the requirement
  register, product/monetization/readiness summaries and canonical AI scope,
  vision, blueprint, plan, architecture, data/database/API, UI and testing rules.
  No missed-work XP penalties or unverified health predictions; limited free AI
  plus optional paid AI; unobtrusive initial-release ads required. Fixed-five/
  ad-only assumptions were superseded or marked as legacy examples. Pre-session
  exit configurability is recorded without inventing an emergency/hard-lock
  policy. Exact allowance/prices/ad settings and complete paid-AI contracts
  remain open. Documentation only; no app code or advertising service changed.

- Added remaining-backend and Website/Portal documentation: strict extension
  DTOs, fourteen sync command kinds, 33 extension/overlapping endpoint contracts,
  snapshot/replay/progress/AI/privacy-job/operations rules, eight BX cards and
  24 future cases. Added a 25-page/two-handler web manifest, ten WP cards/24 future
  cases and publication/rollback runbook. Consolidated readiness/owner decisions
  and corrected the cloud-settings assumption for local phrases/assessment data.
  Read-only checks passed 59 new DTO fixtures plus existing contract/document
  checks. No app code, provider, SQL migration, website scaffold or deployment
  changed; open policies and missing complete response/API/migration contracts
  remain explicit, not silently marked ready.

- Recorded approved Supabase Edge Functions API, Expo SQLite/SecureStore and
  Home/Plan/Focus/Progress/Profile navigation with Rewards under Progress.
  Reconciled the canonical 27-route inventory, architecture navigation and five
  UI examples; updated primary-brand/button guidance to the approved blue
  direction while exact tokens remain proposed. Added backend DTO/OpenAPI and
  guarded SQL prototype documentation, eight BE cards/eighteen future cases,
  and detailed experience/personalization/motivation contracts with eight UX
  cards/twenty-four future cases. Read-only checks passed 32 DTO fixtures and
  56 proposed contrast pairs, plus route/relative-link/ID consistency. These
  are document checks, not deployed backend, app UI, SQL/RLS or accessibility
  certification. No application code or production service was changed.

- Reconciled confirmed January Website/Account Portal inclusion, current weekly
  capacity, selected Auth and the reopened documentation phase in canonical scope,
  screen-map and implementation-plan clauses. Added detailed core lifecycle,
  save/retry/recovery and legacy-migration draft contracts, six CR cards and twenty
  acceptance scenarios. A read-only current-engine diagnostic ran eight synthetic
  checks: three passed and five existing contract gaps were reproduced. No app
  code or dependency was changed and no bug was fixed; detailed new schema and
  implementation choices remain gated. Extended structural documentation checks.
- Clarified education as students' study-work and teachers' independent preparation/marking organisation using their own resources, excluding Deep Focus-supplied papers, notes, videos and other academic materials. Added local-resource/import/recovery and optional paid-cloud draft contracts, six R cards and sixteen future acceptance scenarios. Recorded the owner's refinement from local-only storage to local default plus optional subscription cloud; added a dated provider-cost input snapshot and revenue/cost model without selecting retail prices, quotas or a cloud launch date. Updated affected product/data/security/scope references; no app code, storage service or paid checkout was changed.
- Recorded the owner's product-purpose clarification: organise work and make carrying it out easier across personal/professional and education contexts. Updated revision decision/product/education contracts to explicitly exclude academic lesson-video production/upload/hosting/sales; curriculum structure and optional resource-link proposals do not imply a course-content platform. Existing V1 and AI approval gates remain unchanged. Documentation only; no app functionality changed.
- Recorded the owner's Supabase PostgreSQL/Auth and Next.js Website/Account Portal selections on 2026-09-14 and reconciled those selections in architecture, security, database/API introductions and revision references. Hosting and detailed runtime/policies remain open. Added a cited Sri Lanka student/teacher research report and draft education ownership/flow contracts, ten bounded subcards and eighteen future acceptance scenarios. Updated the January privacy gate after verifying Gazette 2498/16. No infrastructure, app code, real-user pilot or deployment was changed.
- Added the initial research-backed enterprise documentation review draft in `docs/revision/`, including an 80-family requirements register, initially 12 pending architecture/product decisions, retained 20-app evidence, product/security/web/billing contracts, Luna task preparation, release gates and a structural documentation validator. Added README/AI-rules discovery notes. That initial draft did not approve providers, complete the canonical rewrite, fix application code or publish any feature; subsequent stack approval is recorded separately above.
- Implemented local focus-session history and session detail views.
- Added welcome, onboarding, assessment, productivity profile, and account-access UI flows.
- Added focus break, recovery, and automatic pause/resume navigation.
- Added Plan My Day proposal UI and connected account access from Profile and Settings.
- Improved settings with selectable break-duration controls while keeping unsupported sync, notification, and authentication behavior explicit.
- Persisted the selected default break duration locally across app restarts.
- Added a visible Session Recovery entry point under Profile > Your Focus.
- Fixed navigation wiring for Sign In, Create Account, Email Verification, and Forgot Password routes.

- Added
- Changed
- Improved
- Fixed
- Removed
- Deprecated
- Security

### Added

Used for new functionality, capabilities, or significant project additions.

### Changed

Used when existing behavior, architecture, workflows, or requirements change meaningfully.

### Improved

Used as a Deep Focus project convention for meaningful enhancements that do not clearly represent entirely new functionality or defect fixes.

### Fixed

Used for resolved defects or incorrect behavior.

### Removed

Used for functionality, files, APIs, or supported behavior that has been removed.

### Deprecated

Used for functionality that remains available but is planned for future removal or replacement.

### Security

Used for meaningful security-related changes or fixes that are appropriate to document publicly.

Not every category needs to appear in every release.

Empty categories should be omitted from finalized release entries.

---

## Unreleased

---

The `Unreleased` section contains notable completed changes that have not yet been included in a public release.

Only work that has actually been completed should be recorded here.

### Added

- Initial project documentation
- Project vision
- Product blueprint
- UI/UX design specification
- Component library
- AI development rules
- Architecture documentation
- Development guide
- Contribution guide
- Testing strategy
- Initial changelog structure
- EAS development, preview, production, and submission configuration
- Added the initial shared design-token foundation for colors, typography, spacing, radii, shadows, opacity, motion, and layout.
- Added an accessible shared Button component with primary, secondary, ghost, destructive, disabled, and loading states
- Added canonical V1 and post-V1 feature-scope documents, including permanent links to the pre-change documentation snapshot
- Added a canonical V1 screen map covering full-screen routes, primary navigation, contextual interfaces, and unresolved implementation decisions
- Added local task and weekly-goal creation, detail, completion, and progress flows.
- Added Home-matched Focus, Analytics, Rewards, Profile, Settings, Task, and Goal screens with accessible empty and loading states.

### Changed

- Renamed the application configuration and package metadata from MyFirstApp to Deep Focus
- Replaced the experimental session setup entry screen with the Phase 0 Deep Focus home  screen
- Simplified web navigation to the active Home route
- Documented `Plan My Day` as required V1 scope and `Break Down This Task` plus `Review My Day Lite` as release-gated V1 targets
- Documented the November 15 scope checkpoint, November 30 beta, December 15 store submission, and January 1, 2027 public-release targets
- Synchronized the Blueprint, UI specification, architecture, and implementation plan with the canonical five-tab V1 navigation model
- Replaced the temporary Home and Explore navigation with a connected five-tab V1 route skeleton and contextual workflow routes
- Canonicalized the shared visual tokens to the Deep Focus navy and mint palette,
  including accessible dark/light theme values and a distinct AI-only lavender accent
- Refined the Home dashboard into a calm, premium zero-state experience with a
  clear session entry point and working quick-action routes
- Added the first timestamp-based Focus Session vertical slice with live timer,
  pause/resume, completion, cancellation, and session summary states
- Added guarded local active-session and history persistence with a recovery route
- Extended the local focus workflow with session-history details, derived analytics, calm milestone progress, and local task/goal progress views.

### Fixed

- Fixed Quick Action and profile links so Tasks and Goals resolve to their list routes instead of the dynamic detail routes.
- Fixed Welcome and authentication links so the onboarding index resolves through its canonical `/onboarding` route.

### Removed

- Removed obsolete Explore, Focus, Summary, and legacy index prototype routes


### Improved

- Improved project documentation structure and consistency
- Refined documentation for maintainability and future scalability
- Strengthened accessibility guidance
- Strengthened privacy and security guidance
- Refined AI behavior and development guidance
- Expanded development and contribution standards
- Expanded testing, compatibility, performance, release, and defect-management guidance
- Synchronized product, UI, component, architecture, data, database, API, security, and testing contracts for proposal-first AI actions, task reminders, subtasks, action accounting, and trusted rewarded unlocks

---

## Release Guidelines

---

Every public release should be represented in this changelog.

Each release entry should include, where applicable:

- Version number
- Release date
- Significant user-visible changes
- Important internal changes
- Added functionality
- Changed functionality
- Meaningful improvements
- Bug fixes
- Removed functionality
- Deprecated functionality
- Security-related updates

Release notes should remain:

- Clear
- Concise
- Accurate
- Factual
- Easy to understand

Changelog entries should describe what changed rather than provide unnecessary implementation detail.

Features that are planned but not completed should not be recorded as released functionality.

---

## Version History

---

Released versions should appear below `Unreleased`.

The newest released version should appear first.

Example:

```text
## [1.0.0] - YYYY-MM-DD

### Added

- Added Feature A.
- Added Feature B.

### Changed

- Updated existing application behavior.

### Improved

- Improved application performance.

### Fixed

- Fixed a notification issue.

### Removed

- Removed deprecated functionality.

### Deprecated

- Deprecated legacy functionality scheduled for future removal.

### Security

- Improved authentication handling.
```

Categories without relevant changes should be omitted.

Release dates should use a consistent format:

`YYYY-MM-DD`

Released entries should not normally be modified after publication except to correct inaccurate information.

Material corrections to historical entries should preserve the accuracy of the project history.

---

## Pre-Release Versions

---

Before Deep Focus reaches its first stable public release, pre-release versions may be used where appropriate.

Examples may include:

- `0.1.0`
- `0.2.0`
- `1.0.0-alpha.1`
- `1.0.0-beta.1`
- `1.0.0-rc.1`

Pre-release identifiers should only be introduced when they provide useful meaning to the development or release process.

The project does not need to create version numbers for every internal development change.

---

## Release Process

---

Before publishing a new release:

- Complete the intended release scope
- Complete appropriate testing and validation
- Resolve release-blocking defects
- Review relevant documentation
- Update the application version where required
- Review the `Unreleased` section
- Move applicable completed entries into the new release section
- Add the release version and date
- Remove empty categories
- Review the changelog for accuracy
- Create the appropriate Git release tag
- Publish release notes where applicable

After creating a release, the `Unreleased` section should remain available for subsequent completed changes.

A public release should represent a version that has completed the verification appropriate to its intended scope.

---

## Release Tags

---

Public release tags should correspond clearly with application versions.

A consistent tag format should be used, such as:

```text
v1.0.0
v1.1.0
v1.1.1
```

Pre-release tags may follow the corresponding version identifier where applicable.

Examples:

```text
v1.0.0-beta.1
v1.0.0-rc.1
```

Tags should reference the commit representing the intended release state.

Release tags should not be created for ordinary documentation or development commits.

---

## Documentation Updates

---

Significant documentation changes may be recorded when they materially affect:

- Project direction
- Product requirements
- Architecture
- Development standards
- Testing requirements
- Contributor expectations
- Security or privacy guidance
- Accessibility requirements
- AI behavior or development rules
- Release processes

Minor editorial changes, formatting corrections, and typo fixes generally do not need individual changelog entries unless they materially change project understanding.

Documentation entries should describe completed documentation changes accurately.

---

## Change Recording Principles

---

Every recorded change should:

- Be accurate
- Represent completed work
- Be concise and understandable
- Describe user-visible impact when applicable
- Describe significant internal or documentation changes when relevant
- Avoid unnecessary implementation detail
- Avoid duplicate entries
- Avoid speculative future functionality
- Use the most appropriate change category
- Remain understandable without requiring commit-history investigation

The changelog should not function as:

- A project roadmap
- A complete commit log
- A task tracker
- A list of every modified file
- A record of insignificant editorial changes

Git history should preserve implementation-level change history, while the changelog should preserve meaningful release-level project history.

---

## Changelog Maintenance

---

The changelog should be updated as meaningful work is completed rather than reconstructed entirely at release time.

Before a release, contributors should verify that:

- Relevant completed changes are represented
- Planned but incomplete work is excluded
- Duplicate entries are removed
- Categories are accurate
- Descriptions reflect actual implementation
- Security-sensitive details are not unnecessarily exposed
- Historical release information remains accurate

Changelog maintenance should remain lightweight and proportional to the scale of the project.

---

## Conclusion

---

This changelog serves as the historical record of significant changes made to Deep Focus.

Maintaining an accurate changelog helps developers, contributors, and future users understand the evolution of the application while improving transparency and release traceability.

A well-maintained changelog should provide:

- Clear version history
- Accurate change records
- Consistent release documentation
- Reliable release notes
- Useful historical context
- Long-term project traceability

The changelog should remain concise, factual, maintainable, and synchronized with completed project work.

As Deep Focus evolves, changelog practices may evolve with the release process while preserving the principles of accuracy, clarity, and meaningful historical documentation.

---
