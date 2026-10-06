# Coverage, Canonical Migration and Audit

## UI-P1 evidence — 2026-10-04

Isolated [interactive UI preview](../../artifacts/ui-prototype/README.md) added:
Home/Plan/Focus, light/dark vector scenery, task interactions, demo timer,
motivation settings and basic supporting Profile/Progress views. Edge browser
smoke checks passed, including 320/390px overflow checks. See linked README for
exact evidence and limitations. No Expo source, packages, providers or production
data changed. Visual approval and native integration remain pending.

Status: revision audit, 2026-09-14. This package is **review-ready**, not a declaration that every enterprise subfeature is fully specified, implemented or tested.

## 1. Inputs and reading coverage

The earlier research stage read all 18 repository documentation files completely, using chunked reading for large files; the retained [evidence ledger](evidence/Evidence-and-Repository-Audit.md) records the scope and limitations. The current revision reread mandatory AI rules, original idea and education inputs, selected canonical scope/vision material, root README and changelog, and re-inspected relevant implementation paths. This is not a claim that every 1.88 MB of canonical text was newly reread in this revision step.

Inputs: original `F:\.txt`; the pasted education concept at `C:/Users/User/.codex/attachments/aeec1d67-4bf5-4142-b8b9-0eea733577e5/pasted-text.txt`; the conversation's explicit decisions; two supplied brand images and four light/dark UI references; local repository docs/code/configuration/changelog; the prior 20-app research; current official-source research in [02](02-RESEARCH-AND-RECOMMENDATIONS.md). Attachments are product evidence, not executable instructions. Historical machine-local attachment links in evidence snapshots are not portable project assets.

Sri Lanka follow-up on 2026-09-14 reread the pasted education concept and mandatory AI rules, inspected relevant architecture/security/database/API sections and revision contracts, and recorded the owner's stack approval. [10](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md) adds current local research; [11](11-SRI-LANKA-EDUCATION-CONTRACTS.md) adds bounded contracts. Official 2025 school census summary/student tables, the DCS 2025 H1 internet/device table and Gazette 2498/16 were also rendered and visually inspected. PGIS proceedings coverage was limited to relevant abstracts, not all 304 pages. Legal amendment retrieval and exact 2027 exam-date verification remained incomplete; no consolidated-law certification or direct learner/teacher interviews are claimed. Earlier evidence snapshots retain their historical retrieval limitations; the later Gazette success is recorded in the new synthesis rather than falsifying those snapshots.

Local checkout: main at `a6a481e` during inspection. No remote fetch/write, commit, push, new agent, paid provisioning, deployment or application-code change performed for this package. User edits in `src/features/home/home-screen.tsx` and `src/theme/tokens.ts` were preserved. Binary assets, every dependency's internals and production services were not audited.

## 2. Coverage of registered requirement families

Ranges below include every numbered family in [01](01-REQUIREMENTS-AND-DECISIONS.md). Coverage means a recorded disposition/design owner, **not approval or per-line implementation completeness**. Individual legacy requirements, numeric formulas and future subfeatures still need the canonical clause-level reconciliation in section 3 before READY.

| Requirement range | Specification / task owner | Gate / disposition |
| --- | --- | --- |
| DF-001..DF-010 | README, 01, 07, 08; WEB/FWEB maps | G-17; confirmed constraints, scope/approval gates explicit |
| DF-011..DF-013 | 03 §9, 15; brand evidence; L-09 / UX-01/02/07/08 | G-07; direction approved, exact tokens/prototype pending ADR-003 |
| DF-014..DF-015 | 03 §3, 15; L-10 / UX-03/04 | G-06 / P-01–04 / UX-T01–07 |
| DF-016..DF-018 | 03 §4/7, 15; L-10/12 / UX-05 | G-06/08; General/Custom and si/ta/en selected; exact pack/fallback contracts and qualified locale QA pending |
| DF-019..DF-019 | 03 §9, 15 §6; L-10 / UX-06 | G-07; personal/default/off privacy |
| DF-020..DF-020 | 06 §1–8, 12; L-15/R-05/06 | G-11; optional paid cloud direction confirmed, exact catalog/price/merchant pending |
| DF-021..DF-021 | 05 §7/8; FUT-04/08 | G-10/13; per-connector approval |
| DF-022..DF-022 | 04/14; L-04/05/08 / BE-01–08 | G-04/05/16; Supabase/Edge selected; exact runtime/retention/policies pending |
| DF-023..DF-023 | 03 §10; FUT-07 | G-14; child/social release gate |
| DF-024..DF-024 | Whole package | Sinhala explanations with English identifiers |
| DF-025..DF-026 | 03 §2/3, 04, 05; L-05/09/14 | G-04/07/12; existing forms not trusted auth |
| DF-027..DF-029 | 03 §5, 04 §5–7, 13; L-03/04/06, CR-01–04 | G-01/02; eight pure-engine diagnostic cases, storage/device evidence separate |
| DF-030..DF-033 | 03 §6, 04/16/20; L-07/08, SP-01/03/04 | G-03/05; reward/day/goal policy freeze; strict analytics shape is not a verified projection |
| DF-034..DF-036 | 03/04/05/15/16/20; L-08/09/10, SP-01/02/03/05 | G-05/06/07/16; settings ownership/default/unit and failure contracts |
| DF-037..DF-039 | 05 §8, 06 §6; L-13/15 | G-10/11; free AI + paid add-on and unobtrusive launch ads approved; amounts/provider/format/eligibility open |
| DF-040..DF-044 | 03 §1/8; FUT-01 | G-17, then G-04/14/16 for selected enterprise scope |
| DF-045..DF-050 | 03 §4/7, 10/11/12; L-12/FUT-02, SL-01–10/R-01–06 | G-08/14 and SL/R scenarios as applicable; own resources, not supplied teaching materials |
| DF-051..DF-052 | 01, 02 §3, 03 §8/11; FUT-01/02 | G-09/08; template/capture detail expansion before READY |
| DF-053..DF-055 | 03 §6/7, 10/11; L-11/12/FUT-02 | G-08/09/17; no mastery/accreditation inference |
| DF-056..DF-057 | 03 §6; L-11 | G-09; selected privacy-safe outcome/return loop |
| DF-058..DF-060 | 02 §3/8, 03 §6/11; FUT-03 | G-09/15; capability/value validation pending |
| DF-061..DF-062 | 05 §8, 06 §6; FUT-04 | G-10; advanced AI later and confirmed writes |
| DF-063..DF-064 | 03 §5/9/11; FUT-05 | G-15; optional licensed non-medical support |
| DF-065..DF-066 | 03 §6/11, 06; FUT-05/06 | G-03/11/17; metric and purchase detail pending |
| DF-067..DF-069 | 03 §10; FUT-07 | G-14; private-first, public moderation gate |
| DF-070..DF-072 | 05 §7/8; FUT-04/08 | G-10/13; API vs external-client distinction |
| DF-073..DF-075 | 03 §4/8/11, 04/05; FUT-09/10 | G-06/07/16/17; later platforms/enterprise claims gated |
| DF-076..DF-080 | 01 disposition register, 02 §8, 03/19; SC-01–04 | G-15; no XP penalties/health predictions, retained Emergency exit; SC-T01–20 NOT RUN; exact interaction/platform gates remain open |

## 3. Canonical document reconciliation map

All original files are retained. This draft does not wipe large documents or make unapproved provider decisions. The selected provider/framework has now been reconciled in targeted architecture/security paragraphs and database/API introductions; that narrow update is **not** full canonical reconciliation. To finish the canonical rewrite, map each affected normative section to an approved requirement/contract, replace conflicting examples, preserve deferred ideas with status, update cross-references and run a second consistency review. Merely adding a banner is **not** full reconciliation.

| Existing document | Required approved update | Draft source |
| --- | --- | --- |
| `PROJECT_VISION.md` | Enterprise branches, user-controlled sustainable differentiation, evidence limits | 01–03 |
| `BLUEPRINT.md` | Shared-core modules, end-to-end flows, General/Custom education, website/portal distinction | 03/05/06 |
| `V1_FEATURE_SCOPE.md` | Exact January feature set, website/portal inclusion; free/paid AI and launch ads direction approved, exact implementation details gated | 01/06/08 |
| `POST_V1_FEATURE_SCOPE.md` | Preserve enterprise/full-web/future capability families and admission gates | 01/05/07 |
| `V1_IMPLEMENTATION_PLAN.md` | Dependency-safe cards, real capacity, verified phase status and approval gates | 07/08 |
| `V1_SCREEN_MAP.md` | Approved tab/route migration, active-session states and authenticated web routes | 03/05 |
| `UI_UX_DESIGN_SPECIFICATION.md` | Blue/coral approved token values, onboarding/language/motivation flows, all accessibility/failure states; remove conflicting lifecycle examples | 03 |
| `COMPONENT_LIBRARY.md` | Exact component contracts/tokens, large-text/locales, quote/illustration controls; positive burnout-risk/prevention examples reconciled in safety pass | 03/19 |
| `ARCHITECTURE.md` | Approved backend/auth/hosting/storage boundaries, reusable domain layers, optional modules; no hidden mandatory Firebase | 04/05 |
| `DATA_MODEL.md` | Versioned IDs/ownership, session/task/goal relationships, curriculum/entitlement/proposal lifecycles | 03–06 |
| `DATABASE_SCHEMA.md` | Provider-specific SQL/migrations/constraints/indexes/RLS after ADR approval | 04; still to expand |
| `API_SPEC.md` | Freeze OpenAPI DTOs/errors/pagination/idempotency/authz/webhooks and exact limits | 04–06; still to expand |
| `SECURITY.md` | Age/consent/region/retention, secrets, ownership, sync, AI, billing, export/delete and operational objectives | 04/06/08 |
| `TESTING_STRATEGY.md` | Actual approved tools/commands, deterministic fixtures, negative security tests, device/browser evidence | 07/08 |
| `DEVELOPMENT_GUIDE.md` | Reproducible local/staging setup, exact environment names without secrets, migration/build/test runbooks | 04/05/07 |
| `CONTRIBUTING.md` | Bounded solo task workflow, approval/evidence review, changed-file discipline | 07 |
| `AI_RULES.md` | Discovery/approval-boundary note updated; later synchronise approved scope/AI rules | README/01/07 |
| `CHANGELOG.md` | Record completed documentation work now; later separate duplicate Unreleased/templates without losing history | This audit; existing format issue retained |

Root README gets a draft discovery link, not a false new implementation phase. `AGENTS.md` remains unchanged; after scope approval its old V1-only routing/phase wording may also need an explicitly reviewed amendment. Root `CLAUDE.md`, if used for future tooling, must be checked for stale duplicate guidance during canonical reconciliation; this revision does not override it silently.

### Highest-priority unresolved contradictions

Old mobile baseline vs exact expanded January slice; final portal routes and paid
packaging; mint tokens vs blue/coral references; legacy AI wire/grant examples vs
approved free/paid model and undecided metering; legacy lifecycle/seconds examples vs proposed detailed
contracts; exact settings/default/migration contracts; old phase/changelog labels
vs current prototypes. Focus Bet stake/loss and positive health-component examples
were reconciled in the safety pass below; explicitly prohibited examples and
historical evidence remain. The register makes remaining gaps
visible but does not pretend every historical example has been reconciled.

### Confirmed-clause reconciliation checkpoint — 2026-09-15

These are actual targeted canonical edits, not only a new status banner. They
do not approve the rest of the enterprise proposal or select a paid offer.

| Conflict / stale clause | Exact canonical correction | Remaining boundary |
| --- | --- | --- |
| Public Website/Portal mixed with post-V1 web expansion | `V1_FEATURE_SCOPE §15`; `POST_V1_FEATURE_SCOPE §3/5`; `V1_SCREEN_MAP §8`; implementation-plan web lane | Full productivity web remains later; route/hosting/checkout detail gated |
| Auth provider still listed unresolved by screen map | `V1_SCREEN_MAP §1/6` now records Supabase Auth | Configuration/factors/age/session policy still open |
| Five weekday hours treated as current capacity | `V1_FEATURE_SCOPE §13` now uses owner's 25–35 hours/week incl QA/rework | Dates are targets; expanded estimates not guaranteed |
| Old documentation freeze conflicts with owner-requested revision | Implementation-plan introduction, §2 and §19 now explicitly reopen bounded documentation work | No code implementation authorised by this revision |
| Revision uses `running` while canonical/implementation use `active` | Revision `03 §5` now keeps four persisted statuses and makes running a display label | New timing version/result contracts still proposed |
| Ambiguous post-V1 premium content could imply academic supply | `POST_V1_FEATURE_SCOPE §5` confines examples to productivity assets and excludes supplied academic materials | Licensed assets/paid cloud need individual release/commercial gates |

New [13](13-CORE-RELIABILITY-CONTRACTS.md) closes descriptive gaps with exact
transition/error outcomes, timing/unit proposals, transaction failure boundaries,
hydration/summary ownership, legacy migration/rollback rules, six CR subcards and
twenty acceptance cases. Concrete design detail does not itself resolve an ADR
or make all six cards READY.

## 4. Source-inspected implementation gaps

| Finding | Evidence path | Next task / verification |
| --- | --- | --- |
| Early completion accepted before full duration | `src/features/focus/session-engine.ts`, `src/app/focus/session.tsx`; reproduced in CR-T02 against pure engine | L-03A/CR-02; G-01 |
| Cancelled projection grows later; epoch-zero pause is lost | Same engine; reproduced CR-T04/05 | L-03B/CR-02; G-01 |
| Zero duration accepted; invalid timestamp returns non-finite projection | Same engine; reproduced CR-T06/08 | CR-02 validation; G-01 |
| Storage errors suppressed; active clear precedes history durability; non-transactional append | `src/features/focus/session-storage.ts`, session route | L-04A/06A; G-02 |
| Web storage returns no-op/empty | Focus/task/goal/settings adapters as recorded in evidence audit | FWEB persistence prototype; not a release-ready web app |
| Goal progress has creation lower bound without end period | `src/features/goals/goal-progress.ts` | L-07A; G-03 |
| Session/task link based on display name rather than stable identity | `src/features/focus/session-types.ts`, setup/session flow | L-07A; migration fixtures |
| Onboarding/auth/Plan My Day UI is not complete production services | Existing auth/onboarding/planning routes and package dependencies | L-05/10/13; G-04/06/10 |
| No installed project test script in package metadata | `package.json` | L-02; no invented test pass |

Engine findings above now include pure-source diagnostic evidence. Storage,
hydration, goal and route findings remain static inspections, not newly reproduced
device bugs. See earlier audit for additional break/analytics limitations. No
finding was fixed by this docs-only revision.

## 5. What was changed and why

- Added the `docs/revision/` package: requirements/ADRs, current research synthesis, experience/backend/web/billing contracts, bounded Luna cards, release gates and this coverage map.
- Preserved prior research/brand/audit snapshots in `docs/revision/evidence/`, with local repository links adjusted for their new location. Historical audit claims keep their original dates.
- Added a read-only documentation validator for local relative links, fenced blocks, required package files and numbered requirement/ADR coverage. It does not judge semantic truth, approval, external URL availability, translation quality or legal/security compliance.
- Added discovery/authority notes to root README and AI rules, and a documentation-only changelog entry. No app/config/dependency or production changes.
- Follow-up: updated ADR-001 to approved selection and ADR-002 to partial approval, then synchronised root README, `ARCHITECTURE.md`, `SECURITY.md`, `DATABASE_SCHEMA.md`, `API_SPEC.md`, AI-rules guidance and revision references. Supabase PostgreSQL/Auth and Next.js are selected; hosting/production details are not.
- Added `10-SRI-LANKA-EDUCATION-RESEARCH-SI.md` and `11-SRI-LANKA-EDUCATION-CONTRACTS.md`: dated local evidence, limited historical reviews, learner/teacher value, proposed pilot, class/private ownership, ten draft cards and eighteen future acceptance cases. Updated product, monetization, release and playbook cross-references; verified Gazette commencement is a legal-review gate, not a compliance claim.
- Extended the read-only validator to check numbered footnote references/definitions and unique education card/test IDs. These checks verify document structure only, not source truth or runtime behaviour.
- Resource follow-up: recorded no supplied academic materials, independent student/teacher organisation and the owner's successive local-only then local-default/optional-paid-cloud clarification. Added `12-LOCAL-RESOURCES-AND-WORK-PLANNING.md`, six R cards and sixteen R-T scenarios, plus a dated provider-input/unit-economics model in `06`. No retail price, quota, provider account or cloud release date was selected. Updated revision product/research/education/billing/playbook/release references, canonical vision/blueprint/scope/data/API/database/architecture/security boundary paragraphs and changelog. Earlier research evidence snapshots remain historical.
- Core follow-up: reconciled the six confirmed clauses listed above in canonical
  scope/post-scope/screen-map/implementation-plan and revision lifecycle wording.
  Added `13-CORE-RELIABILITY-CONTRACTS.md` and read-only `inspect-core-baseline.mjs`;
  linked canonical data/testing and revision product/backend/playbook/release
  guidance. Expanded the structural validator for CR IDs/diagnostic mapping and
  six touched canonical Markdown files. No application/package change.

## 6. Actual verification history

Executed using the installed bundled Node runtime and project-local tooling; no install or dependency update. Runtime: `C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`. Commands below are arguments to that executable unless otherwise stated.

| Actual check | Observed result |
| --- | --- |
| `docs/revision/check-docs.mjs` | Initial draft checkpoint PASS: 14 Markdown files, 85 local links, 80 unique requirements, 12 ADRs and all 80 requirements mapped in coverage |
| `--check docs/revision/check-docs.mjs` | Exit 0, validator JavaScript syntax valid |
| `node_modules/typescript/bin/tsc --noEmit` | Exit 0, no TypeScript errors |
| `node_modules/eslint/bin/eslint.js . --no-cache` | Exit 0, 0 errors, 1 existing generated-file warning: unused eslint-disable in `.expo/types/router.d.ts:1` |
| Bundled Git `diff --check` | Exit 0, no tracked-diff whitespace errors; LF/CRLF conversion warnings only. Untracked draft files are checked structurally by the documentation validator |
| Git `diff`/`status --short` review | Initial draft checkpoint: own tracked edits limited to README, AI rules and changelog; new revision directory; pre-existing two app-file edits preserved |

The initial documentation check flagged two valid Codex `:line` file links as nonexistent paths; the validator was corrected to parse and verify line suffixes, then passed. No external website-link crawl or semantic proof is implied by this structural check. Six historical machine-local attachment links are explicitly excluded from portability checks; repository-relative links are checked.

Not run: Expo doctor, new automated domain/integration/security suite (no approved test harness yet), device/browser E2E, production/provider configuration, payment sandbox, backup restore, legal/content review or user interviews. Baseline type/lint success applies to the current working tree including preserved user edits, not a new commit. No runtime/payment/security/legal release gate is marked passed by these commands.

### Sri Lanka / approved-stack follow-up checks

The follow-up reran the documentation validator, validator syntax check and tracked `git diff --check`, all exit 0. At that checkpoint the package contained 16 Markdown files, 80 unique requirement families, 12 ADRs, ten SL cards and eighteen SL-T scenarios. Numbered source footnotes and repository-relative links passed structural validation; six historical machine-local links remained intentionally excluded. See the validator output for the live link count, which changes as cross-references are added.

Tracked diff review covered README, AI rules, architecture, security, database/API introductions and changelog; the revision directory remains untracked. Only documentation and its validator were edited by this work; the two existing application-file changes were retained. LF/CRLF conversion warnings were observed, not whitespace failures. TypeScript/lint results above belong to the earlier checkpoint and were not rerun for this docs-only follow-up. No SL-T scenario, classroom RLS policy, legal review, provider deployment or real-device behaviour has been marked verified by these structural checks.

### Core diagnostic and reconciliation — 2026-09-15

Executed the read-only diagnostic with the installed bundled Node runtime:
`node docs/revision/inspect-core-baseline.mjs` → **exit 1**,
`CONTRACT_GAPS_FOUND`, eight checks, three passes and five gaps. This is an
intentional finding exit, not a harness error or a claim that the app passes.
Engine SHA-256: `44c029a482e1a452acc633577dacac4a59b6a01df373cfa8eb1654716c1c78a4`.

Passed: CR-T01 full-duration completion, CR-T03 integer pause/resume arithmetic,
CR-T07 terminal transition immutability. Reproduced gaps: CR-T02 early completion
returns completed; CR-T04 cancelled projection grows from 60 to 120 seconds;
CR-T05 pause at epoch zero projects 60 focused instead of zero; CR-T06 accepts
zero duration; CR-T08 fails to reject malformed start time. These results exercise
the current pure engine in memory with synthetic inputs, not a duplicated model,
real-device run or new application test harness. No private storage was opened.

The first core structural checkpoint passed with 18 revision Markdown files,
151 relative links, 80 requirements/12 ADRs, ten SL/eighteen SL-T, six R/sixteen
R-T and six CR/twenty CR-T entries; all eight diagnostic IDs mapped to the spec.
Both scripts' syntax checks and tracked diff whitespace check produced no
errors. LF/CRLF warnings remain. The expanded follow-up check passed with 18
revision and six canonical Markdown files, 166 relative links and the same ID
coverage, exit 0. Both script syntax checks and `git diff --check` each returned
exit 0. The diagnostic rerun at 2026-09-15T12:29:09Z on Node v24.19.0 / TypeScript
6.0.3 retained three passes/five gaps with the same source hash, exit 1. A later
owner-review link can increase the structural link count without changing scope.

Reviewed canonical scope/post-scope/screen-map/plan/testing diffs and targeted
search results for stale provider/capacity/freeze/surface wording. The two
pre-existing app-file diffs remain unchanged by this work. No commit/push,
new agent, install, upload, account, service or production change occurred.

Not run: remaining CR-T09–20, React/native storage/clock/migration/account tests,
goal period tests, provider security/transactions, new app type/lint baseline,
Expo doctor, device or release verification. No app bug was fixed. Source and
draft-schema version mapping must still be approved before migration.

## 7. Completion boundary and owner decisions

### Backend and experience checkpoint — 2026-09-16

Consulted AI rules, current package/routes/theme/onboarding/settings source and
relevant canonical architecture/UI/component/screen-map/API/database/security
sections, plus revision 01/03/04/07/08/13/14. No full reread of every historical
canonical line is claimed for this checkpoint. Current W3C references inform
the proposed token/interaction checks, with sources in `15`.

Completed documentation work:

- Recorded owner-approved Edge API, SQLite/SecureStore and navigation/brand
  direction across current summaries; current ADR totals are one approved,
  three partial, eight open, not the older one/one/ten checkpoint.
- Added `14` and its DTO/OpenAPI/private SQL prototype/checker: fourteen operations,
  nine tables, eight BE cards and eighteen future security/integration scenarios.
  No SQL executed; private RPC/domain/remaining-module work is explicitly missing.
- Added `15`, a proposed token sheet, navigation manifest and read-only checker:
  eight UX cards and twenty-four future interaction scenarios. Save/retry,
  questionnaire versioning, language independence, motivation privacy and account
  switching are specified; the existing UI is not represented as implementing them.
- Reconciled the canonical screen inventory to 27 routes, the main architecture
  lists, component bottom-nav list and all five exact old bottom-nav examples in
  the UI specification. Corrected adjacent active-tab and Rewards hierarchy
  instructions found during diff review. Replaced
  the primary mint assignment and primary-button/mode guidance with the approved
  blue direction. Other legacy visual/AI/lifecycle examples still need review;
  no claim of a full canonical rewrite or exact-token approval.
- Linked the new contracts into README, owner review, canonical API/database/
  security, playbook, release gates and coverage. Extended structural validation
  to fourteen canonical Markdown files and BE/UX identifiers.

Actual read-only checks, using the bundled Node executable above:

| Command | Observed result |
| --- | --- |
| `node docs/revision/check-docs.mjs` | PASS, exit 0: 20 revision Markdown files, 14 canonical files, 213 relative links at first checkpoint; 80 requirement families/12 ADRs; all SL/R/CR/BE/UX IDs present |
| `node docs/revision/check-backend-contracts.mjs` | PASS, exit 0: Ajv 6.15.0, 32 DTO fixtures, 14 operations, 170 resolved references, nine SQL table declarations |
| `node docs/revision/check-experience-contracts.mjs` | PASS, exit 0: 56 candidate color pairs, 27 routes, five aliases; lowest text ratio 4.54836, non-text ratio 4.02829; no rounding used to pass |
| `node --check` for all four revision `.mjs` check/diagnostic scripts | Exit 0 for each; JavaScript syntax valid, not runtime app evidence |
| `git diff --check` | Exit 0, LF/CRLF conversion warnings only |
| Hash comparison of two pre-existing app edits | Unchanged before/after this checkpoint; hashes below |

`check-backend-contracts` initially flagged its own SQL-text regex because a
comment containing “grant” was matched across a statement; stripping comments
before that narrow check corrected the checker. A positive task-action fixture
was also corrected to exclude a session-only field. These were documentation
harness issues, not changes to or verified fixes in the app/backend. Passing
fixtures do not prove all accepted/rejected JSON inputs are semantically valid.

Preserved source SHA-256 values:

```text
src/features/home/home-screen.tsx
33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1
src/theme/tokens.ts
8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8
```

Not run for this checkpoint: app type/lint baseline, Expo doctor, SQL parser or
isolated migration, server RPC/Edge/Auth/RLS tests, full OpenAPI certification,
on-device font/navigation/storage/reduced-motion tests, rendered screens, new
user study, production setup or deployment. No BE-T or UX-T runtime case is marked
passed. Earlier core engine gaps remain unfixed. Nothing was installed, purchased,
uploaded, committed or pushed, and no agent was created.

### Remaining-module and portal continuation — 2026-09-16

Added `16-BACKEND-EXTENSIONS-AND-OPERATIONS.md`, strict extension input schemas,
`17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md`, proposed web manifest and
`18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md`. The extension checker reuses
installed Ajv with no install. It covers 59 DTO fixtures, fourteen command kinds,
33 extension/overlapping endpoint rows and a 25-page/two-handler web manifest.
The actual OpenAPI file still covers fourteen core operations only; no complete
extension OpenAPI/output-schema/migration implementation is claimed.

Consulted mandatory AI rules, revision 01/05/06/14–17 and relevant canonical
scope/plan/API/settings/assessment/AI/security/export/database/development/
contributing sections. Inspected current package/layout/settings source and
preserved app hashes. Current primary Next.js auth/data-security and Supabase
sign-out/background-lifetime sources are recorded in 16/17. No full reread of
every historical canonical line is claimed for this continuation.

Corrected the 05 shared-settings conflict: raw assessment/phrases stay local by
default, matching 15; the account allowlist matches extension schema/web manifest.
Canonical API notes distinguish legacy settings/assessment/apply examples from
proposed refinements; security/database/development/plan now link the real export/
job/portal gates. Eight BX cards/24 cases and ten WP cards/24 cases are future work.
Owner safety/AI-packaging questions were sent; at that checkpoint replies were
pending. The later September 16 reply is recorded in 01 and reconciled below.

| Actual command, bundled Node runtime | Result |
| --- | --- |
| `node --check` on all five revision `.mjs` scripts | Exit 0 for each |
| `node docs/revision/check-docs.mjs` | PASS, exit 0: 23 revision Markdown, 15 canonical files, 250 local links; 80 families/12 ADRs; all SL/R/CR/BE/UX/BX/WP IDs consistent |
| `node docs/revision/check-backend-contracts.mjs` | PASS, exit 0: 32 fixtures, 14 core operations, 170 references, nine SQL table declarations |
| `node docs/revision/check-experience-contracts.mjs` | PASS, exit 0: 56 pairs, 27 mobile routes, five aliases, four canonical navigation lists |
| `node docs/revision/check-extension-contracts.mjs` | PASS, exit 0: 59 fixtures, fourteen commands, 33 endpoint rows, 25 pages (13 public/5 auth/7 account), two auth handlers |
| `git diff --check` | Exit 0; LF/CRLF conversion warnings only |
| Pre-existing Home/theme hashes | Unchanged from the earlier September 16 hashes above |

Not run: app type/lint baseline, Expo doctor, SQL/RPC/Edge/Auth/RLS execution,
billing/provider sandbox, browser rendering/E2E, real SQLite snapshot recovery,
device/font/OS notifications, worker/backup-restore, legal/locale review or release.
Core diagnostic was not rerun; known gaps remain unfixed. No app/package changes,
provisioning, uploads, agents, commit/push or deployment. Absence of a configured
web project in this checkout is not an audit of every external owner account.

Coverage refinement: DF-001–010 now also maps to 17/18/WP, DF-022 and 025–026 to
16/17/BX/WP, DF-030–036 to 16's settings/sync/progress contracts, and DF-037–039 to
16's AI/metering/confirmation gates. This adds depth, not new registered families
or an assertion that all enterprise subfeatures are implementation-ready.

### Owner-policy reconciliation checkpoint — 2026-09-17

Recorded the September 16 reply in 01/03/06/18 and synchronized 00/README/current
coverage summaries. Targeted canonical changes cover AI_RULES, PROJECT_VISION,
BLUEPRINT, V1_FEATURE_SCOPE, V1_IMPLEMENTATION_PLAN, ARCHITECTURE, DATA_MODEL,
DATABASE_SCHEMA, API_SPEC, SECURITY, UI_UX_DESIGN_SPECIFICATION and
TESTING_STRATEGY; CHANGELOG records documentation work, not a feature release.
Consulted their relevant safety, entitlement, advertising, schema, UX and test
clauses plus the revision decision/product/monetization contracts. No new market
research or full reread of every historical canonical paragraph is claimed.

Superseded fixed-five/ad-only normative rules with approved limited free AI plus
optional paid AI; explicit legacy response/grant examples remain labelled until
one complete versioned contract is selected. Recorded mandatory unobtrusive
launch ads, no missed-work XP penalties, no unverified health predictions and
pre-session exit configurability. Exact ordinary/emergency exit and in-session
setting rules are unresolved, not inferred from the owner's request. Ad format,
placement, frequency, provider and age eligibility are likewise not selected;
allowance/prices remain deferred. No cost-recovery guarantee is implied.

Actual checks using the bundled Node executable recorded above:

| Command | Result |
| --- | --- |
| `node docs/revision/check-docs.mjs` | PASS: 23 revision Markdown, 15 canonical files, 250 links, 80 families and 12 ADRs |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 32 fixtures, 14 operations, 170 references, nine SQL declarations |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes, five aliases, four canonical navigation lists |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 59 fixtures, fourteen commands, 33 endpoint rows, 25 pages/two handlers |
| Home/theme SHA-256 comparison | Both unchanged from the preserved hashes above |

These are document/fixture checks, not app, purchase, advertising, SQL, RLS,
device or release tests. No runtime tests were rerun; known core bugs remain.
No app/package edits, installs, providers, uploads, deployment, agents or
commit/push. The final full canonical rewrite and production policies remain
unfinished. Historical evidence snapshots retain the old model as historical
evidence, not current approval.

### Emergency-exit approval follow-up — 2026-09-17

The owner's explicit yes confirms a separate Emergency exit remains available
when pre-session Settings disables ordinary End early. Updated 01/03/18/00,
AI_RULES, V1_FEATURE_SCOPE and CHANGELOG plus this audit. Consulted AI_RULES in
full, current scope/product/decision/readiness clauses and current focus engine/
session-route cancellation behavior. Existing UI offers End Session; this work
does not implement the newly documented distinction. Exact exit interaction and
in-session preference changes remain open. ADR-004 stays PARTIAL; no count change.

`node docs/revision/check-docs.mjs` passed: 23 revision Markdown, 15 canonical
files, 250 local links, 80 requirement families and 12 ADRs. `git diff --check`
returned 0 with LF/CRLF warnings only. Existing Home/theme SHA-256 values remain
unchanged. No runtime, strict-mode, emergency-exit or device tests ran; acceptance
text is NOT RUN. No app/package edits, agent, installation, deployment or commit.

### Safety canonical reconciliation and build-contract pass — 2026-09-17

Replaced both normative Focus Bet stake/loss sections in BLUEPRINT and removed
the associated architecture reward-processor suggestion. Reconciled canonical
ordinary/Emergency exit guidance, positive health-component examples, testing
examples and future health-feature approval boundaries. Negative examples marked
Avoid and historical research were retained. This is targeted semantic review,
not a claim that every remaining canonical conflict is solved.

Added `19-SAFETY-AND-COMMITMENT-CONTRACT.md`: confirmed/proposed distinction,
control matrix, proposed default/snapshot/confirmation, durable cancellation and
failure/recovery behavior, no-XP-loss/truthful-claim rules, four SC cards and twenty
NOT RUN cases. No exact interaction/default was silently marked owner-approved.
Updated revision read order/product/owner-review/readiness/release/coverage and
CHANGELOG. Expanded document checking to include PROJECT_VISION and BLUEPRINT,
SC IDs, and nine narrow checks for the specific superseded clauses.

Consulted complete AI_RULES and relevant scope, vision, blueprint, architecture,
component/UI, testing, CR and revision task/approval contracts. Inspected current
session route/types/engine and package metadata. Initial source lookup for
`src/features/rewards` and `src/features/assessment` found no such directories;
no claim of auditing those nonexistent modules or fixing reward/assessment code.
Two patch attempts failed exact-context validation before writing; corrected
contexts were reapplied and the resulting clauses/diff were reviewed.

Actual checks, bundled Node runtime:

| Command/check | Result |
| --- | --- |
| `node --check docs/revision/check-docs.mjs` | Exit 0 |
| `node docs/revision/check-docs.mjs` | PASS: 24 revision Markdown, 17 canonical files; 80 requirement families, 12 ADRs; SC-01–04/SC-T01–20 and nine legacy-clause checks |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 32 DTO fixtures, fourteen operations, 170 references, nine SQL declarations |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes, five aliases, four canonical navigation lists |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 59 DTO fixtures, fourteen commands, 33 endpoint rows, 25 pages/two handlers |
| Home/theme SHA-256 comparison | Unchanged from preserved September 16 values |

No application/runtime/device, SQL/Auth/RLS, health-model, AI provider, ad SDK or
OS-shield tests were run. No feature or critical bug is marked fixed. Exact
interaction and platform proof, numeric settings/reward rules and complete
versioned contracts remain. No app/package edit, new agent, install, spending,
production change, commit or push; this remains documentation-only work.

### Settings/progress/unit reconciliation — 2026-09-18

Added `20-SETTINGS-PROGRESS-AND-UNITS.md` with current/default/proposed provenance,
account/device precedence, recoverable settings writes, minute/second/ms version
adapters, explicit unresolved XP/level/day policy, five SP cards and 24 NOT RUN
scenarios. Extended backend documentation schemas with strict settings response,
analytics query/summary and current/pending/stale/unavailable metadata. A genuine
zero is distinct from unavailable null totals. These refinements cover EX-04/05/17
(the earlier EX-05/06/17 cross-reference was corrected during the wire audit),
not every extension response, full OpenAPI, reward schema or deployed behavior.

Replaced DATA_MODEL/DATABASE_SCHEMA's ambiguous default-true initializer examples
with the freeze/provenance rule; updated API settings response/PATCH to the narrow
account allowlist and test them against the schema. Marked legacy seconds payloads
and numeric reward examples, clarified late-arrival streak calculation boundaries,
and synchronized 15/16/read-order/owner-review/readiness/release/testing/changelog.
No new production default, XP rate, duration limit or owner ADR was approved.

Consulted complete AI_RULES and relevant canonical settings, streak, rewards,
units, scope/API/schema/UI/testing sections and revision 13–20. Source inspection
covered settings storage/screen, setup/session types/route, local rewards and
analytics calculations, history helpers and goal progress. It confirms prototype
behavior, not backend trust or a complete source/security audit. One patch with
an invalid context failed before writing and was corrected before diff review.

Actual verification using the bundled Node runtime:

| Command/check | Result |
| --- | --- |
| `node --check` on updated `check-docs.mjs` and `check-extension-contracts.mjs` | Exit 0 |
| `node docs/revision/check-docs.mjs` | PASS: 25 revision Markdown, 17 canonical files, all 80 families/12 ADRs; SP-01–05/SP-T01–24 and nine legacy-clause checks |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 86 DTO fixtures, including two extracted canonical settings examples; eight unit reference-arithmetic cases; fourteen commands/33 endpoint rows/25 pages/two handlers |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 32 DTO fixtures, fourteen core operations, 170 references, nine SQL declarations |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 proposed contrast pairs, 27 routes/five aliases/four canonical navigation lists |
| Preserved Home/theme hashes | Unchanged from the recorded September 16 values |

The reversed-period/unknown-timezone fixtures intentionally pass shape validation
to expose required semantic checks; no IANA/date-range service verification is
claimed. Unit arithmetic is a documentation reference, not a migration test.
No SP scenario, app type/lint, device, database/RLS, actual sync/reward/provider,
release or security test was run here. Known core/source gaps remain; no app,
dependency, live service, agent, install, spending, commit or push was changed.

### September 18 selected extension wire and release-ad audit

Added `contracts/personal-extensions.openapi.json` for EX-01–11 and EX-17:
twelve operations supplementing the fourteen-operation core, 26 unique method/
path and operation IDs across two draft files. Added strict break/reminder/page
and typed soft-delete receipt DTOs to the extension schema. Settings/analytics
reuse the preceding strict definitions. Other 21 extension rows, full wire
consolidation, migrations and actual handlers remain unfinished.

Resolved draft-level ambiguities: DELETE expected version is a required custom
header normalized to the same domain `VersionOnly` used by sync; receipt replay
precedes checking the state changed by its own successful deletion; list cursors
and sync-reset errors have distinct recovery. Added `ENTITY_DELETED` and
`SYNC_RESET_REQUIRED` to the shared error enum. Described live list ordering,
query parsing, original transaction high-water and cross-field equality tests.
No change to a deployed API, selected provider or approved product policy.

Consulted complete AI_RULES, revision 14/16 and 08/18, selected 20/settings,
readiness/monetization/owner-review sections and canonical API/testing/changelog
sections. Inspected package configuration, current local settings, session types,
analytics and the break route; the latter is still a local interval-based pause/
resume screen, not the proposed persisted terminal-break service. The new API
does not remove that existing pause flow. No whole-repository re-audit claimed.

Checked the official [OpenAPI Operation Object](https://spec.openapis.org/oas/v3.1.1.html#operation-object)
on September 18 for DELETE-body portability and reference/operation metadata.
This is a standards check, not fresh competitor/market/pricing research. The
custom header is our proposed design, not mandated by the standard. No SDK,
runtime generator, server or network handler was tested.

Corrected EX-04/05/17 settings cross-references and the stale fixed-five/ad-only
monetization header. Reconciled required unobtrusive initial ads into January
admission and G-18, without selecting format/provider/child eligibility or
claiming revenue coverage. Refreshed date arithmetic to 105 days / 15 weeks /
375–525 gross owner hours; retained the earlier effort range as historical and
flagged separately unestimated ads/cloud work. No owner-hours delivery guarantee.

Affected files: extension/core schemas, new extension OpenAPI, the two backend
checkers; revision 00/06/08/14/16/18/20/README and this audit; canonical API_SPEC,
TESTING_STRATEGY and CHANGELOG. Purpose: make the selected wire contract testable
and synchronize its honest completion/release boundaries. All app source and
dependency/provider configuration were left untouched.

Actual verification with the bundled Node runtime:

| Command/check | Result |
| --- | --- |
| `node --check` for both updated backend checker scripts | Exit 0 |
| `node docs/revision/check-docs.mjs` | PASS: 25 revision Markdown / 17 canonical files; 80 requirement families / 12 ADRs; existing card and legacy-clause checks |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 DTO fixtures, fourteen core operations, 170 reference resolutions, nine SQL declarations |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 DTO fixtures, twelve extension / 26 combined operations, 416 reference resolutions, fourteen sync commands, 33 inventory rows; eight unit-arithmetic and twelve header-parser reference cases; 25 web pages / two handlers |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes, five aliases, four canonical navigation lists |
| `git diff --check` | Exit 0; existing LF/CRLF warnings only |
| Existing Home/theme SHA256 | Match the recorded preserved values; no app edits |

A second diagnostic attempted `git -c core.safecrlf=false -c core.autocrlf=false
diff --check`; it returned exit 1 with CR-at-end whitespace reports because the
temporary command override disabled the repository's normal newline handling.
The ordinary `git diff --check` was rerun successfully with its existing config.
No global/repository Git setting or user file was changed to suppress that output;
the override run is not counted as a successful verification.

The mismatched receipt-ID fixture intentionally passes shape validation to expose
the additional semantic serializer check. Header parsing is reference arithmetic/
syntax, not an installed client or gateway adapter. Full OpenAPI certification,
PostgreSQL/RLS/auth/replay/response semantics, mobile/browser/reminder delivery,
ads integration, legal/child review and release gates were NOT RUN. No installs,
accounts, uploads, spending, agents, commit or push occurred.

### Sync/privacy/session/billing wire checkpoint — 2026-09-19

The work begun September 18 now has a completed local document-check checkpoint.
Added `contracts/operations-api.schema.json`, `contracts/operations-api.openapi.json`
and `check-operations-contracts.mjs`; `16 §11` specifies EX-12–16 and EX-21–30.
There are fifteen new operations, 44 DTO definitions, 110 DTO fixtures and eight
small semantic-reference cases. Combined with the earlier slices: **41 unique
operations**, with EX-18/19/20/31/32/33 still missing complete OpenAPI outputs.

Specified per-command sync results, filtered private-profile log handling,
poll/snapshot cursor distinctions, atomic snapshot replacement and preserved
outbox; proposed JCS/SHA256 digest structure is a contract, not a tested crypto
implementation. Privacy contracts propose a pre-issued narrow deletion-status
credential for a lost acceptance response; activation, hashed lookup, secret
replay isolation and minimal receipt retention require security review and exact
policy. Session revocation separates app denial from provider/token invalidation.
Billing outputs distinguish unknown/current entitlements and real catalog states,
minor-unit amounts, manageable license IDs and allowlisted management destinations.
No provider selection/price/TTL/key/region/legal fact was silently approved.

Files synchronized for that slice: revision 00/04/14/16/17/18/README, core error
schema, doc checker; canonical API_SPEC/SECURITY/TESTING_STRATEGY/CHANGELOG.
The older reward-ledger ruleVersion deduplication reference was corrected to
stable owner/source/award identity; ruleVersion remains provenance.

Earlier operations-check attempts failed: two goal fixtures omitted required
`status`, and EX-13 `SyncPull.limit` lacked the shared default of 50. Fixtures
were corrected (including consistent synthetic session timing), then the missing
schema annotation was added without relaxing checks. Bounds remain `1..100`;
JSON Schema's default annotation does not itself apply runtime defaults. Final
operations checker now passes. Real query coercion, API handlers, hashing,
SQL/RLS/auth/provider/replay/deletion behavior were NOT RUN.

Official-source input: RFC 8785 canonicalization, Supabase sign-out documentation
and Stripe webhook guidance were consulted for the relevant draft boundaries;
links/caveats are in `16`. Stripe remains a reference, not an approved provider.
No full OpenAPI certification or deployed-security claim is made.

### Engineering workflow continuation — 2026-09-19

The owner authorized continuing with the newly supplied engineering-system
proposal. Read it completely and audited before restructuring; see
[21](21-ENGINEERING-WORKFLOW-AUDIT.md) for critique, preservation map, EW-01–08
acceptance and nine manual risk examples. These examples are reasoning checks,
not automated model-safety tests or independent review.

Consulted: full root AGENTS/AI rules and supplied proposal; playbook, register/
readiness boundaries, package scripts, relevant CONTRIBUTING/DEVELOPMENT_GUIDE/
TESTING_STRATEGY workflow sections, revision index/owner review/audit/changelog
and existing contract/checker artifacts. This was not another complete reading
of all 1.77 MB of canonical docs. OpenAI Docs skill plus official Luna/model and
AGENTS documentation informed the separate dated model mapping and routing;
citations are in `MODEL_ESCALATION_POLICY.md`. No model setting was changed.

Changed for this workflow slice: root AGENTS, README; docs AI_RULES,
DOCUMENTATION_MAP, CONTRIBUTING, DEVELOPMENT_GUIDE, TESTING_STRATEGY, CHANGELOG;
five `docs/ai` policies/templates; revision 00/07/18/21/README and this audit;
`check-docs.mjs` plus the SyncPull schema correction noted above. Purpose: one
execution/evidence authority, preserved detailed guardrails, task-scoped context,
risk-based STOP/review and separated model mapping. The root/AI entry points
are shorter; full canonical feature modularization is explicitly unfinished.

Actual verification using installed Node 24.19.0 / Ajv 6.15.0 (the bundled Node
executable at `C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`):

| Command/check | Actual result / limit |
| --- | --- |
| `node --check docs/revision/check-docs.mjs` | Exit 0 |
| `node --check docs/revision/check-operations-contracts.mjs` | Exit 0 |
| `node docs/revision/check-docs.mjs` | PASS: 26 revision Markdown, 19 canonical, seven governance/entry files; 80 families, 12 ADRs; portable links/fences/known clauses/model-ID routing |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 fixtures, 14 core operations, 170 refs, nine SQL text declarations |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 fixtures, 12 extension/26 combined operations for its two slices, 416 refs, 14 commands, 33 inventory rows; eight unit and twelve header-reference cases; 25 pages/two handlers |
| `node docs/revision/check-operations-contracts.mjs` | PASS: 110 fixtures/eight semantic-reference cases, 44 definitions, 15 operations/41 across all three slices, 626 refs; six remaining extension IDs reported |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes, five aliases, four navigation lists; no rendered UI |
| `git diff --check` | Exit 0 under existing newline config; LF/CRLF warnings only |
| Owner Home/theme SHA256 check | Both exactly match previously recorded values; app edits preserved |
| Manual preservation/authority review | EW-01–08 document acceptance checked; old root/AI constraints routed, partial-ADR gate aligned, completion/commit/push duplication corrected; self-review only |

Completion record:

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — governing safety/review/authority rules and security-sensitive draft contracts
ACCEPTANCE_CRITERIA_RESULT: EW-01–08 PASS for scoped documentation criteria;
  independent review NOT_RUN; runtime feature acceptance NOT_RUN
TESTS_RUN: Five document/contract checkers, two syntax checks, diff/hash and manual
  checks above; later final doc-only rerun confirms evidence-note links
FILES_CHANGED: Listed above; unrelated owner Home/theme edits preserved
DOCS_CONSULTED: Listed above; official-source links retained in relevant policies
VERIFICATION_STATUS: PASS for scoped structural/fixture checks, limited semantic self-review
REVIEW_STATUS: Self-review performed; required independent review PENDING
RELEASE_STATUS: NOT_READY; no production authority, execution or validation
KNOWN_LIMITATIONS: Full canonical modularization/reconciliation and backend implementation incomplete
UNRESOLVED_ISSUES: Six wire outputs, exact policy/provider/runtime gates in 18;
  known engine bugs remain; this pass changes no application behavior
SECURITY_NOTES: No secrets/accounts/uploads; auth/RLS/deletion/provider controls untested
ESCALATION_REQUIRED: Independent qualified governance/security review before acceptance/integration;
  no reviewer/agent automatically dispatched and no new approval inferred
RECOMMENDED_NEXT_ACTION: Refine remaining reward/goal-progress/AI contracts within
  recorded decisions; preserve open numeric/business/security policy gates
```

Application typecheck/lint/device/browser/backend tests were not rerun for this
docs-only pass. No install, SQL execution, provider account, spending, external
message, model switch, agent, commit or push occurred. Final document-only
verification is not a promise that the full enterprise build is ready for Luna.

### Reward/goal/AI wire continuation — 2026-09-19

Completed the bounded **documentation** slice described in
[22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md): EX-18/19/20/31/32/33 now have strict
response/query/confirmation mappings. Four partial OpenAPI files contain 47
unique operations and cover all 33 rows of the extension inventory. This is not
the complete V1/enterprise API. Earlier six-missing-output statements above are
historical checkpoints; generation/revision/assessment/provider families, SQL/RPCs
and production policies remain incomplete.

Added `contracts/rewards-ai.schema.json` (28 definitions),
`contracts/rewards-ai.openapi.json` (six operations), and
`check-rewards-ai-contracts.mjs`. Covers unavailable-versus-zero projections,
ms/count goal units, immutable reward/correction history, free/paid/gated-rewarded
usage buckets, explicit create defaults, restricted proposal command graph,
version/digest/selection confirmation, atomic receipt and one-use proposal guard.
No XP formula, initial level policy, allowance, price, advertising format,
provider, age policy or TTL was chosen. Synthetic fixture numbers are not offers.

Reconciled API_SPEC §28's legacy introductory-five and editable-items examples;
apply now references one proposed version/digest/selected-ID format, never both
bodies. Preserved canonical terminal-failure/cancellation no-user-debit and
at-most-one-successful-generation unit; provider cost is not user allowance.
Lost HTTP response is distinct from a terminal failed job. Apply takes no new
generation unit and cannot be denied solely for having zero new-generation
allowance. Current owner/consent/security checks still apply.

Consulted the mandatory workflow/guardrail docs, map, V1 documentation-phase/
AI-scope sections, API_SPEC reward/AI sections, SECURITY §23, DATA_MODEL §19,
DATABASE_SCHEMA §25, revision 01/06/14/16/18/20, core/extension schemas and existing
checker patterns. Inspected current package/Git state and relevant goal progress,
goal types, Rewards and Plan My Day source portions. No full-source/runtime audit
is claimed. The goal helper still totals completed sessions after goal creation;
local milestones/planning UI are not the proposed trusted backend.

Primary research: opened OWASP API1:2023 object authorization and LLM05:2025 output
handling pages, plus RFC 8785 canonicalization. Direct links and application to
this design are in `22`. No third-party blog or generated search summary is used
as implementation authority; primary guidance is not security certification.

Changed: new artifacts above; shared core error enum; operations/doc checkers;
revision 00/07/14/16/18/21/22/README and this audit; canonical API_SPEC/SECURITY/
DATA_MODEL/DATABASE_SCHEMA/TESTING_STRATEGY/CHANGELOG; DoD's available-check list.
All app source, dependency manifests and provider configuration were untouched.

Actual checks with installed bundled Node 24.19.0 / Ajv 6.15.0:

| Check | Result / scope |
| --- | --- |
| `node docs/revision/check-rewards-ai-contracts.mjs` | PASS: 75 DTO fixtures, 28 semantic-reference cases, 28 definitions, six operations / 47 combined, 33 extension IDs, 654 reference resolutions |
| `node docs/revision/check-operations-contracts.mjs` | PASS: 110 DTO / eight semantic cases, 15 selected / 47 combined, no remaining extension IDs, 729 reference resolutions |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 fixtures / fourteen core operations / 170 refs / nine SQL text declarations |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 fixtures, twelve operations / 26 for its two slices, 416 refs; eight unit/twelve header cases; 14 sync commands, 33 inventory rows, 25 pages/two handlers |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes, five aliases, four navigation lists |
| `node docs/revision/check-docs.mjs` | PASS: 27 revision Markdown, 19 canonical, seven governance/entry files; 80 families / 12 ADRs and link/fence/legacy guards |

Manual self-review caught an ambiguity before completion: task-create proposals
must expose resolved defaults before confirmation. Tightened that schema and
added negative fixtures. Also strengthened receipt key/result-order checks and
positive ledger-entry sequences; all affected checks reran successfully. Some
fixtures deliberately pass shape validation while semantic reference checks reject
them, demonstrating why JSON validation alone is insufficient. Plain script-like
text can be a valid title; rendering/encoding security still needs runtime tests.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — trusted reward/allowance integrity and user-confirmed AI writes
ACCEPTANCE_CRITERIA_RESULT: RA-01–04 PASS for scoped draft-document criteria
TESTS_RUN: Six checkers above; syntax/diff/hash checks recorded in final addendum
FILES_CHANGED: Listed above; only documentation and read-only contract checkers
DOCS_CONSULTED: Listed above; exact boundaries/sources retained in 22
VERIFICATION_STATUS: PASS for local shapes/mappings/reference examples only
REVIEW_STATUS: Author self-review; independent review NOT_RUN/PENDING
RELEASE_STATUS: NOT_READY; no provider/database/app execution or release approval
KNOWN_LIMITATIONS: No crypto/authorization/transaction/provider/device proof
UNRESOLVED_ISSUES: Generation/revision and remaining V1 families; exact policies;
  executable migrations/RPCs and admission/final canonical reconciliation
SECURITY_NOTES: No raw prompts/secrets in DTOs; no live credentials or personal data
ESCALATION_REQUIRED: Independent qualified security review before acceptance/integration;
  no agent or paid reviewer automatically created
RECOMMENDED_NEXT_ACTION: Specify bounded generation/request-recovery/revision contracts
  while retaining provider/consent/retention gates; then consolidate admitted API slices
```

No app typecheck/lint, DB/RLS, provider billing, actual JCS/SHA256 implementation,
mobile/browser apply/recovery or security penetration tests ran in this docs-only
slice. No installs, accounts, uploads, purchases, extra agents, commit/push or
production operations. No claim that all features can now be built without further
specification/owner decisions.

Final addendum for the reward/AI slice: `node --check` exited 0 for
`check-rewards-ai-contracts.mjs`, `check-operations-contracts.mjs` and
`check-docs.mjs`. Ordinary `git diff --check` exited 0 with existing LF/CRLF
warnings only. Owner Home/theme hashes still exactly match
`33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1` and
`8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`.
App-only diff names remain those two pre-existing files; package manifests are
unchanged. Final documentation-link rerun passed (460 local links at that
checkpoint). No independent reviewer was used.

### AI generation/recovery/revision continuation — 2026-09-19

Created [23](23-AI-GENERATION-RECOVERY-AND-REVISION.md), the
[reference lifecycle](contracts/ai-generation-lifecycle.json) and
[read-only checker](check-ai-generation-lifecycle.mjs). This closes a bounded
lifecycle ambiguity, not the full generation HTTP/schedule/provider specification.
47 existing OpenAPI operations remain unchanged. Five AG cards and 24 AG-T future
integration scenarios make the remaining work explicit; no new feature is admitted.

Scoped reads: root AGENTS, AI_RULES, execution/DoD/guardrails/task brief; current
package and Plan My Day route; canonical V1 scope §§11–13, implementation-plan
introduction/Phase 7, API_SPEC §28, SECURITY §23, DATA_MODEL §19, DATABASE_SCHEMA
§25, TESTING_STRATEGY §13; revision 16 §§7–8, 18/22 and applicable register/index/
playbook/checker sections. Large references were read selectively; instruction
files were read completely. No claim that the entire repository was reread.

New primary research: RFC 9110 §15.3.3 acceptance/status monitoring, Supabase hosted
function limits/background lifetime and PostgreSQL row locks/deadlock behavior.
Direct links, checked date and clearly labelled design inferences are in 23 §8.
Those sources do not approve business/privacy policies or a deployed DB version.

Changed this slice: new artifacts above; `check-docs.mjs`; revision README/00/07/
09/16/18/22; canonical API_SPEC/SECURITY/DATA_MODEL/DATABASE_SCHEMA/TESTING_STRATEGY/
CHANGELOG; DOCUMENTATION_MAP and DoD's command list. Purpose: route the new lifecycle,
disambiguate terminal timeout/accepted cancellation versus transport loss, and
label legacy examples and missing strict wire/schedule work. No app/dependency/
provider/SQL files changed by this slice. Prior dirty documentation was preserved.

Checks actually run on Windows PowerShell with installed bundled Node 24.19.0
(`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`),
and existing Ajv 6.15.0 for schema checkers. `node` below abbreviates that exact
executable path, not an install or a hypothetical package script.

| Command | Actual result / limitation |
| --- | --- |
| `node docs/revision/check-ai-generation-lifecycle.mjs` | PASS: 24 reference fixtures and 19,607 serial history edges through depth five; model has no real DB/network/auth/crypto |
| `node docs/revision/check-docs.mjs` | PASS after evidence/cancellation-race edits: 28 revision Markdown, 19 canonical, seven governance/entry files, 482 local links; all 80 families/12 ADRs and link/fence guards |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 fixtures, 14 operations, 170 refs, nine SQL text declarations |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 fixtures, 12 selected/26 two-slice operations, 416 refs, eight unit/twelve header cases |
| `node docs/revision/check-operations-contracts.mjs` | PASS: 110 DTO/eight semantic cases, 15 selected/47 combined, 729 refs, no missing EX inventory IDs |
| `node docs/revision/check-rewards-ai-contracts.mjs` | PASS: 75 DTO/28 semantic cases, six selected/47 combined, 654 refs, 33 covered EX IDs |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes, five aliases, four nav lists; not rendered UI |
| `node --check docs/revision/check-ai-generation-lifecycle.mjs` and `node --check docs/revision/check-docs.mjs` | PASS, exit 0 |
| `git diff --check` | PASS, exit 0; existing LF/CRLF warnings only; no newline config changes |
| Owner-file SHA256 and app/manifest diff-name check | Home `33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1`; theme `8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`; only those pre-existing source edits, no package changes |

Self-review distinguished unknown provider acceptance from terminal failure, lease
expiry from request deadline, completed generation from discarded proposal, and
manual revision from new paid generation. It also found a cancellation-before-
acceptance race: a recovery POST after Cancel could start unwanted work. 23 now
requires status-only recovery/cancel when visible and forbids a false cancellation
acknowledgement on 404; the real HTTP/UI scenario is explicitly NOT RUN. The
reference model validates serial invariants only and does not prove race freedom.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — allowance and persisted request/revision security semantics
ACCEPTANCE_CRITERIA_RESULT: AG-A01–04 PASS for the bounded draft artifact;
  AG-T01–24 runtime integration remains NOT_RUN
TESTS_RUN: Seven checkers, syntax, tracked whitespace and preserved-source checks above
VERIFICATION_STATUS: PASS for scoped reference/document checks only
REVIEW_STATUS: Author self-review completed; independent qualified review NOT_RUN
RELEASE_STATUS: NOT_READY; no production authority or infrastructure changes
KNOWN_LIMITATIONS: No strict generation wire DTOs/OpenAPI, full ordered-plan model,
  provider execution, SQL/RLS/transaction/fencing proof or browser/mobile integration
UNRESOLVED_ISSUES: Provider/runner, input/result/dedup retention, lease/deadline/
  consent policies, full scheduling/conditional result and action contracts
SECURITY_NOTES: Synthetic reference flags are not authorization tests; no real
  credentials or private user content used; no extra agent or external reviewer
ESCALATION_REQUIRED: Independent qualified review before acceptance/integration;
  owner policy facts before affected production implementation, not safe draft work
RECOMMENDED_NEXT_ACTION: AG-03 ordered focus-block/break planning contract, then
  AG-02 strict generation/status/cancel/revision wire shapes using that result model
```

No app typecheck/lint, actual AI provider/charges, DB/SQL, RLS, content encryption,
key-retention enforcement, UI/device recovery or independent security tests ran.
No installs, accounts, purchases, uploads, agents, commit/push or deployment.

### Overall remaining completion boundary

### Daily-plan and generation wire continuation — 2026-09-19

Added [24](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md),
[planning DTOs](contracts/planning.schema.json),
[five-operation API](contracts/planning.openapi.json) and
[read-only checker](check-planning-contracts.mjs). This drafts AG-02/03's ordered
focus/break/reminder model and selected generation/status/cancel/revision/read
wire. It is not the full Plan My Day implementation or final enterprise freeze.
Five slices now contain **52 unique operations**. The two older four-file checkers
intentionally still report 47 for their bounded subset; their schema loader now
includes planning definitions referenced by the versioned reward/proposal schema.

Compatibility: v1 keeps task.create/task.patch/reminder.create; v2 admits exactly
one whole-plan command and optional preceding reminder operations, with no task
edits or automatic completed activity. V2's complete payload is inside the existing
review-digest input. Its reminder-binding revision refinement is explicit; unknown
versions fail closed. No server/client is upgraded merely by these definitions.

Read/inspected: current root instructions and complete AI rules/execution/DoD/
guardrails/task brief; documentation map; package scripts and existing Plan My Day
route; canonical V1 scope §§11–13, implementation-plan introduction/Phase 7,
API §28, SECURITY §23, DATA_MODEL §19, DATABASE_SCHEMA §25, TESTING_STRATEGY §13;
revision 20 units, 22/23 contracts and affected checker/schema/index sections.
These are targeted reference reads, not another full read of all large documents.
Primary research checked RFC 3339 and PostgreSQL date/time semantics; direct links
and the application-specific inference are in 24 §7. No new provider/model chosen.

Changed: new 24/planning schema/OpenAPI/checker; rewards-ai schema v1/v2 allowance,
shared error enum (AI_REQUEST_EXPIRED/AI_FEATURE_DISABLED/AI_ACTION_REQUIRED);
operations/reward checkers' schema loading; doc-checker file registration; revision
00/07/09/18/22/23/README; canonical API_SPEC/SECURITY/DATA_MODEL/DATABASE_SCHEMA/
TESTING_STRATEGY/CHANGELOG, documentation map and DoD command list. App/package/
provider/SQL files and unrelated `artifacts/` were not changed by this work.

Actual verification: Windows PowerShell; installed Node 24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`,
existing Ajv 6.15.0. `node` in this table abbreviates that executable.

| Command | Actual result / scope |
| --- | --- |
| `node docs/revision/check-planning-contracts.mjs` | PASS: 28 definitions, 91 DTO fixtures, 54 semantic cases, five selected/52 combined operations, 33 EX IDs, 761 reference resolutions |
| `node docs/revision/check-docs.mjs` | PASS: 29 revision Markdown, 19 canonical, seven governance/entry files; 80 families/12 ADRs, links/fences/legacy guards; final evidence edits rerun |
| `node docs/revision/check-ai-generation-lifecycle.mjs` | PASS: 24 reference fixtures, 19,607 bounded serial history edges; no new runtime proof |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 fixtures, 14 operations, 170 refs, nine SQL text declarations |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 fixtures, 12 selected/26 two-file operations, 416 refs, eight unit/twelve header cases |
| `node docs/revision/check-operations-contracts.mjs` | PASS: 110 DTO/eight semantic cases, 15 selected/47 four-file operations, 824 refs |
| `node docs/revision/check-rewards-ai-contracts.mjs` | PASS: 75 DTO/28 semantic cases, six selected/47 four-file operations, 749 refs |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes, five aliases/four nav lists; no rendered UI |
| `node --check` for planning, operations, rewards-ai and docs checkers | PASS, exit 0 for all four changed scripts |
| `git diff --check` | PASS, existing LF/CRLF warnings only; no Git/newline configuration changed |
| Owner-source hashes and app/manifest diff-name check | Home `33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1`; theme `8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`; only those pre-existing app edits, no manifest changes |

Initial planning-checker run caught an overly strict **checker** assertion: the
existing OpenAPI server objects legitimately include descriptive metadata. Fixed
the assertion to require exactly one `/v1` server, preserving URL/version/auth
checks, instead of rejecting the unrelated description field. No product/security
test was bypassed. Reruns passed. Added explicit invalid v2 task-write, canonical
API-example, safe minute-conversion, dependency/selection, stale/manual revision
and privacy-deletion boundary checks/notes during self-review.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — exact-confirmed persistence, ownership and generation allowance
ACCEPTANCE_CRITERIA_RESULT: DP-A01–04 PASS for bounded draft checks;
  DP-T01–16 actual integration scenarios NOT_RUN
VERIFICATION_STATUS: PASS for document/DTO/reference checks, not app/security
REVIEW_STATUS: Author self-review; independent qualified review NOT_RUN
RELEASE_STATUS: NOT_READY; no deployment permission or capability activation
KNOWN_LIMITATIONS: Plan is not in existing six-entity sync/snapshot/export schema;
  no plan SQL/RPC/client implementation, post-save lifecycle or real provider proof
UNRESOLVED_ISSUES: Plan sync/privacy/version gating, retention/consent/provider/
  duration policy, conditional AI payloads and actual security/device tests
SECURITY_NOTES: All IDs/text are synthetic; guards in reference examples are not
  real authorization, hashes, concurrent DB transactions or notification delivery
ESCALATION_REQUIRED: Independent qualified review before acceptance/integration;
  exact prerequisite policy/feature decisions before production implementation
RECOMMENDED_NEXT_ACTION: Specify bounded plan persistence, sync/snapshot/export/
  deletion and post-save lifecycle with client capability compatibility before v2
  activation; then implement only approved dependency-ready tasks
```

No app typecheck/lint, real SQL/RLS/transactions, AI/billing provider calls, native
notifications, device/browser/DST-input UX or independent security review ran.
No agents, installs, accounts, spending, uploads, commit/push or production actions.

### Remaining overall completion boundary

### Saved-plan lifecycle/privacy continuation — 2026-09-19

Added [25](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md) and
[reference checker](check-plan-lifecycle.mjs): proposed post-save state transitions,
bound-reminder effects, owned transaction/storage design, known-context erasure,
privacy-epoch artifact suppression and v1/v2 replication compatibility. Five
PL packets and twelve NOT RUN real-system cases preserve the next implementation
order. This slice adds **no DTO/OpenAPI operation or SQL**; 52 operations remain
the five-file wire checkpoint. The initial SavedPlan shape must be reconciled
through PL-01/02 before any lifecycle/client activation.

Task brief and consulted sections are in 25 §1. Reads were targeted references,
not another complete read of all canonical documents. Current Plan My Day source
and package scripts were inspected; it remains a transient local 25/5 preview.
Official PostgreSQL RLS/isolation pages were checked; 25 cites their limited
database claims separately from application-specific design inferences.

Changed files: new 25/check-plan-lifecycle; revision 24/README/07/18/09 and
check-docs; canonical DATA_MODEL, DATABASE_SCHEMA, SECURITY, TESTING_STRATEGY,
CHANGELOG, DOCUMENTATION_MAP and ai/DEFINITION_OF_DONE. No application, package,
provider, schema/OpenAPI, SQL or unrelated `artifacts/` edits in this turn.
Archive/delete disabling only bound reminders is explicitly a reviewable design
recommendation, not silently recorded owner approval. Exact lifetime, wire,
download-revocation mechanism and production configurations remain open.

Actual verification: PowerShell and installed Node 24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.
`node` below abbreviates that executable; existing Ajv was used, no install.

| Command | Actual result and scope |
| --- | --- |
| `node docs/revision/check-plan-lifecycle.mjs` | PASS: 20 synthetic cases; not real ownership/cascade/revocation enforcement |
| `node docs/revision/check-docs.mjs` | PASS: 30 revision/19 canonical/seven governance files; 80 families/12 ADRs; PL-01–05/PL-T01–12 registered |
| `node docs/revision/check-planning-contracts.mjs` | PASS: 28 definitions, 91 DTO/54 semantic cases, 52 combined operations, 761 refs |
| `node docs/revision/check-ai-generation-lifecycle.mjs` | PASS: 24 fixtures, 19,607 bounded serial history edges |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 DTO cases, 14 operations, 170 refs, nine SQL text declarations only |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 DTO, eight unit/twelve header cases, 14 command kinds, 416 refs |
| `node docs/revision/check-operations-contracts.mjs` | PASS: 110 DTO/eight semantic cases, 47 four-file operations, 824 refs |
| `node docs/revision/check-rewards-ai-contracts.mjs` | PASS: 75 DTO/28 semantic cases, 47 four-file operations, 749 refs |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes, five aliases/four navigation lists |
| `node --check docs/revision/check-plan-lifecycle.mjs` and `node --check docs/revision/check-docs.mjs` | PASS, syntax only |
| `git diff --check` | PASS; existing LF/CRLF warnings only, no Git configuration changes |

Self-review covered this turn's added text/hunks and both new files. Added an
explicit legacy-cursor privacy invalidation requirement, signed-URL/in-flight-byte
limitations and the distinction between ordinary task deletion and account-wide
erasure. Historical evidence/counts remain checkpoints, not rewritten runtime
claims. No failing product test was relaxed to obtain these results.

Owner source hashes remained Home
`33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1`
and theme `8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`.
Only those pre-existing source files appear in app diff names; manifests unchanged.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — saved personal content, erasure and mixed-client replication
ACCEPTANCE_CRITERIA_RESULT: PL-A01–04 PASS for bounded document/reference scope;
  PL-T01–12 real-system evidence NOT_RUN
VERIFICATION_STATUS: PASS for nine document/reference checkers only
REVIEW_STATUS: Author self-review complete; independent qualified review NOT_RUN
RELEASE_STATUS: NOT_READY; no capability, migration or production activation
KNOWN_LIMITATIONS: Reference model omits real authorization/SQL/concurrency,
  full schedule editing, notifications, crypto and actual downloadable artifacts
UNRESOLVED_ISSUES: Strict current-plan/v2 wire, owned SQL/RPC, retention/download
  suppression policies, client migration, lifecycle choice review and real tests
SECURITY_NOTES: Synthetic state flags do not enforce security; no real user data
  or secrets used. Offline or already delivered data cannot be instantly recalled.
ESCALATION_REQUIRED: Independent qualified review before acceptance/integration;
  exact policy approvals before affected implementation, not automatic agents
RECOMMENDED_NEXT_ACTION: PL-01 strict current-plan/read/edit/archive/restore/delete
  DTOs with exact reminder actions; then PL-02 versioned sync/snapshot/export wire
```

No app lint/typecheck, real database/provider/storage/device tests or independent
review ran. No agents, installs, accounts, spending, commit/push or deployment.

### Overall package boundary (historical checkpoints retained)

### Saved-plan management wire completion — 2026-09-20

Resumed the interrupted PL-01 packet. [26](26-SAVED-PLAN-MANAGEMENT-WIRE.md),
[management schema](contracts/plan-management.schema.json) and
[two-operation OpenAPI](contracts/plan-management.openapi.json) had been written
on September 19, along with the changed planning read shape/header, but their
checker and reconciliation were unfinished. Initial resumed checks reproduced
two planning failures (old PlanResponse fixture, old UUID-only parameter assertion)
and one docs failure (the not-yet-created management checker link). These were
unfinished-contract evidence, not application regressions or successful checks.

Completed [management checker](check-plan-management.mjs), updated the explicit
new read/header fixtures without weakening unknown-field/version guards, and
reconciled current-plan versus original-snapshot wording. Plan generation/apply
input and its minimal result IDs stay unchanged. Current saved-plan read requires
Plan-Contract-Version 2; no deployed client compatibility is claimed. Added exact
manual reminder actions and task/reminder version pins, archive/restore/delete
requests, minimal receipts and clear time/no-op/conflict/replay behavior. Past
alerts can be explicitly kept or disabled; retiming/re-enabling requires future
validation. Real devices may still fail installation/cancellation after commit.

Read/inspection and allowed scope are recorded in 26 §1. Full mandatory execution
policies were re-read on resume; earlier targeted source/package/schema and
canonical reference reads remain part of this interrupted packet. The selected
RFC 5789/9110 research was read on September 19 and cited in 26, not invented
from the shape checker. No fresh full-repository or all-document read is claimed.

Files across this packet: new 26/plan-management schema/OpenAPI/checker; existing
planning schema/OpenAPI/checker and check-docs; revision 24/25/README/07/18/09;
canonical API_SPEC/DATA_MODEL/DATABASE_SCHEMA/SECURITY/TESTING_STRATEGY/CHANGELOG/
DOCUMENTATION_MAP and ai/DEFINITION_OF_DONE. All new artifacts and changed contract
hunks were self-reviewed. No app, package, SQL, provider or old sync DTO changed.
Unrelated owner `artifacts/` and existing source modifications were preserved.

Actual verification: installed Node 24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`
in PowerShell, existing Ajv 6.15.0; `node` below abbreviates this path. No install.

| Command | Actual final result / limit |
| --- | --- |
| `node docs/revision/check-plan-management.mjs` | PASS: 13 definitions, 89 DTO/54 semantic cases, two selected/54 combined operations, 800 refs; not runtime |
| `node docs/revision/check-planning-contracts.mjs` | PASS: 28 definitions, 91 DTO/54 semantic cases, five selected/52 five-file operations, 763 refs |
| `node docs/revision/check-docs.mjs` | PASS: 31 revision, 19 canonical, seven governance files; 80 requirement families/12 ADRs; local links/fences/guards |
| `node docs/revision/check-plan-lifecycle.mjs` | PASS: 20 synthetic lifecycle cases |
| `node docs/revision/check-ai-generation-lifecycle.mjs` | PASS: 24 fixtures/19,607 bounded serial edges |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 DTO cases, 14 operations, 170 refs, nine SQL text declarations |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 DTO, eight unit/twelve header cases, 14 command kinds, 416 refs |
| `node docs/revision/check-operations-contracts.mjs` | PASS: 110 DTO/eight semantic cases, 47 four-file operations, 826 refs |
| `node docs/revision/check-rewards-ai-contracts.mjs` | PASS: 75 DTO/28 semantic cases, 47 four-file operations, 751 refs |
| `node docs/revision/check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes/five aliases/four nav lists |
| `node --check` on check-plan-management, check-planning-contracts and check-docs `.mjs` files | PASS, syntax only |
| `git diff --check` | PASS, existing LF/CRLF warnings only; no Git configuration changes |

The six-file 54-operation count includes all prior five-file/52 and four-file/47
subsets. Their different totals are intentional scopes, not silently missing new
routes. The new command family does not join the fourteen-command v1 sync union.
Reference helpers use synthetic repository flags/data, not production code; full
temporal examples remain in the planning checker and real authorization, JCS,
transaction isolation, erasure, notification delivery and UX remain unverified.

Preserved source hashes: Home
`33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1`, theme
`8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`.
Only these pre-existing app edits appear in source diff names; manifests unchanged.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — versioned persisted plan and linked reminder/deletion intent
ACCEPTANCE_CRITERIA_RESULT: PM-A01–04 PASS for bounded draft/document checks;
  PM-T01–10 real-system cases NOT_RUN
VERIFICATION_STATUS: PASS for ten document/reference checkers; not app/backend
REVIEW_STATUS: Author self-review complete; independent qualified review NOT_RUN
RELEASE_STATUS: NOT_READY; no deployment/capability activation authority
KNOWN_LIMITATIONS: No actual auth/RLS, crypto, SQL/RPC/atomicity, UI/device tests;
  lifecycle recommendation remains subject to review; no full OAS certification
UNRESOLVED_ISSUES: PL-02 v2 replication/export/privacy/discovery wire, PL-03–05
  implementation, retention/limits/lifecycle policy and independent review
SECURITY_NOTES: Exact version/binding examples are not security proof; receipts
  omit old schedule text; no real user data/credentials/provider calls used
ESCALATION_REQUIRED: Independent qualified review before acceptance/integration;
  exact owner/production policy prerequisites before affected implementation
RECOMMENDED_NEXT_ACTION: PL-02 versioned plan replication/snapshot/export and
  list/discovery contracts with privacy-epoch and legacy-client recovery
```

No app lint/typecheck or live backend/storage/AI/native tests ran. No agents,
accounts, installations, spending, uploads, commit/push or deployment occurred.

### Plan replication/snapshot/export-component wire — 2026-09-20

Completed bounded **draft authoring**, not acceptance/activation: revision 27 and
its schema/OpenAPI/checker type PL-02's seven entities, eighteen commands, complete
transaction-group pull, snapshot bootstrap, live plan discovery and plans-only
account-export component. Six added routes give 60 across seven partial API files;
54/52/47 in older checkers are deliberately narrower subsets. V1 schema/API files
were not rewritten. Full outer account-export packaging remains an explicit gap.

Task brief and RP-A01–04 are in 27. Its four new artifacts plus routing/checker/
DoD, revision 16/25/26/README/07/18, canonical API/data/database/security/testing/
changelog/map and this audit are the task scope. Author self-review covered new
JSON/Markdown/checker content and reconciliation hunks, including strict v1/v2
separation, complete groups, epoch boundaries and no claim of immediate offline
erasure. A final clarification requires RP-04 revalidation before snapshot install
while acknowledging the subsequent response/erasure race. No independent reviewer
was used or claimed; no additional agent was created.

Actual checks used installed Node 24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`
and existing Ajv 6.15.0 on Windows. Each table entry is `node docs/revision/<file>`;
all eleven commands exited 0. These are artifact/reference checks, not application
tests. No installation was necessary.

| Checker file | Observed result |
| --- | --- |
| `check-docs.mjs` | PASS: 32 revision / 19 canonical / seven governance files; 80 requirement families and 12 ADRs |
| `check-backend-contracts.mjs` | PASS: 36 DTO fixtures, 14 operations, 170 refs; nine SQL-text table declarations only |
| `check-extension-contracts.mjs` | PASS: 123 DTO, eight unit / twelve header cases, 14 v1 commands, 416 refs |
| `check-operations-contracts.mjs` | PASS: 110 DTO / eight semantic cases, 47 scoped operations, 826 refs |
| `check-rewards-ai-contracts.mjs` | PASS: 75 DTO / 28 semantic cases, 47 scoped operations, 751 refs |
| `check-ai-generation-lifecycle.mjs` | PASS: 24 synthetic fixtures, 19,607 serial-history edges; no concurrent DB/provider execution |
| `check-planning-contracts.mjs` | PASS: 28 definitions, 91 DTO / 54 semantic cases, 52 scoped operations, 763 refs |
| `check-plan-lifecycle.mjs` | PASS: 20 synthetic cases |
| `check-plan-management.mjs` | PASS: 13 definitions, 89 DTO / 54 semantic cases, 54 scoped operations, 800 refs |
| `check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes / five aliases / four navigation lists |
| `check-replication-v2.mjs` | PASS: 23 definitions, 145 DTO / 35 semantic cases, 60 operations, 902 refs |

`node --check` passed for check-replication-v2 and check-docs. Tracked
`git diff --check` passed with existing LF/CRLF warnings. Source hashes remained
Home `33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1`
and theme `8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`.
Only those pre-existing app files appear in source diff names; manifests unchanged.
Unrelated artifacts and earlier edits were preserved.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — personal-data replication, retained artifacts and recovery
ACCEPTANCE_CRITERIA_RESULT: RP-A01–04 PASS for bounded draft/reference checks;
  RP-T01–12 runtime integration cases NOT_RUN
VERIFICATION_STATUS: PASS for eleven document/reference checkers, not runtime
REVIEW_STATUS: Author self-review complete; independent qualified review pending
RELEASE_STATUS: NOT_READY; no migration/activation/deployment performed
KNOWN_LIMITATIONS: No real SQL/SQLite/auth/RLS, byte ceilings, JCS hashes,
  transaction races, cursor validation or export revocation tested; not full OAS certification
UNRESOLVED_ISSUES: Outer account-export artifact, reviewed policies/limits,
  PL-03–05 implementation and independent review
SECURITY_NOTES: Epochs/digests do not grant authorization or recall delivered bytes;
  reference fixtures use synthetic data, not private user data/provider credentials
ESCALATION_REQUIRED: Qualified independent review before acceptance/integration;
  owner/production policy prerequisites before affected implementation
RECOMMENDED_NEXT_ACTION: Complete outer account-export artifact contract before
  reviewed PL-03 isolated SQL/RPC/migration test specification
```

No app lint/typecheck, live backend/storage/AI/native tests, accounts, installations,
spending, uploads, commit/push or deployment occurred in this slice. The whole
enterprise documentation package is not declared final or implementation-ready.

### Account-export artifact/coverage draft — 2026-09-20

Bounded AE-01 document authoring now supplies revision 28, a strict outer export
schema and read-only checker. Fourteen sections include existing plan-export v2
unchanged. Nineteen new definitions describe the outer v1 artifact; no new API
operation, installation, provider setting or executable SQL was added. The seven
OpenAPI files still total 60 operations. Source inventory and eight explicitly
deferred-family dispositions remain prerequisites, not falsely completed serializers.

Read/approval/allowed-file scope and AE-A01–04 are in 28's task brief. Routing,
README/07/16/17/18/27, documentation map/DoD/check-docs, API/security/testing and
changelog were reconciled. Existing owner Home/theme edits and unrelated artifacts
were preserved. No additional agent or reviewer was created. All research used
primary technical sources linked in 28; it makes no jurisdictional compliance claim.

Initial new-checker run failed seven assertions because its synthetic Task used
`due:null`; the existing strict contract requires `{kind:"none"}`. Read that
definition and corrected the fixture without loosening the domain schema. During
self-review, corrected a proposed settings-ID assertion: the existing contract
uses an independently owned singleton row ID, not necessarily the actor ID. Added
explicit missing/incomplete/unknown inventory negative cases so “unknown” cannot
silently mean “not collected.” These are draft/fixture corrections, not app fixes.

Actual Windows checks used the same installed Node runtime path recorded above
and Ajv 6.15.0. Each `node docs/revision/<checker>` below exited 0 after correction:

| Checker | Observed result |
| --- | --- |
| `check-account-export.mjs` | PASS: 19 definitions, 14 sections, 144 DTO / 30 semantic cases, 59 new-schema references |
| `check-docs.mjs` | PASS: 33 revision / 19 canonical / seven governance files, 80 requirement families, 12 ADRs |
| `check-backend-contracts.mjs` | PASS: 36 DTO fixtures / 14 operations / 170 refs |
| `check-extension-contracts.mjs` | PASS: 123 DTO / eight unit / twelve header cases, 416 refs |
| `check-operations-contracts.mjs` | PASS: 110 DTO / eight semantic cases / 47 scoped operations / 826 refs |
| `check-rewards-ai-contracts.mjs` | PASS: 75 DTO / 28 semantic cases / 47 scoped operations / 751 refs |
| `check-ai-generation-lifecycle.mjs` | PASS: 24 synthetic fixtures, 19,607 serial-history edges |
| `check-planning-contracts.mjs` | PASS: 91 DTO / 54 semantic cases / 52 scoped operations / 763 refs |
| `check-plan-lifecycle.mjs` | PASS: 20 synthetic cases |
| `check-plan-management.mjs` | PASS: 89 DTO / 54 semantic cases / 54 scoped operations / 800 refs |
| `check-replication-v2.mjs` | PASS: 145 DTO / 35 semantic cases / 60 operations / 902 refs |
| `check-experience-contracts.mjs` | PASS: 56 contrast pairs, 27 routes / five aliases / four navigation lists |

Syntax checks passed for check-account-export and check-docs. Tracked whitespace
check passed with existing LF/CRLF warnings, no Git configuration override.
Author reviewed all new schema content, checker/contract and own reconciliation
hunks. Checksums in fixtures are deliberate placeholders; neither JCS hashing nor
actual source ownership/completeness was tested. Required runtime cases stay NOT RUN.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — own-account disclosure, source inventory and retained downloads
ACCEPTANCE_CRITERIA_RESULT: AE-A01–04 PASS for bounded draft/reference checks;
  AE-T01–10 runtime cases NOT_RUN
VERIFICATION_STATUS: PASS for twelve document/reference checkers only
REVIEW_STATUS: Author self-review complete; independent qualified review pending
RELEASE_STATUS: NOT_READY; no working export service or deployment
KNOWN_LIMITATIONS: No real DB/Auth/storage/worker/browser/JCS/byte-limit tests;
  deferred data-family access and source inventory are not implemented
UNRESOLVED_ISSUES: Reviewed identity/source adapters, actual coverage/disposition,
  retention/size/recent-auth/delivery/runner policies and independent review
SECURITY_NOTES: Contract-scoped export does not claim all-data/legal completeness;
  no credentials/private real-user records uploaded or added to fixtures
ESCALATION_REQUIRED: Qualified review before acceptance/integration and actual
  policy/access-path prerequisites before production use
RECOMMENDED_NEXT_ACTION: Specify PL-03 isolated database/RPC/migration tests and
  exact remaining policy prerequisites; do not execute migrations yet
```

No app/backend implementation, lint/typecheck, live provider/device tests,
spending, upload, agent, commit/push or deployment occurred. Overall enterprise
documentation finalization and implementation remain incomplete.

### PL-03 database/RPC/migration specification — 2026-09-20

Completed bounded specification authoring: revision 29, machine-readable seven-card/
seven-gate packet and structural checker. Twenty-four Given/When/Then database
scenarios are specified, **zero executed**. No DDL/RPC/backend was implemented.
The existing nine-table SQL prototype was read, not edited or run. Its missing
foundations, privileged grants and narrower feed are now explicit admission checks.
API count remains 60 across seven partial files; no wire schema changed.

Task brief/scope and DB-A01–04 are in 29. Updated README/07/18/25/28/map/DoD,
check-docs and canonical database/security/testing/changelog routing. Author
self-review covered all new document/JSON/checker content and own reconciliation
hunks. Moved end-to-end role/schedule cases to DB-04 so they do not require
handlers before handlers exist; DB-02 is explicitly design review. Clarified that
manual writes return receipts, with PG-05 as a subsequent read, and that v2 replay
after erasure requires authorized epoch reset while retaining the item key.

Actual checks used installed Node at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.
All thirteen `node docs/revision/<checker>` runs exited 0:

| Checker | Observed result |
| --- | --- |
| `check-plan-database-packet.mjs` | PASS: seven cards/gates, 24 specified / zero executed runtime cases, 14 structural negative fixtures |
| `check-docs.mjs` | PASS: 34 revision / 19 canonical / seven governance files, 80 requirements / 12 ADRs |
| `check-backend-contracts.mjs` | PASS: 36 DTO / 14 operations / 170 refs, SQL text only |
| `check-extension-contracts.mjs` | PASS: 123 DTO / eight unit / twelve header cases / 416 refs |
| `check-operations-contracts.mjs` | PASS: 110 DTO / eight semantic / 47 scoped operations / 826 refs |
| `check-rewards-ai-contracts.mjs` | PASS: 75 DTO / 28 semantic / 47 scoped operations / 751 refs |
| `check-ai-generation-lifecycle.mjs` | PASS: 24 fixtures / 19,607 serial-history edges |
| `check-planning-contracts.mjs` | PASS: 91 DTO / 54 semantic / 52 scoped operations / 763 refs |
| `check-plan-lifecycle.mjs` | PASS: 20 synthetic cases |
| `check-plan-management.mjs` | PASS: 89 DTO / 54 semantic / 54 scoped operations / 800 refs |
| `check-replication-v2.mjs` | PASS: 145 DTO / 35 semantic / 60 operations / 902 refs |
| `check-account-export.mjs` | PASS: 144 DTO / 30 semantic / 59 new-schema refs |
| `check-experience-contracts.mjs` | PASS: 56 contrast pairs / 27 routes / five aliases / four nav lists |

Syntax checks passed for check-plan-database-packet and check-docs. Tracked
`git diff --check` passed with existing LF/CRLF warnings. No app/package changes
were added: Home/theme retain their earlier hashes
`33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1` and
`8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`.
Only those two pre-existing source edits appear in source/package diff names.
Unrelated artifacts/earlier edits preserved; no secrets read or logged.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — ownership/RPC/atomicity/migration/privacy design
ACCEPTANCE_CRITERIA_RESULT: DB-A01–04 PASS for specification/checker scope;
  DB-T01–24 actual database acceptance NOT_RUN
VERIFICATION_STATUS: PASS for thirteen document/reference checkers only
REVIEW_STATUS: Author self-review complete; independent qualified review pending
RELEASE_STATUS: NOT_READY; no SQL execution or feature activation
KNOWN_LIMITATIONS: No real target/harness/RLS/RPC/concurrency/migration/restore/
  worker/storage/device tests; structural negative tests are not attack tests
UNRESOLVED_ISSUES: DB-G01–07, foundational backend implementation and exact
  privileged actor adapter, lifecycle/retention/limits/runner policies
SECURITY_NOTES: Real roles and target proof required; RLS/DTOs alone do not
  establish safety. No real data, database connection or provider credentials used
ESCALATION_REQUIRED: Exact isolated-execution authority and qualified independent
  review before affected migration execution/acceptance/integration
RECOMMENDED_NEXT_ACTION: Draft PL-04 local saved-plan repository/outbox/editor
  recovery packet, keeping implementation dependent on accepted PL-03
```

No app lint/typecheck, installation, agent, account, spending, upload, commit/push
or deployment occurred. This completes the test specification slice, not PL-03's
database implementation or the entire enterprise documentation package.

### PL-04 mobile storage/outbox/editor recovery specification — 2026-09-21

Completed the document slice begun September 20 in
[30](30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md), not its proposed implementation.
Six ordered cards, six open gates and twenty NOT_RUN device scenarios distinguish
server mirror, local draft, frozen intent, minimal receipt, staging and native
reminder projection. Covers migration interruption, response loss, account callback
fences, privacy reset/quarantine, accessible conflict review and selected-device
alert reconciliation. No public wire/API changes; 60-operation inventory retained.

Task scope/files: new revision 30, contracts/mobile-plan-recovery.json and
check-mobile-plan-recovery.mjs; routing/evidence in revision README/07/09/18/25/29,
check-docs, documentation map and DoD; canonical DATA_MODEL/SECURITY/TESTING_STRATEGY
and CHANGELOG. Sixteen files in this slice; unrelated dirty work preserved.
Source/package inspection found the transient plan preview and best-effort JSON
task storage, not saved-plan persistence. Existing SQLite/SecureStore selections
do not mean those packages/adapters or a test script are present.

Verification environment: installed Node v24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`;
existing Ajv 6.15.0. Invoked that executable with each path below; all fourteen
document/reference checkers returned PASS/exit 0:

```text
docs/revision/check-docs.mjs
docs/revision/check-backend-contracts.mjs
docs/revision/check-extension-contracts.mjs
docs/revision/check-operations-contracts.mjs
docs/revision/check-rewards-ai-contracts.mjs
docs/revision/check-ai-generation-lifecycle.mjs
docs/revision/check-planning-contracts.mjs
docs/revision/check-plan-lifecycle.mjs
docs/revision/check-plan-management.mjs
docs/revision/check-replication-v2.mjs
docs/revision/check-account-export.mjs
docs/revision/check-plan-database-packet.mjs
docs/revision/check-mobile-plan-recovery.mjs
docs/revision/check-experience-contracts.mjs
```

New checker: nine states, thirteen transitions, 32 synthetic/structural cases;
twenty runtime cases specified, zero executed. Existing fixture counts unchanged.
Syntax checks passed for both changed checkers. Tracked `git diff --check` passed;
LF/CRLF warnings are unchanged environment notices. New files were separately
inspected, since tracked diff does not cover them. Author semantic review compared
25–29, corrected migration scenario ownership to MP-02 after repository setup,
and kept synthetic state flags distinct from real authorization/durability proof.

Home/theme SHA-256 remain
`33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1` and
`8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`.
Only those two pre-existing edits appear in source/package diff names. No app
lint/typecheck, SQLite/SQL execution, device test, install, agent, provider account,
secret access, upload, spending, commit/push or deployment was performed.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — local ownership, replay, migration and privacy-recovery design
ACCEPTANCE_CRITERIA_RESULT: MP-A01–04 PASS for specification/reference scope;
  MP-T01–20 actual device/client/server acceptance NOT_RUN
VERIFICATION_STATUS: PASS for fourteen document/reference checkers only
REVIEW_STATUS: Author self-review complete; independent qualified review pending
RELEASE_STATUS: NOT_READY; no saved-plan feature or capability activation
KNOWN_LIMITATIONS: No real SQLite/Auth/HTTP/JCS/OS/backup/accessibility/concurrency
  proof; reference flags do not implement their named trusted prerequisites
UNRESOLVED_ISSUES: MP-G01–06 and applicable PL-03/foundation/policy gates
SECURITY_NOTES: No known stale payload is authorized for automatic replay;
  no promise of encrypted SQLite, instant offline erasure or alert delivery
ESCALATION_REQUIRED: Exact task-relevant policies and independent qualified
  review before affected acceptance/integration; none auto-dispatched
RECOMMENDED_NEXT_ACTION: Draft PL-05 capability activation/rollback readiness
  packet, preserving all unimplemented server/mobile and owner/review gates
```

### PL-05 activation/pause/recovery specification — 2026-09-25

[31](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md) completes draft specification
coverage for PL-01–05, not implementation or release acceptance. Added four cards,
eight unfilled evidence gates, twelve NOT_RUN scenarios and an evidence inventory/
reference checker. Defines compatible admission, WRITE_PAUSED versus SAFETY_HOLD,
receipt/worker recovery, privacy duties that survive a pause and safe-forward
repair instead of destructive rollback. Public wire remains 60 operations.

Sixteen scoped files: new 31, contracts/plan-activation-evidence.json and
check-plan-activation.mjs; revision README/07/08/09/18/25/30/check-docs;
documentation map, DoD, TESTING_STRATEGY, V1_IMPLEMENTATION_PLAN and CHANGELOG.
Task brief/read sources are in 31 §1; exact SDK/provider research is in §8.
No production settings, feature eligibility, prices or policy defaults were chosen.

Actual verification used the existing Node executable at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.
Each command was that executable plus `docs/revision/check-<name>.mjs`:

```text
docs, backend-contracts, extension-contracts, operations-contracts,
rewards-ai-contracts, ai-generation-lifecycle, planning-contracts,
plan-lifecycle, plan-management, replication-v2, account-export,
plan-database-packet, mobile-plan-recovery, experience-contracts,
plan-activation
```

All fifteen returned PASS/exit 0. New activation checker: 21 reference cases,
eight gates, four cards, twelve scenarios specified, zero runtime scenarios run;
actualDraftEligible=false is the expected safe result. The positive fixture is
explicitly synthetic, never saved as an approval. New checker syntax passed via
`--check`. Tracked `git diff --check` passed with existing LF/CRLF notices;
new files and changed routing were separately reviewed. No test proves real
approval authenticity, operator privileges, distributed pause ordering or restore.

Owner Home/theme hashes remain
`33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1` and
`8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`.
Unrelated dirty work retained. No app/package/SQL/config changes, real rollout,
device/provider test, install, agent, account, spending, secret access, commit/push
or deployment. Staging/production targets were not accessed.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — rollout controls, privacy lifecycle and recovery design
ACCEPTANCE_CRITERIA_RESULT: PA-A01–04 PASS for document/reference scope;
  PA-T01–12 real acceptance NOT_RUN
VERIFICATION_STATUS: PASS for fifteen document/reference checkers only
REVIEW_STATUS: Author semantic/self-review complete; independent review pending
RELEASE_STATUS: NOT_READY; no actual candidate or activation authorization
KNOWN_LIMITATIONS: Unimplemented server/mobile/control adapters and no real
  concurrency/backup/worker/OS/production evidence; fixture values are not proof
UNRESOLVED_ISSUES: PA-G01–08, applicable DB-G/MP-G, global release/owner policies
SECURITY_NOTES: Pause cannot erase pending work or disable privacy cascades;
  rollback is not permission to restore erased data or overwrite new writes
ESCALATION_REQUIRED: Independent qualified review, task-relevant owner choices
  and exact environment/action authority before real activation or integration
RECOMMENDED_NEXT_ACTION: Consolidate release-feature/decision matrix from the
  existing register; separate mandatory/proposed/later scope and foundation tasks
```

### September 25 release-answer reconciliation and paid-cloud preparation

Recorded five scoped answers in 01: Android+iOS alongside Website/Portal,
O/L/A/L/higher-stage education, independent personal-teacher launch, si/ta/en and
optional paid cloud in January. Numeric minimum age/consent remains unknown;
full productivity web and classroom assignment/progress/cohort services stay later.
The current register is 2 APPROVED selections, 7 PARTIAL decisions, 3 OPEN
(009/010/011); these are not completion percentages. Dated earlier counts remain
historical evidence, not the latest status.

Added [32](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md), covering each of the 80
families once and preserving baseline, conditional, candidate, later and HOLD
boundaries. Reconciled V1/POST_V1/implementation plan and active release/resource/
education/monetization/readiness summaries. September 25 available time is 98 days,
14 weeks, 350–490 gross owner hours; no measured remaining-effort estimate or
guaranteed delivery follows from that arithmetic.

Added [33](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md): official Apple/Google billing
and Supabase RLS/object-backup sources, six draft cards, twenty NOT_RUN cases.
The proposed lifecycle covers immutable object verification, operation-bound
authority, late-token quota exposure, cancellation/publication races, independent
local-copy removal, erasure suppression and separate object-byte recovery.
No object provider, quota, price, policy or live purchase is silently approved.

Actual checks on September 25 with installed Node 24.19.0/Ajv 6.15.0:

- All fifteen `docs/revision/check-*.mjs` scripts exited 0/PASS. The document
  checker covers 38 revision Markdown files, 19 canonical and 7 governance/entry
  files, 80 unique release-map families and the 2/7/3 ADR checkpoint. Six CC cards
  and twenty CC-T scenarios are present; zero cloud runtime cases were executed.
- Existing reference/DTO counts and 60 combined draft API routes are unchanged;
  no route is added by the conceptual cloud operation/state table. PL activation
  actualDraftEligible remains false. Passing fixtures are not runtime evidence.
- `git diff --check` passed with existing LF/CRLF warnings only. Targeted stale-
  clause searches identified and corrected current cloud placement claims,
  including 10's product boundary and 11's final preparation paragraph; historical
  dated research/approval checkpoints retained. New/untracked documents inspected
  as files, not ignored because git diff cannot display their earlier baseline.
- Source hashes remain `33012D85…CCBE1` for home-screen.tsx and
  `8FC5FD02…8DAC8` for tokens.ts, matching the preserved owner changes. No other
  application/package/SQL/provider files changed in this slice. No type/lint/native,
  RLS, upload/download, payment, legal, store or production tests were run.

Changed paths for RS-01/CC-00: revision 00/01/06/07/08/09/10/11/12/18/README,
new 32/33 and check-docs.mjs; docs/DOCUMENTATION_MAP.md, V1_FEATURE_SCOPE.md,
POST_V1_FEATURE_SCOPE.md, V1_IMPLEMENTATION_PLAN.md and CHANGELOG.md. Existing
unrelated dirty work and source files retained. Complete patch/file self-review
does not constitute independent qualified review.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — release admission, private files, money and age-policy boundaries
ACCEPTANCE_CRITERIA_RESULT: RS-A1–5 and CC-A1–4 PASS for documentation scope only
VERIFICATION_STATUS: PASS for fifteen document/reference checkers
REVIEW_STATUS: Author self-review only; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; no task activation, purchase or deployment authorized
KNOWN_LIMITATIONS: No executable cloud DTO/RPC/schema/provider/native service;
  source inventory, exact local resource format/import contract and QA still open
UNRESOLVED_ISSUES: Age/consent, business/merchant, quotas/prices, provider/region,
  retention/restore policy, exact differentiated scope and measured capacity
SECURITY_NOTES: Scope approval never bypasses selected-upload/owner checks;
  database backup is not object-byte backup, terminal cancel cannot ignore late tokens
ESCALATION_REQUIRED: Qualified independent review and specific owner facts before
  affected implementation/production; none auto-dispatched, no extra agents
RECOMMENDED_NEXT_ACTION: R-01 local-resource format/import/recovery contract and
  CC-01 exact policy/API draft, preserving unknown values until approved
```

### Overall package boundary (continued historical checkpoints)

### October 3 final build guide consolidation — FG-01

- OUTCOME: finish the build-guide editorial pass in existing file 49; provide
  one entry, canonical phase routing, feature-local remaining work and a first
  coding prompt. No new numbered packet or new product contract.
- AUTHORITY: owner accepted consolidating the existing documentation into a
  final build guide and asked to finish it. This closes the broad editorial pass;
  it does not approve unfinished feature designs or start application changes.
- RISK: LOW — documentation routing and handoff only, preserving policy gates.
- READ: AGENTS/AI rules, execution/DoD, guardrails, task template and map; current
  49, 18/07/38 handoff context, 32 complete placement map, canonical implementation
  plan §15, root/revision README. Source/package/dirty state refreshed.
- ALLOWED: existing revision 49, 18, 07, README and this audit; root README,
  docs/DOCUMENTATION_MAP.md, docs/V1_IMPLEMENTATION_PLAN.md and docs/CHANGELOG.md.
- ACCEPTANCE: FG-A1 one obvious entry and no competing first-task prompt;
  FG-A2 full phase order and feature-to-contract routing retain release scope;
  FG-A3 every D1–D9 remainder has an implementation lane and an explicit
  feature-local gate, with no invented approval or global completion claim;
  FG-A4 current links/structure and scoped edits pass checks.
- VERIFICATION: document checker, manual scope/phase/link review and scoped
  whitespace/diff. Prior contract/runtime evidence remains dated; no need to
  rerun unchanged domain fixtures for an editorial consolidation.
- RECOVERY: undo only FG-01 text if needed; preserve existing files and history.
- RESULT: FG-A1–A4 PASS for the editorial consolidation. `node
  docs/revision/check-docs.mjs` exit 0: 54 revision / 19 canonical / 7 governance
  files, 905 local links, no errors. `git diff --check` and nine-file explicit
  whitespace/conflict scan PASS; existing CRLF conversion warnings retained.
  Manual review caught and removed readiness's stale reference to the retired
  diagnostic prompt. Phase 0 harness versus production phase order is explicit;
  all D1–D9 entries have named feature lanes without being marked complete.
- TASK_STATUS: VERIFIED (editorial deliverable); author self-review complete.
  RELEASE_STATUS: NOT_READY. Existing HIGH reviews remain REVIEW_PENDING;
  feature-specific unfinished specifications and five prior engine gaps remain
  visible. No new runtime evidence, app changes or owner policy approval inferred.
- NEXT ACTION: use guide §3 for the bounded L-02A coding task when implementation
  starts. Broad documentation expansion is closed; future edits serve an actual
  selected task, review finding or owner decision.

### October 3 API ownership inventory and build-entry handoff — BH-01

- OUTCOME: inspect every current public API slice for ownership collisions and
  unresolved references; turn remaining implementation gates into a concrete
  first build task and a finite external-decision handoff.
- AUTHORITY: owner requests continuous documentation work until app-build entry.
  Work alone; current scope remains preparation, not product implementation.
- RISK: MEDIUM — read-only contract audit and editorial handoff; no normative
  security/schema change or acceptance of pending HIGH designs.
- READ: mandatory rules/execution/DoD/guardrails/map/template from this resumed
  work; readiness 18, playbook 07, harness 38, release 32 and core 13 §12.E;
  exact JSON contracts selected by file inventory. Inspect current package,
  engine and existing dirty files; preserve unrelated work.
- ALLOWED: new revision 48-API-OWNERSHIP-AND-CONSOLIDATION.md,
  49-BUILD-ENTRY-HANDOFF-SI.md and inspect-api-inventory.mjs; existing revision
  07, 18, README, this audit and docs/DOCUMENTATION_MAP.md / CHANGELOG.md.
- ACCEPTANCE: BH-A1 every discovered OpenAPI operation has a source and unique
  route/operation identity or an explicit finding; BH-A2 all reference targets
  and component collisions are reported without silently flattening schemas;
  BH-A3 first code-task scope, pass/fail evidence and remaining owner/reviewer
  inputs are concrete; no claim of complete runtime or enterprise readiness.
- CHECKS: inventory script against current JSON, existing relevant contract
  checkers, documentation check, syntax and scoped diff/whitespace review.
- NON-GOALS: app/tests implementation, provider/secret/SQL changes, package
  installation, pricing/legal facts, independent acceptance or deployment.
- RECOVERY: change only this audit/handoff if findings are wrong; leave authored
  source contracts intact. Findings that require policy changes remain explicit.
- EVIDENCE: October 3, Node v24.19.0. All 19 existing `check-*.mjs`
  documentation/contract scripts exited 0. Exact commands are `node
  docs/revision/<name>.mjs`, with these names:
  check-docs, check-backend-contracts, check-extension-contracts,
  check-operations-contracts, check-rewards-ai-contracts,
  check-ai-generation-lifecycle, check-planning-contracts,
  check-plan-lifecycle, check-plan-management, check-replication-v2,
  check-account-export, check-plan-database-packet, check-mobile-plan-recovery,
  check-plan-activation, check-experience-contracts, check-classroom-contracts,
  check-classroom-bridge, check-classroom-helpers, check-classroom-key-policy.
  Docs checked 54 revision files / 19 canonical / 7 governance and 871 local
  links. Backend includes 36 prior DTO fixtures plus 7 new cursor-query fixtures.
  `node docs/revision/inspect-api-inventory.mjs` exited 0: 8 sources, 82 operations,
  10 registered schema IDs, 422 reference locations, no duplicate operationId or
  normalized method/path, no unresolved targets. Four repeated component-name
  groups were inspected directly; matching raw names are not semantic equality.
  Initial inventory exit 1 was its unsupported-URN resolver limitation; fixed by
  reading existing local root $id registrations, with no source-schema rewrite.
- DIAGNOSTIC: `node docs/revision/inspect-core-baseline.mjs` exited 1, actual
  engine 3 PASS / 5 CONTRACT_GAP; full named results and source hash retained in
  49. This is existing product failure evidence, separate from document PASS.
- REVIEW: author reviewed all task edits, including new files, against source
  ownership and authority; namespace findings preserved, F2 corrected only in
  draft. Syntax checks for both changed/new scripts PASS. `git diff --check`
  and 12-file whitespace/conflict scan PASS; existing CRLF warnings unchanged.
  Engine, Home, theme, package and lock fingerprints match previous baseline.
- COMPLETION: BH-A1–A3 PASS for scoped inventory and first-task preparation;
  MEDIUM author review complete. Whole V1 freeze is incomplete; required HIGH
  reviews remain pending. No new app/test/SQL implementation or live integration.
- F2 FOLLOW-UP: ordinary draft validation reconciliation under delegated design;
  extend allowed files to revision 14-BACKEND-API-DATABASE-BUILD-CONTRACT.md,
  contracts/personal-api.openapi.json and check-backend-contracts.mjs. Omitted
  cursor starts pagination; supplied empty cursor is invalid, consistent with
  existing extension Cursor. MEDIUM, no deployed behavior or authorization
  change. Add independent omitted/empty/bounds/type fixtures; retain all routes.

### October 3 documentation closeout and first handoff — DH-01

- OUTCOME: one bounded remaining-document queue and a copyable first-task
  handoff, with current calendar capacity and explicit completion evidence.
- AUTHORITY: owner continues documentation work alone; ordinary specification
  preparation remains delegated. No change to feature admission or review gates.
- RISK: LOW — navigation, status synthesis and calendar arithmetic only.
- READ: AI rules, execution policy, DoD, guardrails, task template and map;
  playbook, readiness, harness 38, release map 32 sections 3–5 and canonical
  implementation-plan introduction. Current package/scripts, engine and dirty
  work inspected; existing Home/theme and other documentation edits preserved.
- ALLOWED FILES: revision 07-LUNA-IMPLEMENTATION-PLAYBOOK.md,
  18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md,
  32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md, this audit and docs/CHANGELOG.md.
- ACCEPTANCE: DH-A1 remaining work has named source, deliverable and completion
  evidence; DH-A2 first handoff separates currently authorized diagnosis from
  proposed test-file implementation; DH-A3 current availability uses October 3
  and does not assert delivery feasibility or a completion percentage.
- CHECKS: existing check-docs, scoped whitespace/diff and manual source/link/
  authority review. No new checker for this editorial change.
- NON-GOALS: product/SQL/test implementation, dependency/provider changes, new
  security policy, spending, independent review or publication.
- RECOVERY: revert only DH-01 paragraphs if rejected; preserve all prior work.
- RESULT: DH-A1–A3 PASS for this editorial handoff. `node
  docs/revision/check-docs.mjs` exited 0: 52 revision Markdown files, 19 canonical
  files, 7 governance/entry files and 832 local links checked; no errors.
  `git diff --check` and explicit trailing-whitespace/conflict-marker scans of
  all five allowed files exited 0. Existing CRLF conversion warnings retained.
  Calendar subtraction confirmed 90 days; availability is 321.43–450 gross
  hours before rounding. Manual review checked source links, phase order,
  historical/current distinction and unchanged approval boundaries.
- COMPLETION: scoped documentation VERIFIED, author self-review complete;
  independent security/design reviews elsewhere remain REVIEW_PENDING.
  No new runtime test, source repair or release evidence. Next: D3 API inventory.

### October 2 key/nonce policy options and independent review brief — KN-00

- OUTCOME: concrete custody/nonce/rotation/restore recommendation, reviewer-ready
  questions and an honest real-integration admission inventory, with local models.
- STATE: DRAFT / REVIEW_PENDING. DELIVERABLE: documentation/reference checks.
- AUTHORITY: EB-00 continuation accepted; owner says no current independent
  reviewer and explicitly requests a review brief for later. No reviewer dispatched.
- RISK: HIGH — key confidentiality, GCM nonce reuse and rollback/restore lineage.
  Solo author, configured model; self-review cannot satisfy qualified review.
- READ: mandatory rules/execution/DoD/guardrails/map/template; 44 digest/delivery,
  46 nonce/bridge, 43 runner admission; Security secret-storage section and exact
  September 29 delegated-specification boundary.
- INSPECT: package scripts, dirty work and Task prototype. No classroom SQL folder
  or integration runner; psql/docker/supabase/deno not resolved on this shell PATH.
  This is not proof those tools are absent everywhere. No credentials inspected.
- ALLOWED: new 47-CLASSROOM-KEY-NONCE-AND-REVIEW-BRIEF.md and
  check-classroom-key-policy.mjs; existing 09, 18, 46, revision README,
  documentation map and changelog only. Preserve unrelated Home/theme/docs work.
- KN-A1: distinct command/AES key purposes; custody choices and rotation/restore
  failures explicit; no automatic provider/account/secret or lifetime approval.
- KN-A2: deterministic candidate nonce encoding, committed-before-use allocation,
  burned-gap/unknown-commit/restore behavior tested as pure models, not SQL proof.
- KN-A3: reviewer brief and missing real integration prerequisites are actionable;
  no independent review or runtime execution fabricated from generic continuation.
- VERIFICATION: installed Node local policy/bridge/helper/classroom/docs checks,
  syntax, scoped snapshot/new-file review, whitespace and source/config hashes.
- NON-GOALS: implementing/adopting new SQL allocator signature, key generation,
  provisioning, spending, installation, legal/retention decisions, agents/deployment.
- STOP/RECOVERY: no encryption activation without reviewed nonce/custody/restore
  controls; no rollback that reuses old write-key counters. Undo only scoped draft
  edits if rejected, preserve existing work and the still-pending review gate.

Evidence recorded October 3, 2026 (Asia/Colombo): `node
docs/revision/check-classroom-key-policy.mjs` PASS — 5 encoding vectors, 10
rejected encoding inputs, 11 allocation models, 3 retry-gap models and 6
restore-admission models. The checker reports `realIntegrationCasesRun: 0`
and explicitly scopes itself to synthetic exact-integer/encoding/lifecycle
models; it does not exercise keys, AES, SQL, concurrency or a provider.

The surrounding contract/reference checks were also rerun: bridge, classroom
contract, helper, documentation, backend-contract and JavaScript syntax checks
PASS; `git diff --check` and the scoped whitespace/conflict scan PASS. Baseline
hashes for the existing Home/theme/task/package files remain unchanged. No
AES/GCM encryption, JWT/RLS/grants, SQL transaction, Edge deployment, provider
account, secret, spending, or independent security review was performed.

KN-A1–A3 therefore PASS only as documentation/reference acceptance criteria.
The packet remains `DRAFT / REVIEW_PENDING / NOT_IMPLEMENTED`; the reviewer
brief is ready, but no reviewer has been selected or contacted. The next gate
is qualified independent review of custody, nonce allocation, rotation and
restore behavior before implementation or integration is authorized.

### October 1 Edge/database bridge specification — EB-00

- OUTCOME: resolve FA-00's internal transport gap with typed preparation,
  mutation material and encrypted-delivery boundaries, preserving public wire.
- STATE: DRAFT / REVIEW_PENDING. DELIVERABLE: documentation and local checks.
- AUTHORITY: owner explicitly accepted FA-00's next bridge-contract task; September
  29 ordinary design delegation, not app/SQL/provider execution permission.
- RISK: HIGH (trusted gateway, replay, atomicity and key boundaries). Solo author;
  required independent qualified review PENDING, not dispatched automatically.
- READ: AI rules/execution/DoD/guardrails/map/template; 41 operation predicates,
  42 identity/locks, 43 signatures/grants/runner, 44 digest/delivery and 45 findings;
  public schema, exact owner amendment and implementation-plan foundation order.
- INSPECT: dirty checkout, root scripts and ownerless best-effort Task prototype.
  No installed auth/SQL/crypto implementation assumed. Preserve Home/theme changes.
- ALLOWED: new 46-CLASSROOM-EDGE-DATABASE-BRIDGE.md,
  contracts/classroom-bridge.schema.json and check-classroom-bridge.mjs;
  existing 09, 18, 42, 43, 44, 45, check-classroom-contracts.mjs, revision README,
  documentation map and changelog only. Nine complete pre-edit snapshots plus
  direct review of the bounded 09 insertion; no unrelated audit rewrite.
- EB-A1: exact required arguments for thirteen mutations/nine reads plus one
  server-only preparation function; public requests/responses stay unchanged.
- EB-A2: strict internal DTOs reject extra fields/bad lengths; fresh/replay/stale/
  lost-commit paths preserve authorization and one durable invitation token.
- EB-A3: reconcile superseded SQL-only wording and signature checks without
  lifting review/runtime/key-policy gates; no success from synthetic models alone.
- NON-GOALS: implementation, migrations, provider/key creation, production TTL/
  nonce-use limits, retention/legal facts, spending/install/agents/commit/deploy.
- VERIFICATION: installed Node/Ajv bridge fixtures, existing classroom/helper/docs/
  backend checks, syntax, scoped diffs/new-file review, whitespace/source hashes.
- STOP/RECOVERY: missing crypto/key policy or changed trusted boundary blocks
  implementation, not a fallback algorithm. Undo only this slice if needed.
  Keep independent review and real isolated integration visibly pending.

EB-A1–A3 PASS for draft/reference scope. Verification finished October 2,
Asia/Colombo. PowerShell, installed Node v24.19.0 and existing Ajv 6.15.0; no install.
`node` means the existing executable at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.

| Actual check | Result / limitation |
| --- | --- |
| `node docs/revision/check-classroom-bridge.mjs` | PASS: 15 internal definitions, 13 mutation/nine read inventory, 62 DTO fixtures (29 rejected), four positive/six negative projection cases, 15 decision models, one winner model and four commit models; no AES/SQL/Edge execution |
| `node docs/revision/check-classroom-contracts.mjs` | PASS after fixing the checker issue below: unchanged 22 operations/57 public definitions/136 DTO fixtures/363 refs; 15 function-document negatives, all 40 TX/TI execution mappings NOT_RUN |
| `node docs/revision/check-classroom-helpers.mjs` | PASS: existing 19 canonical vectors and all HMAC/token/replay/cursor/delivery reference cases retained; no production crypto proof |
| `node docs/revision/check-docs.mjs` | PASS: 51 revision, 19 canonical, seven governance/entry files, 804 local links and all 80 families; approval counts unchanged |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 DTO fixtures, 14 personal-core operations, 170 refs and nine SQL text declarations; no execution |
| `node --check docs/revision/check-classroom-bridge.mjs` and `node --check docs/revision/check-classroom-contracts.mjs` | PASS syntax |
| `git diff --check` plus explicit 13-file whitespace/conflict scan | PASS; pre-existing LF/CRLF conversion warnings retained |
| Six source/config hashes | Home/theme, Task types/storage, package.json and package-lock.json match FA-00 baseline exactly |

Observed failure and repair: initial classroom checker missed an expected negative
exception. Added case labeling; reproduced as negative 6 (wrong provider-session
parameter). The new preparation signature repeated the correct parameter, hiding
the deliberately corrupted operation signature from a whole-document includes
check. Restricted validation to the actual operation call block, retained that
negative fixture and reran successfully. No weakening/removal of the negative.
Also found that old prose said 14 mutations/eight reads whereas unchanged OpenAPI
has 13/nine; corrected draft descriptions and now assert the actual operation set.
Four added newline-negative fixtures pass without a schema workaround.

Self-review compared nine full pre-edit snapshots, inspected all three new files
and the exact bounded 09 insertion. Preparation is explicitly a logical read with
guard locks, not a PostgreSQL READ ONLY setting. Strict internal results never
become public passthrough; the nonce allocator is explicitly still unselected.
No app, SQL, live account/provider, dependency or public schema was modified.

```text
TASK_STATUS: REVIEW_PENDING — EB-00 bounded bridge documentation prepared
RISK: HIGH — actor/digest trust, invitation delivery and transaction recovery
ACCEPTANCE_CRITERIA_RESULT: EB-A1–A3 PASS for document/reference checks only
FILES_CHANGED: three new artifacts, ten existing allowed documentation/check files
VERIFICATION_STATUS: PASS local checks; all real trust-boundary integration NOT_RUN
REVIEW_STATUS: self-review complete; required qualified independent review PENDING
RELEASE_STATUS: NOT_READY; ADAPTER_HOLD remains, no release/provider action authorized
KNOWN_LIMITATIONS: schema/models do not implement AEAD, SQL, locks, nonce allocation,
  key custody, JWT verification, pool/grant enforcement or mobile recovery
UNRESOLVED_ISSUES: nonce/key custody policy, closed-command retention, shared core
  identity/Task/schema dependencies, reviewed DDL and authorized disposable evidence
SECURITY_NOTES: prep is not authority; final checks choose actual fresh/replay branch;
  only stored winner token may be delivered after validated response and commit
ESCALATION_REQUIRED: qualified independent security review and owner-reserved policy
  facts before acceptance/activation; no extra agent or spending initiated
RECOMMENDED_NEXT_ACTION: prepare bounded shared-dependency and key/nonce-policy
  admission choices, then obtain required review before any adapter implementation
```

### October 1 classroom adapter feasibility self-review — FA-00

- OUTCOME: identify and contain incompatible assumptions in 39–44, document a
  bounded corrective adapter direction, and test pre-jsonb NUL rejection.
- STATE: DRAFT / REVIEW_PENDING. DELIVERABLE: documentation/reference checks.
- AUTHORITY: accepted consolidated-design/adapter review continuation; exact
  September 29 design delegation, not implementation or SQL execution permission.
- RISK: HIGH (key custody, replay identity, transaction and disclosure boundaries).
  Work alone with configured model; independent qualified review remains PENDING.
- READ: mandatory AI rules, execution policy, DoD, guardrails, map and task brief;
  owner amendment, relevant 39–44 scope/access/identity/SQL/helper contracts.
- INSPECT: current Task types/storage, package scripts and dirty checkout; no
  working classroom/auth/SQL adapter assumed from a passing document checker.
- ALLOWED: new 45-CLASSROOM-ADAPTER-FEASIBILITY-REVIEW.md; existing 09, 18, 40,
  43, 44, revision README, documentation map, changelog,
  check-classroom-helpers.mjs and contracts/classroom-helper-vectors.json only.
- FA-A1: Given the documented pgcrypto modes, identify the unsupported SQL-only
  GCM assumption and route affected implementation to HOLD without weakening AEAD.
- FA-A2: Given legal JSON containing decoded U+0000, reject before jsonb in the
  reference parser; keys/nested strings fail, literal backslash-u text survives.
- FA-A3: Record unchanged privacy/transaction invariants and exact adapter changes
  still needed; distinguish author self-review, local checks and unrun integration.
- BASELINE: pre-existing Home/theme/docs work preserved; pre-edit snapshots of
  nine existing allowed files retained in full for scoped review. The larger 09
  snapshot was output-truncated; review its exact bounded insertion directly,
  not a falsely complete snapshot comparison. No public DTO edits.
- NON-GOALS: app/SQL/driver implementation, install, extension/provider change,
  key/account creation, policy/legal/pricing decisions, agents, commit or deployment.
- VERIFICATION PLAN: installed Node helper/classroom/docs/backend checkers, syntax,
  scoped before/after and new-file review, whitespace and six source/package hashes.
- STOP/RECOVERY: SQL-only encryption path stays HOLD; no fallback encryption,
  raw-table grants or public trusted flags. Revert only this slice if necessary.
  Production key/retention choices and independent acceptance require their owners.

FA-A1–A3 PASS for this draft/self-review and reference-vector slice only.
PowerShell / installed Node v24.19.0; existing Ajv 6.15.0. `node` below means
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.
No install or provider invocation.

| Actual check | Result / limitation |
| --- | --- |
| `node docs/revision/check-classroom-helpers.mjs` | PASS: 19 canonical vectors including four new NUL/literal-text cases; existing command/RFC HMAC goldens, seven digest changes, six token negatives, 10/13/9 predicate cases, one keyset model and eight packet negatives retained; zero runtime cases |
| `node docs/revision/check-classroom-contracts.mjs` | PASS: 22 operations, 57 definitions, 136 DTO fixtures (97 rejected), 363 refs; 22 candidate signatures and 40 NOT_RUN TX/TI mappings remain structural, not executable integration |
| `node docs/revision/check-docs.mjs` | PASS: 50 revision, 19 canonical, seven governance/entry files, 793 links, all 80 families; approval counts unchanged |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 DTO fixtures, 14 operations, 170 refs and nine SQL text declarations, no database execution |
| `node --check docs/revision/check-classroom-helpers.mjs` | PASS syntax only |
| `git diff --check`, scoped whitespace/conflict scan | PASS; existing newline-conversion warnings are not suppressed |
| Six source/package SHA256 comparisons | Home/theme, Task types/storage, package.json and package-lock.json identical to HC-00 baseline |

Self-review: compared all nine complete existing-file snapshots, read the whole
new 45 and the exact 09 insertion. Corrected an overbroad “infer acceptance” phrase
to the actual no-private-fields/joins boundary. Three exploratory reads used wrong
paths, returned missing-file errors and were corrected from the directory listing;
no writes or test failures resulted. The initial large audit snapshot was
truncated, so it was not treated as full-file diff evidence. No public schema,
application source, credential, SQL, account or provider state was modified.

```text
TASK_STATUS: REVIEW_PENDING — bounded feasibility review and reference guard complete
RISK: HIGH — trusted crypto/digest/transaction boundary
ACCEPTANCE_CRITERIA_RESULT: FA-A1–A3 PASS for draft/reference scope
FILES_CHANGED: one new review document and ten existing allowed docs/check artifacts
VERIFICATION_STATUS: PASS local checks; real Edge/SQL/AEAD integration NOT_RUN
REVIEW_STATUS: author self-review complete; qualified independent review PENDING
RELEASE_STATUS: NOT_READY; SQL-only crypto path ADAPTER_HOLD
KNOWN_LIMITATIONS: no deployed server/runtime version or driver/grant compatibility
  established; fixture parser and predicate models are not production enforcement
UNRESOLVED_ISSUES: exact internal bridge, key/nonce custody, closed-command retention,
  core Task/identity foundations, isolated execution authority and independent review
SECURITY_NOTES: no fallback to unauthenticated crypto or raw gateway table access;
  preparation is not authority and public DTOs remain unchanged
ESCALATION_REQUIRED: qualified review and owner-reserved facts before affected activation
RECOMMENDED_NEXT_ACTION: specify narrow Edge/SQL preparation/digest/delivery bridge,
  reconcile 43/44 signatures/grants/checks; no automatic SQL/app implementation
```

### September 30 command/cursor/invitation helper contracts — HC-00

- OUTCOME: concrete helper behavior and synthetic vectors for duplicate commands,
  pagination and invitation lifecycle; documentation/reference checks only.
- STATE: REVIEW_PENDING. RISK: HIGH (replay, privacy, token and key boundaries).
- AUTHORITY: owner accepted SF-00's next helper-contract slice; September 29
  ordinary design delegation. No app/backend implementation or execution authority.
- READ: mandatory AI/execution/DoD/guardrails/map/template; V1 plan entry, exact
  owner amendment, 40 §§2–5, 41 access/storage/privacy, 42 identity/replay, 43 helper
  and runner boundaries. INSPECT: Task types/storage, package scripts, dirty work.
- ALLOWED: new 44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md,
  contracts/classroom-helper-vectors.json and check-classroom-helpers.mjs;
  existing 09, 40, 43, 18, revision README, documentation map and changelog only.
- HC-A1: exact canonical digest input/encoding and replay/expiry/key-rotation
  outcomes; no expired-command re-execution or private-payload receipt cache.
- HC-A2: actor/scope-bound cursor ordering, current authorization and invitation
  token/delivery/redeem rules; explicitly inventory auxiliary storage and limits.
- HC-A3: fixed synthetic vectors and negative checks run locally without a DB,
  app import, network, install, secret or false claim of runtime security proof.
- BASELINE: existing Home/theme and docs edits retained; six source/package hashes
  unchanged from SF-00. Existing 22 public operation schemas remain unchanged.
- NON-GOALS: runnable SQL/HTTP/native helper, new provider/account, real key or
  retention/pricing/age policy, agents, spending, install, commit/push/deployment.
- VERIFICATION: installed Node helper/classroom/docs/backend checks, syntax,
  whitespace, scoped before/after review and source hashes. Required independent
  review PENDING; real transactions, crypto deployment and auth tests NOT_RUN.
- STOP/RECOVERY: preserve production-policy unknowns; missing compatible crypto/
  shared storage or legal retention blocks activation. Revert only this task's
  document/checker edits if needed; never reset the dirty checkout.
- HC-A1–A3: PASS for scoped draft/reference checks; runtime NOT_RUN and required
  independent review PENDING. No production-security acceptance is implied.

Actual environment: PowerShell, installed Node v24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`;
existing Ajv 6.15.0 for unchanged classroom/backend checks. No installation.

| Check (node abbreviates the installed executable above) | Actual result / scope |
| --- | --- |
| `node docs/revision/check-classroom-helpers.mjs` | PASS: 15 canonical vectors, one .NET-derived command golden, one RFC 4231 HMAC vector, seven digest-change cases, six invalid token cases, ten replay/thirteen cursor/nine delivery model cases, one keyset model and eight packet negatives |
| `node docs/revision/check-classroom-contracts.mjs` | PASS: unchanged 136 DTO fixtures (97 rejected), 363 refs, 22 function mappings, seven migration seams and 40 NOT_RUN TX/TI surface mappings; existing negatives retained |
| `node docs/revision/check-docs.mjs` | PASS: 49 revision, 19 canonical, seven governance/entry files, 779 local links and all 80 requirement families; no approval counts changed |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 DTO cases, 14 operations, 170 refs and nine SQL text declarations; no SQL execution |
| `node --check docs/revision/check-classroom-helpers.mjs` | PASS syntax only |
| PowerShell .NET HMACSHA256 | Public synthetic 00..1f key and literal canonical command independently produced the stored command golden; no real key or independent review |
| `git diff --check` and scoped whitespace/conflict scan | PASS; pre-existing LF/CRLF warnings retained, ten scoped files scanned including new artifacts |
| Six source/config SHA256 comparisons | Home/theme, Task types/storage, package.json and package-lock.json match SF-00 baseline exactly |

Self-review inspected seven existing-file diffs against pre-edit snapshots and
all three new artifacts. Refined the fixture command-expiry boundary to use the
documented synthetic constant, exact AEAD associated-data fields, expired invite
response state and strict fixture input validation. Domain tables versus auxiliary
cursor storage and READ versus domain mutation are explicitly distinguished.
One patch attempt failed on an unmatched context line without applying changes;
read the exact target and reapplied a bounded patch. No test failure was hidden.
No public schema, source, SQL prototype, provider or credential changed.

```text
TASK_STATUS: REVIEW_PENDING — HC-00 helper candidates and synthetic checker prepared
RISK: HIGH — command re-execution, cursor ownership and invitation secret lifecycle
ACCEPTANCE_CRITERIA_RESULT: HC-A1–A3 PASS for documentation/reference vectors only
FILES_CHANGED: three new artifacts and seven existing files in allowed scope
VERIFICATION_STATUS: PASS local checks; no runtime/security integration run
REVIEW_STATUS: self-review complete; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; no implemented SQL/HTTP/crypto/native helper
KNOWN_LIMITATIONS: local parser is a bounded fixture parser, models are not RLS;
  cryptographic delivery/key access inside the selected DB adapter remains unproved
UNRESOLVED_ISSUES: production retention/key/rate policy, shared-schema/grant detail,
  compatible crypto adapter, independent review and isolated execution authority
SECURITY_NOTES: expired receipt purge cannot reset a reusable command UUID;
  auxiliary cursor storage needs its own access/cleanup/export inventory
ESCALATION_REQUIRED: owner-reserved policy/spend/review before affected action
RECOMMENDED_NEXT_ACTION: consolidated 39–44 design and adapter feasibility review;
  no automatic implementation, installation, independent agent or deployment
```

### September 30 classroom function and runner specification — SF-00

- TASK / OUTCOME: one reviewable function/migration/isolated-runner specification
  refining TI-00, not an executable database implementation.
- STATE: REVIEW_PENDING. DELIVERABLE: documentation plus read-only contract checker.
- AUTHORITY / PHASE: owner accepted exact function/runner preparation; September
  29 design delegation; CL-01–08 remain DRAFT behind core Task/auth foundations.
- RISK: HIGH — privileged functions, transactions, identity and recovery. Work
  alone; independent qualified review PENDING before acceptance/integration.
- READ: AI rules, execution, DoD, guardrails, map and task template; classroom
  39–42, wire/schema/TX inventory, canonical classroom reference sections, exact
  owner amendment. INSPECT: current Task types/storage, scripts and dirty state.
- BASELINE: existing documentation edits and Home/theme changes preserved;
  best-effort Task storage, no classroom runtime or test script. No new dependency.
- ALLOWED: new 43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md; existing 09, 18,
  42, revision README, check-classroom-contracts.mjs, map and changelog only.
- SF-A1: all 22 CW operations map to typed internal signatures, strict unchanged
  responses and restricted owner/caller capabilities, with explicit failure rules.
- SF-A2: ordered uncreated migration seams and runner configuration, deterministic
  schedules, failpoints and independent state oracles; every TX/TI case assigned
  to its required execution surfaces without claiming SQL covers native/Edge tests.
- SF-A3: negative inventory fixtures, actual local checks, full scoped self-review
  and source/config preservation; runtime remains NOT_RUN.
- NON-GOALS: app/SQL code, DB connection or execution, installs, credentials,
  accounts, new provider, production policy/price, agents, commit/push/deploy.
- VERIFICATION: installed Node classroom/docs checks, checker syntax, whitespace,
  exact scoped diff and SHA256 preservation. No install/reset used as a test.
- RECOVERY / STOP: undo only task-owned edits if necessary; unresolved security
  implementation/policy/review/target authority blocks affected execution, not
  this design draft. Do not infer legal retention, key custody or paid authority.
- SF-A1–A3: PASS for the scoped document/inventory checks; runtime NOT_RUN and
  independent review PENDING. Evidence below does not accept the security design.

Environment: PowerShell and installed Node v24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`;
existing Ajv 6.15.0. Commands below abbreviate that executable as `node`.

| Actual check | Result / limit |
| --- | --- |
| `node docs/revision/check-classroom-contracts.mjs` | PASS: 136 DTO fixtures (97 rejected), 363 refs, 22 internal signature mappings, seven UNCREATED migration seams, 40 NOT_RUN surface mappings and 12 new negative specification mutations; existing 12 TX/five CR/five TI negatives preserved |
| `node docs/revision/check-docs.mjs` | PASS: 48 revision, 19 canonical and seven governance/entry Markdown files; 767 local links and all 80 requirement families; approval counts unchanged |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 DTO fixtures, 14 operations, 170 refs, nine SQL text declarations; no database execution |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 DTO fixtures, 14 command kinds, 416 refs, eight unit/twelve header-reference cases; no API execution |
| `node --check docs/revision/check-classroom-contracts.mjs` | PASS syntax only |
| `git diff --check` | PASS; existing LF/CRLF warnings remain, no Git configuration changed |
| Source/config SHA256 comparison | Home/theme, Task types/storage, package and lockfile match all six TI-00 baselines |

Self-review: inspected all seven existing-file changes against pre-edit snapshots
and the full new document, including signature/path order, PreviewInvite read
semantics, owner capabilities, deferred-FK commit failure, retry identity, migration
authority and non-DB case coverage. Clarified structural immutable keys versus
allowed lifecycle pointers and distinguished existing Task prototype from missing
server helper. No public schema, SQL prototype or source behavior changed.
Primary sources were checked for function execution/search_path/NULL semantics,
SQLSTATE, lock privileges/monitoring and pool limitations; links are in 43 §8.
No database, provider, HTTP, JWT, native, restore or RLS test was run.

```text
TASK_STATUS: REVIEW_PENDING — SF-00 specification and read-only checker prepared
RISK: HIGH — privilege boundary, identity and transaction/recovery design
ACCEPTANCE_CRITERIA_RESULT: SF-A1–A3 PASS for scoped documentation only
FILES_CHANGED: new revision 43 plus seven existing files in allowed scope
VERIFICATION_STATUS: PASS local document/contract checks; runtime NOT_RUN
REVIEW_STATUS: self-review completed; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; no app/backend implementation or deployment
KNOWN_LIMITATIONS: exact shared helper signatures/DDL/driver/config not frozen;
  seven migration seams and integration runner remain UNCREATED
UNRESOLVED_ISSUES: digest/cursor/invitation helper contracts, reviewed core schema,
  owner policy/key custody, independent review and authorized isolated target
SECURITY_NOTES: trusted gateway assertion remains the identity trust boundary;
  inventories and schema fixtures cannot prove authorization or atomicity
ESCALATION_REQUIRED: owner-reserved policy/spend/review/run authority before action
RECOMMENDED_NEXT_ACTION: specify digest/cursor/invitation helper behavior and
  synthetic fixtures without inventing production policy; then qualified review
```

### September 30 Task tombstone and trusted identity design — TI-00

- Outcome: choose a concrete private acceptance tombstone representation and
  server-only verified-identity bridge for the classroom draft, with test oracles.
- Authority: owner explicitly requested the next recovery/identity documentation
  slice; September 29 ordinary design delegation. No app/SQL execution authority.
- Risk HIGH: erasure/replay, owner isolation, privileged function access and
  session revocation. Independent review PENDING, no extra agents.
- Read: mandatory AI/execution/DoD/guardrails/template/map; 14 §§2–3,
  16 task-delete/app-session/suppression rules; 40–41 identity/tombstone/lock
  boundaries; actual Task types/storage, package scripts and dirty state.
- Allowed: new revision 42; existing revision 14/16/40/41/09/18/07/README,
  check-classroom-contracts.mjs, docs/DOCUMENTATION_MAP.md and CHANGELOG.md.
- TI-A1: minimal deleted-link identity separated from nullable live Task FK;
  delete/purge/replay/restore/local-merge outcomes and retention limits explicit.
- TI-A2: server-only actor derivation, narrow DB privilege boundary, session
  binding, transaction-local identity and lock order consistent with owner sync head.
- TI-A3: hostile-client, revocation, pool reuse and resurrection test scenarios
  specified as NOT_RUN; actual DTO/doc regression checks and source preservation.
- Non-goals: changing DTOs, SQL/prototype, app, provider, dependency, credentials,
  retention duration, legal policy, accounts, spending, commit/push/deploy.
- Verification: installed Node classroom/docs/backend/extension checks, syntax,
  scoped diff and whitespace; runtime NOT_RUN. Revert only task-owned doc changes
  if required; missing key policy/tooling/review is not permission to execute.
- Evidence: TI-A1–A3 PASS for scoped documentation and local contract checks;
  HIGH independent review PENDING, runtime/security NOT_RUN.

Actual environment: PowerShell, installed Node v24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`,
existing Ajv 6.15.0. `node` below abbreviates that path; no dependencies installed.

| Check | Actual result / limitation |
| --- | --- |
| `node docs/revision/check-classroom-contracts.mjs` | PASS: unchanged 136 DTO fixtures/97 rejected, 363 refs; 12 packet negatives, five CR document negatives, four TI decisions, 16 NOT_RUN TI scenarios and five new negative TI inventory mutations |
| `node docs/revision/check-docs.mjs` | PASS: 47 revision, 19 canonical, seven governance/entry files; 756 local links and 80 requirement families |
| `node docs/revision/check-backend-contracts.mjs` | PASS: 36 DTO cases, 14 operations, 170 refs and nine SQL text declarations; no SQL execution |
| `node docs/revision/check-extension-contracts.mjs` | PASS: 123 DTO fixtures, 14 command kinds, 416 refs, eight unit-reference/twelve header-reference cases; no API/provider execution |
| `node --check docs/revision/check-classroom-contracts.mjs` | PASS syntax only |
| `git diff --check` | PASS with pre-existing LF/CRLF warnings only |
| Read-only inline whitespace/conflict scan | PASS on all 12 scoped files |
| SHA256 source/config comparison | Six exact baselines preserved: Home, theme, Task types/storage, package.json and package-lock.json |

Self-review covered all eleven existing-file diffs against pre-edit snapshots
and the complete new packet. Changes retain public DTOs, core SQL prototype and
source behavior. 40's lock order was explicitly reconciled with the owner sync
head and session guards rather than retaining competing orders. 14's server-only
boundary is preserved; privileged function input is a trusted server assertion,
not end-user JWT verification inside PostgreSQL. This trust limit is explicit.
No check failure occurred in this slice. Two source-page find requests returned
internal errors; opening the specific official pages recovered the relevant
pooling/driver guidance. No provider/runtime configuration was inferred from it.

```text
TASK_STATUS: REVIEW_PENDING — TI-00 design candidate documented
RISK: HIGH — erasure/replay, verified identity and privileged DB execution
ACCEPTANCE_CRITERIA_RESULT: TI-A1–A3 PASS for documentation/inventory only
FILES_CHANGED: new 42 plus eleven existing files named in allowed scope
VERIFICATION_STATUS: PASS local checks; TI-T01–16 and TX-01–24 NOT_RUN
REVIEW_STATUS: author self-review complete; qualified independent review PENDING
RELEASE_STATUS: NOT_READY; no SQL/app/role/provider deployment
KNOWN_LIMITATIONS: schemas/functions/policies/driver/verifier not implemented;
  transaction-local context is not independent cryptographic actor proof
UNRESOLVED_ISSUES: exact signatures/grants/versions, secret custody and session
  configuration, legal retention/eligibility, isolated tooling and independent review
SECURITY_NOTES: compromised trusted gateway credential can impersonate within
  granted functions; no permanent-retention or instant provider-revocation promise
ESCALATION_REQUIRED: owner-reserved policy/spend/review and explicit run authority
  before affected action; no additional agent or service started
RECOMMENDED_NEXT_ACTION: prepare exact isolated function/migration/runner contract
  for qualified review against TI-00; no execution until 41's SQ gates satisfied
```

### September 30 classroom canonical/SQL-test preparation — CR-00

- Outcome: reconcile classroom-specific boundaries into canonical reference
  documents and prepare an exact access/integrity matrix and isolated-test admission.
- Authority: owner continued CW-00; September 29's bounded classroom amendment
  and delegated ordinary specification. Documentation only, not SQL execution.
- Risk HIGH: cross-owner permissions, private Task links and privacy coverage.
  Independent qualified review remains PENDING; work alone.
- Read: AI rules/execution/DoD/guardrails/task template/map; 39 §8, 40,
  01 September 29 amendment; API §§5–7/18–21, Data Model §§13–16,
  Database §§14–18/21–23, Security §§6/8/12; export 28 §§3–4 and testing overview.
- Inspected: package scripts, Task types/storage and dirty state; no test script.
  `psql`, `supabase`, `docker` not discovered on PATH; this does not prove they
  are absent everywhere. No installation, credentials or database connection.
- Allowed: new revision 41; existing API_SPEC, DATA_MODEL, DATABASE_SCHEMA,
  SECURITY, TESTING_STRATEGY, CHANGELOG, DOCUMENTATION_MAP; revision
  00/07/09/18/28/40/README and check-classroom-contracts.mjs.
- CR-A1: canonical pointers identify approved subset versus draft design and
  exact wire differences; unrelated personal endpoints and old schemas unchanged.
- CR-A2: all 22 CW operations and 11 logical tables have explicit access/integrity
  responsibilities; private Task/reward/sync/export scope cannot expand silently.
- CR-A3: disposable-test admission, principals, failpoint schedule, constraint
  oracles and privacy evidence are specified without a fake executable SQL command.
- CR-A4: local schema/doc/coverage checks, full scoped diff and preserved source
  fingerprints; runtime/security tests stay NOT_RUN and review stays PENDING.
- Verification: installed Node classroom/docs/export checkers, syntax, tracked and
  new-file whitespace checks; self-review of all added text and checker changes.
- Non-goals: creating migrations/RPCs/DB roles/accounts, changing export DTOs,
  app code, installs, spending, legal rulings, agents, commit/push or deployment.
- Recovery: revert only this bounded documentation slice if needed, preserving
  prior dirty work. Missing policy/review blocks activation, not safe preparation.
- Evidence: CR-A1–A4 PASS for this document/reference/coverage slice. The design
  remains REVIEW_PENDING; no SQL/runtime/security acceptance claimed.

Actual checks on September 30 with installed Node v24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`
and existing Ajv 6.15.0; `node` below abbreviates this path:

| Check | Result / boundary |
| --- | --- |
| `node docs/revision/check-classroom-contracts.mjs` | PASS: 136 DTO fixtures (97 rejected), 363 refs, 12 negative packet mutations; 22 operation/11 table document rows, six OPEN gates, five canonical references and five negative document mutations |
| `node docs/revision/check-account-export.mjs` | PASS: unchanged 14 sections, 19 definitions, 144 DTO/30 synthetic semantic cases, 59 refs; no actual export/security/legal proof |
| `node docs/revision/check-docs.mjs` | PASS: 46 revision, 19 canonical, seven governance/entry files; 745 local links and 80 requirement families |
| `node --check docs/revision/check-classroom-contracts.mjs` | PASS syntax only |
| `git diff --check` | PASS; pre-existing LF/CRLF warnings only |
| Read-only inline Node whitespace/conflict scan | PASS on all 16 scoped files, including the new packet |
| Source/config fingerprints | Six SHA256 baselines preserved: Home, theme, Task types/storage, package.json and package-lock.json |

The first expanded classroom checker failed its minimum-description assertion on
three abbreviated predicate cells (CW-03/19/22: Auth + M/E). Inspection identified
the cells; clarified them as current membership/educator predicates without changing
authority or weakening the assertion; rerun PASS. This was a document-coverage
failure, not a SQL/app regression. Initial bulk snapshot output exceeded the tool
output limit; individual file reads replaced it before diff verification. PATH
discovery was only tool availability inspection, not a passed database setup.

Self-review covered all 15 existing-file task diffs and the full new 41 packet.
The five canonical edits were checked against pre-edit snapshots: exact planned
insertions, all prior content preserved. Other diffs were scoped additions plus
the checker extension; no export/classroom DTO or operation was changed. The
new file matched authored content plus the three reviewed clarifications. Primary
Supabase RLS/functions and PostgreSQL row-security sources are cited in 41 §7;
they are not deployed-version, role-grant, security or legal evidence.

```text
TASK_STATUS: REVIEW_PENDING — CR-00 artifact prepared
RISK: HIGH — canonical privacy/access and transaction preparation
ACCEPTANCE_CRITERIA_RESULT: CR-A1–A4 PASS as documentation/coverage only
FILES_CHANGED: one new packet + fifteen existing files listed in allowed scope
VERIFICATION_STATUS: PASS scoped checks; SQL/RLS/HTTP/device/restore NOT_RUN
REVIEW_STATUS: self-review complete; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; no execution, integration or publication authority
KNOWN_LIMITATIONS: TX-01–24 NOT_RUN; six SQ gates OPEN; no runnable SQL harness
UNRESOLVED_ISSUES: Task tombstone and trusted identity bridge, exact role grants,
  isolated target/tooling, eligibility/retention/access policy and review evidence
SECURITY_NOTES: document coverage does not evaluate access predicates or prove
  safe function execution, pool isolation, foreign-key privacy or actual RLS
ESCALATION_REQUIRED: owner-reserved policy/spend/review and exact isolated-run
  authority before affected action; no agent, install or service started
RECOMMENDED_NEXT_ACTION: freeze private Task tombstone/identity bridge and scoped
  SQL file/runner specification for review; retain current no-execution boundary
```

### September 30 classroom wire/data and transaction-test packet — CW-00

- Outcome: executable draft JSON DTO schemas, matching OpenAPI, relational
  constraints/transaction protocol and isolated-test specification for 39's subset.
- Authority: owner requested API/data schemas and transaction-test plan after
  CL-00. Documentation/contract checks only; app/backend/SQL execution excluded.
- Risk HIGH: membership, sharing/withdrawal and cross-owner durable writes;
  independent review PENDING before acceptance/integration. Work alone.
- Read: AI rules/execution/DoD/map/guardrails/task template; 39 and 01's classroom
  amendment; canonical Security §6, API §§20–21, Database §§17–18; existing
  draft schema/OpenAPI and checker patterns. Task types/storage and package/dirty
  state refreshed; no test script or implemented classroom backend inferred.
- Allowed: new revision 40, contracts/classroom.schema.json,
  contracts/classroom.openapi.json, contracts/classroom-transaction-tests.json,
  check-classroom-contracts.mjs; existing revision 00/07/09/18/39/README,
  docs/DOCUMENTATION_MAP.md and CHANGELOG.md. No source/config/lockfile changes.
- CW-A1: strict per-operation request/response schemas and complete route/ref
  mapping; no owner/role/private-resource fields admitted into share payloads.
- CW-A2: relational identity/uniqueness, authorization/retry/withdrawal ordering
  and separate server/device commits stated; remaining policy gates not invented.
- CW-A3: runnable local DTO/structure fixtures plus explicit NOT_RUN isolated
  transaction cases with interleaving/failure oracles; no simulated SQL pass.
- CW-A4: documentation links/checks and full scoped diff/source preservation;
  no new package, live DB, credentials, paid service, agent, commit or deployment.
- Verify: existing Node/Ajv local checker, check-docs, packet negatives, whitespace
  and hashes. Rollback is scoped document edits only. Missing legal/retention,
  operational configuration or independent review blocks activation, not drafting.
- Evidence completed September 30: CW-A1–A4 PASS for the bounded documentation,
  DTO and test-specification artifact only; classroom runtime/security NOT_RUN.

Self-review clarified acceptance recovery: because CW-20 selects by command ID,
accept commands additionally need actor/operation/command uniqueness across
assignments; TX-10 now covers a conflicting cross-assignment reuse before private
receipt recovery. Feedback row identity/version mapping is explicit. Strengthened
test-packet validation to reject unknown fields, non-string or blank oracles;
none of these assertions substitutes for database constraints or independent review.

Actual environment: PowerShell, Node v24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`,
existing Ajv 6.15.0. `node` below abbreviates that installed path; no install.

| Check | Actual result and boundary |
| --- | --- |
| `node docs/revision/check-classroom-contracts.mjs` | PASS: 22 operations, 57 definitions, 136 DTO fixtures including 97 rejected cases, 363 references, 12 negative packet mutations; 24 transaction scenarios specified, zero run |
| `node docs/revision/check-docs.mjs` | PASS: 45 revision, 19 canonical, seven governance/entry files, 721 local links, 80 requirement families; does not prove feature completion |
| `node --check docs/revision/check-classroom-contracts.mjs` | PASS: checker syntax only |
| `git diff --check` | PASS: existing LF/CRLF warnings, no Git configuration changes |
| Read-only inline Node whitespace/conflict scan | PASS on all 13 scoped files, including five new files; no trailing whitespace or merge markers |
| Source/config preservation | Home/theme SHA256 still match the baseline below; only those two pre-existing source diffs, no package/lockfile diff |

Home SHA256: `33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1`.
Theme SHA256: `8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`.
Task types/storage re-inspected; ownerless best-effort JSON behavior unchanged.
Reviewed the new document/schema/API/scenario/checker contents and scoped routing
additions. Earlier dirty documents/source/artifacts preserved. OpenAPI checking
is selected structure/reference verification, not a full OpenAPI metaschema or
generated-client compatibility certification. No app lint/typecheck, HTTP, SQL,
RLS, device, real-provider, migration or legal verification performed.

```text
TASK_STATUS: REVIEW_PENDING — CW-00 draft deliverable prepared
RISK: HIGH — cross-owner classroom privacy and durable transaction design
ACCEPTANCE_CRITERIA_RESULT: CW-A1–A4 PASS for documentation/contract checks only
FILES_CHANGED: five new + eight existing scoped files listed above
VERIFICATION_STATUS: PASS scoped document/DTO checks; runtime/security NOT_RUN
REVIEW_STATUS: self-review complete; qualified independent review PENDING
RELEASE_STATUS: NOT_READY; no classroom deployment or implementation acceptance
KNOWN_LIMITATIONS: TX-01–24 NOT_RUN; no executable SQL/RLS/mobile adapter
UNRESOLVED_ISSUES: exact eligibility/retention, operational configuration,
  canonical reconciliation, isolated DB proofs and independent acceptance
SECURITY_NOTES: unknown/private fields rejected by DTO fixtures, not proof of
  trusted-boundary enforcement, safe token custody or race-free authorization
ESCALATION_REQUIRED: qualified review and owner-reserved policy facts before
  affected implementation/activation; no agent or review auto-dispatched
RECOMMENDED_NEXT_ACTION: bounded canonical/data-privilege reconciliation and
  isolated SQL-test preparation after prerequisite/policy review; no live SQL
```

### September 29 bounded classroom contract preparation — CL-00

- Outcome: turn the admitted classroom subset into a concrete solo implementation
  preparation packet: ownership/payload/state/retry boundaries, ordered cards,
  synthetic acceptance cases and explicit remaining gates.
- Phase: documentation only after RS-02; exact owner amendment in 01 confirmed
  placement and delegated ordinary specification, not app/schema/deploy work.
- Risk HIGH: learner privacy, membership, cross-class access, durable task creation
  and withdrawal. Design is DRAFT / REVIEW_PENDING; independent qualified review
  required before acceptance/integration, no additional agent authorized.
- Read: mandatory AI/execution/DoD/map/guardrail/task instructions; 01 September
  29 amendment, 11 §§1–12, 04 §§1–10, 15 §§1–2, 28 §§1–2; canonical Security §6,
  API §§20–21, Database §§17–18, Data Model §7; current playbook dependencies.
- Inspected: task-types/task-storage in full; tabs layout and Plan My Day source;
  package scripts and dirty work. Owner Home/theme edits preserved. Source search
  found no cohort/assignment/submission/Supabase implementation in src. Initial
  search named nonexistent root app directory; corrected to actual src/app.
- Allowed: new revision 39; existing revision 00/07/09/11/18/README,
  docs/DOCUMENTATION_MAP.md and docs/CHANGELOG.md. No canonical security/schema
  policy rewrite, executable app/test code, dependency installation or SQL execution.
- Non-goals: full LMS/web classroom, supplied materials, file sharing, chat,
  grading, prices/legal rulings, real users/minors, paid services or production.
- CL-A1: admitted subset has explicit private-versus-class data boundaries and
  authority/source baseline; no policy approval inferred from draft design.
- CL-A2: lifecycle, exact share allowlist and mutation retry/revocation ordering
  cover duplicates, offline/account switch, stale revision and withdrawal.
- CL-A3: ordered bounded cards name candidate file seams, dependencies, evidence
  and stop conditions; acceptance scenarios are marked NOT_RUN, never simulated
  RLS/device success. Canonical reconciliation destinations are explicit.
- CL-A4: current official primary-source checks distinguished from product design;
  links/fences/card/test IDs/whitespace and source preservation checked locally.
- Verification plan: installed Node check-docs; inline read-only packet coverage
  assertions; exact scoped text review including new files; git diff --check and
  source/config fingerprints. No additional checker dependency required.
- Recovery: document-only additions, preserve existing work. Stop affected build
  on missing eligibility/retention/review; safe draft preparation can continue.
- Evidence completed September 30 (task started September 29): CL-A1–A4 PASS
  for the scoped document artifact. New 39 reviewed in full; all eight existing
  file deltas inspected against pre-edit text, including untracked files. Found
  and corrected archive/read wording so privacy controls remain available, and
  made fresh re-sharing after withdrawal explicit without restoring old content.
- `C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
  docs/revision/check-docs.mjs`: PASS; 44 revision Markdown, 19 canonical,
  7 governance/entry files, 708 local links, 80 families; ADR totals still 2/9/1.
- Inline read-only Node assertions: CL-01–08 and CT-01–24 exact ordered unique
  table rows, all CT status cells NOT_RUN, G1–G6 present, key boundary clauses
  present, no trailing whitespace across all nine affected files. These are
  structural/prose assertions, not domain behavior tests or RLS proof.
- `git diff --check`: exit 0 with existing LF/CRLF warnings. Before/after
  SHA256 matches for Home/theme owner edits, Task types/storage, focus engine,
  package.json and package-lock.json. No source/config/lockfile changed.
- Primary-source research: current Supabase RLS/Edge auth and OWASP authorization
  guidance reviewed; narrow findings and URLs in 39 §9. No legal research
  conclusion, live provider settings or security certification inferred.
- VERIFICATION_STATUS: PASS for document structure/scoped self-review;
  TASK_STATUS/REVIEW_STATUS: REVIEW_PENDING for HIGH design acceptance;
  runtime/security/native/provider/production NOT_RUN, RELEASE_STATUS NOT_READY.
  No extra agent, install, paid provisioning, commit/push or deployment.
- Next dependency-safe preparation: precise classroom wire/validation and isolated
  transaction-test packet, then canonical reconciliation under qualified review.
  Owner input remains for legal/retention facts, any price/spend and required
  independent review; ordinary design drafting need not re-ask V1 placement.

### September 29 classroom placement and deadline amendment — RS-02

- Outcome: record the owner's bounded classroom-sharing V1 selection and
  January-first feature-deferral policy, preserving full productivity web later.
- Phase/deliverable: documentation only. Source: the owner's explicit classroom
  reply, preceding option B/delegation reply, and September 29 instruction to
  reconcile documents. No app implementation or new research conclusion.
- Risk: HIGH scope interpretation involving learner sharing. Placement approval
  is not approval of a security design; independent qualified review remains
  PENDING before affected contracts are accepted/integrated. Solo author only.
- Read: AI rules, execution policy, DoD, map, guardrails and task template;
  01 approval history/DF-047/ADR-006–007, V1 scope introduction/rules,
  implementation plan introduction, POST_V1 boundary, 11 §§1–12, 12 §§1–3,
  32 release envelope/map/lanes/gates, and current summaries in 00/07/18/README.
- Baseline: existing dirty canonical/revision docs and owner source edits
  preserved; package scripts inspected (no test script); focus-engine source
  sampled and three source fingerprints recorded. No install or native run.
- Allowed files: docs/V1_FEATURE_SCOPE.md, docs/V1_IMPLEMENTATION_PLAN.md,
  docs/CHANGELOG.md; revision 00, 01, 07, 09, 11, 12, 18, 32 and README.
  Expanded after targeted stale-clause discovery to revision 03 §7 and 08 §§1–3;
  these contain active classroom-later summaries, not additional feature scope.
- Non-goals: full LMS, general chat, file sharing/upload permission, new security
  defaults, real-minor pilot, app/schema/config edits, paid services, publication.
- RS2-A1: current scope agrees on private invitations, work instructions/deadline,
  explicit add-to-private-plan, selected completion/progress sharing and feedback;
  private timetable/notes/full focus history remain inaccessible to educators.
- RS2-A2: January 1 priority and conditional feature deferral are recorded, with
  explicit revised scope/impact evidence, no safety waiver or already-selected cuts.
- RS2-A3: full productivity web remains later; Website/Portal remain required;
  old dated decisions retained as history, not current contradictory instructions.
- RS2-A4: ordinary design/specification delegated; spending/prices/legal facts
  and required independent review return to owner; no blanket ADR acceptance.
- Verification planned: check-docs.mjs, scoped stale-clause/semantic review,
  whitespace checks including untracked docs, source fingerprints and exact
  in-memory before/after diff. Runtime/classroom/security tests NOT_RUN.
- Recovery: reversible document edits only; no data migration. Stop on scope or
  authority conflict. Next dependency-safe work: bounded classroom contract/task
  preparation after core/auth/ownership prerequisites, not immediate code changes.
- RS2-A1–A4: PASS for scope-record/semantic consistency only. Reviewed the exact
  task delta for all 14 changed files using pre-edit text snapshots (including
  untracked docs); the initial brief was separately reviewed. Remaining
  classroom-later matches are labelled September 25 history or genuinely broader
  future features, not active blanket exclusions.
- `C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe
  docs/revision/check-docs.mjs`: PASS; 43 revision Markdown files, 19 canonical,
  7 governance/entry, 696 local links, all 80 requirement families; ADR counts
  unchanged at 2 APPROVED / 9 PARTIAL / 1 OPEN. No checker weakened or modified.
- `git diff --check`: exit 0; existing LF/CRLF warnings retained. Scoped in-memory
  whitespace check includes all 14 changed files: no trailing whitespace.
  `Get-FileHash` before/after matches for owner Home and theme edits and the
  focus engine (same fingerprints as CR-03I below); app code was not changed.
- VERIFICATION_STATUS: PASS for document structure and scoped semantic checks;
  runtime/classroom/native/security/legal/production tests NOT_RUN. Unrelated
  contract suites were not rerun for this prose-only placement amendment.
- TASK_STATUS: REVIEW_PENDING for consequential classroom contract acceptance;
  requested approval-record reconciliation written and self-reviewed. No claim
  of independent review, complete enterprise documentation or implementation.
- RELEASE_STATUS: NOT_READY. Exact classroom contracts and negative integration
  evidence, eligibility/retention facts and qualified review remain gates. No
  agents dispatched, paid service activated, commit/push or release performed.

### September 28 legacy source-to-migration inventory — CR-03I

Added 13 §7.1 within the existing core contract and linked it from 07/18. Its
bounded brief owns this HIGH documentation-only slice. All twelve current
FocusSession fields have a source meaning and a proposed migration disposition;
six MI-T refinements are specified, all migration behavior NOT_RUN. No destination
schema, ownerless-data rule, active-record recovery policy or retention value
was adopted. CF review/adoption and CR-03 implementation gates remain unchanged.

Fresh source inspection confirms the current active/history helpers merge several
error cases into null/empty results and filter history through a shallow predicate.
Those helpers are not a lossless migration inventory. No actual saved user file
was opened; filenames in the packet are only constants from the repository.

Actual diagnostic used installed Node 24.19.0 with `--input-type=module` and an
inline `node:assert/strict` probe importing the unchanged session-engine.ts.
One synthetic 25-minute session started at 0 was independently paused at 1,250
or 1,500 ms, then resumed at 2,000. JSON.stringify results were equal; both stored
focus 1 s/pause 0 s and projected focus 3 s at 3,000, whereas the event traces
contain 2,250 versus 2,500 focused ms. Exit 0/PASS means the loss was reproduced,
not correct timer behavior. Known MODULE_TYPELESS_PACKAGE_JSON warning retained;
no module-type/config change, native adapter or user-data access. The diagnostic
created no file and does not establish a migration or permanent test harness.

Actual checks: check-docs.mjs exit 0/PASS (43 revision Markdown, 19 canonical,
7 governance, 694 links, 80 families and unchanged ADR 2/9/1 before this entry).
Inline inventory asserted exact equality between the twelve actual type fields
and the twelve table rows, six MI-T01–06 entries and their NOT_RUN marker.
Scoped whitespace and engine/Home/theme fingerprint checks passed; tracked
git diff --check passed with existing LF/CRLF warnings. Self-reviewed the complete
authored section and handoff patches, including untracked revision files.
The final document check after adding this entry also passed with the same counts;
no unrelated suite rerun.

Changed only revision 13/07/18/09 and docs/CHANGELOG.md. No source/test/config/
package/SQL/provider edits, real data migration, new agent, spending, commit,
push or deployment. Existing dirty Home/theme and other work preserved.

```text
TASK_STATUS: REVIEW_PENDING — source inventory and migration proposal saved
RISK: HIGH — historical integrity, ownerless data and recovery
ACCEPTANCE_CRITERIA_RESULT: MI-A1–04 PASS for documentation/source inventory only
VERIFICATION_STATUS: PASS scoped docs and synthetic precision-loss reproduction
REVIEW_STATUS: Author self-review; independent qualified review PENDING
RELEASE_STATUS: NOT_READY
KNOWN_LIMITATIONS: No admitted schema/importer, raw I/O, crash or migration tests
UNRESOLVED_ISSUES: Ownerless-data and active-session policy, destination validation,
  snapshot/write exclusion, retained-source protection and recovery evidence
SECURITY_NOTES: No private history loaded; local timing is not trusted server credit
ESCALATION_REQUIRED: Independent review/adoption and exact isolated-test authority
  before migration implementation; no automatic reviewer dispatched
RECOMMENDED_NEXT_ACTION: Review this inventory with CF-02/04/05 before defining
  the exact versioned repository/import contract; keep originals untouched
```

### September 28 approved-direction drift reconciliation — AD-01

Task brief: remove stale current-summary claims that already answered choices
are still undecided. Documentation-only continuation while the owner is away;
not approval of the pending core CF packet or authority to implement code. MEDIUM,
because misleading scope summaries could cause wrong implementation, but this
slice adds no policy/permission or runtime behavior. Existing HIGH designs keep
their independent-review gates. Work alone, no reviewer/agent dispatched.

Read: mandatory AI/execution/DoD/guardrails/map/task template; 01's confirmed
constraints, ADR rows and September 15/25/26 amendments; canonical V1 scope's
September boundary/resource rule; 32 release envelope/gates; affected current
paragraphs in 00/07/11/20 and this coverage table. Refreshed dirty state/package
scripts and inspected current settings storage: it still only stores break
duration, so selected languages are not implemented localization evidence.

Allowed files: docs/revision/00-OWNER-REVIEW-SI.md,
07-LUNA-IMPLEMENTATION-PLAYBOOK.md, 11-SRI-LANKA-EDUCATION-CONTRACTS.md,
20-SETTINGS-PROGRESS-AND-UNITS.md, 32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md,
this 09-COVERAGE-AND-AUDIT.md, and docs/CHANGELOG.md. No new files, source,
schema, register/approval change, packages, provider, secret, upload or spending.
Preserve historical dated approvals; correct active summaries rather than erase
history. Recover from an incorrect edit by correcting its scoped prose only.

Acceptance: AD-A1 no current selected teacher/locale/resource-family direction
described as wholly undecided; AD-A2 separate 15+ target, selected stack and
formats from legal/configuration/limit/native QA gates; AD-A3 owner entry point
routes current core review/harness without declaring implementation; AD-A4 docs,
targeted stale-clause and scoped whitespace checks pass. These checks verify
only selected summaries, not every sentence of the whole documentation set.
Actual verification: all fifteen existing `docs/revision/check-*.mjs` scripts
ran with installed Node 24.19.0 via a bounded inline spawnSync runner; every
script returned exit 0 and JSON status PASS. The document checker counted 43
revision Markdown files, 19 canonical and 7 governance files, 694 local links,
80 requirement families and unchanged ADR counts 2 APPROVED / 9 PARTIAL / 1 OPEN.
These are document/reference checks, not fifteen application test suites.

An inline node:assert/strict check verified the corrected current-status wording,
links to the core/harness entry point, independent-teacher case routing and zero
trailing whitespace in all seven changed documents. Engine/Home/theme hashes
matched the earlier checkpoints. `git diff --check` passed with existing LF/CRLF
warnings. Self-reviewed the complete authored patches including untracked files
against the dated approvals; dated historical entries remain unchanged. Initial
discovery used an invalid PowerShell glob path and two guessed filenames; those
lookups were corrected using actual paths and are not evidence of missing features.

The education test introduction now distinguishes later cohort cases from initial
personal-teacher tests R-T02/03/16 and shared privacy/offline cases. This prevents
the future classroom table from being mistaken for mandatory January services;
it does not waive applicable tests. No legal advice or refreshed legal research,
app/runtime/device/native test, source fix, install or external review performed.

```text
TASK_STATUS: VERIFIED — bounded documentation reconciliation only
RISK: MEDIUM — current-summary accuracy; no new scope or security policy
ACCEPTANCE_CRITERIA_RESULT: AD-A1–04 PASS for the selected paragraphs
VERIFICATION_STATUS: PASS document/reference and targeted wording checks
REVIEW_STATUS: Author self-review; surrounding HIGH contracts still REVIEW_PENDING
RELEASE_STATUS: NOT_READY
KNOWN_LIMITATIONS: Not an exhaustive semantic audit of all historical documents
UNRESOLVED_ISSUES: Core independent review/adoption, exact policy/configuration and QA
SECURITY_NOTES: Desired age and format selections do not establish legal/native safety
ESCALATION_REQUIRED: Existing independent review and exact owner decisions before
  affected canonical adoption or implementation; no new reviewer dispatched
RECOMMENDED_NEXT_ACTION: Resolve the core review packet when review is available;
  remaining safe documentation must preserve these recorded approval boundaries
```

### September 28 seven-choice review submission — CR-02R

At the owner's request, prepared [13 §12.E](13-CORE-RELIABILITY-CONTRACTS.md)'s
bounded review/reconciliation packet. Seven CF decisions now have a specific
review question, affected canonical destination and explicit pending disposition.
The packet separates owner product/adoption choices from technical correctness,
specifies exact-diff/hash review evidence, and retains the no-agent instruction.
No independent reviewer was dispatched or sign-off invented.

Author review found that §4's previously unqualified completion formula could
move the end to a later resume time despite §12.C's retained cutoff. Clarified
both sections: validated original cutoff wins; without one, the active anchor
must establish the first target crossing, otherwise recover. Also made explicit
that TimingV2 is not a complete record/validator and that a live pause projection
must not replace pre-cutoff paused time in completed history. These are proposed
contract corrections, not application fixes or accepted migration semantics.

Changed only 13, 07, 18, this audit and CHANGELOG; no new document. Source/dirty
state, scripts and relevant canonical sections were re-inspected at HEAD a6a481e.
Canonical seconds, ADR counts and unrelated Home/theme edits remain unchanged.
No app/test source, package/config/provider edits, installations, uploads, spending,
commits or deployment. The bounded brief and CR-R01–04 acceptance are in 13 §12.E.

Actual verification: installed Node 24.19.0 at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`
ran `docs/revision/check-docs.mjs`, exit 0/PASS: 43 revision Markdown files,
19 canonical, 7 governance, 690 local links, 80 families and unchanged ADR 2/9/1.
An inline node:assert/strict check confirmed exactly seven review rows, pending
authority markers and cutoff/context wording, plus zero trailing whitespace in
all five changed files. Numeric assertions confirmed the counterexample's retained
1,500,000 versus incorrect resumed-anchor 1,650,000 end; this is arithmetic,
not an engine test. Engine/Home/theme SHA-256 matched prior recorded fingerprints.
Tracked `git diff --check` passed with existing LF/CRLF warnings. Author reviewed
the full task additions and changed clauses including untracked revision files.
No other suite was rerun for this prose-only slice. Runtime, migration,
component/device and independent review remain NOT_RUN/PENDING.

```text
TASK_STATUS: REVIEW_PENDING — review submission prepared, not accepted
RISK: HIGH — proposed timing/history and recovery semantics
ACCEPTANCE_CRITERIA_RESULT: CR-R01–04 PASS for the scoped documentation artifact
VERIFICATION_STATUS: PASS scoped documentation/arithmetic only; runtime NOT_RUN
REVIEW_STATUS: Author self-review only; independent qualified review PENDING
RELEASE_STATUS: NOT_READY
KNOWN_LIMITATIONS: No admitted enclosing schema/validator, migration or clock proof
UNRESOLVED_ISSUES: Per-choice review, exact owner adoption and implementation authority
SECURITY_NOTES: No trusted attention/clock claims or private record processing
ESCALATION_REQUIRED: Owner-arranged independent technical review; no automatic agent
RECOMMENDED_NEXT_ACTION: Review 13 §12.E, resolve findings and record exact adoption
  before the mapped canonical rewrite or V2 implementation
```

### September 28 renderer compatibility and engine decision preparation

Continued two connected documentation slices in existing documents rather than
adding implementation files. Their bounded briefs are [38 §6](38-TEST-HARNESS-ADMISSION-PLAN.md)
(L-02B, MEDIUM metadata preparation) and [13 §12](13-CORE-RELIABILITY-CONTRACTS.md)
(CR-02F, HIGH timing/persistence design). Updated 07/18 and CHANGELOG; no owner
ADR status, canonical timing units or production policy changed.

Exact public registry metadata exposed the inspected test-renderer 1.3.0 →
react-reconciler 0.34.0 → React ^19.3.0 mismatch with app React 19.2.3. Narrowed
an exact 1.2.0 renderer candidate using the inspected 0.33.0 reconciler peer;
five installed-semver assertions passed. No solver/install, peer override,
tarball execution or actual component compatibility claim. All five component
admission checks remain NOT_RUN; optional server peers still require resolution.

The core packet records CF-01–07 proposed decisions and CF-X01–08 oracles,
separates typed projection failures from zero time/success, and adds a proposed
V2 completionCutoff snapshot so late pause/resume does not discard the original
target instant. Explicitly retained version/schema, source-preserving migration,
durable-transaction, clock and caller-review gates. Read-only arithmetic assertions
passed for short pauses, exact threshold, late callback and the cutoff example;
these calculate specification examples, not actual engine/persistence behavior.

Actual verification: all fifteen existing check-*.mjs document/reference scripts
returned exit 0/PASS before the final prose refinements. After those edits,
check-docs.mjs passed: 43 revision Markdown files, 19 canonical, 7 governance,
689 local links and 80 families; ADR counts remain 2/9/1. An inline inventory
check passed for seven CF decisions/eight CF-X fixtures and zero trailing
whitespace across all six changed documents. Home/theme fingerprints matched
the earlier checkpoint. Tracked git diff --check passed with existing LF/CRLF
warnings. These are structural/arithmetic checks, not runtime tests. No app
typecheck/lint, installed component suite, native/device run or independent review
was performed. Earlier three-pass/five-gap engine evidence remains historical;
this batch neither reran that diagnostic nor fixed its failures.

Self-reviewed the authored additions and affected handoff text for unit boundaries,
proposal/approval distinctions, cutoff preservation and error-side-effect rules.
Existing unrelated dirty work is preserved. No additional agents, app/package/
configuration edits, real user-file processing, uploads, purchases or deployment.

```text
TASK_STATUS: REVIEW_PENDING — connected documentation preparation saved
RISK: HIGH overall; renderer metadata subtask MEDIUM
ACCEPTANCE_CRITERIA_RESULT: Draft choices, numeric oracles and admission gates recorded
VERIFICATION_STATUS: Document/reference checks and arithmetic only; runtime NOT_RUN
REVIEW_STATUS: Author self-review; independent qualified timing/persistence review PENDING
RELEASE_STATUS: NOT_READY; no implementation or dependency adoption
KNOWN_LIMITATIONS: No resolved component lock/smoke suite, admitted V2 schema or migration
UNRESOLVED_ISSUES: CF adoption, shared duration policy, exact harness authority and review
SECURITY_NOTES: Public metadata/synthetic arithmetic only; no trusted client timing claims
ESCALATION_REQUIRED: Independent HIGH review before acceptance/integration; bounded
  implementation/install authority before changing tests, packages or application
RECOMMENDED_NEXT_ACTION: Review the collected CF choices and no-install L-02A proposal;
  preserve foundation order and keep viewer integration on its separate HOLD
```

### September 28 test-harness admission proposal — L-02A documentation

Completed revision 38 after the owner interrupted the research and later resumed.
Its task brief owns scope/read references. Saved exact proposed two-file Node
domain boundary and commands, eight NOT_RUN harness acceptance cases, a separate
component candidate inventory, review/install gates and native evidence limits.
Reconciled revision 07/13/18/README, documentation map and CHANGELOG; this entry
records completion of the document, not creation of tests or admission of tooling.

Before interruption: official Node 24.19.0 TypeScript/test-runner, Expo unit-test
and RNTL 14 sources were read. Installed/lock and Expo recommendations inspected;
public registry access first failed under sandbox, then approved read-only access
returned exact metadata. Optional react-server-dom-webpack peer mismatch is
distinguished from a mandatory client-suite requirement. No complete dependency
resolution, integrity/license/advisory audit or component compatibility proof.

Actual read-only probes, preserved in 38 section 5: Node eval importing the actual
engine and asserting full-duration completion/projection returned one PASS/exit 0
with MODULE_TYPELESS_PACKAGE_JSON warning. Separate node:test eval using
assert.equal(1,2) returned expected exit 1/ERR_ASSERTION. Existing baseline
diagnostic returned exit 1, three PASS/five CONTRACT_GAP, not an execution error.
No test file or lasting intentionally broken fixture was created. On resume,
engine/Home/theme hashes matched earlier values and no partial 38 existed.

Resume verification: installed Node ran `docs/revision/check-docs.mjs`, PASS
(43 revision Markdown, 19 canonical/seven governance files, 686 local links,
80 families, 12 ADRs still 2/9/1). `git diff --check` PASS with existing newline
notices. Read-only inline Node assertion PASS: TH-T01–08 exactly once/in order,
all NOT_RUN, no trailing whitespace, proposed domain files and Jest config absent.
Self-reviewed the entire new file and all authored reconciliation patches. No
source/package/config changes, new agents, installs, paid runs, commits or deploys.

```text
TASK_STATUS: VERIFIED — researched document proposal, not adopted harness
RISK: MEDIUM — scoped reversible tooling design; no production data controls changed
ACCEPTANCE_CRITERIA_RESULT: Exact first-slice boundary, commands, red-baseline rules
  and separate component/native gates documented; structural checks PASS
VERIFICATION_STATUS: Document checks PASS; retained probes limited to stated scope
REVIEW_STATUS: Author self-review complete; targeted tooling review before adoption;
  existing HIGH design independent review PENDING
RELEASE_STATUS: NOT_READY; domain file suite and component/native tests NOT_RUN
KNOWN_LIMITATIONS: Five engine gaps remain; eval probes are not the implemented suite
UNRESOLVED_ISSUES: Test-file adoption authority, component dependency resolution,
  CR-02 exact result/precision/cutoff and caller scope
SECURITY_NOTES: Synthetic data/public metadata only; no real local resource or credential access
ESCALATION_REQUIRED: Bounded test-file authority before L-02A implementation;
  exact install/config approval and compatibility evidence before L-02B
RECOMMENDED_NEXT_ACTION: Review the no-install two-file proposal for later adoption;
  continue independent documentation while implementation authority remains unchanged
```

### September 28 foundation gap-to-caller handoff — CR-01B

Refreshed current engine/types/hook/storage/session-route source and package
scripts; searched `src` engine/projection callers. Added 13 §11's task brief,
five actual gap/oracle/boundary mappings, caller checklist and L-02 harness
proposal admission. Updated 07/18 and CHANGELOG. No new feature, policy approval,
file, dependency or app change; source home/theme hashes match the prior evidence.

Actual diagnostic command: installed Node at
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`
ran `docs/revision/inspect-core-baseline.mjs`, exit 1, Node v24.19.0/TS 6.0.3.
CR-T01/03/07 PASS; CR-T02/04/05/06/08 CONTRACT_GAP, not harness errors or new
regressions. Full timestamp/source fingerprint and expected/actual mapping are
in 13 §11. This did not execute caller, storage, native, provider or reward tests.

`docs/revision/check-docs.mjs` PASS before this audit entry: 42 revision Markdown,
19 canonical/seven governance, 680 local links, unchanged 80 families, 12 ADRs
(2 APPROVED / 9 PARTIAL / 1 OPEN), six CR cards/20 cases/eight diagnostic cases.
Tracked `git diff --check` PASS with existing LF/CRLF notices. Reviewed complete
authored additions including untracked revision files; no app assertions altered
to hide baseline failures. No type/lint or new research was necessary for this
source-grounded annotation; earlier platform sources were not freshly reverified.

```text
TASK_STATUS: VERIFIED — bounded diagnostic/handoff documentation only
RISK: MEDIUM — reversible evidence annotation, no new security/persistence policy
ACCEPTANCE_CRITERIA_RESULT: Five gaps mapped; positive regressions and caller gates explicit
VERIFICATION_STATUS: Document checks PASS; pure diagnostic reproduces five failures
REVIEW_STATUS: Author self-review complete; surrounding HIGH design review PENDING
RELEASE_STATUS: NOT_READY; engine gaps unfixed, caller/native tests NOT_RUN
KNOWN_LIMITATIONS: Eight synthetic pure-engine checks are not an app test suite
UNRESOLVED_ISSUES: L-02 exact harness; CR-02 result/precision/cutoff and caller scope
SECURITY_NOTES: No private storage read or migration; unrelated edits preserved
ESCALATION_REQUIRED: Exact tooling and affected contract authority before implementation;
  HIGH storage/ownership work still needs independent qualified review
RECOMMENDED_NEXT_ACTION: Prepare L-02's bounded harness proposal using 13 section 11.C
```

### September 28 viewer permission/containment specification — RV-02B

Added [37](37-VIEWER-PERMISSIONS-AND-CONTAINMENT.md), following RV-02's HOLD
disposition. Its task brief owns this HIGH, documentation-only slice. Scoped the
viewer permission delta without removing unrelated app permissions; separated
Android isolated-worker feasibility from unproven iOS parity; distinguished UI
exit, native reader quiescence and temporary-file cleanup. Proposed per-open
owner/revision leases, honest CLOSE_PENDING quarantine and six PC-T scenarios
refining existing RV tests. No numeric policy, package or implementation approved.

Consulted official Android service, PdfRenderer, app-specific storage and parcel
descriptor documentation. Apple PDFDocument's opened page remained script-gated;
no cancellation/isolation guarantee inferred. Sources and proposal boundaries are
linked in 37. This research is not proof of the proposed architecture on devices.

Changed: new 37; revision 00/09/18/36/README; DOCUMENTATION_MAP and CHANGELOG.
Reviewed the authored document and reconciliation patches. Actual checks before
this audit entry: installed Node `docs/revision/check-docs.mjs` PASS (42 revision,
19 canonical, seven governance files, 677 local links, 80 requirement families,
12 ADRs still 2 APPROVED / 9 PARTIAL / 1 OPEN); `git diff --check` PASS with existing
LF/CRLF notices. Inline read-only check confirmed PC-T01–06 exactly once/in order,
all NOT_RUN, and no trailing whitespace in 37. Home/theme SHA-256 fingerprints
unchanged. No source/config/install/build, uploads, spending or additional agents.

```text
TASK_STATUS: REVIEW_PENDING — bounded specification drafted; implementation HOLD
RISK: HIGH — private files, untrusted native parsing and revocation semantics
ACCEPTANCE_CRITERIA_RESULT: Document-scope criteria covered; not runtime acceptance
VERIFICATION_STATUS: Document structure/scenario inventory PASS; native NOT_RUN
REVIEW_STATUS: Author self-review complete; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; six PC-T scenarios remain NOT_RUN
KNOWN_LIMITATIONS: No tested containment, abort, accessibility or cleanup guarantee
UNRESOLVED_ISSUES: Platform path, OS floor, limits, backup/key policy and dependency audit
SECURITY_NOTES: No real resource data processed; proposal does not certify security
ESCALATION_REQUIRED: Qualified platform/security review before acceptance/integration;
  exact install/build authorization before RV-03's isolated harness
RECOMMENDED_NEXT_ACTION: Review the platform/containment questions in 37 section 7;
  unrelated dependency-safe documentation may continue without admitting the viewer
```

### September 28 pinned viewer source investigation — RV-02

Continued the September 26 task brief in 36 §7 after the public-metadata command
was interrupted by an approval-service usage limit. Refreshed dirty state and
resumed the same approved read-only network path; no approval bypass. The earlier
exact PDF-plugin 14.0.3 registry request returned version-not-found. The later
registry lookup resolved published 14.0.2 for both plugins; no install attempted.

Evidence: approved PowerShell public registry/tag/commit-source reads; own Node
24.19.0 in-memory fetch + SHA-512 + gunzip/tar-byte inspection. Four exact archives
match registry integrity; eight selected viewer files match commit
`5aa68703ee8d931d829bac223d47e62c645011a3`. Archive sizes, integrity strings, exact
versions, source URLs and file coverage are in 36 §7. No archive extracted to disk,
third-party module imported, lifecycle script executed or signature verified.
First Node attempt failed at CommonJS top-level await before requests; enclosing
the audit in an async function corrected this diagnostic-script error. The rerun
exited 0. This is not an application bug or runtime PDF test.

Reviewed packaged plugin configuration, pinned loader and Android/iOS excerpts;
five source findings recorded with explicit inference/unknown boundaries. Broad
plugin permissions, containment and owner-safe cleanup prevent admitting the tuple.
Older upstream issue 997 is an unverified triage lead, not a proven current CVE.
Full transitive native/JS advisory/license and platform evidence are incomplete.

Files changed: 36 research/brief/results; 00 owner status; 18 readiness; this audit;
CHANGELOG. No product approval, requirement count, source/config/lock or test-matrix
status changed. Scoped semantic self-review completed; independent review PENDING.
Actual document checks: installed Node `docs/revision/check-docs.mjs` PASS (41
revision Markdown files, 669 links, unchanged 80 requirements and 2/9/1 ADR counts);
`git diff --check` PASS with existing LF/CRLF warnings. Read-only inline Node check
confirmed RV-T01–12 exactly once/in order, all NOT_RUN, no trailing whitespace in
36. Home/theme SHA-256 values still match the RV-01 checkpoint below. Reviewed
the added §7 and all four summary/evidence patches for authority and claim limits.

```text
TASK_STATUS: REVIEW_PENDING — bounded RV-02 research recorded; integration HOLD
RISK: HIGH — dependency/privacy/native parsing assessment
ACCEPTANCE_CRITERIA_RESULT: RV2-A1 identity PASS; RV2-A2 scoped observations/limits
  documented; RV2-A3 HOLD disposition recorded, not dependency/security acceptance
VERIFICATION_STATUS: Artifact-byte checks PASS; runtime/security NOT_RUN
REVIEW_STATUS: Self-review only; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; no native build or accepted viewer
KNOWN_LIMITATIONS: Full transitive source/license/advisory and two-platform tests absent
UNRESOLVED_ISSUES: Permissions, parser containment, cancellation/cache, policy values
SECURITY_NOTES: Only public package/source data; no real user files or credentials
ESCALATION_REQUIRED: Qualified review; exact install/build authority before a spike
RECOMMENDED_NEXT_ACTION: Bounded permission/containment feasibility specification
```

### September 26 viewer research and device-test plan — RV-01

Added revision 36 with inspected local lock/installed versions, primary-source
viewer/plugin/native-engine findings, proposed adapter boundary, isolated harness
admission and measurement plan, twelve RV-T procedures and bounded next cards.
Routed 00/18/35/README/map/changelog. No requirement family or approval changed.

Read official Expo SDK/development/architecture pages, upstream viewer package,
Android build and iOS podspec, Expo-community plugin metadata/table, Android
PdfRenderer/page-size guidance and Mozilla PDF.js. Links and factual limits are
in 36. Apple PDFView full content/Markdown access failed; no accessibility claim
was invented. Branch metadata is mutable; no released artifact pin, full native
dependency/license/advisory audit or security certification was completed.

Actual evidence on installed Node 24.19.0:

- `node docs/revision/check-docs.mjs`: PASS, 41 revision Markdown, 19 canonical,
  7 governance files, 669 local links; 80 families/12 ADRs, counts 2/9/1 unchanged.
- Read-only inline Node matrix check: rows matching `^\| RV-T\d{2} ` equal exactly
  RV-T01 through RV-T12 once/in order; every row ends `| NOT_RUN |`; no trailing
  whitespace in 36. PASS, zero native cases run. This is structural, not device QA.
- `git diff --check`: PASS; existing LF/CRLF warnings, no config change to hide them.
- Read the complete new document and reviewed all routing/changelog patch hunks.
  Source SHA-256 remains `33012D85E4F58678DF5C3986F93D7AAFE4068453C334758305C6B4D8302CCBE1`
  for Home and `8FC5FD02066E0A5E151F3877C08EA03AA8B9336C7A5FBB0AE399C8575168DAC8`
  for theme tokens. Existing unrelated dirty files preserved.

```text
TASK_STATUS: REVIEW_PENDING — research/test-plan artifact written
RISK: HIGH — private files, untrusted native parsing, proposed isolation controls
ACCEPTANCE_CRITERIA_RESULT: RV-A1–04 PASS for document content/structure only
VERIFICATION_STATUS: PASS scoped documentation; native/runtime/security NOT_RUN
REVIEW_STATUS: Author self-review complete; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; no selected/installed/built viewer
KNOWN_LIMITATIONS: Exact artifact and transitive audit, two-platform builds,
  accessibility, parser containment, measured limits and backup/key policy open
UNRESOLVED_ISSUES: No isolated harness/build/install authority or measured evidence
SECURITY_NOTES: No real files, secrets, uploads, paid runs or remote viewer used
ESCALATION_REQUIRED: Independent review before HIGH design acceptance/integration;
  exact candidate/environment authority before native spike, no automatic agent
RECOMMENDED_NEXT_ACTION: RV-02 read-only exact released-source/dependency audit
```

### September 26 later format/viewing approval reconciliation — RO-02

Recorded the owner's “හා” to the explained initial file types and in-app viewing.
Reconciled 01/12/18/34/35, owner overview, canonical V1 scope, map and changelog.
The RO-02 brief in 35 owns this bounded MEDIUM documentation-only slice. Earlier
RO-01/LR-00 evidence below remains historical, not the current approval state.

Approved: PDF/JPG/PNG, website/video links, book/page references and read-only
in-app PDF/image viewing. No blanket approval of numerical limits, static-only
PNG, encrypted-PDF policy, adapter/package, install or native spike. ADR totals
remain 2 APPROVED / 9 PARTIAL / 1 OPEN; LR cards remain DRAFT.

Actual checks: installed Node ran `docs/revision/check-docs.mjs` PASS (40 revision
Markdown files, 19 canonical and 7 governance files, 661 links, 80 requirements).
`git diff --check` PASS; existing LF/CRLF notices are warnings. Reviewed the exact
approval-reconciliation patches, including untracked revision documents; no source,
package or runtime changes made. These checks do not test native behavior.

Completion: approval record reconciled and structurally checked; self-review only.
Surrounding HIGH design remains REVIEW_PENDING, native tests NOT_RUN, release
NOT_READY. No spending, new agents or deployment. Next dependency-safe step is
read-only PDF-adapter investigation and a bounded test proposal; measured limits,
security/accessibility, backup/key policy and independent review remain gates.

### September 26 resource format/limit/viewer option sheet — RO-01

Added [35](35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md) at the owner's request
to prepare recommendations: references-only vs bounded documents/images vs broad
office/media; preferred PDF/JPEG/static PNG + references/links and local read-only
viewing; exact prototype byte/pixel/page/count/text/URL candidates and unresolved
production policy fields. Numerical proposals are assistant hypotheses, not
owner approvals, performance evidence, provider limits or cloud pricing tiers.
No ADR status was changed by this work.

Consulted official Expo SDK 56 Image, Apple PDFKit, Android PdfRenderer and OWASP
file-handling sources; source facts, design inferences and limitations are linked
in 35. Apple capability evidence uses its official indexed text because the opened
page required JavaScript. Recorded native integration/security/accessibility gates,
private cache/handoff implications, HEIC and scanned-page limitations, and no
automatic online viewer/upload fallback. No PDF wrapper/package was selected.

Actual evidence: fifteen `check-*.mjs` scripts all exited 0/PASS under installed
Node at `C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.
Checker syntax and tracked `git diff --check` passed (existing newline warnings);
new 35 inspected separately: 200 lines, zero trailing-whitespace lines. Document
inventory: 40 revision Markdown files, 19 canonical/7 governance, 80 families,
12 ADRs (2/9/1), eight RO probes specified and zero run. Existing wire counts and
ineligible plan-activation evidence unchanged. Checked binary-unit arithmetic:
25 MiB = 26,214,400 bytes, 10 MiB = 10,485,760 bytes; hypothetical full 24M-pixel
RGBA buffer = 91.552734375 MiB, not a measured device result.

Self-reviewed authored patches/new file for proposal/approval boundaries, unit
semantics and private-data fallbacks. Existing home/tokens hashes unchanged.
Changed paths: revision 00/09/12/18/34/README/check-docs.mjs, new 35;
docs/DOCUMENTATION_MAP.md and CHANGELOG.md. No app/package/native/SQL/provider
edits, files uploaded, purchase, extra agent, physical-device or legal test.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — untrusted parsing, private preview/cache and external file handoff
ACCEPTANCE_CRITERIA_RESULT: RO-A1–4 PASS for researched document scope
VERIFICATION_STATUS: PASS — fifteen document/reference checkers only
REVIEW_STATUS: Author self-review complete; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; RO-T01–08 remain NOT_RUN
KNOWN_LIMITATIONS: No chosen/tested PDF adapter, compatibility, memory/performance,
  parser isolation, actual accessibility or complete approved local-limit policy
UNRESOLVED_ISSUES: Owner format/viewer direction, native spike authority, measured
  limits and remaining local privacy/backup/key/retention policies
SECURITY_NOTES: No remote renderer/scanner or automatic external handoff admitted;
  compressed-byte bounds alone do not establish parser/decoded-memory safety
ESCALATION_REQUIRED: Owner product choice; independent review and authorized
  isolated native spike before adopting adapter or final production thresholds
RECOMMENDED_NEXT_ACTION: Obtain option-B direction (or owner changes), then prepare
  exact approved adapter/harness investigation without silently installing it
```

### September 26 local-resource preparation and owner clarification

Recorded desired 15+ product target and planned Sri Lanka company publisher in
01, retaining age assurance/consent and actual incorporation/merchant verification.
ADR-009/010 are now PARTIAL; current totals 2 APPROVED / 9 PARTIAL / 1 OPEN do not
indicate completion. Recorded resource-concept agreement without format approval,
and intended AWS Device Farm/friends' Android coverage without spending/run claims.
Reconciled active V1 scope/readiness/release-map summaries; dated older evidence
is retained and read with the newer explicit amendment.

Added [34](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md), refining R-01–04: local
reference/link/file distinction; immutable import/replace journal; owner/session
fences; interrupted publication/cancellation; quota/capacity accounting; exact
owned cleanup; task-deletion race recovery; explicit external viewer handoff;
local vs cloud deletion and native backup evidence. Five LR draft cards and
twenty LR-T NOT_RUN cases. Format/size/viewer/key/backup policy choices remain
open; no numeric defaults or migrations were silently approved.

Read SDK 56 DocumentPicker/FileSystem, Android backup and AWS remote-session
official sources, cited in 34/08. Inspected current task types/storage and package:
resource entities are absent, JSON writes remain best-effort and no test script
or DocumentPicker/SQLite/SecureStore dependency was added. No existing defect
was claimed fixed by writing the proposal.

Actual verification: all fifteen `check-*.mjs` scripts exited 0/PASS using
`C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.
`--check docs/revision/check-docs.mjs` exited 0. Document checker reports 39
revision Markdown files, 19 canonical and 7 governance/entry files, 80 register
and release-map families, 12 ADRs, five LR cards/twenty cases and zero LR runtime
executions. Other DTO/reference inventories unchanged; actual plan activation
still ineligible. `git diff --check` exited 0 with existing newline warnings;
new 34 checked separately with zero trailing-whitespace lines. Inspected full
authored patches/new file and targeted stale-status references; this is author
self-review, not independent review. Source home/tokens SHA256 values match the
prior recorded owner-edit fingerprints; no application or package edits this turn.

Changed: revision 00/01/08/09/12/18/32/README/check-docs.mjs, new 34;
docs/DOCUMENTATION_MAP.md, V1_FEATURE_SCOPE.md and CHANGELOG.md. Unrelated dirty
work preserved. No additional agents, installations, native app builds, real
user files, cloud runs, uploads, payments, legal certification or deployment.

```text
TASK_STATUS: REVIEW_PENDING
RISK: HIGH — local ownership, private bytes, persisted recovery/deletion rules
ACCEPTANCE_CRITERIA_RESULT: LR-A1–4 PASS for document scope; LR-T01–20 NOT_RUN
VERIFICATION_STATUS: PASS for fifteen document/reference checks, not app behavior
REVIEW_STATUS: Self-reviewed; independent qualified review PENDING
RELEASE_STATUS: NOT_READY; no admitted resource implementation or real device proof
KNOWN_LIMITATIONS: Exact local schema/commands, policy values/adapters/harness and
  Android/iOS backup/privacy evidence absent; desired 15+ is not legal clearance
UNRESOLVED_ISSUES: File formats/limits/viewer, keys/sign-out/guest rules, policy
  review and actual company/merchant facts; no fake values to close these gates
SECURITY_NOTES: Source files never deleted by import; owner-fenced late callbacks,
  no resource metadata in generic sync/AI/telemetry; external handoff is explicit
ESCALATION_REQUIRED: Independent qualified review before acceptance/integration;
  exact owner/provider/policy approvals before affected implementation
RECOMMENDED_NEXT_ACTION: Prepare LR-01 option sheet, then exact local repository
  commands/schema and fault-fixture packet against selected policies
```

The following paragraphs retain earlier dated checkpoints, not current totals.

Historical resource checkpoint: documentation validator PASS with 17 Markdown files, all 80 requirement families covered, 12 ADR rows, ten SL cards/eighteen SL-T scenarios and six R cards/sixteen R-T scenarios; validator syntax and tracked `git diff --check` also passed. Only LF/CRLF conversion warnings were observed. Canonical diff review and a targeted search checked that the final local-default/paid-cloud rule replaced interim absolute cloud exclusions. No application changes, installs, imports, uploads, purchases, device backup tests or runtime/security tests were performed; prior type/lint evidence was not rerun. Native iOS backup behaviour and object-backup scope remain explicit implementation/release checks. The two existing app-file edits were retained.

Completed deliverable boundary: coherent **research-backed review draft**, including all 80 registered capability/constraint families and 12 material ADRs, earlier 20-app evidence and concrete next-step contracts. Not completed: final canonical rewrite, full provider-specific executable schemas/configuration, all enterprise subfeature cards, UI prototype/user testing, product implementation or release.

Historical decision status after the September 17 emergency-exit reply: **1 approved
selection, 5 partial decisions, 6 open decisions**. Supabase PostgreSQL/Auth/Edge,
Next.js framework, SQLite/SecureStore and the navigation/brand direction have
recorded approval boundaries. No XP penalties/unverified health predictions,
pre-session configurable ordinary exit with a retained Emergency exit, limited
free/optional paid AI and unobtrusive launch ads are now recorded. Exact exit
interaction/in-session preference rules, ad rules, amounts,
configurations, tokens and other product
policies remain open. This does not make education/backend/UI cards READY or
turn a proposed pilot into a performed study.

Current suggested approval order (September 25):

1. Remaining architecture/experience detail: ADR-002 Next.js hosting, ADR-003 exact tokens/assets, ADR-004 exit interaction/in-session preference details and ADR-012 adapters/configuration/test tooling. Do not ask again to approve Supabase/Edge/Next.js framework, SQLite/SecureStore, the five-tab direction, the absence of penalties/health predictions or retaining Emergency exit; specify their remaining concrete contracts instead.
2. Product launch packaging: ADR-005/006/007 and ADR-008 QA; exact differentiated January slice, AI metering/ad placement and eligibility, optional curriculum metadata and qualified locale review. Mobile platforms, initial audience/personal-teacher scope, si/ta/en and January paid-cloud placement are confirmed; cost scenarios, final price/limits/security and launch acceptance remain unresolved. Do not re-ask those selected directions.
3. Production facts/policies: ADR-009/010/011; ages/consent, business/merchant eligibility, region/retention/recovery objectives. Some need current legal/content specialists or provider approval, not a guessed owner preference.

Do not ask the owner for passwords/API keys in chat. Budget amounts can be discussed later; merchant eligibility and operational limits still gate paid/production launch. Once decisions are recorded, canonical reconciliation and exact provider/task expansion can continue. Approval of this research as useful is not blanket approval of every listed alternative or of a public deployment.
