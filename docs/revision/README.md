# Deep Focus Enterprise Documentation Revision

මෙය 2026-09-14 දින ආරම්භ කළ research-backed planning package එකයි. Product-owner discussion එකෙන් enterprise vision එක සකස් කර, පසුව January release scope එක freeze කිරීම මෙහි අරමුණයි. Sinhala explanations සහ English technical identifiers භාවිත කරයි.

## Status and authority

**Start here:** [49 — Final Build Guide](49-BUILD-ENTRY-HANDOFF-SI.md) contains
the first coding prompt, full phase routing, launch lanes and feature-local
remaining work. The broad editorial consolidation is closed; these numbered
documents are supporting references, not an instruction to keep adding packets.
[48 — API inventory](48-API-OWNERSHIP-AND-CONSOLIDATION.md) maps source ownership.
Unresolved feature specifications, required review and actual implementation
remain explicit in the guide; they have not been declared complete.

**Status: DRAFT CONTRACTS WITH RECORDED STACK APPROVAL — NOT DEPLOYMENT AUTHORIZATION.**

2026-09-14 update: Supabase PostgreSQL/Auth and Next.js Website/Portal were approved by the owner. The [decision register](01-REQUIREMENTS-AND-DECISIONS.md) defines the exact approval boundary. Hosting, other ADRs, production settings and full canonical reconciliation remain open; do not ask again whether the already selected providers/framework are approved.

මෙම directory එක පැරණි canonical docs නිහඬව supersede කරන්නේ නැත. Confirmed requirements සහ approved stack selection සටහන් කර ඇත; වෙනත් detailed designs තවම proposals ය. Existing implementation එකත්, intended implementation එකත් වෙන් කර තිබේ. Unsupported historical ideas implementation instructions නොවේ.

- January 1, 2027: **Android + iOS + Public Website + Account Portal**, with optional paid Cloud Resources. Full productivity Web App is later; target inclusion is not production acceptance.
- Education launch target: Sri Lanka O/L/A/L/higher-stage learners, independent personal-teacher organization and bounded private classroom invitations/assignments/selected-progress/text feedback (September 29 record); no full LMS or file sharing. Initial app languages si/ta/en, others later; age/consent, exact sharing contracts, independent review and qualified QA remain gates.
- January 1 priority: document feature deferrals if measured progress shows date risk; no specific cuts yet or safety waiver. Full productivity web remains later; Website/Portal remain required. Ordinary design specification delegated; spending/prices/legal facts/required independent review return to owner.
- Capacity: 25–35 owner hours/week, including implementation supervision, testing and release work.
- Budget amounts deferred by owner; no paid account creation or spending authorized.
- Research/documentation performed by one assistant; no additional agents.
- No application code, provider configuration or production infrastructure changed by this package.
- Education provides no teaching-material library. Students and teachers organise their own resources/work; local is default, optional paid cloud has January placement approved September 25, with cost/limits/security/launch acceptance still gated.

## Read order

මුලින් [කෙටි Sinhala owner review](00-OWNER-REVIEW-SI.md) කියවන්න. එහි නිර්දේශ, තවම අවසන් නොකළ දේ සහ ඔබේ තීරණ අවශ්‍ය කොටස් සාරාංශ කර ඇත.

1. [Requirements and decisions](01-REQUIREMENTS-AND-DECISIONS.md)
2. [Research and recommendations](02-RESEARCH-AND-RECOMMENDATIONS.md)
3. [Product and experience specification](03-PRODUCT-AND-EXPERIENCE.md)
4. [Backend, ownership and secure synchronization](04-BACKEND-SECURITY-AND-SYNC.md)
5. [Website, account portal and future web app](05-WEB-AND-INTEGRATIONS.md)
6. [Monetization and entitlements](06-MONETIZATION-AND-ENTITLEMENTS.md)
7. [Luna implementation playbook](07-LUNA-IMPLEMENTATION-PLAYBOOK.md)
8. [Verification and release gates](08-VERIFICATION-AND-RELEASE.md)
9. [Coverage and revision audit](09-COVERAGE-AND-AUDIT.md)
10. [Sri Lanka student/teacher research — Sinhala](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md)
11. [Sri Lanka education flows, ownership and Luna subcards](11-SRI-LANKA-EDUCATION-CONTRACTS.md)
12. [Own resources, local planning and optional paid cloud](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md)
13. [Core reliability contracts and reproducible checks](13-CORE-RELIABILITY-CONTRACTS.md)
14. [Backend API, DTOs, isolated SQL prototype and build cards](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md)
15. [Navigation, personalization, motivation and accessible token contracts](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md)
16. [Remaining backend modules, sync, privacy jobs and operations](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md)
17. [Website/Portal page contracts and publication runbook](17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md)
18. [Implementation readiness and remaining owner decisions](18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md)
19. [Non-punitive commitment, Emergency exit and truthful claims](19-SAFETY-AND-COMMITMENT-CONTRACT.md)
20. [Settings defaults, progress policies and explicit unit contracts](20-SETTINGS-PROGRESS-AND-UNITS.md)
21. [Engineering workflow critique, migration and review boundary](21-ENGINEERING-WORKFLOW-AUDIT.md)
22. [Reward/goal-progress/AI usage and atomic confirmation wire contracts](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md)
23. [AI generation, interrupted-request recovery and manual revision](23-AI-GENERATION-RECOVERY-AND-REVISION.md)
24. [Daily plan and exact generation/recovery/revision wire](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md)
25. [Saved-plan lifecycle, compatibility and privacy](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md)
26. [Saved-plan management wire and exact reminder actions](26-SAVED-PLAN-MANAGEMENT-WIRE.md)
27. [V2 grouped replication, snapshots and plans export component](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md)
28. [Account-export artifact, coverage and safe delivery](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md)
29. [Isolated plan database/RPC and migration test packet](29-PLAN-DATABASE-RPC-TEST-PACKET.md)
30. [Mobile saved-plan storage, outbox and editor recovery](30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md)
31. [Saved-plan activation, pause and recovery gates](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md)
32. [January release choices and complete 80-family placement map](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md)
33. [Paid-cloud admission, billing/quota lifecycle and recovery](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md)
34. [Local-resource import/open/removal and interrupted-operation recovery](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md)
35. [Resource format, prototype-limit and viewer options for owner review](35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md)
36. [Viewer compatibility research and isolated device-test plan](36-RESOURCE-VIEWER-COMPATIBILITY-AND-DEVICE-TEST-PLAN.md)
37. [Viewer permission boundaries, containment and cancellation](37-VIEWER-PERMISSIONS-AND-CONTAINMENT.md)
38. [Domain test harness proposal and separate component/device admission](38-TEST-HARNESS-ADMISSION-PLAN.md)

For implementation context start with the [documentation map](../DOCUMENTATION_MAP.md).
Permanent execution/risk/evidence rules now live in `docs/ai`; `07` retains
product sequencing and uses the shared task brief. The dated model mapping is
separate from stable engineering rules. This governance pass is solo-authored:
independent review remains pending, not silently counted as completed.

## One decision, one owner

`01` owns requirement status and approval records. Other files reference its IDs rather than silently changing their status. `02` owns source-backed provider comparisons, not product approval. `03` owns experience rules. `04` owns data/security/sync contracts. `05` owns surface and connector boundaries. `06` owns entitlement semantics, not yet final prices. `07` owns implementation sequence. `08` owns acceptance evidence. `09` records what was inspected and what remains unfinished.

`10` owns the current Sri Lanka evidence/strategy, with source dates and limitations. `11` refines L-12/FUT-02 into proposed learner/teacher contracts and SL-01–10 cards, with SL-T01–18 acceptance scenarios. It does not approve a teacher LMS, curriculum pack or real-minor pilot. Current ADR status after September 26: two approved selections, nine partial decisions and one open decision; see `01` for exact boundaries, not completion percentages. Desired 15+ target and planned Sri Lanka company do not establish consent, incorporation or merchant eligibility.

September 15 approvals add Supabase Edge Functions API, Expo SQLite mobile data,
Expo SecureStore credentials and Home/Plan/Focus/Progress/Profile with Rewards
under Progress. They approve design selections, not installs, exact production
settings, price/scope changes or deployment. Next.js hosting remains open.

`12` owns the local-resource/optional-cloud boundary and student/independent-teacher work flows, with six R cards and sixteen R-T scenarios. `06 §8` owns the cloud cost/pricing model. The latest paid-cloud refinement supersedes the earlier absolute local-only cloud exclusion; local remains the default and subscribing alone does not authorise upload. A confirmed product direction is distinct from resolving the full commercial ADR or a release commitment.

[39 — bounded classroom sharing](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) refines
the V1-selected portion of 11: private invitations, assignments, explicit private
Task acceptance, categorical progress sharing and text feedback. Eight CL cards,
24 NOT_RUN CT cases and six gates separate draft design from verified services.
No full LMS, file sharing, grading, app/schema changes or real-minor pilot is added.

[40 — classroom wire/data and transaction tests](40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md)
refines 39 with 57 JSON Schema definitions, 22 OpenAPI operations and 24 NOT_RUN
transaction scenarios. `check-classroom-contracts.mjs` runs document/DTO fixtures
only; no SQL, deployed API or classroom security proof is implied.

Before a task can be marked implementation-ready, every decision it depends on must be approved, contracts must be concrete, and required tests/tooling must exist or be part of that task. A drafted task is not a completed feature. A research recommendation is not a signed-off architecture decision.

[41 — classroom canonical/access and SQL-test preparation](41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md)
reconciles scoped references across API/data/database/security/testing, with
22-operation and 11-table access/integrity matrices, export-family treatment and
six OPEN SQL admission gates. No executable SQL, new export format or runtime
security proof; design remains HIGH / REVIEW_PENDING.

[42 — private Task tombstone and identity bridge](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md)
selects concrete design candidates for deleted-link recovery and the server-only
Edge-to-PostgreSQL identity boundary; reconciles shared lock order and defines
16 NOT_RUN scenarios. Public DTOs unchanged, no SQL or credentials created.

[43 — classroom function and isolated runner specification](43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md)
maps all 22 API operations to typed internal entry signatures and capability
boundaries, seven ordered UNCREATED migration seams and 40 NOT_RUN execution-surface
mappings. Local inventory checks do not execute SQL or create a test runner.

[44 — command, cursor and invitation helpers](44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md)
specifies canonical digest/replay, private cursor handles and invitation lifecycle
with synthetic-only vectors. `check-classroom-helpers.mjs` runs local reference
checks, not deployed crypto, authorization or transaction tests. DRAFT / HIGH /
REVIEW_PENDING; no production expiry/retention/key policy is inferred.

[45 — adapter feasibility self-review](45-CLASSROOM-ADAPTER-FEASIBILITY-REVIEW.md)
places the combined 43/44 SQL-only GCM path on ADAPTER_HOLD, documents a proposed
Edge/atomic-database correction and adds pre-jsonb NUL reference regressions.
The internal bridge still needs exact signatures/grants and independent review;
no SQL, Edge handler or crypto integration was implemented or executed.

[46 — Edge/database bridge](46-CLASSROOM-EDGE-DATABASE-BRIDGE.md) now supplies
strict internal preparation/material/delivery DTOs and reconciles the draft
signatures: 13 mutations, nine reads and one server-only preparation call.
Public API remains 22 operations. Reference models test shape/projection/retry
rules only; ADAPTER_HOLD remains for shared foundations, key/nonce policy,
qualified independent review and actual integration, not a missing public feature.

[47 — key/nonce policy and review brief](47-CLASSROOM-KEY-NONCE-AND-REVIEW-BRIEF.md)
adds separate purpose-specific key custody options, a committed-before-use per-key
nonce counter candidate, rotation/restore failure rules and a reviewer-ready brief.
It does not select a KMS, create keys, approve budgets/retention, or claim runtime
or independent verification; ADAPTER_HOLD remains.

`13` refines L-01–08 into six CR cards and twenty CR-T scenarios, separating
baseline invariants from proposed result/precision/repository contracts. Its
read-only current-source diagnostic exercises eight pure-engine cases; it is
not an application test harness or proof of storage/security correctness.
Confirmed Website/Portal inclusion, available weekly hours and the reopened
documentation phase are now reconciled in the canonical scope/plan; the mobile
screen map records approved Auth selection and separates web surfaces.

## Canonical reconciliation procedure

`14` makes the first personal-core API slice concrete: fourteen documented
operations, nine prototype tables, thirty-two DTO fixtures and eight BE cards /
eighteen future integration cases. `15` refines L-09/10 with an approved-direction
navigation manifest, proposed tokens, eight UX cards and twenty-four future
interaction cases. Their read-only checkers do not deploy a backend, implement
routes or certify security/accessibility. See [the audit](09-COVERAGE-AND-AUDIT.md)
for actual results and unfinished modules. Exact token values remain proposed.

Current approved navigation has been reconciled in the canonical screen map,
architecture and five UI navigation examples. The full historical UI/AI/formula
rewrite remains incomplete; do not mistake this bounded reconciliation for it.

`16` refines remaining backend modules with 33 extension/overlapping endpoints,
fourteen strict sync command kinds, eight BX cards and 24 future cases. `17`
refines Website/Portal into 25 proposed pages, two auth handlers, ten WP cards
and 24 future cases. [Extension checker](check-extension-contracts.mjs) exercises
JSON shapes and manifest consistency only. `18` is the consolidated readiness/
owner-decision sheet: it distinguishes completed document work from missing
wire/schema/implementation/policy evidence. No price, legal fact or deployment
permission is invented to make a task appear READY.

The [selected extension OpenAPI](contracts/personal-extensions.openapi.json) now
specifies EX-01–11/17, including soft-delete/version headers, settings, breaks,
reminders and analytics. Twelve operations supplement the fourteen-operation core:
26 unique operations across two partial draft files. Shared-reference, exact
request/response/query mapping and negative DTO checks do not prove runtime
authorization. The subsequent [operations OpenAPI](contracts/operations-api.openapi.json)
and [DTOs](contracts/operations-api.schema.json) cover EX-12–16/21–30: fifteen more
sync/privacy/session/billing-visibility operations, 41 unique across three draft
files. [Operations checker](check-operations-contracts.mjs) adds strict output and
cross-file/auth/query mapping fixtures. EX-18–20/31–33 were without complete
OpenAPI outputs at that earlier checkpoint. The subsequent
[reward/AI slice](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md) now covers those six:
47 unique operations across four partial files and all 33 extension inventory
rows. This is still not the complete V1/enterprise API: generation/revision,
assessment/provider families, full migrations and exact policies remain gated.
The subsequent [generation lifecycle](23-AI-GENERATION-RECOVERY-AND-REVISION.md)
now specifies reservation/terminal-race/recovery/manual-edit behavior, with a
read-only reference model, five draft cards and 24 future integration scenarios.
It adds no strict HTTP schemas or OpenAPI operations: 47 remains the current
wire count. Full schedule/block contracts and production evidence remain open.

Latest [daily-plan/wire slice](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md)
adds five exact operations, giving **52 across five partial OpenAPI files**,
and a proposed v2 ordered focus/break/reminder plan command while retaining v1.
Its checker validates DTO/temporal/binding examples, not runtime. Plan SQL/RPC,
sync/snapshot/export/deletion, post-save lifecycle, conditional AI results and
provider/security evidence still gate activation. Earlier counts above are checkpoints.
No actual sync, account deletion, purchase, migration or provider
configuration is performed; the receipt/snapshot details need security review.

The subsequent [saved-plan lifecycle](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md)
specifies proposed edit/archive/restore/delete, known-content erasure, privacy
epochs and legacy projection boundaries, with five draft packets and twelve
NOT RUN runtime cases. Its synthetic checker does not implement any of those
systems. Strict lifecycle/v2 replication wire is the next dependency; the OpenAPI
count remains 52. Required independent review remains pending.

Latest [management wire](26-SAVED-PLAN-MANAGEMENT-WIRE.md) refines PG-05's
undeployed read shape and adds two management operations: **54 across six files**.
Thirteen strict DTO definitions and a new checker cover PL-01's typed manual
commands, not a working editor. PL-02 replication/export wire and PL-03–05
implementation/review gates remained open at that checkpoint; earlier counts are historical subsets.

Latest [replication wire](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md) adds six
operations: **60 across seven files**, seven replicated entity kinds and eighteen
v2 command kinds. Transaction-group paging, snapshot/epoch recovery and the plans
section of account export are typed. V1 wire is unchanged. The complete outer
account-export artifact, SQL/RPC/client implementation, policies and independent
review remain open; a passing reference checker is not working sync or erasure.

The subsequent [account-export artifact](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md)
types the outer UTF-8 JSON envelope and fourteen sections, retaining 27's plans
component. Eight deferred-family dispositions prevent silent omissions; they do
not implement missing serializers or legally certify all-data access. Nineteen
DTO definitions and a synthetic checker add no routes (still 60). Source inventory,
separate access processes, policy, real delivery/storage and independent review
remain release gates. PL-03's isolated SQL/RPC test specification is next.

That [PL-03 specification](29-PLAN-DATABASE-RPC-TEST-PACKET.md) is now drafted:
seven small-context cards, seven open gates and 24 detailed NOT_RUN runtime cases.
It explicitly inventories missing prototype foundations before plan migrations,
then covers actor/role safety, whole transactions, migration cutover and recovery.
The structural checker does not execute SQL or prove security. No new routes or
database changes. [30](30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md) now supplies
PL-04's local repository/outbox/editor recovery draft: six ordered cards, six open
gates and twenty NOT_RUN device scenarios. Its state checker is synthetic only;
no SQLite migration, saved-plan UI or native alert adapter is implemented.
[31](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md) supplies PL-05's activation/pause/
recovery draft with eight unfilled gates, four cards and twelve NOT_RUN scenarios.
All five PL packets now have drafts, not accepted implementations. The
[release-feature map](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) now reconciles the
five September 25 replies and all 80 families; implementation still starts with
approved foundations and review, not capability activation.

`19` refines the approved no-penalty/no-health-prediction and retained Emergency
exit boundaries into four SC cards and twenty NOT RUN acceptance cases. Detailed
default/snapshot/confirmation behavior is proposed, not silently owner-approved.
Canonical Focus Bet stake/loss paragraphs and misleading positive health-component
examples have been reconciled; labelled negative examples and historical research
are retained. No strict-mode UI or shielding behavior was implemented.

`20` separates current settings/milestones from proposed defaults and unresolved
XP/day rules, with explicit minute/second/ms adapters, five SP cards and twenty-
four NOT RUN cases. Strict settings/analytics output shapes now extend `16`;
unavailable is null rather than a fabricated zero. Canonical settings API examples
are checked against the proposed schema. This is not a complete reward catalog,
all-extension API or tested migration/production projection.

1. Owner reviews the register and grouped recommendations.
2. Record exact approved alternatives and dates in `01`; do not infer approval from silence.
3. Apply approved changes to the existing canonical documents listed in `09`, preserving historical ideas through explicit future/rejected records rather than deleting them silently.
4. Expand provider-specific SQL migrations, auth settings, product IDs, deployment configuration and task cards only after their prerequisite decisions are fixed.
5. Run the documentation consistency checks, then mark a bounded implementation task READY.

Until these gates are satisfied, Luna must not treat this whole directory as an instruction to build every future feature at once. Existing `AGENTS.md` and `docs/AI_RULES.md` remain mandatory.
