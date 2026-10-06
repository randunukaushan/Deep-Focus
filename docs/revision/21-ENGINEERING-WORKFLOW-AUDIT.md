# Engineering workflow audit and bounded migration

Date: 2026-09-19. Scope: documentation/execution-system design, alone; no app,
provider, account, model-setting or production changes. The owner's newly
supplied engineering-system proposal is now in scope. Its recommendations are
reviewed below, not treated as approval of new product/security policies.

## 1. Findings before the rewrite

Measured local files before this pass: `AGENTS.md` 10,969 bytes; `AI_RULES.md`
14,321; `CONTRIBUTING.md` 24,933; `DEVELOPMENT_GUIDE.md` 47,033; revision `07`
19,847. Top-level `docs/*.md` total 1,770,081 bytes. UI specification alone is
566,645 bytes; component library 382,841; architecture 176,411. Byte counts
are not token counts. The contribution/development guides already recommend
task-relevant reading; the problem is overlapping rules and oversized sources,
not a rule requiring every document on every task.

| Finding / critique | Chosen correction / remaining limit |
| --- | --- |
| A fixed Luna → Terra → Sol → Astra ladder confuses model choice with diagnosis | Keep roles/risk permanent, current model IDs replaceable. Diagnose requirement, environment and reasoning failures separately; no mandatory intermediate purchases/runs |
| A stronger model's confidence does not establish correctness | Evidence and independent review gates; neither an AI review nor schema fixtures certify security |
| Independent review for every typo wastes effort, but calling self-review independent is unsafe | LOW self-review; MEDIUM targeted extra review when justified; HIGH/CRITICAL independent review before acceptance/integration. Solo authoring can continue with REVIEW_PENDING; no agents created |
| The original task gate demanded every dependent ADR be fully closed | Require only the exact subdecisions the task uses, with source/date; an approved SQLite choice does not approve backup/key policy |
| “STOP for unknown cause” could forbid useful diagnostics | Stop speculative/destructive fixes; allow bounded read-only diagnosis and unrelated safe work. Stop immediate exposure/data-loss paths without waiting for retries |
| Execution/requirement/quality/risk failures omit environment, evidence and permission failures | Add those categories; missing test tooling is not proof the model is incapable or that tests passed |
| Risk cannot be classified from a folder name | Use data sensitivity, trust boundary, blast radius and reversibility. A SQL-document typo differs from a production ownership migration; security-policy docs themselves can be HIGH |
| Root rules, AI rules and three workflow guides repeat the same procedure | One execution policy and one Definition of Done; short entry points and task-context template; keep engineering guardrails in a small routed file |
| “Latest document wins” would promote drafts to product decisions | Explicit per-topic authority and scoped owner amendments; revision register records evidence, not blanket approval. Unreconciled consequential conflicts block affected implementation |
| “Choose the cheapest model” could override the owner's configuration | Preserve configured preference; recommend a justified switch, do not silently switch/spawn/spend. No assumed API/account access or price guarantee |
| Commit/push/pull language could cause unauthorized mutations | Workflow recommendations are not authorization. Inspect dirty state; commit/push/integrate only within explicit task authority |
| Merely creating many new folders would not reduce context | Add only `docs/ai` and a lookup map now. Defer architecture/features/backend folder migration until one section at a time is reconciled, linked and verified |
| Small prompts can omit cross-cutting constraints | Keep mandatory safety/procedure reading; include necessary callers, data ownership and tests. No arbitrary maximum-file/token rule; no truncated instruction reads |
| Feature cards still require substantial engineering decisions | Preserve DRAFT status and `18` gaps: remaining reward/AI wires, real migrations/adapters, exact policies and canonical reconciliation. A template is not completed feature design |
| Build/typecheck cannot establish device, legal or production readiness | Explicit lifecycle/device, ownership/RLS, recovery, privacy, accessibility and release evidence by changed behavior; human/specialist review where needed |

## 2. Preservation and document ownership

No approved product selection, launch requirement or safety rule is revoked.
The [decision register](01-REQUIREMENTS-AND-DECISIONS.md) and
[readiness sheet](18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md) retain
the dated choices and outstanding decisions. No new ADR is marked approved.

| Previous material | Destination / responsibility after this pass |
| --- | --- |
| AGENTS mission, scope, authority, phase and safety constraints | Short root constitution; detailed rules in `docs/ai/ENGINEERING_GUARDRAILS.md`; canonical phase order remains in V1 implementation plan |
| AI_RULES detailed architecture/component/UI/performance/code rules | Engineering guardrails with mandatory routed reading for implementation; original subject documents remain authoritative for detailed design |
| AI_RULES dated owner choices and product-AI scope | Register/readiness as approval record; guardrails retain user-confirmed proposals, AI-independent core and canonical V1 AI boundary |
| AI_RULES / development / contribution duplicated workflow | `docs/ai/AI_EXECUTION_POLICY.md` and `DEFINITION_OF_DONE.md`; legacy guides explicitly defer on execution and authorization |
| `07` generic copy-paste prompt and READY gate | Shared `TASK_BRIEF_TEMPLATE.md` and execution policy; `07` retains Deep Focus task sequence, code observations and subcards |
| Risk → model recommendation | `MODEL_ESCALATION_POLICY.md`, dated and replaceable; no model IDs in permanent execution/guardrail rules |
| Huge canonical UI/architecture/security references | Retained, not silently deleted or declared fully modular. `DOCUMENTATION_MAP.md` routes relevant sections and defines extraction/parity requirements |
| Real commands and evidence | Package scripts remain unchanged; Definition of Done gives current inspection checkpoint and verification requirements; `09` records actual runs |

All detailed root constraints must remain discoverable: approved stack/SDK
compatibility, architecture/state/reuse/type safety, lifecycle timestamps,
accessibility/reduced motion, least privilege/secret storage/data ownership,
AI proposals/verified ad grants, failure/recovery handling, scope/dependency
control, documentation maintenance, truthful evidence and focused handoff.

## 3. Acceptance for this documentation slice

| ID | Acceptance condition | Evidence required |
| --- | --- | --- |
| EW-01 | Short entry points route to one permanent execution policy, one DoD, separate model mapping and preserved guardrails | File/link checks plus manual old-to-new constraint review |
| EW-02 | Four risk levels, failure categories, STOP/retry/escalation rules distinguish safe diagnosis from risky implementation | Scenario walkthrough; not a runtime safety proof |
| EW-03 | Task brief includes only necessary authoritative context and explicit decisions/acceptance/evidence | Template inspection and one bounded example |
| EW-04 | Implemented, verified, reviewed and production-ready are different; HIGH cannot self-certify independent review | Policy consistency review; reviewer still pending |
| EW-05 | Partial ADRs can unblock approved subdecisions without approving missing details | `07`, `18`, execution policy and documentation map agree |
| EW-06 | Current commands are real; installs, reset-project, commit/push, agents or production actions are not automatic verification | Package/script inspection and workflow review |
| EW-07 | Existing document checkers include new docs and the pending SyncPull default matches its existing shared query contract | Actual checker runs, not a weakened expectation |
| EW-08 | No app/config edits; existing owner changes preserved; all previous product boundaries remain | Diff/hash checks, register unchanged, explicit limitations |

## 4. Scenario walkthrough / reasoning check

These are manual policy examples, not executed application acceptance tests.

| Scenario | Classification and next action |
| --- | --- |
| Fix spelling in a non-normative help sentence | LOW; link/content check and self-review; no stronger-model review |
| Approved local task filter with no schema/ownership change | MEDIUM; unit/interaction/empty-state checks; use configured implementation model |
| Sync conflict handler changes canonical owner data | HIGH minimum; approve exact conflict contract, test replay/offline/concurrency/isolation; independent review pending if unavailable |
| Purge production accounts or migrate their encryption keys | CRITICAL; qualified plan/isolated rehearsal/restore evidence/independent review and explicit owner production approval; do not execute in this task |
| Retype an RLS example without changing semantics | Classify actual impact: cosmetic correction may be LOW; changing who can read is HIGH or CRITICAL, even in documentation |
| Package lacks `npm test` | ENVIRONMENT failure; report missing harness, use available scoped checks, do not fabricate pass or escalate solely to get a different model |
| Timer regression has unknown cause | Stop speculative patching; reproduce and inspect timestamps/state; resume only with supported hypothesis and a failing regression test |
| Approved navigation order but font ADR still open | Order-only contract task can proceed if isolated; typography task remains gated |
| Sensitive bug found during unrelated typography work | Stop affected risky path, report without leaking data; no unsolicited production repair or unrelated source rewrite |

## 5. Completion boundary and next migration

After restructuring, root AGENTS is 3,360 bytes (54 lines) and AI_RULES 2,170
bytes (34 lines): 5,530 combined, down from 25,290 at this pass's start. This
measures entry points only. Mandatory execution/DoD reading adds 17,225 bytes;
task-specific guardrails/map/contracts add more. It is **not** a measured total
token or API-cost reduction, and the complete repository documentation grew to
include previously missing safeguards. The next context-efficiency improvement
is authoritative feature extraction, not pretending links eliminate reading.

Risk: **HIGH** for governance/security-review rules. This is solo authoring and
self-review; independent review has **NOT** occurred. Final evidence belongs in
[09](09-COVERAGE-AND-AUDIT.md). No claim that all engineering safeguards are
automatically enforceable or that the complete enterprise package is frozen.

Next documentation sequence: finish the six remaining reward/goal-progress/AI
wire operations after their relevant contracts are concrete; reconcile exact
canonical defaults/units/flows; extract one authoritative feature specification
with a retained legacy pointer and acceptance parity. Do not mass-move the large
canonical docs or mark all cards READY. Owner policy/security/provider facts
remain gated separately; this workflow does not supply those missing facts.

Later September 19 checkpoint: [22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md) supplies
those six wire contracts and fixtures. Generation/revision/provider families,
canonical feature extraction and real runtime/security verification remain open;
the earlier next-step wording records the sequence before that continuation.
