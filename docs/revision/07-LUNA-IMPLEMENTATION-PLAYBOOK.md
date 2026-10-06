# Luna Medium Implementation Playbook

Status: draft product task sequence and repository observations. The owner's model
preference is unchanged; see the replaceable [model policy](../ai/MODEL_ESCALATION_POLICY.md).
Work alone; no agents are authorized. These cards do not guarantee correctness or
replace owner approval, independent review, device tests or security verification.

## 1. Document authority and READY gate

මෙහි අරමුණ Lunaට app එකම එකවර හදන්න දීම නොවේ. Exact behavior, acceptance සහ
failure cases සහිත කුඩා vertical slice එකක් දෙන්න; product/security decisions
task එක අතරතුර අනුමාන කරන්න ඉඩ දෙන්න එපා.

The [documentation map](../DOCUMENTATION_MAP.md) owns authority/routing.
[Execution policy](../ai/AI_EXECUTION_POLICY.md) owns READY, risk, task states and
STOP/escalation; [Definition of Done](../ai/DEFINITION_OF_DONE.md) owns verification,
independent review and acceptance. This file owns the product dependency sequence
and subcard references, not a duplicate global procedure.

These are DRAFT product cards until their exact scope and **task-relevant
subdecisions** are approved and affected contracts reconciled. A partial ADR can
satisfy an approved subdecision without approving its unresolved fields. Inspect
current source/dirty state, real tooling and allowed files before each card.
A blocked payment/provider task does not stop unrelated authorized document work.
Do not turn a verified document into a claim that its proposed feature is READY.

## 2. Bounded task prompt

Use [TASK_BRIEF_TEMPLATE](../ai/TASK_BRIEF_TEMPLATE.md), filling the selected card's
requirements, current-code paths, exact behavior, data/trust boundaries, acceptance,
commands and review gate. It replaces the older inline generic prompt.

Screenshots supplement state, navigation, accessibility and lifecycle contracts;
they do not replace them. Keep relevant context small without skipping mandatory
instruction reading or cross-feature invariants. Model selection cannot waive
verification or authorize extra agents, dependencies, accounts or deployment.

## 3. Repository checkpoint for this revision

Audit base: `a6a481e`, branch `main` on 2026-09-14. This is a local inspection, not a claim that remote HEAD is unchanged. User edits already existed in `src/features/home/home-screen.tsx` and `src/theme/tokens.ts`; preserve them. Existing routes/features include focus engine/storage/hook, tasks/goals, local history, onboarding/auth forms and Plan My Day UI. Forms and prototypes are not production integrations.

Installed mobile versions at inspection: Expo `~56.0.21`, React Native `0.85.3`, React `19.2.3`, Expo Router `~56.2.20`, TypeScript `~6.0.3`. Recheck `package.json`/lockfile when starting a card; consult exact SDK 56 docs before Expo code. No test runner, database/auth SDK, production AI adapter or billing provider is established merely by this package.

Existing scripts: `start`, `reset-project`, `android`, `ios`, `web`, `lint`. **There is no `test` script.** Never run `reset-project` as a verification step; it is not a test. Do not invent passing `npm test`, web-build or security commands. Test tooling must first be approved, installed, configured and documented in L-02. For later checks prefer local executables; do not allow `npx` to silently download an unreviewed tool.

The [L-02 harness proposal](38-TEST-HARNESS-ADMISSION-PLAN.md) separates a
two-file pure-domain baseline using the already installed Node runtime (no new
packages) from later component dependencies and real integration/device tests.
Install only tooling actually required by the admitted slice. A known-red domain
baseline is useful harness evidence, not completion of L-02 or repaired app code.

Baseline commands where installed/configured: `npx tsc --noEmit`, `npm run lint`; Expo doctor only through an available/approved invocation. These alone do not test lifecycle, authentication, RLS or real-device behaviour.

## 4. Dependency map and estimated task size

Estimates below are planning ranges of owner-assisted work, not measured Luna speed or fixed commitments. Split cards exceeding a focused session into subcards before READY. Keep old implementation phase order unless ADR-006 explicitly reconciles it.

| Card | Outcome | Dependencies / gate | Inspection or intended boundary |
| --- | --- | --- | --- |
| L-00 | Approve decisions and reconcile canonical docs | Owner ADRs, coverage audit | All affected docs, no app code |
| L-01 | Reproduce current foundation/lifecycle gaps and establish baseline | L-00 for changed behaviour; read-only diagnosis can precede | Focus/session/goals/hooks/routes; package scripts |
| L-02 | Approved deterministic domain/component/integration test harness | ADR-012, exact version compatibility | Proposed tests/tool config; package/lock changes only when approved |
| L-03 | Guard valid timer transitions and early completion | L-01/02, canonical session contract | `src/features/focus/session-engine.ts`, `session-types.ts`, related tests |
| L-04 | Transactional SQLite storage adapter and interruption-safe all-or-nothing JSON migration | ADR-012 SQLite/SecureStore selection + 2026-10-06 owner migration decisions, L-02, native/SQLite failure fixtures | Existing feature storage modules; versioned local schema and migration gate; HIGH review remains before acceptance/integration |
| L-05 | Stable identity/account and secure auth vertical slice | ADR-001 provider selection, ADR-009 15+ and 15–17 development boundary (2026-10-06); qualified legal review for real-minor access, ADR-011, L-02; approved phase | Auth routes, credential adapter, trusted API/migrations; real-minor pilot/release stays disabled pending legal review |
| L-06 | Atomic terminal save and recoverable focus UI | L-03/04/05 as applicable | `src/features/focus/use-focus-session.ts`, `src/app/focus/session.tsx`, recovery/break/summary |
| L-07 | Stable task links and bounded goals | L-04/05/06; 2026-10-06 approved goal event/period semantics; remaining task-link identity contract | Task/goal types/storage/routes, `goal-progress.ts`, history; cancelled sessions count focused seconds only for time goals, never session counts |
| L-08 | Server-authoritative sync, cursor/conflicts and reward ledger | L-04/05/06/07, ADR-011, exact overlap rules | Approved backend schema/RLS/API + local outbox |
| L-09 | Approved design tokens, reusable states and route migration | ADR-003, component specification, user dirty edits reconciled | Theme/components/tab composition; no business rules in UI |
| L-10 | Optional personalisation and locale-ready settings | L-04/05/09, ADR-008, P-01–07 | Onboarding/profile/settings and approved locale resources |
| L-11 | Return Ticket, Outcome Receipt and bounded plan | ADR-006, L-07/09/10 | Proposed focused feature modules; stable task/session links |
| L-12 | Own-resource General student/independent-teacher organiser; optional curriculum metadata | L-07/10, local storage/locale/age gates as applicable; ADR-007 only for official metadata | Local resource/task flows first; no supplied papers/notes/videos |
| L-13 | Approved AI Plan My Day with exact confirmation | ADR-005/006, L-05/07/08, quota/eval contract | `src/app/plan-my-day.tsx` composition; proposed server adapter/proposal service |
| L-14 | January Public Website + Account Portal | ADR-002; WEB-01–06; auth/billing/privacy prerequisites | Proposed separate web surface; no full web timer implied |
| L-15 | Catalog, verified billing and entitlement transitions | ADR-005/010/011, L-05/08, sandbox provider setup | Server ledger/webhooks and client entitlement display |
| L-16 | Release accessibility, privacy and resilience verification | All selected release cards | [08](08-VERIFICATION-AND-RELEASE.md) evidence, real devices/browsers |
| L-17 | Staging-to-production publication with rollback | L-16, explicit owner release approval | Store/domain/build metadata, operational runbooks |
| L-18 | Post-release support and incident readiness | L-17 | Published support path, monitored owned infrastructure; no automation created here |

L-14 contains website subcards that can progress alongside mobile after contracts are stable; this is one person's scheduling, not delegation. Do not leave portal/billing/merchant feasibility until the final release week. L-08 backend foundations can be developed incrementally with earlier vertical slices rather than postponing every server check to the end.

[BE-01–08](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md) refine L-05/07/08 into
bounded backend tasks, with fourteen operation contracts, nine prototype tables
and eighteen future security/integration cases. DTO fixtures can run now with
the existing local checker; executing SQL requires an expressly isolated,
authorized target. The prototype is incomplete and must not be auto-deployed.

[UX-01–08](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md) refine L-09/10 with
approved navigation routes/aliases and proposed tokens, personalization and
motivation contracts. UX-T01–24 require later real implementation/device evidence.
Do not re-request the approved five-tab direction or SQLite/SecureStore selection;
resolve the exact remaining value/adapter/policy gate for the particular card.

L-12/FUT-02 now have [Sri Lanka subcards SL-01–SL-10](11-SRI-LANKA-EDUCATION-CONTRACTS.md), supported by [local evidence and pilot proposal](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md). These remain DRAFT. September 25 selects the independent personal-teacher organizer; the amendment recorded September 29 additionally targets bounded private invitations/assignments/learner-selected progress/text feedback for V1, not full LMS, general chat or file sharing. September 26 records the desired 15+ target, not legal/consent clearance. Exact pilot subject/medium, eligibility, APIs/RLS and implementation evidence remain open. Do not bypass core/test/auth foundations to build a class dashboard first. The 18 SL-T acceptance scenarios extend, rather than replace, the shared release gates.

The January-first policy now permits documented feature deferrals if measured
delivery risk emerges; no specific cut is selected. Keep the revised launch map
and task dependencies explicit, with no safety/quality waiver. Ordinary design
specification is delegated; spending/prices/legal facts/required independent
review return to the owner. No app implementation or automatic agents are authorized.

[CL-01–08 preparation](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) expands the
admitted SL-06–09 subset, with actual task-storage gaps, strict sharing fields,
state/replay boundaries, candidate file seams and CT-01–24 (all NOT_RUN).
The cards remain DRAFT: resolve G1–G4 and independent review for the selected
operation before its implementation brief. Start with shared core/identity/private
Task prerequisites, not a classroom dashboard; do not run all cards in one prompt.

[CW-00 wire/data packet](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md) adds
22 draft API operations, strict DTOs and a read-only local checker. TX-01–24
describe isolated race/failure tests; none has run. Use these with 39 for the
next reviewed canonical/schema preparation, not as permission to execute SQL
or bypass CL prerequisite, policy and independent-review gates.

[CR-00 reconciliation](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md)
provides operation/table access obligations and the isolated SQL preparation order.
Before runnable SQL, freeze the shared private-Task tombstone/identity bridge and
review exact grants/roles; before execution, identify an authorized disposable
target and tooling. Never treat DTO PASS as RLS proof or add classroom commands
to the personal sync/export union without a versioned contract change.

[TI-00](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md) now selects those design
candidates: nullable live Task FK with immutable deleted-link identity, and narrow
server-only PostgreSQL entry functions with verified actor/session arguments.
Use its common identity-guard/owner-head/class lock order. TI-T01–16 are NOT_RUN;
this does not authorize implementing roles/migrations or bypassing review.

[R-01–R-06](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) refine user-resource planning: local defaults and independent teacher work first; optional paid cloud only after its cost/entitlement/ownership gates. Sixteen R-T scenarios cover the resource boundary. A resource subscription neither uploads the library automatically nor approves class sharing. September 25 explicitly requires January cloud placement; this is not inferred from the enterprise inventory and does not authorize service activation. Use [32](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) for platform/audience/locale scope; no supplied-material feature is admitted.

## 5. Detailed initial defect cards (not implemented)

[BX-01–08](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md) extend BE/L-05/07/08/13/15
with full-command sync, projection, AI confirmation and privacy/operations tasks.
[WP-01–10](17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md) expand WEB-01–06 into exact
surface/auth/settings/billing/release boundaries. Each family has 24 future
acceptance cases. Consult [18](18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md)
before selecting a task; it records open policies and missing complete API/
response/migration work rather than presenting all future cards as READY.

[Core reliability contracts](13-CORE-RELIABILITY-CONTRACTS.md) now refine these
cards into CR-01–06 with twenty CR-T scenarios. The read-only diagnostic reproduces
eight current pure-engine cases without installing a test runner or changing app
code. It does not resolve ADR-012 or test React/native storage/security. Proposed
result types, timing precision/cutoff and migrations still pass the READY gate.

### L-03A: early completion must not count as completed work

September 28's [foundation handoff](13-CORE-RELIABILITY-CONTRACTS.md#11-foundation-handoff-refresh--september-28)
maps all five re-reproduced pure-engine gaps to actual callers and regression
oracles. L-02's exact harness proposal is the next preparation task; no package
or engine change is authorized by that diagnostic. Preserve its three positive
cases and do not call an arithmetic repair a durable-save or recovery fix.

Observed source: `completeFocusSession` currently marks completed before planned duration; session route exposes Complete Session. Contract: full completion only at planned elapsed time; early termination remains allowed and is cancelled/ended early without completed-session rewards. Determine an explicit typed outcome for rejected completion during L-00 contract reconciliation; do not silently change caller return types.

Fixture: start at epoch 0, planned 25 minutes; at 60,000 ms an attempted completion cannot return terminal `completed`. At 1,500,000 ms a valid unpaused session can complete once. Repeated terminal calls cannot change IDs/timestamps or add rewards. Cancelled session cannot later complete. Invalid duration, malformed timestamp and clock rollback tests must produce a documented safe error/recovery state rather than NaN or free credit.

Allowed implementation boundaries after READY: engine/types, associated domain tests, route/hook call handling needed for that result only. Out of scope: redesign, backend migration, reward formula changes. Verify failed early completion does not trap the user from Cancel. Run domain tests plus type/lint; device flow remains separately required.

### L-03B: pause/resume projection and terminal immutability

The [core decision packet, 13 §12](13-CORE-RELIABILITY-CONTRACTS.md) groups seven
proposed freeze choices and eight numeric/caller oracles. Its proposed V2 cutoff
snapshot preserves target-time evidence across a late pause/resume; exact schema,
adoption, transaction and independent review remain gates. Keep source seconds,
domain milliseconds and display results distinct; this is not a completed repair.

Use 13 §12.E (CR-02R) as the next **review packet**, not a coding prompt: seven
decision-specific questions, canonical destinations and required review evidence.
Its author corrections clarify original-cutoff precedence and the missing enclosing
validation context. Independent review/owner adoption are still pending. Do not
implement V2 in L-03 alone while legacy storage silently serializes the new shape;
admit the matched persistence/migration/caller boundary before application cutover.

Fixture: start 0, pause 300,000 ms, resume 420,000 ms, project 1,320,000 ms → 1,200 seconds focus, 120 seconds pause, 300 seconds remaining. Valid completion at 1,620,000 ms → 1,500 seconds focus. Further rendering after terminal state must not grow terminal totals. Repeated pause/resume, background/restart and exact-zero epoch timestamps need fixtures; truthiness checks must not discard a valid timestamp of zero.

Test pure engine separately from OS lifecycle. Inject a clock in tests rather than actually waiting 25 minutes. Real OS suspension/restart still needs physical-device evidence; fake timers do not prove it.

### L-04A / L-06A: no acknowledged history loss

Read 13 §7.1 (CR-03I) before preparing the migration card: twelve actual source
fields, shallow-reader limitations, a reproduced loss-of-precision example and
six NOT_RUN migration refinements. Do not inventory through helpers that hide
parse failures/filter records or copy a stale focus snapshot into V2 settled
state. Exact ownerless-data, envelope, writer exclusion and recovery policies
remain gated; no real files or migration are authorized by that packet.

Observed source: storage catches errors with fallback; terminal route clears active record before appending history; history append is read-modify-write. Required result: atomic durable terminal session+outbox+active-pointer transition and honest failure UI. The October 6 owner approved a versioned Expo SQLite local schema, a shared write barrier and complete transactional import before SQLite cutover; the legacy JSON sources remain unchanged, device-local and never auto-claimed/uploaded to an account.

Fixtures: fail each transaction step; process death before/after commit; two simultaneous append requests; timeout after server commit; repeated app open; malformed old JSON; no storage space; migration retry. Expected: at most one terminal record, no success on failed durable save, old source preserved until approved cleanup, recovery still offered. Review both data integrity and UI navigation—passing a storage unit test alone is insufficient.

ADR-012 and the October 6 owner decision authorize the selected local SQLite foundation; use an SDK-compatible Expo package version and pin the lockfile. This is still not authority to run a production/cloud migration, delete legacy files, or accept/integrate HIGH-risk code without independent review and native evidence. The existing interim JSON patch is not equivalent to transactional cross-device storage.

### L-07A: bounded goal progress and stable task identity

Observed source: `goal-progress.ts` includes every completed record after goal creation with no end boundary; sessions carry task name rather than stable task identity. On October 6 the owner approved the goal changes recorded in 01/DATA_MODEL: durable completed or cancelled terminal sessions contribute confirmed focused seconds to time goals, but only completed sessions count toward session-count goals; periods are saved IANA-zone-derived UTC half-open intervals and historical periods are immutable. Stable task identity/link migration and device/review evidence remain separate.

Fixture for a UTC weekly interval: `[2026-09-14T00:00:00Z, 2026-09-21T00:00:00Z)`. Eligible completion at start is included; just before start and exactly at end are excluded; cancelled/foreign-account/unrelated records are excluded under the approved goal rule. Rename/archive task → historic session link remains readable. Migration maps legacy names only when unambiguous; otherwise keep a legacy display label rather than attach to the wrong task.

## 6. Provider-specific contract expansion checklist

ADR-001 provider selection and ADR-002 Next.js framework selection are now approved. Do not re-open those choices without a material reason. After ADR-012 and remaining schema/domain/runtime gates are resolved, create exact schema/migration files, RLS policy SQL, auth configuration, API schemas, indexes, seed fixtures and rollback instructions. Include two-user/two-workspace test identities without real credentials. Choose and pin tool versions through project-local configuration. Record actual commands for unit tests, DB reset in isolated test environment, RLS tests, API integration and mobile tests. “Reset” must never target production or the user's broad workspace.

Freeze unresolved numeric/business rules: focus duration bounds, original XP/streak formulas and revisions, overlap-credit/clock tolerance, retention/offline windows, supported auth factors, exact age/consent policy, locale fallback/terminology/QA, curriculum edition, AI units/billable success and subscription transitions. The initial si/ta/en locale list is already approved; do not ask to select it again or treat approval as translated/tested surfaces. Existing canonical numbers are the starting evidence, not automatically valid across the expanded platform. This is why the current whole package is review-ready rather than wholly implementation-ready.

## 7. Future feature card map

| Family | Preparation card / contracts required before coding |
| --- | --- |
| Full productivity web | FWEB-01–08 in [05](05-WEB-AND-INTEGRATIONS.md) |
| Team/professional workflows DF-040–044 | FUT-01: scoped project/role templates, selected handoff copies, audit/offboarding; first one role pilot |
| Education depth DF-045–055 | FUT-02: own-resource planning, optional metadata rights, separately scoped grading/cohort consent/practice/interoperability; no supplied teaching material |
| Shield/recovery experiments DF-058–060 | FUT-03: OS capability/entitlement spike, safe exit, privacy and benefit validation; no medical claims |
| Advanced AI DF-061/062/070/071 | FUT-04: provider/client compatibility, structured tools, evaluation corpus, quotas, revocation, confirmed writes |
| Audio/cosmetics DF-063/064/066 | FUT-05: asset licensing, downloads/storage, accessibility/reduced motion and non-pressure monetization |
| Advanced insights DF-065 | FUT-06: metric definitions, uncertainty, private exports, aggregation re-identification review |
| Rooms/challenges/community DF-067–069 | FUT-07: age/consent, membership/abuse controls, moderation/support, optional notifications; private pilot before public |
| Connectors DF-072 | FUT-08: one provider at a time, OAuth scopes, mirror/conflict/410 tests and write confirmation |
| Other devices/locales DF-073/075 | FUT-09: platform/locale support matrix, native reviewer/device tests, no language-country coupling |
| Enterprise security DF-074 | FUT-10: SSO/SCIM/offboarding, audit/residency/retention, independent security review and service obligations |

These future cards are preparation maps, **not complete executable subfeature specifications**. No claim that all enterprise modules can now be built without further decisions. Their role is to preserve scope and dependencies so future expansion is deliberate rather than contradictory.

## 8. Review and bug-fix protocol

[22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md) refines the reward/goal-progress and
AI usage/read/apply wire slice. Its strict shapes and fixtures do not approve
reward formulas, generation/revision behavior, pricing, retention or actual
database transactions. Continue through each card's exact READY/review gate.

[23](23-AI-GENERATION-RECOVERY-AND-REVISION.md) adds AG-01–05 for durable requests,
strict lifecycle wire contracts, the missing ordered-plan model, provider output
validation and client recovery. The lifecycle/reference examples exist; strict
generation/revision OpenAPI and full scheduling still do not. Document preparation
AG-02/03 can proceed without production accounts; do not promote these cards to
READY or silently activate conditional AI features from their names.

Subsequent [24](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md) supplies the
AG-02/03 draft ordered-plan model and five strict wire operations. Next close
plan persistence/sync/privacy/client-version integration before v2 activation;
schemas do not implement ordinary plan management or supersede the phase order.

[25](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md) now separates that work into
PL-01–05: current-plan lifecycle wire, v2 replication/privacy wire, isolated
owned SQL/RPC, local repository/UI, then capability activation. Complete PL-01/02
contracts before SQL; no current card is READY merely because its design exists.

[26](26-SAVED-PLAN-MANAGEMENT-WIRE.md) supplies PL-01's strict current read,
edit/action and minimal receipt draft with exact reminder version/action coverage.
[27](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md) now supplies PL-02's versioned
replication/snapshot/discovery and plans-export-component draft.
[28](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md) now types the outer export envelope,
fourteen sections and explicit coverage gates.
[29](29-PLAN-DATABASE-RPC-TEST-PACKET.md) supplies PL-03's seven-card isolated
SQL/RPC/migration test specification and seven open gates. It executes nothing.
Review PL-01/02 and verify foundations/target before affected DB work.
[30](30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md) now supplies PL-04's six-card
mobile storage/outbox/editor recovery specification and twenty NOT_RUN cases.
Its reference state checks cannot substitute for SQLite/device/server evidence.
[31](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md) now specifies PL-05 activation,
write pause, privacy containment and recovery evidence. All five PL drafts exist;
none is accepted from document checks alone. Next consolidate selected release
features, owner decisions and foundation prerequisites before broader implementation.
Neither a passing DTO checker nor the new plan
header activates a capability or approves lifecycle policy. No live SQL is authorized.

For each bug: record reproducible steps/environment, expected contract, actual observation, risk and minimal failing fixture. Add a regression test, fix the smallest boundary, run focused and baseline checks, inspect the diff and rerun affected device flow. Never replace a real provider failure with a hard-coded success or disable an authorisation test to ship.

Use the single completion record in [Definition of Done](../ai/DEFINITION_OF_DONE.md).
A plausible-looking screenshot is not verification of persistence/security.
Never mark OWNER_ACCEPTED on the owner's behalf.

## 9. First-task handoff — October 3

Use [Final Build Guide §3](49-BUILD-ENTRY-HANDOFF-SI.md)
for the single first coding prompt. It points to 38 §3's exact harness acceptance
and preserves the recorded baseline. The earlier read-only diagnostic prompt
has served its purpose; actual October 3 results are in guide §2 and audit BH-01.
Refresh diagnosis if source changes, rather than repeatedly preparing the same
handoff. Guide §4 maps this playbook's cards to the canonical phase sequence.
