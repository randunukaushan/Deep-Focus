# Plan My Day task-read recovery — 2026-10-07

```text
TASK: V1 Plan My Day — task read/loading recovery
STATE: IMPLEMENTED; device/accessibility review pending
DELIVERABLE: honest task read states, retry, stale-route guard and regressions
REQUIREMENT / PHASE: V1 Phase 7; required Plan My Day; local failure behavior
APPROVALS: core remains useful without AI; proposal is not applied until
  explicit user confirmation; no provider, credential, spend or data write
RISK: MEDIUM — route state/read lifecycle only; no persisted mutation
REVIEW: self-review complete; targeted product/accessibility review pending
READ: AGENTS.md; docs/AI_RULES.md; execution policy; DoD; guardrails;
  V1_FEATURE_SCOPE.md §11.2; revision/15 §4; revision/23–24 recovery and
  proposal/apply boundary; task brief template
ALLOWED FILES: src/app/plan-my-day.tsx; tests/components/plan-my-day.test.mjs;
  docs/CHANGELOG.md; this evidence file
NON-GOALS: OpenAI API/provider, model selection, credential or cost setup;
  proposal persistence/apply, task writes, schedule/reminder changes, backend,
  schema, dependency, migration or release
BEHAVIOR: The route starts in loading. A read error shows safe text and Retry,
  not an empty state or proposal. Successful zero records show the existing
  add-task state. Suggest stays disabled unless the latest read succeeded and
  usable tasks are selected. A result from a prior focus instance is ignored.
PERSISTENCE: read-only `loadTasks`; no task, schedule, reminder or plan write.
SECURITY / ACCESSIBILITY: no raw storage error exposed. Loading uses a polite
  live region, read failure an alert; retry is an explicit button. Native TalkBack,
  large-text and route lifecycle checks remain NOT_RUN.
ACCEPTANCE: failed reads do not appear empty; retry loads current tasks; empty
  only follows successful empty read; late result after blur cannot replace UI.
VERIFICATION: focused route tests 3/3 PASS; full `node --test` — 160/160 PASS;
  root `node node_modules/typescript/bin/tsc --noEmit` — PASS; direct ESLint on
  the changed route/test — PASS; `node docs/revision/check-docs.mjs` — PASS
  (81 Markdown files, 930 local links, no errors); `git diff --check` — exit 0
  with Git line-ending notices on existing dirty files. Android device
  verification is NOT_RUN. No API/provider call occurred.
ROLLBACK: revert route state and test only; no stored data changed.
STOP: AI proposal generation, server persistence and apply remain gated on
  reviewed contracts, provider credentials/cost and backend/RLS integration.
```
