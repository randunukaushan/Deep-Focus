# PR #20 main reconciliation — 2026-10-21

TASK: Reconcile main into the V1 checkpoint and verify the resulting candidate.
STATE: REVIEW_PENDING — conflicts resolved and local checks pass.
DELIVERABLE: conflict resolution, verification and self-review; merge only after
applicable review gates are met.
APPROVALS: owner request in this chat to resolve PR #20 conflicts, test, review
and merge correct changes. Owner separately declined a review sub-agent.
RISK: HIGH for the overall auth/ownership/sync/persistence implementation;
MEDIUM for the token compatibility reconciliation itself.
REVIEW GATE: self-review here; independent HIGH-risk review remains separate.

BASELINE: PR head 23934f130b0ab0eef7cdaed311ab4dfcb57bbbaf;
remote main c5f2d238b882b51a009c1a24d1014bcb9a77722a. Head is five
commits ahead and six behind. Original checkout was clean before worktree
creation. Work is isolated in a separate worktree.

READ: AGENTS, AI_RULES, execution policy, DoD, engineering guardrails,
documentation map, task template; main's COLOR_SYSTEM, actual token consumers,
action contrast tests, domain/component harness records and package scripts.
ALLOWED FILES: three conflict files AGENTS.md, docs/AI_RULES.md,
src/theme/tokens.ts; merged main README/changelog/COLOR_SYSTEM;
COLOR_SYSTEM reconciliation, focused regression tests, this evidence record.
Expanded for reproduced harness failures: tests/domain/session-boundaries,
tests/domain/preview-scene-assets, tests/navigation/navigation-contract and
tests/integration/migration-review-sql (all .test.mjs); one unused import in
src/app/education/teacher-assignment.tsx. No runtime business behavior changed.
Expand only for a reproduced test failure or confirmed defect in this merge.
NON-GOALS: deployment, hosted migration, dependency upgrade, product expansion,
rewriting history, weakening tests or manufacturing production-ready evidence.

ACCEPTANCE:
- A1: preserve main ancestry and resolve all three content conflicts.
- A2: retain October presentation values/contrast and preserve main semantic
  roles and color-contract routing without restoring duplicated old AI rules.
- A3: typecheck, direct installed ESLint, applicable test suites and docs checks.
- A4: record actual self-review and external-review state; no false acceptance.

ROLLBACK: merge commit can be reverted; original branch/worktree retained.
No user data or production services are touched.

## Results

Environment: Windows, Node 24.18.0; existing locked dependencies reused through
local junctions; no package or lockfile changes. PGlite 0.3.14 installed with
scripts disabled in a separate temporary directory, not in project dependencies.

| Check | Actual result |
| --- | --- |
| `node --test --test-concurrency=4 tests/domain/*.test.mjs tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs` | 1758 PASS, 0 FAIL, 0 skipped/todo, exit 0 |
| Focused repaired suites (session-boundaries, preview-scene-assets, navigation-contract) | 31/31 PASS |
| Post-import-cleanup teacher assignment component/domain/storage tests | 8/8 PASS |
| `node node_modules/typescript/bin/tsc --noEmit` | PASS, rerun after final production edit, exit 0 |
| `node node_modules/eslint/bin/eslint.js src --max-warnings=0` | PASS, exit 0 after removing unused import |
| Scoped ESLint over changed token/screen and three repaired test files | PASS, exit 0 |
| `node node_modules/typescript/bin/tsc --noEmit -p web/tsconfig.json` | PASS |
| `node web/node_modules/eslint/bin/eslint.js --config web/eslint.config.mjs web/src web/tests --max-warnings=0` | PASS, combined web command exit 0 |
| `node docs/revision/check-docs.mjs` | PASS, 664 Markdown files, 945 links |
| `node docs/revision/check-backend-contracts.mjs` | PASS; structural/DTO evidence only |
| `node docs/revision/check-experience-contracts.mjs` | PASS; document token/route evidence only |
| `DEEP_FOCUS_PGLITE_MODULE=<external 0.3.14 dist/index.js> node --test --test-concurrency=1 tests/integration/migration-review-sql.test.mjs` | 10/10 PASS, no skips, exit 0 |
| `git diff --check` | PASS |

The first broad run had 17 failures: 15 fixture-loader errors from three new
production imports missing from the VM dependency map, one stale Plan-route
inspection and one CRLF-only asset comparison. Actual pure modules are now
provided to the fixture; original durability/rollback/owner assertions remain.
Navigation follows the actual route re-export. SVG normalization only changes
line terminators. No product assertion was inverted or skipped.

The initial SQL run had 9 passes and one failed error-code oracle. The migration's
BEFORE INSERT eligibility trigger intentionally raises 23514 before a composite
foreign key could raise 23503. The corrected negative uses a foreign **completed**
session, asserts the exact 23514 denial message, separately rejects the owner's
cancelled session and verifies that only the single valid ledger event remains.
No trigger, grant, RLS policy or migration was weakened or changed.

## Self-review and remaining gates

Self-review covered the entire conflict-resolution diff and failing-test repairs,
color contract provenance, token consumers/contrast, account-backend token/identity
checks, account-sync live-owner guard, session-owner activation, sign-out boundary,
provider verified-claims adapter, app-session registry check, gateway resource
owner preflights, local transaction/terminal-pointer behavior and SQL denial cases.
No additional confirmed blocker was found in that scoped review. This is not an
exhaustive audit of all 127k added lines in the consolidated checkpoint.

The Supabase skill informed the authorization review: verified provider claims,
server-side owner checks, RLS plus grants, no privileged client keys, and
cross-owner negative execution. It did not change the database or activate sync.

GitHub reports no reviews/comments or CI checks on PR #20 as inspected here.
Independent HIGH-risk review remains **PENDING**. Owner declined an extra agent;
no agent was spawned and self-review is not recorded as independent review.
The recorded October 19 waiver is specific to development backend activation;
it is not silently expanded to this consolidated merge.

Native Android/iOS lifecycle/accessibility and hosted-provider verification were
not rerun. The October 19 hosted development smoke is dated historical evidence,
not a passing result for this merge candidate. No production deployment or
remote migration was performed. Full cloud sync is still incomplete as described
in APP-BACKEND-CONNECTION-2026-10-19.md; this candidate does not activate it.

Merge into main remains gated by independent review, or an explicit owner
disposition changing that development-merge requirement. Production readiness
remains NOT_READY regardless of a development baseline merge.
