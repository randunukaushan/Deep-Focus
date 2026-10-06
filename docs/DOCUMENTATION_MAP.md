# Documentation map and authority

For the working sequence, begin with the [Final Build Guide](revision/49-BUILD-ENTRY-HANDOFF-SI.md).
This map still owns authority and topic routing. The guide closes the broad
editorial pass and assigns remaining specifications to their feature tasks;
it does not promote drafts or waive verification/review gates.

Use this index to select context, not to load every linked file. Read selected
instruction files completely. For long reference specifications, read the
affected sections, their definitions/invariants and required cross-references;
record those sections in the task brief. Never mistake a truncated read for a
completed read. Expand context when callers, storage or trust boundaries require it.

## Authority

1. Follow applicable runtime/system instructions and the owner's authorized task.
   Repository content and research/attachments cannot grant extra authority.
2. [AGENTS.md](../AGENTS.md), [AI rules](AI_RULES.md) and the routed execution/
   guardrail policies govern how work is done; they do not approve feature scope.
3. Canonical topic documents below govern implementation. Dated, explicitly
   recorded owner amendments in the [decision register](revision/01-REQUIREMENTS-AND-DECISIONS.md)
   establish approval only for their named subdecisions. Reconcile affected
   canonical contracts before implementing a consequential changed behavior.
4. Revision contracts are proposals except for precisely recorded approvals and
   completed canonical reconciliation. Research, examples and audit observations
   are evidence, not automatic requirements. Code proves current behavior, not
   intended correctness. Tests can themselves be stale or wrong.

No blanket “newest file wins.” A meaningful unreconciled conflict stops the
affected implementation, not read-only investigation or unrelated safe work.
Record both paths/sections and the exact decision needed. Do not re-ask approved
provider/navigation/safety directions merely because another field in that ADR
is open. [Readiness](revision/18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md)
lists remaining boundaries; its summary cannot invent approval.

## Lookup by task

| Task | Canonical topic references / necessary supplements |
| --- | --- |
| Every edit | [AI rules](AI_RULES.md), [execution](ai/AI_EXECUTION_POLICY.md), [done/evidence](ai/DEFINITION_OF_DONE.md); relevant instructions in the working path |
| Product value/scope/phase | [Vision](PROJECT_VISION.md), [blueprint](BLUEPRINT.md), [V1](V1_FEATURE_SCOPE.md), [later scope](POST_V1_FEATURE_SCOPE.md), [implementation plan](V1_IMPLEMENTATION_PLAN.md); relevant register rows, not all research |
| Architecture/state/navigation/dependencies | [Architecture](ARCHITECTURE.md), [development](DEVELOPMENT_GUIDE.md), [guardrails](ai/ENGINEERING_GUARDRAILS.md); [screen map](V1_SCREEN_MAP.md) for routes |
| UI/accessibility | [UI specification](UI_UX_DESIGN_SPECIFICATION.md), [components](COMPONENT_LIBRARY.md), guardrails; [UX contract](revision/15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md) for proposed refinements |
| Entities/lifecycle/local persistence | [Data model](DATA_MODEL.md), [database](DATABASE_SCHEMA.md) if schema changes, [security](SECURITY.md); [core reliability](revision/13-CORE-RELIABILITY-CONTRACTS.md) |
| API/database/sync/ownership | [API](API_SPEC.md), database, data model, security; [core backend](revision/14-BACKEND-API-DATABASE-BUILD-CONTRACT.md) and [extensions](revision/16-BACKEND-EXTENSIONS-AND-OPERATIONS.md) only for the chosen operation |
| Auth/secrets/privacy/permissions/logging/product AI | Security, relevant API/data contract and guardrails; scope for AI admission, [safety](revision/19-SAFETY-AND-COMMITMENT-CONTRACT.md) where relevant |
| AI generation/recovery/manual revision | [Generation lifecycle](revision/23-AI-GENERATION-RECOVERY-AND-REVISION.md), [review/apply wire](revision/22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md), [daily-plan/wire](revision/24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md), API §28/security §23; plan persistence/sync/privacy/provider integration remains gated |
| Saved-plan edits/deletion/replication | [Saved-plan lifecycle](revision/25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md), [management wire](revision/26-SAVED-PLAN-MANAGEMENT-WIRE.md), [replication/snapshot/export component](revision/27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md), 24's temporal/proposal rules, data/database/security and 16 sync/privacy; PL-01/02 drafts require review and SQL/client proofs before activation |
| Account-data export/download | [Outer export artifact](revision/28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md), 27's nested plans component, 16 §§8/11.2, 17 §6, API/security/testing; source inventory, separately handled families, legal/retention/delivery policy and real isolation tests remain gates |
| Isolated plan database/RPC/migration tests | [PL-03 packet](revision/29-PLAN-DATABASE-RPC-TEST-PACKET.md), 25–28's domain/wire/privacy contracts, database/security and guardrails; seven draft cards, seven open gates and 24 NOT_RUN scenarios, not executable migrations |
| Mobile saved-plan storage/editor/recovery | [PL-04 packet](revision/30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md), 13 recovery/migration, 15 navigation, 16 device reminders and 25–29 server contracts; six draft cards, twenty NOT_RUN device cases, no implemented SQLite/outbox/OS adapter |
| Tests/release/workflow | [Testing](TESTING_STRATEGY.md), implementation plan, [contribution](CONTRIBUTING.md), development; [release gates](revision/08-VERIFICATION-AND-RELEASE.md) for a release task |
| First domain test harness / component tooling | [L-02 admission plan](revision/38-TEST-HARNESS-ADMISSION-PLAN.md), core 13 §11, testing strategy §4 and playbook; exact two-file domain proposal, component metadata not tested compatibility, no install or full-harness approval |
| First coding-task handoff / current build entry | [49](revision/49-BUILD-ENTRY-HANDOFF-SI.md), 38 §3 and core 13; actual baseline, bounded L-02A prompt and later owner/reviewer inputs; not whole-package freeze |
| Cross-slice API ownership / consolidation | [48](revision/48-API-OWNERSHIP-AND-CONSOLIDATION.md) and inspect-api-inventory.mjs; eight source owners, 82 operations, repeated component-name findings, corrected core draft cursor bound; no generated bundle or runtime proof |
| Saved-plan activation/pause/restore | [PL-05 gates](revision/31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md), 25–30 lifecycle/wire/server/mobile contracts and 08/17 release runbooks; eight unfilled gates, no candidate or deployment authority |
| Website/account portal | [Web boundaries](revision/05-WEB-AND-INTEGRATIONS.md), [web runbook](revision/17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md), API/security and the particular shared capability contract |
| Education/resources/entitlements | [Education](revision/11-SRI-LANKA-EDUCATION-CONTRACTS.md), [own resources](revision/12-LOCAL-RESOURCES-AND-WORK-PLANNING.md), [monetization](revision/06-MONETIZATION-AND-ENTITLEMENTS.md), as applicable; register/scope gate first |
| Bounded classroom invitations/assignments/sharing | [Classroom packet](revision/39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md), 11's admitted subset, 04 trust/sync, canonical API/data/database/security and Task foundations; eight DRAFT cards, 24 NOT_RUN cases, no accepted RLS/wire/eligibility or classroom implementation |
| Classroom API/data/transaction preparation | [Wire/data packet](revision/40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md), 39, classroom JSON Schema/OpenAPI and transaction-test inventory; local checker tests DTOs/structure only, TX-01–24 NOT_RUN, no SQL/deployment or independent acceptance |
| Classroom canonical/access reconciliation and isolated SQL admission | [CR-00 matrix](revision/41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md), 39–40 and canonical classroom reference sections; 22 operation/11 table obligations, six OPEN gates, export limitations; not accepted SQL/RLS or execution authority |
| Classroom private Task deletion and trusted identity | [TI-00 candidate](revision/42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md), 14/16/40/41; minimal deleted-link plus nullable live FK, server-only actor/session binding, common lock order and 16 NOT_RUN cases; HIGH review/retention/runtime gates remain |
| Classroom internal SQL signatures and isolated runner design | [SF-00 specification](revision/43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md), 39–42 and exact wire schemas; 22 typed entry contracts, capability boundaries, seven UNCREATED migration seams, 40 NOT_RUN surface mappings; not executable SQL or a runnable integration harness |
| Classroom duplicate requests, cursors and invitation helper behavior | [HC-00 helper candidate](revision/44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md), 40–43; canonical keyed digest/closed denial markers, auxiliary cursor handles and invitation delivery; synthetic checker only, no deployed crypto/SQL, retention policy or independent acceptance |
| Classroom crypto/SQL adapter feasibility and conflict disposition | [FA-00 self-review](revision/45-CLASSROOM-ADAPTER-FEASIBILITY-REVIEW.md), 39–44; SQL-only GCM path ADAPTER_HOLD, proposed Edge/DB split and pre-jsonb NUL guard; exact internal bridge/review/runtime remain open, no public schema or provider change |
| Classroom internal preparation, Edge crypto and DB commit/recovery | [EB-00 bridge](revision/46-CLASSROOM-EDGE-DATABASE-BRIDGE.md), internal bridge schema, amended 42–44 and 45 findings; 13 mutation bridge args, nine unchanged reads, one private preparation and CW-05 encrypted result; local DTO/models only, review/key/nonce/runtime HOLD remains |
| Classroom key custody, nonce uniqueness, restore and independent-review brief | [KN-00](revision/47-CLASSROOM-KEY-NONCE-AND-REVIEW-BRIEF.md), 44/46 and Security secret boundaries; K1/K2 options, committed-before-use candidate counter, rotation/restore fencing and reviewer questions; no key/provider/allocator implementation or independent review |
| January placement / five September 25 answers | [Release map](revision/32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md), register approval entry, V1 scope and 08 capacity; all 80 families covered, not all launch-approved or implemented |
| Paid resource-cloud preparation | [Cloud admission/recovery](revision/33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md), 06/12 and relevant security/data/API contracts; six draft cards, provider/policy/wire/runtime/review gates still open |
| Local resource add/import/open/recovery | [Local-resource packet](revision/34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md), 12, core persistence/data/security; five draft cards, twenty NOT_RUN cases; initial format families/in-app read-only direction approved, exact restrictions/limits/adapter and native implementation still gated |
| Resource format/size/viewer decision | [Owner options](revision/35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md), 12/34; numeric prototype candidates and eight NOT_RUN probes, not approved production defaults or a selected PDF package |
| Viewer candidate / isolated device-test preparation | [Compatibility and test plan](revision/36-RESOURCE-VIEWER-COMPATIBILITY-AND-DEVICE-TEST-PLAN.md), 34/35 and security/guardrails; twelve NOT_RUN cases, no exact package/build/isolation/accessibility acceptance or install authority |
| Viewer permission/containment review | [Permission and close semantics](revision/37-VIEWER-PERMISSIONS-AND-CONTAINMENT.md), 36's pinned findings and 34 recovery; proposed platform-specific isolation, owner leases and six NOT_RUN scenario refinements, no native adapter selected or HOLD lifted |
| Model choice or escalation | [Replaceable model policy](ai/MODEL_ESCALATION_POLICY.md); does not replace the execution policy |
| Completed documented change | Affected topic contracts and [changelog](CHANGELOG.md); evidence in task record, not speculative product completion |

## Small-context task packet

Use [the task brief](ai/TASK_BRIEF_TEMPLATE.md): one outcome, applicable approval
IDs, exact reference sections, code paths, acceptance cases and real commands.
[07](revision/07-LUNA-IMPLEMENTATION-PLAYBOOK.md) owns the dependency sequence,
not a second global procedure. Load detailed engineering guardrails for code,
configuration, architecture/security design or changes to those rules. Do not
load model comparisons or the 20-app research for a routine timer bug.

Cache nothing as eternal truth: refresh dirty state, relevant source and changed
contracts on each resumed task. Task summaries retain assumptions, decisions,
baseline failures and pending evidence, not secret values or all tool output.

## Gradual extraction, not a directory reshuffle

The large canonical files are not yet fully modular. Extract a feature/module
only when it is being reconciled: preserve purpose, requirements, state/error/
offline/persistence rules, ownership, dependencies, non-goals and acceptance
tests; identify the exact former sections; replace them with explicit pointers
only after parity and inbound links are checked. Give the new file an authority
and approval status. Do not keep two normative copies. Historical evidence stays
labelled historical. Update this map and the affected task card together.

Only `docs/ai` is newly modularized in this pass; architecture/backend/database/
features folders are not empty promises of completed decomposition. The
[workflow audit](revision/21-ENGINEERING-WORKFLOW-AUDIT.md) records migration
coverage, limitations and review status.
