# PR #13 release-guidance reconciliation — 2026-10-22

## Bounded task brief

Owner requested reconciling PR #13 Android/iOS release guidance with current V1
and required Website/Account Portal, resolving conflicts, checks/review and main
merge. Original PR head 77d4b6192ce7351673eea60eadd71896c4a60b10; baseline main
60eb2318027c314b74e9f7ed47958ee3e089a10a after PR #19/#14/#20.

Risk MEDIUM: documentation reconciliation of existing scope/build workflow;
no new normative safety/security, identity/ownership, release gate or operational
authority. Self-review applies to this bounded documentation integration.
High-risk implementation/release reviews remain separate. No extra agent or
PR #14/#20 waiver is reused. Missing iOS identifier does not block documenting
the open gate; it does block dependent configuration/signing decisions.

Allowed: README and docs ARCHITECTURE, BLUEPRINT, PROJECT_VISION, DEVELOPMENT_GUIDE,
TESTING_STRATEGY, V1_FEATURE_SCOPE, V1_IMPLEMENTATION_PLAN, CHANGELOG; new
DUAL_PLATFORM_RELEASE_GUIDE and this evidence; DOCUMENTATION_MAP routing.
Preserve current AGENTS/AI_RULES exactly. No app.json/eas/package/lockfile,
source/test/SQL, credentials, paid accounts, builds, uploads, submission,
deployment, production data or entity/IP changes.

Read mandatory AGENTS/AI/execution/DoD/map/template/engineering guardrails;
V1 scope September amendments and §§13/15, implementation plan foundations/web
lane, owner decision amendments, release08 gate matrix, web17 publication
boundary, original 11-file PR diff, current app.json/package scripts and PR19
dated matrix. Older research is not a current price or approval.

Five content conflicts: AGENTS, README, AI_RULES, CHANGELOG, PROJECT_VISION.
Resolve from current main and reapply only compatible release intent. Keep
current capacity, owner amendments, five-step onboarding and web requirements.
Consolidate detailed release guidance instead of restoring duplicate governance.

Acceptance: R1 Android/iOS plus required Website/Portal, full productivity web
later; R2 separate native artifacts/shared source, no binary conversion claim;
R3 confirmed milestones distinct from proposed freeze/RC dates, no launch guarantee;
R4 owner-approved identifiers/accounts/costs remain gates; R5 official dated
source verification for store/build/cost claims; R6 local links/fences/tables,
scope/contradiction and docs checks plus self-review; R7 head-safe merge and
verified-tree/no-non-document-delta confirmation.

Verification: installed Node docs/experience checkers; bounded Markdown/source/
non-document/governance identity verifier; web public-content tests if available.
No runtime/build/typecheck/lint/native/hosted/security/store acceptance is claimed
by a documentation pass. Rollback: scoped documents only, no user-data operation.
Status VERIFIED_FOR_DOCUMENTATION_INTEGRATION; actual checks and review below.

## Actual verification and self-review — 2026-10-22

- Documentation checker PASS: 668 Markdown files inventoried, 19 canonical and
  7 governance files, 969 local links and 80/80 requirements.
- Experience-contract checker PASS: 56 contrast pairs, 27 routes and 5 aliases.
- Public web content tests PASS: 21/21, zero failures/skips/todos. These are
  local content tests, not hosted Portal, native lifecycle or store acceptance.
- Bounded verifier PASS: 12 intended document files, 211 local links and three
  new tables; balanced fences and no conflict markers in the intended changes.
- Current-main AGENTS.md and AI_RULES.md preserved exactly. Approved V1 scope
  milestone table and section 15 preserved exactly; no tracked non-document delta.
- app.json inspected, not edited: Android package preserved, iOS identifier still
  absent and iOS icon configuration present. No signing/config decision inferred.
- Self-review: checked all task changes against current scope, owner decisions,
  repository configuration and dated official sources linked in the guide.
  No actionable defect remains in this bounded documentation delta. Five content
  conflicts resolved by retaining current-main governance and compatible intent.
  December 1/8 freeze/RC remain proposals, not confirmed milestones. Required
  Website/Portal are not confused with the deferred full productivity Web App.

Final staging/whitespace and expected-head merge checks are integration controls;
the merge outcome is recorded separately in the workspace continuity record.
Typecheck, lint, full runtime/SQLite tests, native builds/devices, hosted-provider
checks, security acceptance and store release checks NOT_RUN in this docs-only
task. Prior test counts are not new evidence. Product production remains
NOT_READY; no release, spending, publisher or independent-review waiver granted.
