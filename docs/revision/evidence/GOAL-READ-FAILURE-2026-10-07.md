# Goals local-read recovery — 2026-10-07

```text
TASK: L-07 UI reliability slice — recover from failed Goals reads
STATE: IMPLEMENTED; native and independent review pending
DELIVERABLE: recoverable Goals reads and duplicate-safe local goal submission
REQUIREMENT / PHASE: V1 Tasks/Goals, L-07; no dependency on account/auth/sync
APPROVALS: local SQLite selection and local-only/no-auto-claim boundary (ADR-012);
  existing goal event/period semantics unchanged
RISK / REASON: MEDIUM — data-bearing route read state, read-only and reversible
REVIEW GATE: self-review only; independent review and native accessibility evidence pending
READ: docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md; docs/ai/DEFINITION_OF_DONE.md;
  docs/ai/ENGINEERING_GUARDRAILS.md; docs/DOCUMENTATION_MAP.md;
  docs/V1_FEATURE_SCOPE.md §6; docs/COMPONENT_LIBRARY.md error/loading/recovery;
  docs/revision/07-LUNA-IMPLEMENTATION-PLAYBOOK.md L-07A;
  docs/revision/15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md §7;
  docs/revision/01-REQUIREMENTS-AND-DECISIONS.md ADR-012;
  docs/COMPONENT_LIBRARY.md §4.1 loading-button behavior
INSPECT: src/app/goals/index.tsx, goal/session readers, existing Tasks and Progress
  failure states, package scripts, tests and dirty working tree
BASELINE: existing changes preserved; before this slice combined suite was
  documented 64/64; no clean-tree assumption
ALLOWED FILES: src/app/goals/index.tsx; src/features/goals/goal-read-state.ts;
  tests/components/goals.test.mjs; tests/domain/goal-read-state.test.mjs;
  tests/{components,domain}/README.md; this evidence; docs/CHANGELOG.md
NON-GOALS: auth/account/backend/sync, SQLite/schema/migration, ownership changes,
  goal formulas, session semantics, dependency changes, production data/deploy
BEHAVIOR: if either local goals or supporting history read fails, hide potentially
  false empty/zero progress, show a generic error and retry; successful empty reads
  retain the existing create-goal state. Unmounted route ignores late results.
  During goal save, a synchronous ref guard admits one write, the loading button
  disables re-submit, and editing/cancel are disabled. Failed save keeps the draft.
PERSISTENCE: read-only; no writes or data clearing
FAILURES / EDGES: independent failures of each read, retry after transient failure,
  private storage error text is not rendered
SECURITY / ACCESSIBILITY: generic copy, native alert role, loading live region,
  labeled retry button; actual VoiceOver/TalkBack, contrast and touch behavior NOT_RUN
ACCEPTANCE: route does not pretend failed reads are empty; explicit retry restores
  loaded state; intentional empty remains distinct; pending saves cannot duplicate;
  failed save preserves values for explicit retry — PASS in synthetic tests
VERIFICATION: combined Node suite `node --test --test-reporter=tap tests/domain/*.test.mjs
  tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs`
  — 71/71 pass, 0 fail/skip/todo; root `node node_modules/typescript/bin/tsc
  --noEmit` — exit 0; focused direct ESLint over the two source and two test files
  — exit 0. These checks ran with synthetic hooks/primitives; native UI/SQLite NOT_RUN.
ROLLBACK / RECOVERY: revert only this slice if required; no persisted records touched
STOP / OPEN DECISIONS: no new decision; independent review/device evidence remain open
```
