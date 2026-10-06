# Definition of Done and evidence

This is the single workflow completion standard. [Testing strategy](../TESTING_STRATEGY.md)
provides domain scenarios; feature acceptance can add requirements, not waive
security, data integrity or accessibility. [Execution policy](AI_EXECUTION_POLICY.md)
defines risk and STOP conditions. A documentation deliverable and its proposed
product implementation have different completion records.

## Four separate claims

| Claim | Required meaning |
| --- | --- |
| IMPLEMENTED | The scoped artifact/code and necessary tests exist; not a claim the behavior passed |
| VERIFIED | Every mandatory task acceptance check has passing, reproducible evidence on the actual changed artifact/environment; unrun required checks prevent this status |
| REVIEWED | Self-review completed; independent qualified review also completed when risk requires it. Name reviewer role, diff/revision reviewed, findings and resolution; do not invent independence |
| PRODUCTION_READY | Task and release requirements, real integrations, supported platforms, operational/privacy/security gates and approvals are satisfied for a named release candidate/environment |

ACCEPTED requires applicable verification/review and the recorded acceptance
authority; `OWNER_ACCEPTED` means an actual owner response. Production readiness
is not permission to deploy. No known critical defect remains; lower unresolved
issues need explicit disposition consistent with acceptance, not silent waiver.
Required NOT RUN/BLOCKED checks cannot be renamed N/A to create a pass. Changes
after verification/review invalidate the affected evidence until rerun/reviewed.

Independent review means another reviewer examines requirements, relevant code/
diff and evidence and can challenge the solution. A second pass by the author
or a newly worded prompt is **self-review**, not independence. A stronger-model
review may help, but is not automatically a security audit or a substitute for
qualified human review of critical controls, legal facts or production actions.
No extra agent is authorized here. If required review is unavailable, retain
`REVIEW_PENDING`; do not merge/deploy or self-certify that gate.

## Verification matrix

Always trace each acceptance criterion to a test/check/manual observation with
environment, command or steps, result and limitation. Self-review the whole task
diff, including untracked files, for scope, secrets and documentation consistency.
Compare known baseline failures; new unexplained regressions stop affected work.

| Changed behavior/artifact | Required evidence in addition to task acceptance |
| --- | --- |
| Documentation/schema only | Links/fences/identifiers and applicable schema fixtures; manual authority/semantic/approval review; mark runtime/security NOT RUN |
| TypeScript business logic | Installed typecheck/lint plus focused unit tests, boundaries/negative/regression cases; no tests that merely repeat implementation assumptions |
| UI/navigation/localization | Relevant automated checks plus affected platform interactions, loading/empty/error/retry, back/deep-link behavior where touched, screen reader/large text/contrast/reduced motion and script layout |
| Focus timer/persistence/recovery | Deterministic timestamp/state tests, duplicate completion, interruption/process restart, failed writes/offline, clock changes, actual affected Android/iOS lifecycle; UI screenshots alone insufficient |
| Auth/RLS/ownership/API | Real isolated trusted-boundary integration tests: unauthenticated/expired/revoked identities, owner A versus B, guessed IDs, forged owner/role, malformed/replayed/concurrent requests, safe logs/errors and rate limits where relevant |
| Schema/migration/backup/deletion | Disposable authorized DB with constraints and representative synthetic data; forward/backward compatibility, migration failure, backup/restore or reviewed safe-forward recovery, interrupted/duplicate deletion and required retention checks |
| Sync/local-to-cloud/conflicts | Client/server integration: retries, replay, concurrent device writes, owner/account switch, version conflict, atomic snapshot/outbox preservation, lost response and recovery, offline persistence integrity |
| AI/ads/payments/entitlements | Fake fixtures plus provider sandbox where applicable; failure/quota/timeout, exact user-confirmed proposals, server-authoritative grants/usage, webhook signatures/idempotency/refunds, no focus interruption; no real charges or personal data without authority |
| Dependencies/config/build/hosting | Version/lockfile compatibility, relevant security advisories with triage, build for affected targets, environment separation/secrets, least privilege, rollback/observability; no install/download treated as a passing test |
| Release | Release-candidate evidence on supported devices/browsers, staging smoke/security, privacy/child/merchant facts, monitoring/support, recoverability and explicit owner release approval |

Apply rows by changed effects, not file extension. A HIGH schema design can be
verified as a **document** with schema/semantic checks but its production security
remains NOT RUN. LOW does not need unrelated full-suite/provider/device checks;
MEDIUM adds relevant behavior tests; HIGH adds independent review and affected
trust-boundary/failure evidence; CRITICAL adds qualified planning and isolated
rehearsal/recovery plus exact human production approval. If infrastructure is
missing, complete the safe draft/test-harness slice and report the implementation
gate blocked. Do not simulate real-provider success and call it integration-tested.

Automated coverage/fixtures cannot establish UX usefulness, legal compliance,
all device behavior, race freedom or absence of vulnerabilities. Use domain
review, realistic manual tests and user research where the acceptance requires
them. Do not market synthetic metrics as validated user/health outcomes.

## Available commands checkpoint — inspect again before use

Inspected 2026-09-19: root package scripts are `start`, `reset-project`, `android`,
`ios`, `web`, `lint`. There is **no `test` script** or production web build project
provided by this documentation work. `reset-project` is destructive scaffolding,
never verification. `npm install` changes dependencies and is not a quality check.

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`, if installed.
- Lint: `npm run lint`, after confirming its local Expo tool/environment.
- Expo doctor: use an installed compatible binary; `npx expo-doctor` may download
  tooling, so do not silently run it as a read-only/offline check. Record missing
  tooling or obtain appropriate installation/network authority.
- Docs: `node docs/revision/check-docs.mjs`.
- Selected contracts: `node docs/revision/check-backend-contracts.mjs`,
  `node docs/revision/check-extension-contracts.mjs`,
  `node docs/revision/check-operations-contracts.mjs`,
  `node docs/revision/check-rewards-ai-contracts.mjs`,
  `node docs/revision/check-ai-generation-lifecycle.mjs`,
  `node docs/revision/check-planning-contracts.mjs`,
  `node docs/revision/check-plan-lifecycle.mjs`,
  `node docs/revision/check-plan-management.mjs`,
  `node docs/revision/check-replication-v2.mjs`,
  `node docs/revision/check-account-export.mjs`,
  `node docs/revision/check-plan-database-packet.mjs`,
  `node docs/revision/check-mobile-plan-recovery.mjs`,
  `node docs/revision/check-plan-activation.mjs`,
  `node docs/revision/check-experience-contracts.mjs`.
- `node docs/revision/inspect-core-baseline.mjs` is a narrow diagnostic with
  known gaps recorded in [the audit](../revision/09-COVERAGE-AND-AUDIT.md), not a
  full runtime or security suite. Do not expect it to be green by assumption.
- `git diff --check` verifies tracked whitespace only. Inspect new files too.
  Use existing newline settings; do not suppress issues through Git config changes.

Commands above are candidates, not evidence of runs. Use the actual installed
runtime path if `node` is not on PATH. Add/approve the test harness as a bounded
task before claiming future unit/integration commands exist.

## Completion record

Keep the user-facing summary short, in Sinhala with English technical terms as
requested. A linked durable task/audit record may hold the detailed fields below;
the summary must still state outcome, verification limits, pending review/decisions
and next action. Never require the user to read collapsed progress messages.

```text
TASK_STATUS: <DRAFT|BLOCKED|IN_PROGRESS|IMPLEMENTED|VERIFIED|REVIEW_PENDING|ACCEPTED>
RISK: <LOW|MEDIUM|HIGH|CRITICAL> — <reason>
ACCEPTANCE_CRITERIA_RESULT: <IDs: PASS|FAIL|NOT_RUN|N/A with reason>
TESTS_RUN: <exact command/steps, environment, exit/result; evidence path>
FILES_CHANGED: <paths and purpose; separate preserved unrelated edits>
DOCS_CONSULTED: <paths/sections and approval sources>
VERIFICATION_STATUS: <PASS|FAIL|PARTIAL|NOT_RUN for scoped artifact>
REVIEW_STATUS: <self-review, required independent review status/evidence>
RELEASE_STATUS: <NOT_APPLICABLE|NOT_READY|READY; owner approval separately>
KNOWN_LIMITATIONS: <unverified boundaries/assumptions>
UNRESOLVED_ISSUES: <defects/decisions and exact blocked scope, or none>
SECURITY_NOTES: <affected boundary, negative evidence, residual risk; no secrets>
ESCALATION_REQUIRED: <no|role/decision required and why; not auto-dispatched>
RECOMMENDED_NEXT_ACTION: <one dependency-safe action>
```

Do not copy every field into a long conversational answer when one concise
handoff plus the record is clearer. Never omit a blocking failure, security risk,
unperformed required test or pending independent review from the summary.
